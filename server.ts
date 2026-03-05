import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes can be added here
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  if (process.env.NODE_ENV === "production") {
    // Serve static files from dist directory
    app.use(express.static(path.join(__dirname, "dist")));
    
    // SPA fallback for production
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  } else {
    // Vite middleware for development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Fallback for development to ensure SPA routing works on refresh
    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      
      // If it's an API route or has a file extension, don't serve index.html
      if (url.startsWith('/api') || url.includes('.')) {
        return next();
      }
      
      console.log(`[SPA Fallback] Serving index.html for: ${url}`);
      
      try {
        // Read the actual index.html file
        const template = fs.readFileSync(
          path.resolve(__dirname, "index.html"),
          "utf-8"
        );

        // Let Vite handle the HTML serving and transforms
        const html = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

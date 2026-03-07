import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('database.sqlite');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS profiles (id TEXT PRIMARY KEY, data TEXT);
  CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, data TEXT);
  CREATE TABLE IF NOT EXISTS order_requests (id TEXT PRIMARY KEY, data TEXT);
  CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, data TEXT);
  CREATE TABLE IF NOT EXISTS order_items (id TEXT PRIMARY KEY, data TEXT);
  CREATE TABLE IF NOT EXISTS incomplete_orders (id TEXT PRIMARY KEY, data TEXT);
  CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY, data TEXT);
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API routes can be added here
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Generic Supabase Mock API
  app.post('/api/supabase/:table/select', (req, res) => {
    const { table } = req.params;
    try {
      const rows = db.prepare(`SELECT data FROM ${table}`).all() as any[];
      res.json({ data: rows.map(r => JSON.parse(r.data)), error: null });
    } catch (e: any) {
      res.json({ data: null, error: e.message });
    }
  });

  app.post('/api/supabase/:table/insert', (req, res) => {
    const { table } = req.params;
    const rows = req.body;
    try {
      const stmt = db.prepare(`INSERT INTO ${table} (id, data) VALUES (?, ?)`);
      db.transaction(() => {
        for (const row of rows) {
          if (!row.id) row.id = Math.random().toString(36).substring(7);
          stmt.run(row.id, JSON.stringify(row));
        }
      })();
      res.json({ data: rows, error: null });
    } catch (e: any) {
      res.json({ data: null, error: e.message });
    }
  });

  app.post('/api/supabase/:table/update', (req, res) => {
    const { table } = req.params;
    const { data, eq, neq } = req.body;
    try {
      if (eq) {
        const row = db.prepare(`SELECT data FROM ${table} WHERE id = ?`).get(eq.val) as any;
        if (row) {
          const updated = { ...JSON.parse(row.data), ...data };
          db.prepare(`UPDATE ${table} SET data = ? WHERE id = ?`).run(JSON.stringify(updated), eq.val);
          res.json({ data: [updated], error: null });
        } else {
          res.json({ data: null, error: 'Not found' });
        }
      } else if (neq) {
        // Update all except neq
        const rows = db.prepare(`SELECT id, data FROM ${table} WHERE id != ?`).all(neq.val) as any[];
        const stmt = db.prepare(`UPDATE ${table} SET data = ? WHERE id = ?`);
        db.transaction(() => {
          for (const row of rows) {
            const updated = { ...JSON.parse(row.data), ...data };
            stmt.run(JSON.stringify(updated), row.id);
          }
        })();
        res.json({ data: [], error: null });
      } else {
        res.json({ data: null, error: 'Missing condition' });
      }
    } catch (e: any) {
      res.json({ data: null, error: e.message });
    }
  });

  app.post('/api/supabase/:table/delete', (req, res) => {
    const { table } = req.params;
    const { eq, neq } = req.body;
    try {
      if (eq) {
        db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(eq.val);
      } else if (neq) {
        db.prepare(`DELETE FROM ${table} WHERE id != ?`).run(neq.val);
      }
      res.json({ data: null, error: null });
    } catch (e: any) {
      res.json({ data: null, error: e.message });
    }
  });

  app.post('/api/supabase/:table/upsert', (req, res) => {
    const { table } = req.params;
    const row = req.body;
    try {
      if (!row.id) row.id = Math.random().toString(36).substring(7);
      db.prepare(`INSERT INTO ${table} (id, data) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data`).run(row.id, JSON.stringify(row));
      res.json({ data: [row], error: null });
    } catch (e: any) {
      res.json({ data: null, error: e.message });
    }
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

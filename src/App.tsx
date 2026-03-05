import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Login } from './pages/Login';
import { AdminLogin } from './pages/AdminLogin';
import { Register } from './pages/Register';
import { Account } from './pages/Account';
import { Notifications } from './pages/Notifications';
import { AdminDashboard } from './pages/AdminDashboard';
import { useAuthStore, useThemeStore, useProductStore, useUserStore, useOrderStore, useOrderRequestStore, useNotificationStore } from './store';

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user } = useAuthStore();
  
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
  
  return <>{children}</>;
};

export default function App() {
  const { theme } = useThemeStore();
  const { fetchProducts } = useProductStore();
  const { fetchUsers } = useUserStore();
  const { fetchOrders } = useOrderStore();
  const { fetchRequests } = useOrderRequestStore();
  const { fetchNotifications } = useNotificationStore();

  const [isInitializing, setIsInitializing] = React.useState(true);

  React.useEffect(() => {
    const initData = async () => {
      try {
        await Promise.all([
          fetchProducts(),
          fetchUsers(),
          fetchOrders(),
          fetchRequests(),
          fetchNotifications()
        ]);
      } finally {
        setIsInitializing(false);
      }
    };
    initData();
  }, []);

  React.useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-ios-orange border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold tracking-widest uppercase opacity-40 animate-pulse">Initializing Cellex...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-neon-cyan/30 transition-colors duration-500">
        <Navbar />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/register" element={<Register />} />
          
          {/* User Routes */}
          <Route 
            path="/account" 
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 Fallback */}
          <Route path="*" element={
            <div className="pt-32 pb-20 px-6 min-h-screen flex flex-col items-center justify-center text-center">
              <h1 className="text-9xl font-display font-bold text-gradient mb-4">404</h1>
              <h2 className="text-3xl font-bold mb-6">Lost in the future?</h2>
              <p className="text-white/40 mb-10 max-w-sm">The page you're looking for doesn't exist in this timeline.</p>
              <Link to="/" className="px-8 py-4 rounded-2xl bg-white text-black font-bold">
                Return Home
              </Link>
            </div>
          } />
        </Routes>

        <Toaster position="bottom-right" theme={theme} closeButton />
      </div>
    </Router>
  );
}

import React from 'react';
import { motion } from 'motion/react';
import { Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useUserStore } from '../store';
import { toast } from 'sonner';
import { LOGO_URL } from '../constants';

export const AdminLogin = () => {
  const [adminId, setAdminId] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const { setUser } = useAuthStore();
  const { findUser } = useUserStore();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = adminId.trim();
    const cleanPass = password.trim();
    
    // Search by email/ID
    const user = findUser(cleanId);
    
    if (user && user.role === 'admin' && user.password === cleanPass) {
      setUser(user);
      toast.success(`Welcome to Admin Portal, ${user.name}!`);
      navigate('/admin');
    } else {
      toast.error('Invalid Admin ID or Password.');
    }
  };

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center">
      <div className="bg-glow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#ff6b00]/20" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="neu-flat p-10 relative overflow-hidden">
          <div className="flex flex-col items-center mb-10">
            <div className="w-24 h-24 neu-button flex items-center justify-center mb-4 overflow-hidden rounded-full">
              <img src={LOGO_URL} alt="Cellex Logo" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
            </div>
            <h1 className="text-3xl font-display font-bold">Admin Portal</h1>
            <p className="text-[var(--text-secondary)] text-sm mt-2">Secure access for administrators only</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Admin ID</label>
              <div className="neu-inset flex items-center px-4 py-3 group focus-within:border-ios-orange/50 transition-all">
                <User size={18} className="opacity-30 group-focus-within:text-ios-orange" />
                <input
                  type="text"
                  required
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder=""
                  className="bg-transparent border-none outline-none px-3 py-1 text-sm w-full placeholder:opacity-20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Password</label>
              <div className="neu-inset flex items-center px-4 py-3 group focus-within:border-ios-orange/50 transition-all relative">
                <Lock size={18} className="opacity-30 group-focus-within:text-ios-orange" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  className="bg-transparent border-none outline-none px-3 py-1 text-sm w-full placeholder:opacity-20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 opacity-30 hover:opacity-100 transition-opacity"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-4 rounded-2xl ios-button-primary flex items-center justify-center gap-2 group"
            >
              Login to Dashboard
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </form>
          
          <div className="mt-8 text-center">
            <button 
              onClick={() => navigate('/login')}
              className="text-xs opacity-40 hover:opacity-100 transition-opacity font-medium"
            >
              Back to User Login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

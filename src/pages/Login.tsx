import React from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useUserStore } from '../store';
import { toast } from 'sonner';
import { LOGO_URL } from '../constants';

export const Login = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const { setUser } = useAuthStore();
  const { findUser } = useUserStore();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = findUser(email);

    if (user && user.password === password) {
      setUser(user);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      toast.error('Invalid email or password');
    }
  };

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center">
      <div className="bg-glow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neon-cyan/20" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="neu-flat p-10 relative overflow-hidden">
          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-24 h-24 neu-button flex items-center justify-center mb-4 overflow-hidden rounded-full">
              <img src={LOGO_URL} alt="Cellex Logo" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
            </div>
            <h1 className="text-3xl font-display font-bold">Welcome Back</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Email or Admin ID</label>
              <div className="neu-inset flex items-center px-4 py-3 group focus-within:border-ios-orange/50 transition-all">
                <Mail size={18} className="opacity-30 group-focus-within:text-ios-orange" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                  className="bg-transparent border-none outline-none px-3 py-1 text-sm w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60">Password</label>
                <Link to="#" className="text-[10px] font-bold text-ios-orange hover:underline uppercase tracking-widest">Forgot?</Link>
              </div>
              <div className="neu-inset flex items-center px-4 py-3 group focus-within:border-ios-orange/50 transition-all relative">
                <Lock size={18} className="opacity-30 group-focus-within:text-ios-orange" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  className="bg-transparent border-none outline-none px-3 py-1 text-sm w-full"
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

            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-4 rounded-2xl ios-button-primary flex items-center justify-center gap-2 group"
              >
                Sign In
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => navigate('/admin/login')}
                className="w-full py-4 rounded-2xl ios-button-secondary flex items-center justify-center gap-2 group"
              >
                Admin Portal
              </motion.button>
            </div>
          </form>

          <p className="text-center mt-10 text-sm opacity-40">
            Don't have an account?{' '}
            <Link to="/register" className="text-ios-orange font-bold hover:underline">Create one</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, User, Search, Menu, X, ChevronRight, Moon, Sun, Bell, Trash2, CheckCircle, ShoppingBag, Zap } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCartStore, useAuthStore, useThemeStore, useNotificationStore } from '../store';
import { cn } from '../lib/utils';
import { LOGO_URL } from '../constants';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [navSearchQuery, setNavSearchQuery] = React.useState('');
  const { items } = useCartStore();
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { notifications, markAsRead, clearAll } = useNotificationStore();
  const location = useLocation();
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
  ];

  if (location.pathname === '/') return null;

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-700 px-6 py-4',
        isScrolled ? 'py-3' : 'py-6'
      )}
    >
      <div className="max-w-7xl mx-auto">
        <div className={cn(
          'neu-flat px-8 py-3 flex items-center justify-between transition-all duration-700',
          isScrolled ? 'scale-95' : 'scale-100'
        )}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-10 h-10 neu-button flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 overflow-hidden rounded-full">
              <img src={LOGO_URL} alt="Cellex Logo" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
            </div>
            <span className="text-2xl font-display font-bold tracking-tighter hidden sm:block">CELLEX</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  'text-sm font-semibold transition-all duration-300 hover:opacity-100 relative group',
                  location.pathname === link.path ? 'opacity-100' : 'opacity-40'
                )}
              >
                {link.name}
                <span className={cn(
                  'absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-ios-orange transition-all duration-300',
                  location.pathname === link.path ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                )} />
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 neu-button hidden sm:flex items-center justify-center transition-all duration-300 active:scale-90"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications */}
            <div className="hidden md:flex items-center gap-4">
              <Link to="/shop" className="w-10 h-10 neu-button flex items-center justify-center relative group active:scale-90" title="Shop">
                <ShoppingBag size={18} className="opacity-60 group-hover:opacity-100" />
              </Link>
            </div>

            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="w-10 h-10 neu-button flex items-center justify-center relative group active:scale-90"
              >
                <Bell size={18} className={cn("opacity-60 group-hover:opacity-100", unreadCount > 0 && "text-ios-orange opacity-100")} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-ios-orange text-[9px] font-bold flex items-center justify-center rounded-full text-white shadow-lg animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-4 w-80 neu-flat overflow-hidden z-[60]"
                  >
                    <div className="p-4 border-b border-black/5 flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-widest opacity-40">Notifications</h3>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => {
                            navigate('/notifications');
                            setIsNotifOpen(false);
                          }}
                          className="text-[10px] font-bold text-ios-orange uppercase tracking-widest hover:underline"
                        >
                          View All
                        </button>
                        <button 
                          onClick={clearAll}
                          className="text-[10px] font-bold opacity-40 uppercase tracking-widest hover:underline"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div 
                            key={n.id} 
                            onClick={() => markAsRead(n.id)}
                            className={cn(
                              "p-4 border-b border-black/5 last:border-0 cursor-pointer transition-all flex gap-4",
                              !n.read ? "bg-ios-orange/5" : "hover:bg-black/5"
                            )}
                          >
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                              n.type === 'success' ? "bg-green-500/10 text-green-500" :
                              n.type === 'warning' ? "bg-yellow-500/10 text-yellow-500" :
                              "bg-ios-orange/10 text-ios-orange"
                            )}>
                              {n.type === 'success' ? <CheckCircle size={14} /> : 
                               n.type === 'warning' ? <Bell size={14} /> : 
                               <Bell size={14} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold truncate pr-2">{n.title}</span>
                                <span className="text-[9px] opacity-40 whitespace-nowrap">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p className="text-[11px] opacity-60 line-clamp-2 leading-relaxed">{n.message}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <Bell size={24} className="mx-auto mb-2 opacity-10" />
                          <p className="text-xs opacity-40">No notifications yet</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={() => setIsSearchOpen(true)}
              className="w-10 h-10 neu-button hidden sm:flex items-center justify-center transition-all duration-300 active:scale-90"
            >
              <Search size={18} className="opacity-60" />
            </button>
            <Link to="/cart" className="w-10 h-10 neu-button flex items-center justify-center relative group active:scale-90">
              <ShoppingCart size={18} className="opacity-60 group-hover:opacity-100" />
              {items.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-ios-orange text-[9px] font-bold flex items-center justify-center rounded-full text-white shadow-lg">
                  {items.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </Link>
            <Link to={user ? (user.role === 'admin' ? '/admin' : '/account') : '/login'} className="w-10 h-10 neu-button flex items-center justify-center active:scale-90">
              <User size={18} className="opacity-60 hover:opacity-100" />
            </Link>
            <button 
              className="md:hidden w-10 h-10 neu-button flex items-center justify-center active:scale-90"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={isMobileMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        className="md:hidden overflow-hidden mt-4"
      >
          <div className="neu-flat p-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-medium flex items-center justify-between group"
              >
                {link.name}
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
            
            {/* Mobile-only links */}
            <Link
              to="/notifications"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg font-medium flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-ios-orange" />
                Notifications
                {unreadCount > 0 && (
                  <span className="w-5 h-5 bg-ios-orange text-[10px] font-bold flex items-center justify-center rounded-full text-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="h-px bg-black/5 my-2" />
          <div className="flex items-center justify-between">
            <button 
              onClick={() => {
                toggleTheme();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 text-sm font-bold opacity-60"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              Toggle Theme
            </button>
            <button 
              onClick={() => {
                setIsSearchOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 text-sm font-bold opacity-60"
            >
              <Search size={18} />
              Search
            </button>
          </div>
        </div>
      </motion.div>

      {/* Global Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl flex items-start justify-center pt-32 px-6"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="w-full max-w-2xl neu-flat p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] opacity-40">Global Search</h2>
                <button onClick={() => setIsSearchOpen(false)} className="neu-button p-2">
                  <X size={18} />
                </button>
              </div>
              
              <div className="neu-inset flex items-center px-6 py-4 group focus-within:ring-2 ring-ios-orange/20 transition-all">
                <Search size={20} className="opacity-30 group-focus-within:opacity-100 group-focus-within:text-ios-orange" />
                <input
                  autoFocus
                  type="text"
                  placeholder="What are you looking for?"
                  value={navSearchQuery}
                  onChange={(e) => setNavSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && navSearchQuery.trim()) {
                      navigate(`/shop?q=${encodeURIComponent(navSearchQuery.trim())}`);
                      setIsSearchOpen(false);
                      setNavSearchQuery('');
                    }
                  }}
                  className="bg-transparent border-none outline-none px-4 py-1 text-lg w-full font-medium"
                />
              </div>
              
              <div className="mt-8 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest opacity-40">
                <span>Press Enter to search in shop</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

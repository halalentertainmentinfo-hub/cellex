import React from 'react';
import { motion } from 'motion/react';
import { Zap, Search, User, ArrowRight, Cloud, ChevronLeft, ChevronRight, ShoppingCart, Star, Bell } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { useProductStore, useNotificationStore, useAuthStore } from '../store';
import { formatPrice, cn } from '../lib/utils';
import { toast } from 'sonner';
import { LOGO_URL } from '../constants';

export const Home = () => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const { products } = useProductStore();
  const { notifications } = useNotificationStore();
  const { user } = useAuthStore();
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const heroProduct = products.find(p => p.isFeatured) || products[0];
  const allFeaturedProducts = products.filter(p => p.isFeatured);
  
  // If no featured products, use all products as fallback
  const baseProducts = allFeaturedProducts.length > 0 ? allFeaturedProducts : products;
  
  // Display 8 products initially (2 rows of 4), or all if expanded
  // Sort products by ID or creation date if available (mocking with reverse for now to show newest)
  const sortedProducts = [...products].reverse();
  const displayProducts = isExpanded ? sortedProducts : sortedProducts.slice(0, 8);

  const profileLink = user ? (user.role === 'admin' ? '/admin' : '/account') : '/login';

  const [homeSearch, setHomeSearch] = React.useState('');
  const navigate = useNavigate();
  
  const handleHomeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (homeSearch.trim()) {
      navigate(`/shop?q=${encodeURIComponent(homeSearch.trim())}`);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Top Navigation Bar (Neumorphic) */}
        <div className="neu-flat p-4 mb-8 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 gap-4 sm:gap-0">
          <div className="flex items-center justify-between w-full sm:w-auto gap-8">
            <Link to="/" className="w-10 h-10 sm:w-12 sm:h-12 neu-button flex items-center justify-center overflow-hidden rounded-full">
              <img src={LOGO_URL} alt="Cellex Logo" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium opacity-60">
              <Link to="/" className="hover:opacity-100 transition-opacity">Home</Link>
              <Link to="/shop" className="hover:opacity-100 transition-opacity">Shop</Link>
            </nav>
            <div className="flex sm:hidden items-center gap-2">
              <Link to="/cart" className="w-10 h-10 neu-button flex items-center justify-center relative">
                <ShoppingCart size={18} className="opacity-60" />
              </Link>
              <Link to="/notifications" className="w-10 h-10 neu-button flex items-center justify-center relative">
                <Bell size={18} className={cn("opacity-60", unreadCount > 0 && "text-ios-orange opacity-100")} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-ios-orange rounded-full animate-pulse shadow-lg" />
                )}
              </Link>
              <Link to={profileLink} className="w-10 h-10 neu-button flex items-center justify-center">
                <User size={18} className="opacity-60" />
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <form onSubmit={handleHomeSearch} className="neu-inset px-4 sm:px-6 py-2 flex items-center gap-3 flex-1 sm:w-64 group focus-within:ring-2 ring-ios-orange/20 transition-all">
              <Search size={16} className="opacity-40 group-focus-within:opacity-100 group-focus-within:text-ios-orange" />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={homeSearch}
                onChange={(e) => setHomeSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full opacity-60 group-focus-within:opacity-100"
              />
            </form>
            <div className="hidden sm:flex items-center gap-4">
              <Link to="/cart" className="w-10 h-10 neu-button flex items-center justify-center relative">
                <ShoppingCart size={18} className="opacity-60" />
              </Link>
              <Link to="/notifications" className="w-10 h-10 neu-button flex items-center justify-center relative">
                <Bell size={18} className={cn("opacity-60", unreadCount > 0 && "text-ios-orange opacity-100")} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3 h-3 bg-ios-orange rounded-full animate-pulse shadow-lg" />
                )}
              </Link>
              <Link to={profileLink} className="w-10 h-10 neu-button flex items-center justify-center">
                <User size={18} className="opacity-60" />
              </Link>
            </div>
          </div>
        </div>

        {/* Main Bento Grid - Hidden on Mobile */}
        <div className="hidden lg:grid lg:grid-cols-[400px_1fr] gap-8 mb-12">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Hero Promo Card */}
            <div className="neu-flat p-10 relative overflow-hidden h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 neu-button flex items-center justify-center mb-6">
                  <Zap size={20} className="text-ios-orange" />
                </div>
                <h2 className="text-4xl font-display font-bold tracking-tighter mb-4">Premium<br />Tech Only.</h2>
                <p className="opacity-60 text-sm leading-relaxed max-w-[200px] mb-8">
                  Curated selection of the world's most advanced gadgets.
                </p>
                
                {/* Prominent Search Bar */}
                <form onSubmit={handleHomeSearch} className="neu-inset p-2 flex items-center gap-3 group focus-within:ring-2 ring-ios-orange/20 transition-all mb-8">
                  <Search size={18} className="ml-2 opacity-40 group-focus-within:opacity-100 group-focus-within:text-ios-orange" />
                  <input 
                    type="text" 
                    placeholder="Search gadgets..." 
                    value={homeSearch}
                    onChange={(e) => setHomeSearch(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm w-full opacity-60 group-focus-within:opacity-100 py-2"
                  />
                  <button type="submit" className="neu-button p-2 text-ios-orange">
                    <ArrowRight size={18} />
                  </button>
                </form>
              </div>
              
              <div className="mt-12">
                <Link to="/shop" className="ios-button-primary inline-flex items-center gap-2">
                  Shop Now <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Hero */}
          <div className="neu-flat p-12 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
            <div className="flex-1 z-10">
              <span className="text-ios-orange font-bold text-xs uppercase tracking-[0.3em] mb-4 block">
                {heroProduct ? 'Featured Product' : 'New Arrival'}
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold tracking-tighter mb-6 leading-none">
                {heroProduct ? heroProduct.name : 'iPhone 15 Pro'}
              </h1>
              <p className="text-xl opacity-60 max-w-sm leading-relaxed mb-8">
                {heroProduct ? heroProduct.description : 'Titanium design. A17 Pro chip. A monster for gaming.'}
              </p>
              <div className="flex gap-4">
                <Link to={heroProduct ? `/product/${heroProduct.id}` : "/shop"} className="ios-button-primary">
                  {heroProduct ? 'View Details' : 'Shop Now'}
                </Link>
                <div className="w-12 h-12 neu-button flex items-center justify-center">
                  <ChevronRight size={20} className="opacity-40" />
                </div>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center relative">
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-full max-w-sm aspect-square"
              >
                <img 
                  src={heroProduct ? heroProduct.images[0] : "https://picsum.photos/seed/iphone/800/800"} 
                  alt="Featured Product" 
                  className="w-full h-full object-contain drop-shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
              {/* Floating Badge */}
              <div className="absolute top-0 right-0 neu-button p-4 flex flex-col items-center">
                <span className="text-[10px] font-bold opacity-40 uppercase">From</span>
                <span className="text-xl font-display font-bold text-ios-orange">
                  {heroProduct ? formatPrice(heroProduct.price) : '৳1,20,000'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Products Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-3xl font-display font-bold tracking-tight">Latest <span className="text-ios-orange">Arrivals</span></h2>
            <Link to="/shop" className="text-sm font-bold opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2">
              View All <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {baseProducts.length > 8 && (
            <div className="flex justify-center mt-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsExpanded(!isExpanded)}
                className="neu-button px-6 py-3 sm:px-10 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-3 hover:text-ios-orange transition-all group"
              >
                {isExpanded ? (
                  <>
                    Show Less <ChevronLeft size={16} className="rotate-90 group-hover:-translate-y-1 transition-transform" />
                  </>
                ) : (
                  <>
                    See More <ChevronRight size={16} className="rotate-90 group-hover:translate-y-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

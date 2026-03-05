import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, SlidersHorizontal, Grid, List, ChevronDown, Zap } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { MOCK_PRODUCTS } from '../lib/supabase';
import { cn } from '../lib/utils';
import { useSearchParams } from 'react-router-dom';
import { useProductStore } from '../store';

export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = React.useState(searchParams.get('q') || '');
  
  React.useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
  }, [searchParams]);
  const [priceRange, setPriceRange] = React.useState(300000);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const { products } = useProductStore();

  const filteredProducts = products.filter(product => {
    const searchWords = searchQuery.toLowerCase().trim().split(/\s+/).filter(word => word.length > 0);
    const matchesSearch = searchWords.length === 0 || searchWords.some(word => 
      product.name.toLowerCase().includes(word) || 
      product.brand.toLowerCase().includes(word) ||
      product.category.toLowerCase().includes(word)
    );
    const matchesPrice = product.price <= priceRange;
    return matchesSearch && matchesPrice;
  });

  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold mb-4 tracking-tight">
              Explore
            </h1>
            <p className="text-[var(--text-secondary)] font-medium">
              Browse our collection of premium devices.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="neu-inset flex items-center px-6 py-3 w-full md:w-80 group focus-within:ring-2 ring-ios-orange/20 transition-all">
              <Search size={18} className="opacity-30 group-focus-within:opacity-100 group-focus-within:text-ios-orange" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  if (val.trim()) {
                    setSearchParams({ q: val.trim() }, { replace: true });
                  } else {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('q');
                    setSearchParams(newParams, { replace: true });
                  }
                }}
                className="bg-transparent border-none outline-none px-3 py-1 text-sm w-full font-medium"
              />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-16">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block space-y-12">
            {/* Price Range */}
            <div>
              <h3 className="text-xs font-bold mb-8 uppercase tracking-[0.2em] opacity-40">Price Range</h3>
              <div className="px-2">
                <input
                  type="range"
                  min="0"
                  max="500000"
                  step="1000"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-ios-orange"
                />
                <div className="flex justify-between mt-6 text-[10px] font-bold opacity-40 uppercase tracking-widest">
                  <span>৳0</span>
                  <span className="text-ios-orange opacity-100">৳{priceRange}</span>
                  <span>৳500000+</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-10 neu-flat p-4 rounded-3xl sm:rounded-full px-8 gap-4 sm:gap-0">
              <div className="text-xs font-bold opacity-40 uppercase tracking-widest w-full sm:w-auto text-center sm:text-left">
                <span className="opacity-100 text-[var(--foreground)]">{filteredProducts.length}</span> results
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                <button 
                  onClick={() => setIsFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-5 py-2 neu-button text-xs font-bold uppercase tracking-widest"
                >
                  <Filter size={14} />
                  Filters
                </button>
                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex items-center gap-2 neu-inset p-1 rounded-full">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={cn("p-2 rounded-full transition-all", viewMode === 'grid' ? "neu-button text-ios-orange" : "opacity-40 hover:opacity-100")}
                    >
                      <Grid size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={cn("p-2 rounded-full transition-all", viewMode === 'list' ? "neu-button text-ios-orange" : "opacity-40 hover:opacity-100")}
                    >
                      <List size={16} />
                    </button>
                  </div>
                  <button className="flex items-center gap-2 px-5 py-2 neu-button text-xs font-bold uppercase tracking-widest">
                    Sort
                    <ChevronDown size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className={cn(
              "grid gap-8",
              viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
            )}>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full py-20 text-center">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                    <Search size={40} className="text-white/20" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">No products found</h3>
                  <p className="text-white/40">Try adjusting your filters or search query.</p>
                </div>
              )}
            </div>
          </main>
        </div>
        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {isFilterOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm lg:hidden"
                onClick={() => setIsFilterOpen(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm z-[110] bg-[var(--background)] lg:hidden p-8 overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-12">
                  <h2 className="text-2xl font-bold tracking-tight">Filters</h2>
                  <button onClick={() => setIsFilterOpen(false)} className="neu-button p-2">
                    <ChevronDown className="rotate-90" size={20} />
                  </button>
                </div>

                <div className="space-y-12">
                  {/* Price Range */}
                  <div>
                    <h3 className="text-xs font-bold mb-8 uppercase tracking-[0.2em] opacity-40">Price Range</h3>
                    <div className="px-2">
                      <input
                        type="range"
                        min="0"
                        max="500000"
                        step="1000"
                        value={priceRange}
                        onChange={(e) => setPriceRange(Number(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-ios-orange"
                      />
                      <div className="flex justify-between mt-6 text-[10px] font-bold opacity-40 uppercase tracking-widest">
                        <span>৳0</span>
                        <span className="text-ios-orange opacity-100">৳{priceRange}</span>
                        <span>৳500k+</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="w-full py-4 ios-button-primary mt-8"
                  >
                    Apply Filters
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

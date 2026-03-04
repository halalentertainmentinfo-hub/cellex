import React from 'react';
import { motion } from 'motion/react';
import { Search, Filter, SlidersHorizontal, Grid, List, ChevronDown, Zap } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { MOCK_PRODUCTS } from '../lib/supabase';
import { cn } from '../lib/utils';
import { useSearchParams } from 'react-router-dom';
import { useProductStore } from '../store';

export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = React.useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = React.useState(searchParams.get('category') || 'All');
  
  React.useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
  }, [searchParams]);
  const [priceRange, setPriceRange] = React.useState(300000);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const { products } = useProductStore();

  const categories = ['All', 'Smartphones', 'Laptops', 'Audio', 'Wearables', 'Tablets'];
  const showCategoriesOnly = searchParams.get('filter') === 'categories';

  const filteredProducts = products.filter(product => {
    const searchWords = searchQuery.toLowerCase().trim().split(/\s+/).filter(word => word.length > 0);
    const matchesSearch = searchWords.length === 0 || searchWords.some(word => 
      product.name.toLowerCase().includes(word) || 
      product.brand.toLowerCase().includes(word) ||
      product.category.toLowerCase().includes(word)
    );
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesPrice = product.price <= priceRange;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <h1 className="text-6xl font-display font-bold mb-4 tracking-tight">
              {showCategoriesOnly ? 'Categories' : 'Explore'}
            </h1>
            <p className="text-[var(--text-secondary)] font-medium">
              {showCategoriesOnly ? 'Select a category to browse products.' : 'Browse our collection of premium devices.'}
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

        {showCategoriesOnly && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete('filter');
                  newParams.set('category', cat);
                  setSearchParams(newParams);
                }}
                className={cn(
                  "neu-flat p-6 flex flex-col items-center justify-center gap-4 transition-all duration-300 group",
                  selectedCategory === cat ? "ring-2 ring-ios-orange" : "hover:scale-105"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                  selectedCategory === cat ? "bg-ios-orange text-white" : "bg-white/5 group-hover:bg-ios-orange/10"
                )}>
                  <Zap size={20} />
                </div>
                <span className="text-sm font-bold uppercase tracking-widest">{cat}</span>
              </button>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-[280px_1fr] gap-16">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block space-y-12">
            {/* Categories */}
            <div>
              <h3 className="text-xs font-bold mb-8 uppercase tracking-[0.2em] opacity-40">Categories</h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 flex items-center justify-between group font-semibold",
                      selectedCategory === cat 
                        ? "bg-ios-orange text-white shadow-lg shadow-ios-orange/20" 
                        : "hover:bg-white/5 opacity-60 hover:opacity-100"
                    )}
                  >
                    {cat}
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-bold",
                      selectedCategory === cat ? "bg-white/20" : "bg-white/10"
                    )}>
                      {cat === 'All' ? products.length : products.filter(p => p.category === cat).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

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
            <div className="flex items-center justify-between mb-10 neu-flat p-4 rounded-full px-8">
              <div className="text-xs font-bold opacity-40 uppercase tracking-widest">
                <span className="opacity-100 text-[var(--foreground)]">{filteredProducts.length}</span> results
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 neu-inset p-1 rounded-full">
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
      </div>
    </div>
  );
};

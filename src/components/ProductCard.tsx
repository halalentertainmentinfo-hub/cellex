import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Eye, Star } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Product, useCartStore } from '../store';
import { formatPrice, cn } from '../lib/utils';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCartStore();
  const navigate = useNavigate();

  const isStockOut = product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isStockOut) {
      toast.error('This product is currently out of stock');
      return;
    }

    // If product has variants, navigate to detail page to let user choose
    if (product.colors?.length || product.ramOptions?.length || product.storageOptions?.length) {
      navigate(`/product/${product.id}`);
      toast.info('Please select your preferred variants');
      return;
    }

    addItem(product);
    toast.success(`${product.name} added to cart!`, {
      style: {
        background: 'var(--card-bg)',
        border: '1px solid var(--glass-border)',
        color: 'var(--foreground)',
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn("group relative h-full", isStockOut && "grayscale opacity-80")}
    >
      <Link to={`/product/${product.id}`} className="block h-full">
        <div className="neu-flat overflow-hidden p-3 sm:p-6 h-full flex flex-col relative">
          {/* Stock Out Badge */}
          {isStockOut && (
            <div className="absolute top-4 right-4 z-10">
              <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">
                Stock Out
              </span>
            </div>
          )}

          {/* Image Container */}
          <div className="relative aspect-square rounded-2xl overflow-hidden neu-inset mb-4 sm:mb-6">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-125 rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">{product.brand}</span>
              <div className="flex items-center gap-1 opacity-60">
                <Star size={10} className="text-ios-gold fill-ios-gold" />
                <span className="text-[10px] font-bold">{product.rating ? product.rating.toFixed(1) : '5.0'}</span>
              </div>
            </div>
            
            <h3 className="text-sm sm:text-lg font-bold mb-2 sm:mb-4 group-hover:text-ios-orange transition-colors line-clamp-1 tracking-tight">
              {product.name}
            </h3>
            
            <div className="mt-auto flex items-center justify-between gap-2">
              <span className="text-lg sm:text-xl font-display font-bold text-ios-orange truncate">
                {formatPrice(product.price)}
              </span>
              <motion.button 
                whileHover={!isStockOut ? { scale: 1.1 } : {}}
                whileTap={!isStockOut ? { scale: 0.9 } : {}}
                onClick={handleAddToCart}
                disabled={isStockOut}
                className={cn(
                  "w-9 h-9 sm:w-10 sm:h-10 neu-button flex-shrink-0 flex items-center justify-center transition-all duration-300",
                  isStockOut ? "opacity-20 cursor-not-allowed" : "hover:text-ios-orange"
                )}
              >
                <ShoppingCart size={14} className="sm:hidden" />
                <ShoppingCart size={16} className="hidden sm:block" />
              </motion.button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Truck, RotateCcw, CreditCard, Wallet } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore, useAuthStore, useOrderStore } from '../store';
import { formatPrice, cn } from '../lib/utils';
import { toast } from 'sonner';

export const Cart = () => {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { addOrder } = useOrderStore();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = React.useState<'card' | 'cod'>('cod');
  const [address, setAddress] = React.useState('');
  const [phone, setPhone] = React.useState(user?.phone || '');

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    if (!user) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }

    if (!address.trim() || !phone.trim()) {
      toast.error('Please provide shipping address and phone number');
      return;
    }

    // Save order to store
    await addOrder({
      userId: user.id,
      userName: user.name || user.email.split('@')[0],
      items: [...items],
      total: total * 1.08, // Including estimated tax
    }, address, phone);

    toast.success('Order placed successfully!', {
      description: paymentMethod === 'card' ? 'Payment processed via Card.' : 'Cash on delivery confirmed.',
      style: {
        background: 'var(--card-bg)',
        border: '1px solid var(--glass-border)',
        color: 'var(--foreground)',
      }
    });
    clearCart();
    navigate('/account');
  };

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-20 px-6 min-h-screen flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-32 h-32 neu-button flex items-center justify-center mb-8"
        >
          <ShoppingBag size={64} className="opacity-20" />
        </motion.div>
        <h1 className="text-4xl font-display font-bold mb-4">Your cart is empty</h1>
        <p className="text-white/50 mb-10 max-w-sm">
          Looks like you haven't added any premium gadgets to your cart yet.
        </p>
        <Link to="/shop">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-2xl bg-white text-black font-bold flex items-center gap-2"
          >
            Start Shopping
            <ArrowRight size={20} />
          </motion.button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold mb-10 sm:mb-16 tracking-tight">Cart</h1>

        <div className="grid lg:grid-cols-[1fr_400px] gap-12 sm:gap-16">
          {/* Items List */}
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="ios-card p-6 flex flex-col sm:flex-row items-center gap-8 group"
                >
                  <div className="w-32 h-32 neu-inset overflow-hidden flex-shrink-0 p-2 rounded-2xl">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-1000"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-xl font-bold mb-1 tracking-tight">{item.name}</h3>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-40">{item.category} • {item.brand}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.selectedColor && (
                            <span className="px-2 py-1 rounded-lg bg-ios-orange/10 text-ios-orange text-[9px] font-bold uppercase tracking-widest border border-ios-orange/20">
                              {item.selectedColor}
                            </span>
                          )}
                          {item.selectedRam && (
                            <span className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[9px] font-bold uppercase tracking-widest border border-blue-500/20">
                              {item.selectedRam}
                            </span>
                          )}
                          {item.selectedStorage && (
                            <span className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-[9px] font-bold uppercase tracking-widest border border-purple-500/20">
                              {item.selectedStorage}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-2xl font-display font-bold text-ios-orange">
                        {formatPrice(item.price)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-between gap-6">
                      <div className="flex items-center gap-4 neu-inset p-1 rounded-full">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1, {
                            color: item.selectedColor,
                            ram: item.selectedRam,
                            storage: item.selectedStorage
                          })}
                          className="w-8 h-8 neu-button flex items-center justify-center active:scale-90"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, {
                            color: item.selectedColor,
                            ram: item.selectedRam,
                            storage: item.selectedStorage
                          })}
                          className="w-8 h-8 neu-button flex items-center justify-center active:scale-90"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id, {
                          color: item.selectedColor,
                          ram: item.selectedRam,
                          storage: item.selectedStorage
                        })}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Promo Code - Moved here */}
            <div className="ios-card p-6 mt-12 max-w-md">
              <h3 className="text-xs font-bold mb-4 uppercase tracking-widest opacity-40">Promo Code</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-2 text-sm outline-none focus:border-ios-orange/50 transition-all"
                />
                <button className="px-5 py-2 ios-glass rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Summary */}
          <aside className="space-y-8">
            <div className="ios-card p-10 sticky top-32">
              <h2 className="text-2xl font-bold mb-10 tracking-tight">Summary</h2>
              
              <div className="space-y-5 mb-10">
                <div className="flex justify-between text-sm font-medium opacity-60">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium opacity-60">
                  <span>Shipping</span>
                  <span className="text-ios-orange font-bold uppercase text-[10px] tracking-widest">Free</span>
                </div>
                <div className="flex justify-between text-sm font-medium opacity-60">
                  <span>Tax (Estimated)</span>
                  <span>{formatPrice(total * 0.08)}</span>
                </div>
                <div className="h-px bg-white/5 my-6" />
                <div className="flex justify-between text-2xl font-bold tracking-tight">
                  <span>Total</span>
                  <span className="text-ios-orange">{formatPrice(total * 1.08)}</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Shipping Details</label>
                <div className="space-y-3">
                  <div className="neu-inset px-4 py-3 flex items-center gap-3">
                    <Truck size={16} className="opacity-30" />
                    <input 
                      type="text" 
                      placeholder="Shipping Address" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="bg-transparent border-none outline-none text-sm w-full"
                    />
                  </div>
                  <div className="neu-inset px-4 py-3 flex items-center gap-3">
                    <RotateCcw size={16} className="opacity-30" />
                    <input 
                      type="tel" 
                      placeholder="Phone Number" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-transparent border-none outline-none text-sm w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Payment Method</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod('cod')}
                    className={cn(
                      "p-4 rounded-2xl border transition-all flex flex-col items-center gap-2",
                      paymentMethod === 'cod' 
                        ? "neu-inset border-ios-orange/20 text-ios-orange" 
                        : "bg-black/5 border-transparent opacity-60"
                    )}
                  >
                    <Wallet size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Cash on Delivery</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={cn(
                      "p-4 rounded-2xl border transition-all flex flex-col items-center gap-2",
                      paymentMethod === 'card' 
                        ? "neu-inset border-ios-orange/20 text-ios-orange" 
                        : "bg-black/5 border-transparent opacity-60"
                    )}
                  >
                    <CreditCard size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Credit Card</span>
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                className="w-full ios-button-primary py-5 text-lg mb-8"
              >
                Checkout Now
              </motion.button>

              <div className="space-y-5">
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest opacity-40">
                  <ShieldCheck size={16} className="text-ios-orange" />
                  Secure Cellex Pay
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest opacity-40">
                  <Truck size={16} className="text-ios-orange" />
                  Free Express Shipping
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

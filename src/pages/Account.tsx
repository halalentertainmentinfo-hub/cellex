import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Package, Settings, LogOut, ChevronRight, Mail, Shield, Camera, Phone, CreditCard, Bell, Download } from 'lucide-react';
import { useAuthStore, useOrderStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { formatPrice, cn } from '../lib/utils';
import { generateOrderPDF } from '../lib/pdf';

export const Account = () => {
  const { user, logout, updateUser } = useAuthStore();
  const { orders } = useOrderStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = React.useState<'profile' | 'orders' | 'security' | 'settings'>('profile');
  
  const [editName, setEditName] = React.useState(user?.name || '');
  const [editPhone, setEditPhone] = React.useState(user?.phone || '');

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateUser({ profileImage: reader.result as string });
        toast.success('Profile picture updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name: editName, phone: editPhone });
    toast.success('Profile updated successfully!');
  };

  const toggle2FA = () => {
    const newState = !user.twoFactorEnabled;
    updateUser({ twoFactorEnabled: newState });
    toast.success(`Two-Factor Authentication ${newState ? 'enabled' : 'disabled'}`);
  };

  const handleAddCard = () => {
    const newCard = {
      id: Math.random().toString(36).substring(7),
      last4: Math.floor(1000 + Math.random() * 9000).toString(),
      brand: 'Visa',
      expiry: '12/28'
    };
    const currentCards = user.savedCards || [];
    updateUser({ savedCards: [...currentCards, newCard] });
    toast.success('New card added successfully!');
  };

  const handleRemoveCard = (cardId: string) => {
    const currentCards = user.savedCards || [];
    updateUser({ savedCards: currentCards.filter(c => c.id !== cardId) });
    toast.success('Card removed successfully!');
  };

  if (!user) {
    return null;
  }

  const userOrders = orders.filter(o => o.userId === user.id);

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-display font-bold mb-12 tracking-tight">MY <span className="text-ios-orange">PROFILE</span></h1>

        <div className="grid lg:grid-cols-[320px_1fr] gap-12">
          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="neu-flat p-8 text-center relative group">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="w-full h-full rounded-full neu-inset flex items-center justify-center overflow-hidden">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-ios-orange font-bold text-5xl">{user.email[0].toUpperCase()}</span>
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-10 h-10 neu-button flex items-center justify-center text-ios-orange bg-[var(--card-bg)]"
                >
                  <Camera size={18} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
              <h2 className="text-xl font-bold mb-1 truncate">{user.name || user.email.split('@')[0]}</h2>
              <p className="text-sm opacity-40 mb-6 truncate">{user.email}</p>
              <div className="flex justify-center">
                <span className="px-3 py-1 rounded-full bg-ios-orange/10 text-ios-orange text-[10px] font-bold uppercase tracking-widest border border-ios-orange/20">
                  {user.role}
                </span>
              </div>
            </div>

            <nav className="neu-flat p-4 space-y-2">
              {[
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'orders', label: 'Orders', icon: Package },
                { id: 'security', label: 'Security', icon: Shield },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-sm font-bold group",
                    activeTab === item.id ? "neu-inset text-ios-orange" : "hover:bg-white/5 opacity-60 hover:opacity-100"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} />
                    {item.label}
                  </div>
                  <ChevronRight size={16} className={cn("transition-transform", activeTab === item.id ? "translate-x-1" : "opacity-0")} />
                </button>
              ))}
              <div className="pt-4 mt-4 border-t border-black/5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-all text-sm font-bold"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="h-full">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full"
                >
                  <div className="neu-flat p-8 h-full flex flex-col">
                    <h3 className="text-2xl font-bold mb-8 tracking-tight">Personal Information</h3>
                    <form onSubmit={handleUpdateProfile} className="space-y-6 flex-1 flex flex-col justify-between">
                      <div className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Full Name</label>
                            <input 
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full neu-inset px-4 py-3 text-sm font-medium outline-none focus:border-ios-orange/50 transition-all"
                              placeholder="Your Name"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Phone Number</label>
                            <div className="relative">
                              <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-ios-orange opacity-60" />
                              <input 
                                type="tel"
                                value={editPhone}
                                onChange={(e) => setEditPhone(e.target.value)}
                                className="w-full neu-inset pl-12 pr-4 py-3 text-sm font-medium outline-none focus:border-ios-orange/50 transition-all"
                                placeholder="+880 1XXX XXXXXX"
                              />
                            </div>
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Email Address</label>
                            <div className="neu-inset px-4 py-3 text-sm font-medium flex items-center gap-3 opacity-60 cursor-not-allowed">
                              <Mail size={14} className="text-ios-orange" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="pt-8">
                        <button type="submit" className="ios-button-primary px-12 py-4 w-full sm:w-auto">
                          Update Profile
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="neu-flat p-8">
                    <h3 className="text-2xl font-bold mb-8 tracking-tight">Order History</h3>
                    {userOrders.length > 0 ? (
                      <div className="space-y-6">
                        {userOrders.map((order) => (
                          <div key={order.id} className="neu-inset p-6 rounded-3xl">
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                              <div>
                                <span className="text-ios-orange font-mono font-bold">{order.id}</span>
                                <span className="mx-2 opacity-20">|</span>
                                <span className="text-xs opacity-40">{new Date(order.createdAt).toLocaleDateString()}</span>
                              </div>
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border",
                                order.status === 'DELIVERED' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                order.status === 'CONFIRMED' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                order.status === 'SHIPPED' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                order.status === 'CANCELLED' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                              )}>
                                {order.status}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col gap-4">
                                <div className="flex -space-x-3">
                                  {order.items.map((item, i) => (
                                    <div key={i} className="w-10 h-10 rounded-xl border-2 border-[var(--card-bg)] overflow-hidden bg-white group relative">
                                      <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[8px] text-white font-bold">
                                        x{item.quantity}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="space-y-1">
                                  {order.items.map((item, i) => (
                                    <div key={i} className="text-[10px] opacity-60">
                                      <span className="font-bold">{item.name}</span>
                                      {(item.selectedColor || item.selectedRam || item.selectedStorage) && (
                                        <span className="ml-2 opacity-40">
                                          ({[item.selectedColor, item.selectedRam, item.selectedStorage].filter(Boolean).join(' / ')})
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <button 
                                  onClick={() => generateOrderPDF(order)}
                                  className="neu-button p-2 text-ios-orange"
                                  title="Download Invoice"
                                >
                                  <Download size={16} />
                                </button>
                                <span className="text-xl font-display font-bold">{formatPrice(order.total)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 neu-button flex items-center justify-center mx-auto mb-6">
                          <Package size={32} className="opacity-20" />
                        </div>
                        <p className="opacity-40 mb-6">You haven't placed any orders yet.</p>
                        <button 
                          onClick={() => navigate('/shop')}
                          className="ios-button-primary px-8 py-3"
                        >
                          Start Shopping
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="neu-flat p-8">
                    <h3 className="text-2xl font-bold mb-8 tracking-tight">Security Settings</h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-6 neu-inset rounded-3xl">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 neu-button flex items-center justify-center transition-colors",
                            user.twoFactorEnabled ? "text-green-500" : "text-ios-orange"
                          )}>
                            <Shield size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold">Two-Factor Authentication</h4>
                            <p className="text-xs opacity-40">Add an extra layer of security to your account.</p>
                          </div>
                        </div>
                        <button 
                          onClick={toggle2FA}
                          className={cn(
                            "font-bold text-sm px-4 py-2 rounded-full transition-all",
                            user.twoFactorEnabled ? "bg-green-500/10 text-green-500" : "text-ios-orange"
                          )}
                        >
                          {user.twoFactorEnabled ? 'Enabled' : 'Enable'}
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-6 neu-inset rounded-3xl">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 neu-button flex items-center justify-center text-ios-orange">
                            <LogOut size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold">Active Sessions</h4>
                            <p className="text-xs opacity-40">Manage your logged in devices.</p>
                          </div>
                        </div>
                        <button className="text-ios-orange font-bold text-sm">Manage</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="neu-flat p-8">
                    <h3 className="text-2xl font-bold mb-8 tracking-tight">Account Settings</h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-6 neu-inset rounded-3xl">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 neu-button flex items-center justify-center text-ios-orange">
                            <Bell size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold">Notifications</h4>
                            <p className="text-xs opacity-40">Choose what updates you want to receive.</p>
                          </div>
                        </div>
                        <button className="text-ios-orange font-bold text-sm">Configure</button>
                      </div>
                      
                      <div className="p-6 neu-inset rounded-3xl space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 neu-button flex items-center justify-center text-ios-orange">
                              <CreditCard size={20} />
                            </div>
                            <div>
                              <h4 className="font-bold">Payment Methods</h4>
                              <p className="text-xs opacity-40">Manage your saved cards and billing info.</p>
                            </div>
                          </div>
                          <button 
                            onClick={handleAddCard}
                            className="text-ios-orange font-bold text-sm"
                          >
                            Add Card
                          </button>
                        </div>

                        {user.savedCards && user.savedCards.length > 0 && (
                          <div className="space-y-4 pt-4 border-t border-black/5">
                            {user.savedCards.map((card) => (
                              <div key={card.id} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-6 bg-ios-orange/20 rounded flex items-center justify-center text-[8px] font-bold">
                                    {card.brand.toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold">•••• •••• •••• {card.last4}</p>
                                    <p className="text-[10px] opacity-40">Expires {card.expiry}</p>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => handleRemoveCard(card.id)}
                                  className="text-red-500 text-xs font-bold opacity-60 hover:opacity-100"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

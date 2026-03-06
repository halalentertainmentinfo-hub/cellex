import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  User,
  TrendingUp, 
  Plus, 
  MoreVertical,
  ArrowRight,
  Search,
  LogOut,
  MessageSquare,
  FileText,
  ArrowDownCircle,
  ArrowUpCircle,
  Eye,
  Bell,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  RefreshCw,
  Edit2,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatPrice, cn } from '../lib/utils';
import { generateOrderPDF } from '../lib/pdf';
import { MOCK_PRODUCTS } from '../lib/supabase';
import { useUserStore, useOrderStore, useAuthStore, useProductStore, useOrderRequestStore, useNotificationStore, Product } from '../store';
import { toast } from 'sonner';

export const AdminDashboard = () => {
  const { orders, updateOrderStatus, fetchOrders, incompleteOrders, fetchIncompleteOrders } = useOrderStore();
  const { products, addProduct, updateProduct, removeProduct, fetchProducts } = useProductStore();
  const { requests, updateRequestStatus, fetchRequests } = useOrderRequestStore();
  const { notifications, addNotification, fetchNotifications } = useNotificationStore();
  const { users, fetchUsers } = useUserStore();
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchOrders(),
      fetchProducts(),
      fetchRequests(),
      fetchIncompleteOrders(),
      fetchNotifications(),
      fetchUsers()
    ]);
    setIsRefreshing(false);
    toast.success('Data refreshed!');
  };

  React.useEffect(() => {
    handleRefresh();
  }, []);

  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'users' | 'orders' | 'confirmed' | 'cancelled' | 'products' | 'requests' | 'notifications' | 'incomplete_orders'>('dashboard');
  const [isAddingProduct, setIsAddingProduct] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);
  
  const [notifTitle, setNotifTitle] = React.useState('');
  const [notifMessage, setNotifMessage] = React.useState('');
  const [notifType, setNotifType] = React.useState<'info' | 'success' | 'warning'>('info');

  const filteredOrders = React.useMemo(() => {
    if (activeTab === 'orders') return orders.filter(o => o.status === 'PENDING');
    if (activeTab === 'confirmed') return orders.filter(o => o.status === 'CONFIRMED');
    if (activeTab === 'cancelled') return orders.filter(o => o.status === 'CANCELLED');
    return orders;
  }, [orders, activeTab]);

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    addNotification({
      title: notifTitle,
      message: notifMessage,
      type: notifType
    });
    toast.success('Notification broadcasted to all users!');
    setNotifTitle('');
    setNotifMessage('');
  };
  const [newProduct, setNewProduct] = React.useState({
    name: '',
    price: 0,
    category: 'Smartphones',
    brand: '',
    images: [] as string[],
    specs: {},
    stock: 10,
    description: '',
    battery: '',
    displaySize: '',
    colors: '',
    ramOptions: '',
    storageOptions: '',
    isFeatured: false,
    rating: 5.0
  });

  const [uploading, setUploading] = React.useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setNewProduct(prev => ({
        ...prev,
        images: [base64String]
      }));
      setUploading(false);
      toast.success('Image uploaded successfully!');
    };
    reader.onerror = () => {
      setUploading(false);
      toast.error('Failed to upload image');
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product.id);
    setNewProduct({
      name: product.name,
      price: product.price,
      category: product.category || 'Smartphones',
      brand: product.brand,
      images: product.images,
      specs: product.specs || {},
      stock: product.stock,
      description: product.description,
      battery: product.battery || '',
      displaySize: product.displaySize || '',
      colors: Array.isArray(product.colors) ? product.colors.join(', ') : '',
      ramOptions: Array.isArray(product.ramOptions) ? product.ramOptions.join(', ') : '',
      storageOptions: Array.isArray(product.storageOptions) ? product.storageOptions.join(', ') : '',
      isFeatured: product.isFeatured || false,
      rating: product.rating || 5.0
    });
    setIsAddingProduct(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await removeProduct(productId);
      toast.success('Product deleted successfully!');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newProduct.images.length === 0) {
      toast.error('Please upload a product image');
      return;
    }

    const productData = {
      ...newProduct,
      colors: typeof newProduct.colors === 'string' ? newProduct.colors.split(',').map(c => c.trim()).filter(c => c) : newProduct.colors,
      ramOptions: typeof newProduct.ramOptions === 'string' ? newProduct.ramOptions.split(',').map(r => r.trim()).filter(r => r) : newProduct.ramOptions,
      storageOptions: typeof newProduct.storageOptions === 'string' ? newProduct.storageOptions.split(',').map(s => s.trim()).filter(s => s) : newProduct.storageOptions,
      isFeatured: newProduct.isFeatured,
      rating: newProduct.rating
    };

    if (editingProduct) {
      await updateProduct(editingProduct, productData as any);
      toast.success('Product updated successfully!');
    } else {
      await addProduct(productData as any);
      toast.success('Product added successfully!');
    }

    setIsAddingProduct(false);
    setEditingProduct(null);
    setNewProduct({
      name: '',
      price: 0,
      category: 'Smartphones',
      brand: '',
      images: [],
      specs: {},
      stock: 10,
      description: '',
      battery: '',
      displaySize: '',
      colors: '',
      ramOptions: '',
      storageOptions: '',
      isFeatured: false,
      rating: 5.0
    });
  };
  
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  
  const today = new Date().toDateString();
  const dailySales = orders
    .filter(order => new Date(order.createdAt).toDateString() === today)
    .reduce((sum, order) => sum + order.total, 0);

  const stockIn = products.reduce((sum, product) => sum + (product.stock || 0), 0);
  
  const stockOut = orders.reduce((sum, order) => {
    return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
  }, 0);

  const stats = [
    { label: 'Daily Sales', value: formatPrice(dailySales), icon: TrendingUp, color: 'text-ios-orange' },
    { label: 'Stock In', value: `${stockIn} Units`, icon: ArrowDownCircle, color: 'text-emerald-500' },
    { label: 'Stock Out', value: `${stockOut} Units`, icon: ArrowUpCircle, color: 'text-red-500' },
    { label: 'Total Orders', value: orders.length.toString(), icon: ShoppingBag, color: 'text-ios-orange' },
  ];

  // Display real orders
  const displayOrders = orders.slice(0, 5);

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-5xl font-display font-bold mb-2 tracking-tight">Admin Portal</h1>
            <p className="text-[var(--text-secondary)] font-medium">Management system for Cellex Premium Store.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="neu-button flex items-center gap-2 px-6 py-3"
            >
              <RefreshCw size={20} className={cn(isRefreshing && "animate-spin text-ios-orange")} />
              Refresh
            </button>
            <button 
              onClick={handleLogout}
              className="neu-button flex items-center gap-2 text-red-500 px-6 py-3"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="neu-flat p-2 mb-12 flex flex-wrap items-center gap-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'confirmed', label: 'Confirmed', icon: CheckCircle },
            { id: 'cancelled', label: 'Cancelled', icon: XCircle },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'requests', label: 'Requests', icon: MessageSquare },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'incomplete_orders', label: 'Incomplete', icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-300 font-bold text-sm",
                activeTab === tab.id 
                  ? "neu-inset text-ios-orange" 
                  : "opacity-40 hover:opacity-100"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'incomplete_orders' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-display font-bold tracking-tight">Incomplete Orders</h2>
                <p className="text-sm opacity-40 mt-1">Users who added items to cart but haven't checked out yet.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 neu-inset rounded-xl text-xs font-bold text-ios-orange">
                  {incompleteOrders.length} Abandoned Carts
                </div>
                <button 
                  onClick={fetchIncompleteOrders}
                  className={cn(
                    "w-10 h-10 neu-button flex items-center justify-center hover:text-ios-orange transition-all",
                    isRefreshing && "animate-spin"
                  )}
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {incompleteOrders.length > 0 ? (
                incompleteOrders.map((order) => (
                  <div key={order.id} className="neu-flat p-8 group hover:bg-white/[0.02] transition-colors">
                    <div className="flex flex-col lg:flex-row justify-between gap-10">
                      {/* User Info */}
                      <div className="lg:w-1/4 space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 neu-button flex items-center justify-center text-ios-orange overflow-hidden">
                            <img 
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${order.userName}`} 
                              alt="" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold truncate max-w-[150px]">{order.userName}</h3>
                            <span className="px-2 py-0.5 rounded-full bg-ios-orange/10 text-ios-orange text-[8px] font-bold uppercase tracking-widest border border-ios-orange/20">
                              Potential Customer
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-sm">
                            <Users size={16} className="text-ios-orange opacity-60" />
                            <span className="font-medium">{order.userPhone || 'No phone provided'}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs opacity-40">
                            <Clock size={16} />
                            <span>Cart active since: {new Date(order.createdAt).toLocaleString()}</span>
                          </div>
                        </div>

                        <button 
                          onClick={() => {
                            const user = users.find(u => u.id === order.userId || u.name === order.userName);
                            if (user) {
                              useAuthStore.getState().setUser(user);
                              navigate('/account');
                              toast.success(`Viewing account of ${user.name}`);
                            } else {
                              toast.error('User account not found');
                            }
                          }}
                          className="w-full py-3 neu-button text-[10px] font-bold uppercase tracking-widest hover:text-ios-orange transition-all"
                        >
                          View Account
                        </button>
                      </div>

                      {/* Cart Items */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xs font-bold uppercase tracking-widest opacity-40">Cart Contents</h4>
                          <span className="text-[10px] font-bold opacity-40">{order.items.length} Items</span>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 neu-inset rounded-2xl">
                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 p-1">
                                <img src={item.images[0]} alt="" className="w-full h-full object-cover rounded-lg" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate">{item.name}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {item.selectedColor && <span className="px-1 py-0.5 bg-ios-orange/10 text-ios-orange rounded-[4px] text-[7px] font-bold uppercase">{item.selectedColor}</span>}
                                  {item.selectedRam && <span className="px-1 py-0.5 bg-blue-500/10 text-blue-400 rounded-[4px] text-[7px] font-bold uppercase">{item.selectedRam}</span>}
                                  {item.selectedStorage && <span className="px-1 py-0.5 bg-purple-500/10 text-purple-400 rounded-[4px] text-[7px] font-bold uppercase">{item.selectedStorage}</span>}
                                </div>
                                <p className="text-[10px] opacity-40 mt-1">Quantity: {item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold">{formatPrice(item.price * item.quantity)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Summary & Action */}
                      <div className="lg:w-1/5 flex flex-col justify-between items-end">
                        <div className="text-right">
                          <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-1">Cart Value</p>
                          <p className="text-4xl font-display font-bold text-ios-orange">{formatPrice(order.total)}</p>
                        </div>
                        
                        <div className="space-y-3 w-full">
                          <button className="w-full py-4 ios-button-primary text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                            <Send size={14} />
                            Send Offer
                          </button>
                          <p className="text-[9px] text-center opacity-30 italic">User will see this in their notifications</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="neu-flat p-20 text-center">
                  <div className="w-20 h-20 neu-button flex items-center justify-center mx-auto mb-6 text-ios-orange opacity-20">
                    <ShoppingBag size={40} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">No incomplete orders</h3>
                  <p className="text-[var(--text-secondary)]">All carts are either empty or have been converted to orders.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            {/* Daily Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Daily Sales', value: formatPrice(dailySales), icon: TrendingUp, color: 'text-ios-orange' },
                { label: 'Stock In', value: `${stockIn} Units`, icon: ArrowDownCircle, color: 'text-emerald-500' },
                { label: 'Stock Out', value: `${stockOut} Units`, icon: ArrowUpCircle, color: 'text-red-500' },
                { label: 'Total Orders', value: orders.length.toString(), icon: ShoppingBag, color: 'text-ios-orange' },
              ].map((stat, i) => (
                <div key={i} className="neu-flat p-8">
                  <div className={cn("w-12 h-12 neu-button flex items-center justify-center mb-6", stat.color)}>
                    <stat.icon size={24} />
                  </div>
                  <div className="text-3xl font-display font-bold mb-1 tracking-tight">{stat.value}</div>
                  <div className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em]">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-[1fr_400px] gap-12">
              <div className="neu-flat overflow-hidden">
                <div className="p-8 border-b border-black/5 flex items-center justify-between">
                  <h2 className="text-2xl font-bold tracking-tight">Recent Sales & Invoices</h2>
                  <button className="text-ios-orange text-sm font-bold hover:underline">Download All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-[0.2em] opacity-40 border-b border-black/5">
                        <th className="px-8 py-4">Invoice</th>
                        <th className="px-8 py-4">Product</th>
                        <th className="px-8 py-4">Amount</th>
                        <th className="px-8 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {orders.slice(0, 10).map((order) => (
                        <tr key={order.id} className="border-b border-black/5 hover:bg-white/[0.02] transition-colors">
                          <td className="px-8 py-6 font-mono text-ios-orange">
                            {order.invoiceNumber || `#${order.id.slice(0, 8).toUpperCase()}`}
                          </td>
                          <td className="px-8 py-6">
                            <div className="font-bold">{order.items[0]?.name || 'Premium Gadget'}</div>
                            <div className="text-[10px] opacity-40">{order.userName}</div>
                          </td>
                          <td className="px-8 py-6 font-bold">{formatPrice(order.total)}</td>
                          <td className="px-8 py-6 text-right">
                            <button 
                              onClick={() => generateOrderPDF(order)}
                              className="neu-button p-2"
                            >
                              <FileText size={16} className="opacity-60" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="neu-flat p-8">
                <h2 className="text-2xl font-bold mb-8 tracking-tight">Stock Status</h2>
                <div className="space-y-6">
                  {products.slice(0, 4).map((product) => (
                    <div key={product.id} className="flex items-center gap-4">
                      <div className="w-12 h-12 neu-inset overflow-hidden flex-shrink-0 rounded-full">
                        <img src={product.images[0]} alt="" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold truncate text-sm">{product.name}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <div className="w-full bg-black/5 h-1 rounded-full mr-4">
                            <div 
                              className={cn("h-full rounded-full", product.stock < 5 ? "bg-red-500" : "bg-emerald-500")} 
                              style={{ width: `${Math.min(100, (product.stock / 20) * 100)}%` }} 
                            />
                          </div>
                          <span className="text-[10px] font-bold opacity-40">{product.stock} left</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="neu-flat p-8 flex items-center justify-between">
                <div>
                  <div className="text-4xl font-display font-bold mb-1">{users.length}</div>
                  <div className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em]">Total Users</div>
                </div>
                <div className="w-12 h-12 neu-button flex items-center justify-center text-ios-orange">
                  <Users size={24} />
                </div>
              </div>
              <div className="neu-flat p-8 flex items-center justify-between">
                <div>
                  <div className="text-4xl font-display font-bold mb-1 text-emerald-500">3</div>
                  <div className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em]">Live Active</div>
                </div>
                <div className="w-12 h-12 neu-button flex items-center justify-center text-emerald-500">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>
            </div>

            <div className="neu-flat overflow-hidden">
              <div className="p-8 border-b border-black/5">
                <h2 className="text-2xl font-bold tracking-tight">User Directory</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.2em] opacity-40 border-b border-black/5">
                      <th className="px-8 py-4">User</th>
                      <th className="px-8 py-4">Email</th>
                      <th className="px-8 py-4">Phone</th>
                      <th className="px-8 py-4">Password</th>
                      <th className="px-8 py-4">Joined Date</th>
                      <th className="px-8 py-4">Role</th>
                      <th className="px-8 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-black/5 hover:bg-white/[0.02] transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 neu-button flex items-center justify-center overflow-hidden">
                              {u.profileImage ? (
                                <img 
                                  src={u.profileImage} 
                                  alt="" 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <img 
                                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`} 
                                  alt="" 
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div>
                              <div className="font-bold">{u.name || u.email.split('@')[0]}</div>
                              <div className="text-[10px] opacity-40 uppercase tracking-widest">ID: {u.id.slice(0, 8)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="font-medium">{u.email}</div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="font-bold text-ios-orange">{u.phone || 'N/A'}</div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="font-mono text-xs opacity-60">{u.password || 'No password'}</div>
                        </td>
                        <td className="px-8 py-6 opacity-60">
                          {new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-8 py-6">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border",
                            u.role === 'admin' ? "bg-ios-orange/10 text-ios-orange border-ios-orange/20" : "bg-black/5 text-black/40 border-black/10"
                          )}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => {
                                useAuthStore.getState().setUser(u);
                                navigate('/account');
                                toast.success(`Logged in as ${u.name || u.email}`);
                              }}
                              className="neu-button p-2 text-ios-orange"
                              title="Login as User"
                            >
                              <LogOut size={16} className="rotate-180" />
                            </button>
                            <button className="neu-button p-2">
                              <Eye size={16} className="opacity-60" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {(activeTab === 'orders' || activeTab === 'confirmed' || activeTab === 'cancelled') && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            <div className="neu-flat overflow-hidden">
              <div className="p-8 border-b border-black/5 flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight capitalize">{activeTab} Management</h2>
                <div className="flex items-center gap-4">
                  <div className="neu-inset px-4 py-2 flex items-center gap-2">
                    <Search size={14} className="opacity-40" />
                    <input type="text" placeholder="Search orders..." className="bg-transparent border-none outline-none text-xs w-40" />
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.2em] opacity-40 border-b border-black/5">
                      <th className="px-8 py-4">Order ID</th>
                      <th className="px-8 py-4">Customer</th>
                      <th className="px-8 py-4">Items</th>
                      <th className="px-8 py-4">Total</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b border-black/5 hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-6 font-mono text-ios-orange">{order.id}</td>
                        <td className="px-8 py-6">
                          <div className="font-bold">{order.userName}</div>
                          <div className="text-[10px] font-bold text-ios-orange mb-1">{order.userPhone}</div>
                          <div className="text-[10px] opacity-60 mb-1 line-clamp-1">{order.address}</div>
                          <div className="text-[10px] opacity-40">{new Date(order.createdAt).toLocaleString()}</div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="font-bold">{order.items.reduce((sum: number, item: any) => sum + item.quantity, 0)}</span>
                          <div className="mt-1 space-y-1">
                            {order.items.map((item: any, i: number) => (
                              <div key={i} className="text-[9px] opacity-40 leading-tight">
                                {item.name} 
                                {(item.selectedColor || item.selectedRam || item.selectedStorage) && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {item.selectedColor && <span className="px-1.5 py-0.5 bg-ios-orange/10 text-ios-orange rounded text-[8px] font-bold uppercase">{item.selectedColor}</span>}
                                    {item.selectedRam && <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded text-[8px] font-bold uppercase">{item.selectedRam}</span>}
                                    {item.selectedStorage && <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-400 rounded text-[8px] font-bold uppercase">{item.selectedStorage}</span>}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-8 py-6 font-bold">{formatPrice(order.total)}</td>
                        <td className="px-8 py-6">
                          <select 
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                            className={cn(
                              "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border bg-transparent outline-none cursor-pointer",
                              order.status === 'DELIVERED' ? "text-green-400 border-green-500/20" :
                              order.status === 'CONFIRMED' ? "text-blue-400 border-blue-500/20" :
                              order.status === 'SHIPPED' ? "text-purple-400 border-purple-500/20" :
                              order.status === 'CANCELLED' ? "text-red-400 border-red-500/20" :
                              "text-yellow-400 border-yellow-500/20"
                            )}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                        <td className="px-8 py-6 text-right relative">
                          <button 
                            onClick={() => setActiveMenuId(activeMenuId === order.id ? null : order.id)}
                            className="neu-button p-2"
                          >
                            <MoreVertical size={18} className="opacity-40" />
                          </button>
                          
                          {activeMenuId === order.id && (
                            <div className="absolute right-8 top-16 z-50 w-48 neu-flat p-2 flex flex-col gap-1">
                              <button 
                                onClick={() => {
                                  generateOrderPDF(order);
                                  setActiveMenuId(null);
                                }}
                                className="flex items-center gap-3 px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-black/5 rounded-xl text-ios-orange"
                              >
                                <Download size={14} />
                                Download PDF
                              </button>
                              <button 
                                onClick={() => {
                                  updateOrderStatus(order.id, 'CONFIRMED');
                                  setActiveMenuId(null);
                                  toast.success(`Order ${order.id} confirmed`);
                                }}
                                className="flex items-center gap-3 px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-black/5 rounded-xl text-blue-400"
                              >
                                <CheckCircle size={14} />
                                Confirm Order
                              </button>
                              <button 
                                onClick={() => {
                                  updateOrderStatus(order.id, 'CANCELLED');
                                  setActiveMenuId(null);
                                  toast.error(`Order ${order.id} cancelled`);
                                }}
                                className="flex items-center gap-3 px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-black/5 rounded-xl text-red-400"
                              >
                                <XCircle size={14} />
                                Cancel Order
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredOrders.length === 0 && (
                  <div className="py-20 text-center opacity-40">
                    <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-bold uppercase tracking-widest">No orders found in {activeTab}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'products' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            <div className="flex justify-end">
              <button 
                onClick={() => {
                  setEditingProduct(null);
                  setNewProduct({
                    name: '',
                    price: 0,
                    category: 'Smartphones',
                    brand: '',
                    images: [],
                    specs: {},
                    stock: 10,
                    description: '',
                    battery: '',
                    displaySize: '',
                    colors: '',
                    ramOptions: '',
                    storageOptions: '',
                    isFeatured: false
                  });
                  setIsAddingProduct(true);
                }}
                className="ios-button-primary flex items-center gap-2"
              >
                <Plus size={20} />
                Add Product
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div key={product.id} className="neu-flat p-6 group">
                  <div className="aspect-square neu-inset mb-6 overflow-hidden p-4 rounded-full">
                    <img src={product.images[0]} alt="" className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{product.brand}</span>
                    <span className="text-sm font-bold text-ios-orange">{formatPrice(product.price)}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-4 truncate">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium opacity-60">Stock: {product.stock}</div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditProduct(product)}
                        className="neu-button p-2 text-ios-orange"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="neu-button p-2 text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'requests' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            <div className="neu-flat overflow-hidden">
              <div className="p-8 border-b border-black/5 flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Order Requests</h2>
                <div className="text-sm opacity-40 font-medium">Total: {requests.length}</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.2em] opacity-40 border-b border-black/5">
                      <th className="px-8 py-4">Request ID</th>
                      <th className="px-8 py-4">User</th>
                      <th className="px-8 py-4">Product Name</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {requests.length > 0 ? requests.map((req) => (
                      <tr key={req.id} className="border-b border-black/5 hover:bg-white/[0.02] transition-colors">
                        <td className="px-8 py-6 font-mono text-ios-orange">{req.id}</td>
                        <td className="px-8 py-6 font-bold">{req.userName}</td>
                        <td className="px-8 py-6">{req.productName}</td>
                        <td className="px-8 py-6">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border",
                            req.status === 'Approved' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                            req.status === 'Rejected' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                            "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                          )}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right space-x-2">
                          <button 
                            onClick={() => updateRequestStatus(req.id, 'Approved')}
                            className="text-[10px] font-bold uppercase tracking-widest text-green-500 hover:underline"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => updateRequestStatus(req.id, 'Rejected')}
                            className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:underline"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-8 py-10 text-center opacity-40">No order requests yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
        {activeTab === 'notifications' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="neu-flat p-10">
                <h2 className="text-3xl font-bold mb-8 tracking-tight">Broadcast Message</h2>
                <form onSubmit={handleSendNotification} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Notification Title</label>
                    <input 
                      type="text" 
                      required
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      className="w-full neu-inset px-4 py-3 text-sm outline-none focus:border-ios-orange/50 transition-all"
                      placeholder="e.g. New Flash Sale!"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Type</label>
                    <div className="flex gap-4">
                      {['info', 'success', 'warning'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setNotifType(type as any)}
                          className={cn(
                            "flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all",
                            notifType === type 
                              ? "bg-ios-orange/10 text-ios-orange border-ios-orange/20" 
                              : "bg-black/5 text-black/40 border-black/10"
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Message Content</label>
                    <textarea 
                      required
                      value={notifMessage}
                      onChange={(e) => setNotifMessage(e.target.value)}
                      className="w-full neu-inset px-4 py-3 text-sm outline-none focus:border-ios-orange/50 transition-all h-32 resize-none"
                      placeholder="Type your message here..."
                    />
                  </div>
                  <button type="submit" className="ios-button-primary w-full py-4 flex items-center justify-center gap-2">
                    <Send size={18} />
                    Send Notification
                  </button>
                </form>
              </div>

              <div className="space-y-8">
                <div className="neu-flat p-8">
                  <h3 className="text-xl font-bold mb-6 tracking-tight">Preview</h3>
                  <div className="neu-inset p-6 rounded-3xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold">{notifTitle || 'Title Preview'}</span>
                      <span className="text-[10px] opacity-40">Just now</span>
                    </div>
                    <p className="text-xs opacity-60">{notifMessage || 'Message content will appear here...'}</p>
                  </div>
                </div>
                
                <div className="neu-flat p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold tracking-tight">Recent Broadcasts</h3>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full ios-glass text-[10px] font-bold text-ios-orange">
                      <Eye size={12} />
                      {notifications.reduce((acc, n) => acc + (n.views || 0), 0)} Total Views
                    </div>
                  </div>
                  <div className="space-y-4">
                    {notifications.slice(0, 3).map((n) => (
                      <div key={n.id} className="p-4 border-b border-black/5 last:border-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">{n.title}</span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-[9px] opacity-40">
                              <Eye size={10} />
                              {n.views || 0}
                            </div>
                            <span className="text-[9px] opacity-40">{new Date(n.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <p className="text-[10px] opacity-60 line-clamp-1">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Add Product Modal - Full Page */}
      {isAddingProduct && (
        <div className="fixed inset-0 z-[100] bg-[var(--background)] overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-screen w-full p-6 sm:p-12 md:p-20"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-4xl sm:text-5xl font-display font-bold tracking-tight">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button 
                  onClick={() => {
                    setIsAddingProduct(false);
                    setEditingProduct(null);
                    setNewProduct({
                      name: '',
                      price: 0,
                      category: 'Smartphones',
                      brand: '',
                      images: [],
                      specs: {},
                      stock: 10,
                      description: '',
                      battery: '',
                      displaySize: '',
                      colors: '',
                      ramOptions: '',
                      storageOptions: '',
                      isFeatured: false,
                      rating: 5.0
                    });
                  }}
                  className="w-12 h-12 neu-button flex items-center justify-center text-red-500"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Product Name</label>
                    <input 
                      type="text" 
                      required
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      className="w-full neu-inset px-6 py-4 text-sm outline-none focus:border-ios-orange/50 transition-all rounded-2xl"
                      placeholder="e.g. iPhone 15 Pro"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Price (TK)</label>
                    <input 
                      type="number" 
                      required
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                      className="w-full neu-inset px-6 py-4 text-sm outline-none focus:border-ios-orange/50 transition-all rounded-2xl"
                      placeholder="e.g. 120000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Brand</label>
                    <input 
                      type="text" 
                      required
                      value={newProduct.brand}
                      onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
                      className="w-full neu-inset px-6 py-4 text-sm outline-none focus:border-ios-orange/50 transition-all rounded-2xl"
                      placeholder="e.g. Apple"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Stock Units (Available Quantity)</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                      className="w-full neu-inset px-6 py-4 text-sm outline-none focus:border-ios-orange/50 transition-all rounded-2xl font-bold text-ios-orange"
                      placeholder="e.g. 10"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Product Rating (e.g. 4.5)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    max="5"
                    value={newProduct.rating}
                    onChange={(e) => setNewProduct({...newProduct, rating: Number(e.target.value)})}
                    className="w-full neu-inset px-6 py-4 text-sm outline-none focus:border-ios-orange/50 transition-all rounded-2xl"
                    placeholder="e.g. 4.5"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Product Image</label>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-32 h-32 neu-inset rounded-3xl overflow-hidden flex items-center justify-center bg-black/5 shrink-0">
                      {newProduct.images[0] ? (
                        <img src={newProduct.images[0]} alt="Preview" className="w-full h-full object-contain" />
                      ) : (
                        <Package size={40} className="opacity-20" />
                      )}
                    </div>
                    <label className="w-full">
                      <div className={cn(
                        "neu-button py-6 px-8 text-sm font-bold text-center cursor-pointer transition-all rounded-2xl flex items-center justify-center gap-3",
                        uploading && "opacity-50 cursor-not-allowed"
                      )}>
                        {uploading ? <RefreshCw size={20} className="animate-spin" /> : <Plus size={20} />}
                        {uploading ? 'Processing Image...' : 'Upload Product Image'}
                      </div>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Battery (mAh)</label>
                    <input 
                      type="text" 
                      value={newProduct.battery}
                      onChange={(e) => setNewProduct({...newProduct, battery: e.target.value})}
                      className="w-full neu-inset px-6 py-4 text-sm outline-none focus:border-ios-orange/50 transition-all rounded-2xl"
                      placeholder="e.g. 5000 mAh"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Display Size</label>
                    <input 
                      type="text" 
                      value={newProduct.displaySize}
                      onChange={(e) => setNewProduct({...newProduct, displaySize: e.target.value})}
                      className="w-full neu-inset px-6 py-4 text-sm outline-none focus:border-ios-orange/50 transition-all rounded-2xl"
                      placeholder="e.g. 6.7 inch"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Colors (Comma separated)</label>
                  <input 
                    type="text" 
                    value={newProduct.colors}
                    onChange={(e) => setNewProduct({...newProduct, colors: e.target.value})}
                    className="w-full neu-inset px-6 py-4 text-sm outline-none focus:border-ios-orange/50 transition-all rounded-2xl"
                    placeholder="e.g. Black, White, Blue"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">RAM Options (Comma separated)</label>
                    <input 
                      type="text" 
                      value={newProduct.ramOptions}
                      onChange={(e) => setNewProduct({...newProduct, ramOptions: e.target.value})}
                      className="w-full neu-inset px-6 py-4 text-sm outline-none focus:border-ios-orange/50 transition-all rounded-2xl"
                      placeholder="e.g. 4GB, 6GB, 8GB"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Storage Options (Comma separated)</label>
                    <input 
                      type="text" 
                      value={newProduct.storageOptions}
                      onChange={(e) => setNewProduct({...newProduct, storageOptions: e.target.value})}
                      className="w-full neu-inset px-6 py-4 text-sm outline-none focus:border-ios-orange/50 transition-all rounded-2xl"
                      placeholder="e.g. 64GB, 128GB, 256GB"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 p-6 neu-inset rounded-3xl">
                  <input 
                    type="checkbox" 
                    id="isFeatured"
                    checked={newProduct.isFeatured}
                    onChange={(e) => setNewProduct({...newProduct, isFeatured: e.target.checked})}
                    className="w-6 h-6 rounded-lg accent-ios-orange"
                  />
                  <label htmlFor="isFeatured" className="text-sm font-bold opacity-60 cursor-pointer">Mark as Featured Product</label>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Description</label>
                  <textarea 
                    required
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    className="w-full neu-inset px-6 py-4 text-sm outline-none focus:border-ios-orange/50 transition-all h-40 resize-none rounded-3xl"
                    placeholder="Describe the product features and details..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-6 pt-10">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsAddingProduct(false);
                      setEditingProduct(null);
                      setNewProduct({
                        name: '',
                        price: 0,
                        category: 'Smartphones',
                        brand: '',
                        images: [],
                        specs: {},
                        stock: 10,
                        description: '',
                        battery: '',
                        displaySize: '',
                        colors: '',
                        ramOptions: '',
                        storageOptions: '',
                        isFeatured: false,
                        rating: 5.0
                      });
                    }}
                    className="flex-1 neu-button py-6 text-sm font-bold uppercase tracking-widest text-red-500 rounded-2xl"
                  >
                    Discard Changes
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 ios-button-primary py-6 text-sm font-bold uppercase tracking-widest rounded-2xl"
                  >
                    {editingProduct ? 'Update Product' : 'Publish Product'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './lib/supabase';
import { toast } from 'sonner';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  brand: string;
  images: string[];
  specs: Record<string, string>;
  stock: number;
  description: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const items = get().items;
        const existingItem = items.find((item) => item.id === product.id);
        if (existingItem) {
          set({
            items: items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({ items: [...items, { ...product, quantity: 1 }] });
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      get total() {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'cellex-cart',
    }
  )
);

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: 'user' | 'admin';
  createdAt: string;
  profileImage?: string;
  twoFactorEnabled?: boolean;
  savedCards?: {
    id: string;
    last4: string;
    brand: string;
    expiry: string;
  }[];
}

interface AuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUser: (data: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      updateUser: (data) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...data } });
        }
      },
      logout: () => set({ user: null }),
    }),
    {
      name: 'cellex-auth',
    }
  )
);

interface UserStore {
  users: User[];
  isLoading: boolean;
  fetchUsers: () => Promise<void>;
  registerUser: (user: Omit<User, 'id' | 'createdAt' | 'role'>) => Promise<void>;
  findUser: (email: string) => User | undefined;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      users: [
        {
          id: 'admin-001',
          name: 'Arvin Hanif',
          email: 'arvin_hanif',
          phone: '01700000000',
          password: 'arvin_hanif',
          role: 'admin',
          createdAt: new Date().toISOString()
        }
      ],
      isLoading: false,
      fetchUsers: async () => {
        if (!supabase) return;
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.from('profiles').select('*');
          if (error) throw error;
          if (data && data.length > 0) {
            const formattedUsers: User[] = data.map(u => ({
              id: u.id,
              name: u.name || u.email.split('@')[0],
              email: u.email,
              phone: u.phone || '',
              role: u.role as 'user' | 'admin',
              createdAt: u.created_at,
              profileImage: u.avatar_url
            }));
            
            // Add default admin if not present
            const defaultAdmin = {
              id: 'admin-001',
              name: 'Arvin Hanif',
              email: 'arvin_hanif',
              phone: '01700000000',
              password: 'arvin_hanif',
              role: 'admin' as const,
              createdAt: new Date().toISOString()
            };

            if (!formattedUsers.some(u => u.email === defaultAdmin.email)) {
              formattedUsers.push(defaultAdmin);
            }

            set({ users: formattedUsers });
          } else {
            // If no users in DB, keep default admin
            set({ users: [
              {
                id: 'admin-001',
                name: 'Arvin Hanif',
                email: 'arvin_hanif',
                phone: '01700000000',
                password: 'arvin_hanif',
                role: 'admin',
                createdAt: new Date().toISOString()
              }
            ] });
          }
        } catch (error) {
          console.error('Error fetching users:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      registerUser: async (userData) => {
        if (supabase) {
          try {
            // This is a simplified version. In a real app, you'd use supabase.auth.signUp
            const { data, error } = await supabase.from('profiles').insert([{
              name: userData.name,
              email: userData.email,
              role: 'user'
            }]).select();
            if (error) throw error;
            if (data) {
              const newUser: User = {
                ...userData,
                id: data[0].id,
                role: 'user',
                createdAt: data[0].created_at,
              };
              set({ users: [...get().users, newUser] });
              return;
            }
          } catch (error) {
            console.error('Error registering user in Supabase:', error);
          }
        }

        const newUser: User = {
          ...userData,
          id: Math.random().toString(36).substring(7),
          role: 'user',
          createdAt: new Date().toISOString(),
        };
        set({ users: [...get().users, newUser] });
      },
      findUser: (email) => {
        return get().users.find((u) => u.email === email);
      },
    }),
    {
      name: 'cellex-users',
    }
  )
);

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userPhone?: string;
  address?: string;
  items: CartItem[];
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
}

export interface OrderRequest {
  id: string;
  userId: string;
  userName: string;
  productName: string;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

interface ProductStore {
  products: Product[];
  isLoading: boolean;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  removeProduct: (productId: string) => Promise<void>;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: [],
      isLoading: false,
      fetchProducts: async () => {
        if (!supabase) return;
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.from('products').select('*');
          if (error) throw error;
          if (data && data.length > 0) {
            set({ products: data });
          }
        } catch (error) {
          console.error('Error fetching products:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      addProduct: async (productData) => {
        if (supabase) {
          try {
            const { data, error } = await supabase.from('products').insert([productData]).select();
            if (error) throw error;
            if (data) {
              set({ products: [...get().products, data[0]] });
              return;
            }
          } catch (error) {
            console.error('Error adding product to Supabase:', error);
          }
        }
        
        const newProduct: Product = {
          ...productData,
          id: Math.random().toString(36).substring(7),
        };
        set({ products: [...get().products, newProduct] });
      },
      removeProduct: async (productId) => {
        if (supabase) {
          try {
            const { error } = await supabase.from('products').delete().eq('id', productId);
            if (error) throw error;
          } catch (error) {
            console.error('Error removing product from Supabase:', error);
          }
        }
        set({ products: get().products.filter((p) => p.id !== productId) });
      },
    }),
    {
      name: 'cellex-products',
    }
  )
);

interface OrderRequestStore {
  requests: OrderRequest[];
  fetchRequests: () => Promise<void>;
  addRequest: (request: Omit<OrderRequest, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateRequestStatus: (requestId: string, status: OrderRequest['status']) => Promise<void>;
}

export const useOrderRequestStore = create<OrderRequestStore>()(
  persist(
    (set, get) => ({
      requests: [],
      fetchRequests: async () => {
        if (!supabase) return;
        try {
          const { data, error } = await supabase.from('order_requests').select('*').order('created_at', { ascending: false });
          if (error) throw error;
          if (data) {
            set({ requests: data.map((r: any) => ({
              id: r.id,
              userId: r.user_id,
              userName: r.user_name,
              productName: r.product_name,
              description: r.description,
              status: r.status,
              createdAt: r.created_at
            })) });
          }
        } catch (error) {
          console.error('Error fetching requests:', error);
        }
      },
      addRequest: async (requestData) => {
        if (supabase) {
          try {
            const { data, error } = await supabase.from('order_requests').insert([{
              user_id: requestData.userId,
              user_name: requestData.userName,
              product_name: requestData.productName,
              description: requestData.description,
              status: 'Pending'
            }]).select();
            if (error) throw error;
            if (data) {
              set({ requests: [data[0], ...get().requests] });
              return;
            }
          } catch (error) {
            console.error('Error adding request:', error);
          }
        }
        const newRequest: OrderRequest = {
          ...requestData,
          id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
          status: 'Pending',
          createdAt: new Date().toISOString(),
        };
        set({ requests: [newRequest, ...get().requests] });
      },
      updateRequestStatus: async (requestId, status) => {
        if (supabase) {
          try {
            const { error } = await supabase.from('order_requests').update({ status }).eq('id', requestId);
            if (error) throw error;
          } catch (error) {
            console.error('Error updating request status:', error);
          }
        }
        set({
          requests: get().requests.map((r) =>
            r.id === requestId ? { ...r, status } : r
          ),
        });
      },
    }),
    {
      name: 'cellex-order-requests',
    }
  )
);

interface OrderStore {
  orders: Order[];
  fetchOrders: () => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>, address?: string, phone?: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      fetchOrders: async () => {
        if (!supabase) return;
        try {
          // Fetch orders and their items
          const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select(`
              *,
              profiles (*),
              order_items (
                *,
                products (*)
              )
            `)
            .order('created_at', { ascending: false });

          if (ordersError) throw ordersError;

          if (ordersData) {
            const formattedOrders: Order[] = ordersData.map((o: any) => ({
              id: o.id,
              userId: o.user_id,
              userName: o.profiles?.name || 'User',
              userPhone: o.phone || o.profiles?.phone || 'Not provided',
              address: o.address || 'Not provided',
              total: Number(o.total),
              status: o.status.toUpperCase(),
              createdAt: o.created_at,
              items: o.order_items.map((item: any) => ({
                ...item.products,
                quantity: item.quantity,
                price: Number(item.price_at_purchase)
              }))
            }));
            set({ orders: formattedOrders });
          }
        } catch (error) {
          console.error('Error fetching orders:', error);
        }
      },
      addOrder: async (orderData, address = 'Not provided', phone = 'Not provided') => {
        if (supabase) {
          try {
            // 1. Create Order
            const { data: order, error: orderError } = await supabase
              .from('orders')
              .insert([{
                user_id: orderData.userId,
                total: orderData.total,
                status: 'Pending',
                address,
                phone
              }])
              .select()
              .single();

            if (orderError) throw orderError;

            // 2. Create Order Items
            const orderItems = orderData.items.map(item => ({
              order_id: order.id,
              product_id: item.id,
              quantity: item.quantity,
              price_at_purchase: item.price
            }));

            const { error: itemsError } = await supabase
              .from('order_items')
              .insert(orderItems);

            if (itemsError) throw itemsError;

            // Refresh orders
            get().fetchOrders();
            return;
          } catch (error) {
            console.error('Error adding order to Supabase:', error);
          }
        }

        const nextNum = get().orders.length + 1;
        const formattedNum = String(nextNum).padStart(4, '0');
        const newOrder: Order = {
          ...orderData,
          id: `ORD-${formattedNum}#`,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        };
        set({ orders: [newOrder, ...get().orders] });
      },
      updateOrderStatus: async (orderId, status) => {
        if (supabase) {
          try {
            const { error } = await supabase
              .from('orders')
              .update({ status: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() })
              .eq('id', orderId);
            if (error) throw error;
          } catch (error) {
            console.error('Error updating order status:', error);
          }
        }
        set({
          orders: get().orders.map((o) =>
            o.id === orderId ? { ...o, status } : o
          ),
        });
      },
    }),
    {
      name: 'cellex-orders',
    }
  )
);

interface ThemeStore {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
    }),
    {
      name: 'cellex-theme',
    }
  )
);

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  createdAt: string;
}

interface NotificationStore {
  notifications: Notification[];
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => Promise<void>;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      fetchNotifications: async () => {
        if (!supabase) return;
        try {
          const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
          if (error) throw error;
          if (data) {
            set({ notifications: data.map((n: any) => ({
              id: n.id,
              title: n.title,
              message: n.message,
              type: n.type,
              read: n.read,
              createdAt: n.created_at
            })) });
          }
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      },
      addNotification: async (notif) => {
        // Show toast for new notification
        toast(notif.title, {
          description: notif.message,
          icon: notif.type === 'success' ? '✅' : notif.type === 'warning' ? '⚠️' : 'ℹ️',
        });

        if (supabase) {
          try {
            const { data, error } = await supabase.from('notifications').insert([{
              title: notif.title,
              message: notif.message,
              type: notif.type,
              read: false
            }]).select();
            if (error) throw error;
            if (data) {
              set({ notifications: [data[0], ...get().notifications] });
              return;
            }
          } catch (error) {
            console.error('Error adding notification:', error);
          }
        }
        const newNotif: Notification = {
          ...notif,
          id: Math.random().toString(36).substring(7),
          read: false,
          createdAt: new Date().toISOString(),
        };
        set({ notifications: [newNotif, ...get().notifications] });
      },
      markAsRead: (id) => {
        set({
          notifications: get().notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        });
      },
      clearAll: () => set({ notifications: [] }),
    }),
    {
      name: 'cellex-notifications',
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  registerUser: (user: Omit<User, 'id' | 'createdAt' | 'role'>) => void;
  findUser: (email: string) => User | undefined;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      users: [
        {
          id: 'admin-1',
          name: 'Admin',
          email: 'admin@cellex.com',
          phone: '0000000000',
          password: 'admin123',
          role: 'admin',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'admin-2',
          name: 'Arvin Hanif',
          email: 'arvin_hanif',
          phone: '0000000000',
          password: 'arvin_hanif',
          role: 'admin',
          createdAt: new Date().toISOString(),
        }
      ],
      registerUser: (userData) => {
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
  addProduct: (product: Omit<Product, 'id'>) => void;
  removeProduct: (productId: string) => void;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: [
        {
          id: '1',
          name: 'iPhone 16 Pro Max',
          price: 185000,
          category: 'Smartphones',
          brand: 'Apple',
          images: ['https://picsum.photos/seed/iphone16/800/800'],
          specs: { display: '6.9" Super Retina XDR', chip: 'A18 Pro', camera: '48MP Fusion' },
          stock: 50,
          description: 'The ultimate iPhone with the largest display ever and the most powerful chip.'
        },
        {
          id: '2',
          name: 'MacBook Pro M4',
          price: 245000,
          category: 'Laptops',
          brand: 'Apple',
          images: ['https://picsum.photos/seed/macbookm4/800/800'],
          specs: { display: '14" Liquid Retina XDR', chip: 'M4 Max', ram: '32GB' },
          stock: 20,
          description: 'The most advanced laptop for demanding workflows.'
        },
        {
          id: '3',
          name: 'Sony WH-1000XM5',
          price: 45000,
          category: 'Audio',
          brand: 'Sony',
          images: ['https://picsum.photos/seed/sonyh5/800/800'],
          specs: { battery: '30 hours', noise_cancelling: 'Industry Leading', driver: '30mm' },
          stock: 100,
          description: 'Your world, nothing else. Best-in-class noise cancellation.'
        },
        {
          id: '4',
          name: 'Samsung Galaxy Watch Ultra',
          price: 75000,
          category: 'Wearables',
          brand: 'Samsung',
          images: ['https://picsum.photos/seed/galaxywatch/800/800'],
          specs: { display: 'Sapphire Crystal', battery: '100 hours', water_resistance: '10ATM' },
          stock: 35,
          description: 'The most rugged and capable Galaxy Watch yet.'
        },
        {
          id: '5',
          name: 'iPad Pro M4',
          price: 125000,
          category: 'Tablets',
          brand: 'Apple',
          images: ['https://picsum.photos/seed/ipadpro/800/800'],
          specs: { display: 'Ultra Retina XDR', chip: 'M4', thickness: '5.1mm' },
          stock: 45,
          description: 'Thinner than ever, more powerful than imaginable.'
        }
      ],
      addProduct: (productData) => {
        const newProduct: Product = {
          ...productData,
          id: Math.random().toString(36).substring(7),
        };
        set({ products: [...get().products, newProduct] });
      },
      removeProduct: (productId) => {
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
  addRequest: (request: Omit<OrderRequest, 'id' | 'createdAt' | 'status'>) => void;
  updateRequestStatus: (requestId: string, status: OrderRequest['status']) => void;
}

export const useOrderRequestStore = create<OrderRequestStore>()(
  persist(
    (set, get) => ({
      requests: [],
      addRequest: (requestData) => {
        const newRequest: OrderRequest = {
          ...requestData,
          id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
          status: 'Pending',
          createdAt: new Date().toISOString(),
        };
        set({ requests: [newRequest, ...get().requests] });
      },
      updateRequestStatus: (requestId, status) => {
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
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (orderData) => {
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
      updateOrderStatus: (orderId, status) => {
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
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      addNotification: (notif) => {
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

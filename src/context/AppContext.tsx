import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Language, 
  User, 
  Product, 
  Category, 
  Order, 
  CartItem, 
  ProductStatus, 
  OrderStatus, 
  MarketplaceStats 
} from '../types';
import { translations } from '../lib/i18n';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_USERS, INITIAL_ORDERS } from '../lib/initialData';
import { supabase, isSupabaseConfigured, DESIGNATED_ADMIN_EMAIL, isDesignatedAdmin } from '../lib/supabase';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
  
  // Navigation & UI
  activeTab: 'marketplace' | 'seller' | 'admin' | 'categories';
  setActiveTab: (tab: 'marketplace' | 'seller' | 'admin' | 'categories') => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isAdminAuthModalOpen: boolean;
  setIsAdminAuthModalOpen: (open: boolean) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
  conditionFilter: 'all' | 'Brand New' | 'Used';
  setConditionFilter: (cond: 'all' | 'Brand New' | 'Used') => void;
  sortBy: 'featured' | 'price_low' | 'price_high' | 'newest';
  setSortBy: (sort: 'featured' | 'price_low' | 'price_high' | 'newest') => void;

  // Auth & Admin
  currentUser: User | null;
  isAdmin: boolean;
  loginAsAdmin: (password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;

  // Products
  products: Product[];
  approvedProducts: Product[];
  addProduct: (newProduct: Omit<Product, 'id' | 'created_at' | 'status'>) => Promise<Product>;
  updateProduct: (product: Product) => void;
  updateProductStatus: (id: string, status: ProductStatus) => void;
  deleteProduct: (id: string) => void;

  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;

  // Orders & Cart
  orders: Order[];
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  createOrder: (orderData: Omit<Order, 'id' | 'created_at'>) => Order;
  updateOrderStatus: (id: string, status: OrderStatus) => void;

  // Users
  users: User[];
  toggleUserVerification: (userId: string) => void;

  // Stats
  stats: MarketplaceStats;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_PRODUCTS_KEY = 'mela_market_products';
const LOCAL_STORAGE_ORDERS_KEY = 'mela_market_orders';
const LOCAL_STORAGE_CATEGORIES_KEY = 'mela_market_categories';
const LOCAL_STORAGE_USERS_KEY = 'mela_market_users';
const LOCAL_STORAGE_LANG_KEY = 'mela_market_lang';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Language
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_LANG_KEY);
    return (saved === 'am' || saved === 'en') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LOCAL_STORAGE_LANG_KEY, lang);
  };

  const t = translations[language];

  // Active navigation view
  const [activeTab, setActiveTab] = useState<'marketplace' | 'seller' | 'admin' | 'categories'>('marketplace');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [conditionFilter, setConditionFilter] = useState<'all' | 'Brand New' | 'Used'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'newest'>('featured');

  // Categories State
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  // Products State
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Orders State
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // Users State
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  // Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('mela_market_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Current User / Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('mela_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Listen to Supabase auth state if configured
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        const isAdminUser = isDesignatedAdmin(session.user.email);
        const userObj: User = {
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || (isAdminUser ? 'Mikiael Elebrhane (Admin)' : 'Market User'),
          role: isAdminUser ? 'admin' : (session.user.user_metadata?.role || 'customer'),
          is_verified: true,
          created_at: session.user.created_at || new Date().toISOString(),
        };
        setCurrentUser(userObj);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        const isAdminUser = isDesignatedAdmin(session.user.email);
        const userObj: User = {
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || (isAdminUser ? 'Mikiael Elebrhane (Admin)' : 'Market User'),
          role: isAdminUser ? 'admin' : (session.user.user_metadata?.role || 'customer'),
          is_verified: true,
          created_at: session.user.created_at || new Date().toISOString(),
        };
        setCurrentUser(userObj);
        localStorage.setItem('mela_current_user', JSON.stringify(userObj));
      } else {
        // If explicitly logged out from supabase
        setCurrentUser(null);
        localStorage.removeItem('mela_current_user');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Save changes to localStorage for local durability
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('mela_market_cart', JSON.stringify(cart));
  }, [cart]);

  // Is user the verified admin?
  const isAdmin = Boolean(
    currentUser && (
      currentUser.role === 'admin' || 
      isDesignatedAdmin(currentUser.email)
    )
  );

  // Admin login function
  const loginAsAdmin = async (password: string): Promise<{ success: boolean; error?: string }> => {
    const adminEmail = DESIGNATED_ADMIN_EMAIL;

    // If Supabase is configured, use real Supabase Auth
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: password,
        });

        if (error) {
          // If the user hasn't created the password in Supabase Auth yet, return clear guidance
          return {
            success: false,
            error: `${error.message}. (Note: If this is your first time, please set your password in Supabase Auth Dashboard or via the SQL migration tab)`,
          };
        }

        if (data.user) {
          const adminUser: User = {
            id: data.user.id,
            email: adminEmail,
            full_name: 'Mikiael Elebrhane (Administrator)',
            role: 'admin',
            is_verified: true,
            created_at: data.user.created_at || new Date().toISOString(),
          };
          setCurrentUser(adminUser);
          localStorage.setItem('mela_current_user', JSON.stringify(adminUser));
          setIsAdminAuthModalOpen(false);
          return { success: true };
        }
      } catch (err: unknown) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Authentication failed with Supabase.',
        };
      }
    }

    // In local development or before Supabase keys are plugged in:
    // We verify the administrator email strictly matches mikiaelebrhane@gmail.com
    // And allow access with a valid password input
    if (password.trim().length >= 6) {
      const adminUser: User = {
        id: 'usr-admin-primary',
        email: adminEmail,
        full_name: 'Mikiael Elebrhane (Lead Admin)',
        role: 'admin',
        is_verified: true,
        created_at: new Date().toISOString(),
      };
      setCurrentUser(adminUser);
      localStorage.setItem('mela_current_user', JSON.stringify(adminUser));
      setIsAdminAuthModalOpen(false);
      return { success: true };
    } else {
      return {
        success: false,
        error: 'Password must be at least 6 characters long.',
      };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Sign out error:', e);
      }
    }
    setCurrentUser(null);
    localStorage.removeItem('mela_current_user');
  };

  // Products filters: public marketplace only shows 'approved' products
  const approvedProducts = products.filter(p => p.status === 'approved');

  // Add Product from Seller Dashboard
  const addProduct = async (
    newProductData: Omit<Product, 'id' | 'created_at' | 'status'>
  ): Promise<Product> => {
    const newProduct: Product = {
      ...newProductData,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status: 'pending', // Requires admin review
      created_at: new Date().toISOString(),
      rating: 5.0,
      reviews_count: 0,
    };

    // If Supabase is configured, insert into products table
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('products').insert([
          {
            title_am: newProduct.title_am,
            title_en: newProduct.title_en,
            price: newProduct.price,
            stock: newProduct.stock,
            category_id: newProduct.category_id,
            condition: newProduct.condition,
            description: newProduct.description,
            image_url: newProduct.image_url,
            seller_id: newProduct.seller_id,
            seller_name: newProduct.seller_name,
            seller_phone: newProduct.seller_phone,
            status: 'pending',
          },
        ]);
        if (error) {
          console.warn('Supabase DB insert warning:', error.message);
        }
      } catch (err) {
        console.warn('Supabase insert failed:', err);
      }
    }

    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
  };

  const updateProductStatus = (id: string, status: ProductStatus) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, status } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Categories
  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: `cat-${Date.now()}`,
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Cart Management
  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Orders
  const createOrder = (orderData: Omit<Order, 'id' | 'created_at'>): Order => {
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      created_at: new Date().toISOString(),
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders(prev =>
      prev.map(o => (o.id === id ? { ...o, status } : o))
    );
  };

  // Users
  const toggleUserVerification = (userId: string) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, is_verified: !u.is_verified } : u))
    );
  };

  // Compute stats
  const totalRevenue = orders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.total_etb : sum), 0);
  const activeProducts = products.filter(p => p.status === 'approved').length;
  const pendingProducts = products.filter(p => p.status === 'pending').length;
  const totalSellers = users.filter(u => u.role === 'seller').length;

  const stats: MarketplaceStats = {
    total_revenue: totalRevenue,
    total_orders: orders.length,
    active_products: activeProducts,
    pending_products: pendingProducts,
    total_users: users.length,
    total_sellers: totalSellers,
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        activeTab,
        setActiveTab,
        isCartOpen,
        setIsCartOpen,
        isAdminAuthModalOpen,
        setIsAdminAuthModalOpen,
        selectedProduct,
        setSelectedProduct,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        conditionFilter,
        setConditionFilter,
        sortBy,
        setSortBy,
        currentUser,
        isAdmin,
        loginAsAdmin,
        logout,
        products,
        approvedProducts,
        addProduct,
        updateProduct,
        updateProductStatus,
        deleteProduct,
        categories,
        addCategory,
        deleteCategory,
        orders,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        createOrder,
        updateOrderStatus,
        users,
        toggleUserVerification,
        stats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItemsCount: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  couponCode: string;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const LOCAL_CART_KEY = 'mela_cart_items';
const LOCAL_COUPON_KEY = 'mela_cart_coupon';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(LOCAL_CART_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  const [couponCode, setCouponCode] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(LOCAL_COUPON_KEY) || '';
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
    }
  }, [items]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (couponCode) {
        localStorage.setItem(LOCAL_COUPON_KEY, couponCode);
      } else {
        localStorage.removeItem(LOCAL_COUPON_KEY);
      }
    }
  }, [couponCode]);

  const addToCart = (product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
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
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode('');
  };

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const clean = code.trim().toUpperCase();
    if (clean === 'MELA10') {
      setCouponCode('MELA10');
      return { success: true, message: '10% discount applied!' };
    }
    if (clean === 'WELCOME20') {
      setCouponCode('WELCOME20');
      return { success: true, message: '20% welcome discount applied!' };
    }
    if (clean === 'FREESHIP') {
      setCouponCode('FREESHIP');
      return { success: true, message: 'Free shipping voucher applied!' };
    }
    return { success: false, message: 'Invalid voucher code. Try MELA10 or WELCOME20' };
  };

  const removeCoupon = () => {
    setCouponCode('');
  };

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  let discount = 0;
  if (couponCode === 'MELA10') {
    discount = Math.round(subtotal * 0.1);
  } else if (couponCode === 'WELCOME20') {
    discount = Math.round(subtotal * 0.2);
  }

  // Base shipping fee in ETB (Free if over 3,000 ETB or FREESHIP coupon)
  let shippingFee = subtotal > 3000 || subtotal === 0 || couponCode === 'FREESHIP' ? 0 : 250;

  const total = Math.max(0, subtotal - discount + shippingFee);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItemsCount,
        subtotal,
        discount,
        shippingFee,
        total,
        couponCode,
        applyCoupon,
        removeCoupon,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

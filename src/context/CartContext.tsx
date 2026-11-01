import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types/database.types.ts';

interface Coupon {
  code: string;
  percent: number;
  freeShipping: boolean;
  minSpend?: number;
}

const AVAILABLE_COUPONS: Record<string, Coupon> = {
  MELA10: { code: 'MELA10', percent: 10, freeShipping: false },
  WELCOME20: { code: 'WELCOME20', percent: 20, freeShipping: false },
  FREESHIP: { code: 'FREESHIP', percent: 0, freeShipping: true },
};

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  grandTotal: number;
  couponCode: string;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  lastAddedProduct: Product | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_CART = 'mela_cart_items';
const STORAGE_COUPON = 'mela_applied_coupon';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(STORAGE_CART);
    return saved ? JSON.parse(saved) : [];
  });

  const [couponCode, setCouponCode] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(STORAGE_COUPON) || '';
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [lastAddedProduct, setLastAddedProduct] = useState<Product | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (couponCode) {
      localStorage.setItem(STORAGE_COUPON, couponCode);
    } else {
      localStorage.removeItem(STORAGE_COUPON);
    }
  }, [couponCode]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product_id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = Math.min(
          product.stock_quantity,
          updated[existingIndex].quantity + quantity
        );
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          product,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: 'cart-' + Math.random().toString(36).substring(2, 9),
          product_id: product.id,
          quantity: Math.min(product.stock_quantity, quantity),
          created_at: new Date().toISOString(),
          product,
        };
        return [...prev, newItem];
      }
    });

    setLastAddedProduct(product);
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.product_id === productId) {
          const maxStock = item.product.stock_quantity || 999;
          return {
            ...item,
            quantity: Math.min(quantity, maxStock),
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setCouponCode('');
  };

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const clean = code.trim().toUpperCase();
    const found = AVAILABLE_COUPONS[clean];
    if (found) {
      setCouponCode(clean);
      return { success: true, message: `Promo code "${clean}" successfully applied!` };
    }
    return { success: false, message: 'Invalid promo code. Please check and try again.' };
  };

  const removeCoupon = () => {
    setCouponCode('');
  };

  const appliedCoupon = couponCode ? AVAILABLE_COUPONS[couponCode] || null : null;

  // Totals calculations
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce((sum, item) => {
    const price = item.product.discount_price ?? item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const discountAmount = appliedCoupon
    ? (subtotal * appliedCoupon.percent) / 100
    : 0;

  const baseShipping = subtotal > 50 || (appliedCoupon && appliedCoupon.freeShipping) || subtotal === 0 ? 0 : 9.99;
  const shippingFee = baseShipping;

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = subtotal > 0 ? taxableAmount * 0.08 : 0; // 8% sales tax

  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee + taxAmount);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        discountAmount,
        shippingFee,
        taxAmount,
        grandTotal,
        couponCode,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        isCartOpen,
        setIsCartOpen,
        lastAddedProduct,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

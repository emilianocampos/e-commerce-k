'use client';

/* ==========================================================================
   Moscú Showroom - Cart Context (Next.js App Router)
   ========================================================================== */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, Coupon } from '../lib/types';

interface CartContextType {
  items: CartItem[];
  coupon: Coupon | null;
  note: string;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, size: string, quantity?: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message?: string };
  removeCoupon: () => void;
  setNote: (note: string) => void;
  subtotal: number;
  totalQuantity: number;
  discountAmount: number;
  total: number;
  transferTotal: number;
  freeShippingProgress: {
    threshold: number;
    difference: number;
    progressPct: number;
    isFree: boolean;
  };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'moscu_store_cart';
const FREE_SHIPPING_THRESHOLD = 150000;
const TRANSFER_DISCOUNT_PCT = 15;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [note, setNote] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setItems(parsed.items || []);
        setCoupon(parsed.coupon || null);
        setNote(parsed.note || '');
      }
    } catch (e) {
      console.error('Error loading cart:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items, coupon, note }));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }, [items, coupon, note, isLoaded]);

  const openCart = () => {
    setIsCartOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeCart = () => {
    setIsCartOpen(false);
    document.body.style.overflow = '';
  };

  const addToCart = (product: Product, size: string, quantity = 1) => {
    setItems(prevItems => {
      const existingIdx = prevItems.findIndex(
        i => i.productId === product.id && i.size === size
      );

      if (existingIdx > -1) {
        const copy = [...prevItems];
        copy[existingIdx] = {
          ...copy[existingIdx],
          quantity: copy[existingIdx].quantity + quantity
        };
        return copy;
      }

      const newItem: CartItem = {
        id: `${product.id}-${size}`,
        productId: product.id,
        name: product.name,
        size: size,
        price: product.price,
        comparePrice: product.comparePrice,
        image: product.images[0] || '',
        quantity
      };
      return [...prevItems, newItem];
    });

    openCart();
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
    } else {
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i));
    }
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
    setNote('');
  };

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    const VALID_COUPONS: Record<string, number> = {
      MOSCU10: 10,
      BIENVENIDA: 15,
      HOTDROP: 20
    };

    if (VALID_COUPONS[clean]) {
      const applied: Coupon = {
        code: clean,
        discountPct: VALID_COUPONS[clean]
      };
      setCoupon(applied);
      return { success: true };
    }
    return { success: false, message: 'Cupón inválido o expirado' };
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const discountAmount = coupon ? Math.round(subtotal * (coupon.discountPct / 100)) : 0;
  const total = Math.max(0, subtotal - discountAmount);
  const transferTotal = Math.round(total * (1 - (TRANSFER_DISCOUNT_PCT / 100)));

  const difference = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const isFree = difference === 0;

  return (
    <CartContext.Provider
      value={{
        items,
        coupon,
        note,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
        setNote,
        subtotal,
        totalQuantity,
        discountAmount,
        total,
        transferTotal,
        freeShippingProgress: {
          threshold: FREE_SHIPPING_THRESHOLD,
          difference,
          progressPct,
          isFree
        }
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

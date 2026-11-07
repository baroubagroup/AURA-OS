import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, Product, Customer } from '../types';

interface PosContextType {
  activeCartIndex: number;
  setActiveCartIndex: (index: number) => void;
  carts: CartItem[][];
  currentCart: CartItem[];
  addToCart: (product: Product, qty?: number) => void;
  updateCartItemQty: (productId: number, qty: number) => void;
  updateCartItemDiscount: (productId: number, discount: number) => void;
  removeFromCart: (productId: number) => void;
  clearCurrentCart: () => void;
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  cartTotals: {
    subtotal: number;
    discount: number;
    total: number;
    itemsCount: number;
  };
  smartCashSuggestions: number[];
}

const PosContext = createContext<PosContextType | null>(null);

export const PosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeCartIndex, setActiveCartIndex] = useState<number>(0);
  const [carts, setCarts] = useState<CartItem[][]>([[], [], []]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const currentCart = carts[activeCartIndex] || [];

  const addToCart = (product: Product, qty = 1) => {
    setCarts(prevCarts => {
      const nextCarts = [...prevCarts];
      const cart = [...nextCarts[activeCartIndex]];
      const existingIdx = cart.findIndex(item => item.product.id === product.id);

      if (existingIdx !== -1) {
        cart[existingIdx] = {
          ...cart[existingIdx],
          qty: cart[existingIdx].qty + qty
        };
      } else {
        cart.push({
          id: Date.now() + Math.random(),
          product,
          qty,
          priceUnit: product.priceSell,
          discount: 0
        });
      }

      nextCarts[activeCartIndex] = cart;
      return nextCarts;
    });
  };

  const updateCartItemQty = (productId: number, qty: number) => {
    setCarts(prevCarts => {
      const nextCarts = [...prevCarts];
      let cart = [...nextCarts[activeCartIndex]];

      if (qty <= 0) {
        cart = cart.filter(it => it.product.id !== productId);
      } else {
        cart = cart.map(it => it.product.id === productId ? { ...it, qty } : it);
      }

      nextCarts[activeCartIndex] = cart;
      return nextCarts;
    });
  };

  const updateCartItemDiscount = (productId: number, discount: number) => {
    setCarts(prevCarts => {
      const nextCarts = [...prevCarts];
      const cart = nextCarts[activeCartIndex].map(it =>
        it.product.id === productId ? { ...it, discount: Math.max(0, discount) } : it
      );
      nextCarts[activeCartIndex] = cart;
      return nextCarts;
    });
  };

  const removeFromCart = (productId: number) => {
    updateCartItemQty(productId, 0);
  };

  const clearCurrentCart = () => {
    setCarts(prevCarts => {
      const nextCarts = [...prevCarts];
      nextCarts[activeCartIndex] = [];
      return nextCarts;
    });
    setSelectedCustomer(null);
  };

  // Totals
  const subtotal = currentCart.reduce((sum, it) => sum + (it.priceUnit * it.qty), 0);
  const discount = currentCart.reduce((sum, it) => sum + it.discount, 0);
  const total = Math.max(0, subtotal - discount);
  const itemsCount = currentCart.reduce((sum, it) => sum + it.qty, 0);

  // Smart Cash Rounding (West African FCFA denominations: 500, 1000, 2000, 5000, 10000)
  const calculateSmartCash = (amount: number): number[] => {
    if (amount <= 0) return [];
    const suggestions = new Set<number>();
    suggestions.add(amount); // Exact amount

    const denominations = [500, 1000, 2000, 5000, 10000];
    for (const d of denominations) {
      if (d >= amount) {
        suggestions.add(d);
      } else {
        const nextMultiple = Math.ceil(amount / d) * d;
        if (nextMultiple > amount) suggestions.add(nextMultiple);
      }
    }

    if (amount > 10000) {
      suggestions.add(Math.ceil(amount / 5000) * 5000);
      suggestions.add(Math.ceil(amount / 10000) * 10000);
    }

    return Array.from(suggestions).sort((a, b) => a - b).slice(0, 5);
  };

  const smartCashSuggestions = calculateSmartCash(total);

  return (
    <PosContext.Provider
      value={{
        activeCartIndex,
        setActiveCartIndex,
        carts,
        currentCart,
        addToCart,
        updateCartItemQty,
        updateCartItemDiscount,
        removeFromCart,
        clearCurrentCart,
        selectedCustomer,
        setSelectedCustomer,
        cartTotals: { subtotal, discount, total, itemsCount },
        smartCashSuggestions
      }}
    >
      {children}
    </PosContext.Provider>
  );
};

export const usePos = () => {
  const ctx = useContext(PosContext);
  if (!ctx) throw new Error('usePos must be used within PosProvider');
  return ctx;
};

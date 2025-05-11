"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  size: string; // ✅ 이 줄 추가
};

type CartItem = Product & { quantity: number };

type CartStore = {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, qty: number) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addToCart: (product) =>
        set((state) => {
          const existing = state.items.find((item) => item.id === product.id);
          if (existing) {
            return {
              items: state.items,
            };
          }
          return {
            items: [...state.items, { ...product, quantity: 1 }],
          };
        }),
      removeFromCart: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      updateQuantity: (id, qty) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: qty } : item
          ),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage", // localStorage 키
    }
  )
);

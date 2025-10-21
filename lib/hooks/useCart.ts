'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/lib/types';
import { toast } from 'sonner';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, size: string, color: string, quantity: number) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
  getItemCount: () => number;
  isMinQuantityMet: (minQuantity: number) => boolean;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, size, color, quantity) => {
        const items = get().items;
        const existingItemIndex = items.findIndex(
          item =>
            item.product_id === product.id &&
            item.size === size &&
            item.color === color
        );

        if (existingItemIndex > -1) {
          // Actualizar cantidad del item existente
          const newItems = [...items];
          newItems[existingItemIndex].quantity += quantity;
          set({ items: newItems });
          toast.success('Cantidad actualizada en el carrito');
        } else {
          // Agregar nuevo item
          const price = product.wholesale_price || product.price;
          const newItem: CartItem = {
            product_id: product.id,
            product,
            size,
            color,
            quantity,
            unit_price: price,
          };
          set({ items: [...items, newItem] });
          toast.success('Producto agregado al carrito');
        }
      },

      removeItem: (productId, size, color) => {
        set(state => ({
          items: state.items.filter(
            item =>
              !(
                item.product_id === productId &&
                item.size === size &&
                item.color === color
              )
          ),
        }));
        toast.success('Producto eliminado del carrito');
      },

      updateQuantity: (productId, size, color, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size, color);
          return;
        }

        set(state => ({
          items: state.items.map(item =>
            item.product_id === productId &&
            item.size === size &&
            item.color === color
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
        toast.success('Carrito vaciado');
      },

      getSubtotal: () => {
        const items = get().items;
        return items.reduce((total, item) => total + item.unit_price * item.quantity, 0);
      },

      getTotal: () => {
        // Por ahora, total = subtotal (sin descuentos)
        return get().getSubtotal();
      },

      getItemCount: () => {
        const items = get().items;
        return items.reduce((count, item) => count + item.quantity, 0);
      },

      isMinQuantityMet: (minQuantity = 5) => {
        return get().getItemCount() >= minQuantity;
      },
    }),
    {
      name: 'zingarito-cart',
    }
  )
);


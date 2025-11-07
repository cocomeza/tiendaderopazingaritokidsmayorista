import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  id: string
  productId: string
  variantId?: string | null
  name: string
  price: number
  wholesale_price: number
  quantity: number
  image?: string
  stock: number
  size?: string | null
  color?: string | null
}

interface CartStore {
  items: CartItem[]
  addItem: (product: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  getTotalWholesalePrice: () => number
  getDiscountPercentage: () => number
  getDiscountAmount: () => number
  getTotalWithDiscount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product) => {
        const items = get().items
        const existingItem = items.find(item => item.id === product.id)
        
        if (existingItem) {
          // Si ya existe, aumentar cantidad
          set({
            items: items.map(item =>
              item.id === product.id
                ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
                : item
            )
          })
        } else {
          // Si no existe, agregar nuevo
          set({
            items: [...items, { ...product, quantity: 1 }]
          })
        }
      },
      
      removeItem: (id) => {
        set({
          items: get().items.filter(item => item.id !== id)
        })
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        
        set({
          items: get().items.map(item =>
            item.id === id
              ? { ...item, quantity: Math.min(quantity, item.stock) }
              : item
          )
        })
      },
      
      clearCart: () => {
        set({ items: [] })
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
      },
      
      getTotalWholesalePrice: () => {
        return get().items.reduce((total, item) => total + (item.wholesale_price * item.quantity), 0)
      },

      getDiscountPercentage: () => {
        const totalItems = get().getTotalItems()
        
        // Escala de descuentos por defecto (se puede conectar con la base de datos después)
        if (totalItems >= 100) return 25
        if (totalItems >= 50) return 20
        if (totalItems >= 25) return 15
        if (totalItems >= 10) return 10
        if (totalItems >= 5) return 5
        return 0
      },

      getDiscountAmount: () => {
        const total = get().getTotalWholesalePrice()
        const discountPercentage = get().getDiscountPercentage()
        return total * (discountPercentage / 100)
      },

      getTotalWithDiscount: () => {
        const total = get().getTotalWholesalePrice()
        const discount = get().getDiscountAmount()
        return total - discount
      }
    }),
    {
      name: 'zingarito-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
)
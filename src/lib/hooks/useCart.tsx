"use client"

import type { ICart, ICartItem } from "@/lib/types/ICart"
import type { IProduct } from "@/lib/types/IProduct"
import type { IVariant } from "@/lib/types/IVariant"
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"

interface CartContextType {
  cart: ICart
  addItem: (product: IProduct, variant: IVariant, quantity?: number) => void
  removeItem: (variantSKU: string) => void
  updateQuantity: (variantSKU: string, quantity: number) => void
  clearCart: () => void
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
  itemJustAdded: boolean
}

const CartContext = createContext<CartContextType | null>(null)

const CART_STORAGE_KEY = "agility-cart"

function calculateTotal(items: ICartItem[]): number {
  return items.reduce((total, item) => total + item.variant.price * item.quantity, 0)
}

function calculateItemCount(items: ICartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0)
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ICartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [itemJustAdded, setItemJustAdded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ICartItem[]
        setItems(parsed)
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback(
    (product: IProduct, variant: IVariant, quantity: number = 1) => {
      const variantSKU = variant.variantSKU || `${product.sku}-${variant.color || variant.colorName || 'default'}`
      // Use commercetools product ID if available, otherwise fallback to SKU
      const productId = product.commercetoolsId || product.sku || 'unknown'

      setItems((currentItems) => {
        const existingItem = currentItems.find(
          (item) => item.variantSKU === variantSKU
        )

        if (existingItem) {
          return currentItems.map((item) =>
            item.variantSKU === variantSKU
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        }

        return [
          ...currentItems,
          {
            productId, // commercetools product ID
            variantSKU,
            product,
            variant,
            quantity,
          },
        ]
      })

      // Trigger pulse animation
      setItemJustAdded(true)
      setTimeout(() => setItemJustAdded(false), 1000)
    },
    []
  )

  const removeItem = useCallback((variantSKU: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.variantSKU !== variantSKU)
    )
  }, [])

  const updateQuantity = useCallback((variantSKU: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((currentItems) =>
        currentItems.filter((item) => item.variantSKU !== variantSKU)
      )
    } else {
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.variantSKU === variantSKU ? { ...item, quantity } : item
        )
      )
    }
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const openCart = useCallback(() => {
    setIsCartOpen(true)
  }, [])

  const closeCart = useCallback(() => {
    setIsCartOpen(false)
  }, [])

  const cart: ICart = {
    items,
    total: calculateTotal(items),
    itemCount: calculateItemCount(items),
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        itemJustAdded,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }

  return context
}

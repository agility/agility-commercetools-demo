"use client"

import type { IProduct } from "@/lib/types/IProduct"
import type { IVariant } from "@/lib/types/IVariant"
import type { ICart, ICartItem } from "@/lib/types/ICart"
import React, { createContext, useContext, useState, useEffect } from "react"

const CART_STORAGE_KEY = "agility-commerce-cart"

interface CartContextType {
  cart: ICart
  addToCart: (product: IProduct, variant: IVariant, quantity?: number) => void
  removeFromCart: (variantSKU: string) => void
  updateQuantity: (variantSKU: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartItemCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

interface CartProviderProps {
  children: React.ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<ICart>({
    items: [],
    total: 0,
    itemCount: 0,
  })

  const [isClient, setIsClient] = useState(false)

  // Initialize cart from localStorage on client side
  useEffect(() => {
    setIsClient(true)
    const storedCart = localStorage.getItem(CART_STORAGE_KEY)
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart) as ICart
        setCart(parsedCart)
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error)
      }
    }
  }, [])

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    if (isClient) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    }
  }, [cart, isClient])

  const calculateCartTotals = (items: ICartItem[]): { total: number; itemCount: number } => {
    const total = items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0)
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
    return { total, itemCount }
  }

  const addToCart = (product: IProduct, variant: IVariant, quantity: number = 1) => {
    const variantSKU = variant.variantSKU || `${product.sku}-${variant.color || 'default'}`
    setCart((prevCart) => {
      const existingItemIndex = prevCart.items.findIndex(
        (item) => item.variantSKU === variantSKU
      )

      let newItems: ICartItem[]

      if (existingItemIndex !== -1) {
        // Update quantity of existing item
        newItems = [...prevCart.items]
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity,
        }
      } else {
        // Add new item to cart
        const newItem: ICartItem = {
          productId: product.commercetoolsId || product.sku,
          variantSKU,
          product,
          variant,
          quantity,
        }
        newItems = [...prevCart.items, newItem]
      }

      const { total, itemCount } = calculateCartTotals(newItems)

      return {
        items: newItems,
        total,
        itemCount,
      }
    })
  }

  const removeFromCart = (variantSKU: string) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter((item) => item.variantSKU !== variantSKU)
      const { total, itemCount } = calculateCartTotals(newItems)

      return {
        items: newItems,
        total,
        itemCount,
      }
    })
  }

  const updateQuantity = (variantSKU: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantSKU)
      return
    }

    setCart((prevCart) => {
      const newItems = prevCart.items.map((item) =>
        item.variantSKU === variantSKU ? { ...item, quantity } : item
      )
      const { total, itemCount } = calculateCartTotals(newItems)

      return {
        items: newItems,
        total,
        itemCount,
      }
    })
  }

  const clearCart = () => {
    setCart({
      items: [],
      total: 0,
      itemCount: 0,
    })
  }

  const getCartTotal = (): number => {
    return cart.total
  }

  const getCartItemCount = (): number => {
    return cart.itemCount
  }

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

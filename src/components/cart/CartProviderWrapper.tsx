"use client"

import { CartProvider } from "@/lib/hooks/useCart"
import { CartDrawer } from "./CartDrawer"

interface CartProviderWrapperProps {
  children: React.ReactNode
}

export function CartProviderWrapper({ children }: CartProviderWrapperProps) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
    </CartProvider>
  )
}

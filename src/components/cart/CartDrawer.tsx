"use client"

import { useCart } from "@/lib/hooks/useCart"
import { formatPrice } from "@/lib/utils"
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react"
import { ExclamationCircleIcon, ShoppingBagIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { motion, AnimatePresence } from "motion/react"
import { CartLineItem } from "./CartLineItem"
import { useState } from "react"

export function CartDrawer() {
  const { cart, isCartOpen, closeCart, clearCart } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const handleCheckout = async () => {
    setIsCheckingOut(true)
    setCheckoutError(null)

    try {
      // Create Stripe checkout session
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart.items,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      // Redirect to Stripe Checkout using the session URL
      if (!data.url) {
        throw new Error("No checkout URL returned from server")
      }

      // Modern approach: use window.location.href instead of deprecated redirectToCheckout
      window.location.href = data.url
    } catch (error) {
      console.error("Checkout error:", error)
      setCheckoutError(
        error instanceof Error ? error.message : "Failed to proceed to checkout. Please try again."
      )
    } finally {
      setIsCheckingOut(false)
    }
  }

  return (
    <Dialog open={isCartOpen} onClose={closeCart} className="relative z-50">
      {/* Backdrop */}
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/30 transition-opacity duration-300 ease-out data-[closed]:opacity-0"
      />

      {/* Panel */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <DialogPanel
              transition
              className="pointer-events-auto w-screen max-w-md transform transition duration-300 ease-out data-[closed]:translate-x-full"
            >
              <div className="flex h-full flex-col bg-white shadow-xl dark:bg-gray-900">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-6 dark:border-gray-800">
                  <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Shopping Cart
                  </DialogTitle>
                  <button
                    onClick={closeCart}
                    className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
                    aria-label="Close cart"
                  >
                    <XMarkIcon className="size-6" />
                  </button>
                </div>

                {/* Cart Items or Empty State */}
                {cart.items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-1 flex-col items-center justify-center px-4"
                  >
                    <div className="rounded-full bg-gray-100 p-6 dark:bg-gray-800">
                      <ShoppingBagIcon className="size-12 text-gray-400" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                      Your cart is empty
                    </h3>
                    <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
                      Add items to your cart to see them here
                    </p>
                    <button
                      onClick={closeCart}
                      className="mt-6 rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                    >
                      Continue Shopping
                    </button>
                  </motion.div>
                ) : (
                  <>
                    {/* Cart Items List */}
                    <div className="flex-1 overflow-y-auto px-4">
                      <AnimatePresence mode="popLayout">
                        {cart.items.map((item) => (
                          <motion.div
                            key={item.variantSKU}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-b border-gray-200 dark:border-gray-800"
                          >
                            <CartLineItem item={item} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Footer with Subtotal and Actions */}
                    <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                      {/* Subtotal */}
                      <div className="flex items-center justify-between py-4">
                        <span className="text-base font-medium text-gray-900 dark:text-white">
                          Subtotal
                        </span>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatPrice(cart.total)}
                        </span>
                      </div>

                      {/* Item Count */}
                      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                        {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"} in cart
                      </p>

                      {/* Error Message */}
                      <AnimatePresence>
                        {checkoutError && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mb-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/20"
                          >
                            <div className="flex items-start gap-2">
                              <ExclamationCircleIcon className="size-5 shrink-0 text-red-600 dark:text-red-400" />
                              <p className="text-sm text-red-700 dark:text-red-300">{checkoutError}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <button
                          className="w-full rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                          onClick={handleCheckout}
                          disabled={isCheckingOut}
                        >
                          {isCheckingOut ? "Processing..." : "Checkout"}
                        </button>
                        <button
                          onClick={closeCart}
                          className="w-full rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
                        >
                          Continue Shopping
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  )
}

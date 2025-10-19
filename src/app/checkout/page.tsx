"use client"

import { useCart } from "@/lib/hooks/useCart"
import { getStripe } from "@/lib/stripe/client"
import { motion } from "motion/react"
import { AgilityPic } from "@agility/nextjs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function CheckoutPage() {
  const router = useRouter()
  const { cart } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect to products if cart is empty
  useEffect(() => {
    if (cart.items.length === 0 && !isLoading) {
      router.push("/products")
    }
  }, [cart.items.length, router, isLoading])

  // Calculate tax estimate (assuming 10% for demo)
  const taxRate = 0.1
  const subtotal = cart.total
  const taxEstimate = subtotal * taxRate
  const total = subtotal + taxEstimate

  const handleCheckout = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get customer ID from session storage if available
      const customerId = typeof window !== 'undefined' ? sessionStorage.getItem("customer_id") : null

      // Create checkout session
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart.items.map((item) => ({
            id: item.variantSKU,
            name: `${item.product.title} - ${item.variant.variantName || item.variant.details || item.variant.colorName || item.variant.color || 'Default'}`,
            price: item.variant.price,
            quantity: item.quantity,
            image: item.product.featuredImage?.url,
          })),
          customerId: customerId || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      // Redirect to Stripe checkout using the URL
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (err) {
      console.error("Checkout error:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsLoading(false)
    }
  }

  // Show loading state while redirecting to products
  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Order Items
                </h2>

                <div className="space-y-4">
                  {cart.items.map((item, index) => (
                    <motion.div
                      key={item.variantSKU}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0"
                    >
                      {item.product.featuredImage && (
                        <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                          <AgilityPic
                            image={item.product.featuredImage}
                            fallbackWidth={80}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {item.product.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.variant.variantName || item.variant.details || item.variant.colorName || item.variant.color || 'Default'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Quantity: {item.quantity}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ${(item.variant.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          ${item.variant.price.toFixed(2)} each
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm p-6 sticky top-24"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900 font-medium">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax estimate</span>
                    <span className="text-gray-900 font-medium">
                      ${taxEstimate.toFixed(2)}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-base font-semibold text-gray-900">
                        Total
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Proceed to Payment"
                  )}
                </button>

                <Link
                  href="/products"
                  className="block text-center text-sm text-gray-600 hover:text-gray-900 mt-4"
                >
                  Continue Shopping
                </Link>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    Secure checkout powered by Stripe
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

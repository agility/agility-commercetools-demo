"use client"

import { useCart } from "@/lib/hooks/useCart"
import { motion, AnimatePresence } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { ExclamationCircleIcon } from "@heroicons/react/24/outline"
import { checkoutFlow } from "@commercetools/checkout-browser-sdk"
import { getImageDimensions } from "@/lib/utils/imageOptimization"

interface CheckoutClientProps {
  heading: string
  description?: string
  taxRate: number
  contentID: string
}

export function CheckoutClient({ heading, description, taxRate, contentID }: CheckoutClientProps) {
  const router = useRouter()
  const { cart } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [createAccount, setCreateAccount] = useState(false)
  const [authenticatedCustomerId, setAuthenticatedCustomerId] = useState<string | null>(null)
  const checkoutInitialized = useRef(false)


  // Redirect to products if cart is empty
  useEffect(() => {
    if (cart.items.length === 0 && !isLoading) {
      router.push("/products")
    }
  }, [cart.items.length, router, isLoading])

  // Calculate totals
  const subtotal = cart.total
  const taxEstimate = subtotal * taxRate
  const total = subtotal + taxEstimate

  const handleCheckout = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Prevent multiple initializations
      if (checkoutInitialized.current) {
        return
      }

      const customerId = typeof window !== 'undefined' ? sessionStorage.getItem("customer_id") : undefined

      // Build request body for checkout session creation
      const requestBody: {
        items: typeof cart.items
        customerId?: string
        email?: string
        currency?: string
        country?: string
      } = {
        items: cart.items,
        currency: "USD",
        country: "US",
      }

      // If authenticated, use customer ID
      if (customerId) {
        requestBody.customerId = customerId
      }

      // If email provided, include it
      if (email) {
        requestBody.email = email
      }

      // Create commercetools checkout session
      const response = await fetch("/api/checkout/session/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to create checkout session")
      }

      if (!data.sessionId || !data.region || !data.projectKey) {
        throw new Error("Invalid checkout session response")
      }

      // Initialize commercetools Checkout SDK
      checkoutInitialized.current = true

      checkoutFlow({
        projectKey: data.projectKey,
        region: data.region,
        sessionId: data.sessionId,
        locale: typeof window !== 'undefined' ? navigator.language.split('-')[0] || 'en' : 'en',
        logInfo: process.env.NODE_ENV === 'development',
        logWarn: process.env.NODE_ENV === 'development',
        logError: true,
        onInfo: (info) => {
          console.log('[Checkout Info]', info)
        },
        onWarn: (warn) => {
          console.warn('[Checkout Warning]', warn)
        },
        onError: (err) => {
          console.error('[Checkout Error]', err)
          setError(err.message || 'Checkout error occurred')
          setIsLoading(false)
          checkoutInitialized.current = false
        },
      })
    } catch (err) {
      console.error("Checkout error:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsLoading(false)
      checkoutInitialized.current = false
    }
  }

  // Show loading state while redirecting to products
  if (cart.items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center" data-agility-component={contentID}>
        <div className="text-center">
          <div className="mx-auto size-12 animate-spin rounded-full border-b-2 border-t-2 border-gray-900 dark:border-white"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Redirecting to products...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8"
      data-agility-component={contentID}
    >
      <div className="mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-8">
            <h1
              className="text-3xl font-bold text-gray-900 dark:text-white"
              data-agility-field="heading"
            >
              {heading}
            </h1>
            {description && (
              <p
                className="mt-2 text-gray-600 dark:text-gray-400"
                data-agility-field="description"
              >
                {description}
              </p>
            )}
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
              >
                <div className="flex items-start gap-2">
                  <ExclamationCircleIcon className="size-5 shrink-0 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="space-y-4 lg:col-span-2">
              <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Order Items</h2>

                <div className="space-y-4">
                  {cart.items.map((item, index) => (
                    <motion.div
                      key={item.variantSKU}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex gap-4 border-b border-gray-200 pb-4 last:border-b-0 last:pb-0 dark:border-gray-700"
                    >
                      {item.product.featuredImage && (
                        <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700">
                          <Image
                            src={item.product.featuredImage.url}
                            alt={item.product.featuredImage.label || item.product.title}
                            width={item.product.featuredImage.width || getImageDimensions('cart').width}
                            height={item.product.featuredImage.height || getImageDimensions('cart').height}
                            className="size-full object-cover"
                            sizes="80px"
                            quality={85}
                          />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {item.product.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {(typeof item.variant.color === 'string' ? item.variant.color : '') ||
                            (typeof item.variant.size === 'object' && 'fields' in item.variant.size ? (item.variant.size as any).fields?.name : '') ||
                            "Default"}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Quantity: {item.quantity}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {/* ${(item.variant.price * item.quantity).toFixed(2)} */}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          ${item.variant.price} each
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
                className="sticky top-24 space-y-4"
              >
                {/* Customer Email Form */}
                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                  <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Contact Information</h2>

                  {authenticatedCustomerId && (
                    <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                      <p className="text-sm text-green-800 dark:text-green-300">
                        ✓ Logged in as {email}
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="checkout-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address {!authenticatedCustomerId && <span className="text-xs text-gray-500">(optional)</span>}
                      </label>
                      <input
                        type="email"
                        id="checkout-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        disabled={!!authenticatedCustomerId}
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-white dark:focus:ring-white dark:disabled:bg-gray-800"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {authenticatedCustomerId
                          ? "Your account email"
                          : email
                            ? "We'll send your order confirmation here"
                            : "Skip to checkout as guest - you'll enter email at payment"}
                      </p>
                    </div>

                    {!authenticatedCustomerId && email && (
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          id="create-account"
                          checked={createAccount}
                          onChange={(e) => setCreateAccount(e.target.checked)}
                          className="mt-0.5 size-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-white"
                        />
                        <label htmlFor="create-account" className="text-sm text-gray-700 dark:text-gray-300">
                          Create an account to track orders and manage billing
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                  <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Order Summary</h2>

                  <div className="mb-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                      <span className="font-medium text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Tax estimate</span>
                      <span className="font-medium text-gray-900 dark:text-white">${taxEstimate.toFixed(2)}</span>
                    </div>

                    <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                      <div className="flex justify-between">
                        <span className="text-base font-semibold text-gray-900 dark:text-white">Total</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={isLoading}
                    className="w-full rounded-lg bg-gray-900 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="size-5 animate-spin"
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
                    className="mt-4 block text-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    Continue Shopping
                  </Link>

                  <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
                    <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                      Secure checkout powered by commercetools
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

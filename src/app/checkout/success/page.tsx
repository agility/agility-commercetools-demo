"use client"

import { useCart } from "@/lib/hooks/useCart"
import { CheckCircleIcon } from "@heroicons/react/24/solid"
import { motion } from "motion/react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"

function CheckoutSuccessContent() {
  const { clearCart } = useCart()
  const searchParams = useSearchParams()
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    // Clear cart on successful checkout
    clearCart()

    // Get session ID from URL
    const id = searchParams.get("session_id")
    setSessionId(id)

    // Fetch session details and store customer ID
    if (id) {
      fetch(`/api/checkout/session?session_id=${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.customerId && typeof window !== 'undefined') {
            sessionStorage.setItem("customer_id", data.customerId)
            console.log("[Checkout Success] Stored customer ID in session:", data.customerId)
          }
        })
        .catch((err) => {
          console.error("[Checkout Success] Error fetching session:", err)
        })
    }
  }, [clearCart, searchParams])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.2,
            }}
            className="mx-auto w-20 h-20 mb-6"
          >
            <CheckCircleIcon className="w-full h-full text-green-500" />
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Order Confirmed!
            </h1>

            <p className="text-lg text-gray-600 mb-6">
              Thank you for your purchase. Your order has been successfully
              processed.
            </p>

            {sessionId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-500 mb-1">Order Reference</p>
                <p className="text-xs font-mono text-gray-700 break-all">
                  {sessionId}
                </p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                A confirmation email has been sent to your email address with
                order details and tracking information.
              </p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-3"
          >
            <Link
              href="/products"
              className="block w-full bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </Link>

            <Link
              href="/"
              className="block w-full bg-white text-gray-700 py-3 px-6 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Return to Home
            </Link>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 pt-6 border-t border-gray-200"
          >
            <p className="text-xs text-gray-500">
              Need help? Contact our support team at{" "}
              <a
                href="mailto:support@example.com"
                className="text-blue-600 hover:underline"
              >
                support@example.com
              </a>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}

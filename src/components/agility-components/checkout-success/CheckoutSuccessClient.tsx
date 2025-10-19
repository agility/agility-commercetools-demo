"use client"

import { useCart } from "@/lib/hooks/useCart"
import { CheckCircleIcon } from "@heroicons/react/24/solid"
import { motion } from "motion/react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"

interface CheckoutSuccessClientProps {
  heading: string
  description: string
  supportEmail: string
  contentID: string
}

function CheckoutSuccessContent({
  heading,
  description,
  supportEmail,
  contentID,
}: CheckoutSuccessClientProps) {
  const { clearCart } = useCart()
  const searchParams = useSearchParams()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionData, setSessionData] = useState<any>(null)
  const [portalUrl, setPortalUrl] = useState<string | null>(null)

  useEffect(() => {
    // Clear cart on successful checkout
    clearCart()

    // Get session ID from URL
    const id = searchParams.get("session_id")
    setSessionId(id)

    // Fetch session details to check if account was created
    if (id) {
      fetchSessionDetails(id)
    }
  }, [clearCart, searchParams])

  const fetchSessionDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/checkout/session?session_id=${id}`)
      const data = await response.json()
      if (response.ok) {
        setSessionData(data)

        // Store customer ID in session storage
        if (data.customerId && typeof window !== 'undefined') {
          sessionStorage.setItem("customer_id", data.customerId)
          console.log("[Checkout Success] Stored customer ID in session:", data.customerId)

          // Generate portal link for order tracking
          generatePortalLink(data.customerId, id)
        }
      }
    } catch (error) {
      console.error("Error fetching session details:", error)
    }
  }

  const generatePortalLink = async (customerId: string, sessionId: string) => {
    try {
      const response = await fetch("/api/customer-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          returnUrl: typeof window !== 'undefined'
            ? `${window.location.origin}/checkout/success?session_id=${sessionId}`
            : undefined
        })
      })

      const data = await response.json()
      if (response.ok && data.url) {
        setPortalUrl(data.url)
      }
    } catch (error) {
      console.error("Error generating portal link:", error)
    }
  }


  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8"
      data-agility-component={contentID}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="rounded-lg bg-white p-8 text-center shadow-lg dark:bg-gray-800">
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
            className="mx-auto mb-6 size-20"
          >
            <CheckCircleIcon className="size-full text-green-500" />
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h1
              className="mb-4 text-3xl font-bold text-gray-900 dark:text-white"
              data-agility-field="heading"
            >
              {heading}
            </h1>

            <p
              className="mb-6 text-lg text-gray-600 dark:text-gray-400"
              data-agility-field="description"
            >
              {description}
            </p>

            {sessionId && (
              <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">Order Reference</p>
                <p className="break-all text-xs font-mono text-gray-700 dark:text-gray-300">{sessionId}</p>
              </div>
            )}

            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                A confirmation email has been sent to your email address with order details and tracking
                information.
              </p>
            </div>

            {/* Track Your Order Section */}
            {portalUrl && (
              <div className="mb-6 rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
                <h3 className="mb-2 font-semibold text-purple-900 dark:text-purple-100">
                  Track Your Order
                </h3>
                <p className="mb-3 text-sm text-purple-800 dark:text-purple-300">
                  View your order history, track shipments, and manage your account.
                </p>
                <a
                  href={portalUrl}
                  className="inline-flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-200"
                >
                  Go to Customer Portal
                  <svg
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </a>
              </div>
            )}



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
              className="block w-full rounded-lg bg-gray-900 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            >
              Continue Shopping
            </Link>

            <Link
              href="/"
              className="block w-full rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Return to Home
            </Link>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400" data-agility-field="supportEmail">
              Need help? Contact our support team at{" "}
              <a href={`mailto:${supportEmail}`} className="text-blue-600 hover:underline dark:text-blue-400">
                {supportEmail}
              </a>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export function CheckoutSuccessClient(props: CheckoutSuccessClientProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="mx-auto size-12 animate-spin rounded-full border-b-2 border-t-2 border-gray-900 dark:border-white"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent {...props} />
    </Suspense>
  )
}

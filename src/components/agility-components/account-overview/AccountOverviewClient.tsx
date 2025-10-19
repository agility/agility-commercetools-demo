"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline"

interface AccountOverviewClientProps {
  heading: string
  description?: string
  portalButtonText: string
  contentID: string
}

export function AccountOverviewClient({
  heading,
  description,
  portalButtonText,
  contentID,
}: AccountOverviewClientProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "verifying" | "success" | "error">("idle")

  // Login form state
  const [email, setEmail] = useState("")
  const [loginStatus, setLoginStatus] = useState<"idle" | "sending" | "sent">("idle")
  const [loginError, setLoginError] = useState("")

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get("token")
    const sessionId = urlParams.get("session_id")

    //get the customer id from session
    const customerId = sessionStorage.getItem("customer_id")


    // Priority 1: Verify magic link token
    if (token) {
      verifyMagicLinkToken(token)
      return
    }

    // Priority 2: Get customer ID from checkout session
    if (sessionId) {
      fetchCustomerIdFromSession(sessionId)
      return
    }

    // Priority 3: Use stored customer ID
    if (customerId) {
      generatePortalLink(customerId)
      return
    }

    // No authentication - redirect to portal
    setIsLoading(false)
  }, [])

  const verifyMagicLinkToken = async (token: string) => {
    try {
      setVerificationStatus("verifying")
      const response = await fetch("/api/auth/verify-magic-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok && data.url) {
        setVerificationStatus("success")

        //save the customer id in local session storage
        sessionStorage.setItem("customer_id", data.customerId)

        // Clean URL and redirect to the portal
        window.history.replaceState({}, "", "/account")
        location.href = data.url
      } else {
        setVerificationStatus("error")
        setError(data.error || "Invalid or expired link")
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Error verifying token:", err)
      setVerificationStatus("error")
      setError("Failed to verify login link")
      setIsLoading(false)
    }
  }

  const fetchCustomerIdFromSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/checkout/session?session_id=${sessionId}`)
      const data = await response.json()

      if (response.ok && data.customerId) {
        await generatePortalLink(data.customerId)
      } else {
        throw new Error("Could not retrieve customer information")
      }
    } catch (err) {
      console.error("Error fetching customer ID:", err)
      setError("Failed to load customer information")
      setIsLoading(false)
    }
  }

  const generatePortalLink = async (customerId: string) => {
    const response = await fetch("/api/auth/generate-portal-link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ customer_id: customerId }),
    })

    const portalData = await response.json()

    if (response.ok) {
      // Redirect to customer portal
      window.location.href = portalData.url
    } else {
      throw new Error("Failed to generate portal link")
    }
  }

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginStatus("sending")
    setLoginError("")

    try {
      const response = await fetch("/api/auth/send-magic-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setLoginStatus("sent")
      } else {
        setLoginStatus("idle")
        setLoginError(data.error || "Failed to send login link")
      }
    } catch (err) {
      console.error("Error sending magic link:", err)
      setLoginStatus("idle")
      setLoginError("Failed to send login link. Please try again.")
    }
  }

  // Show verification status when verifying magic link
  if (verificationStatus === "verifying") {
    return (
      <div className="flex min-h-screen items-center justify-center" data-agility-component={contentID}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800"
        >
          <div className="text-center">
            <div className="mx-auto size-12 animate-spin rounded-full border-b-2 border-t-2 border-gray-900 dark:border-white"></div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">Verifying...</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Please wait while we log you in</p>
          </div>
        </motion.div>
      </div>
    )
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" data-agility-component={contentID}>
        <div className="text-center">
          <div className="mx-auto size-12 animate-spin rounded-full border-b-2 border-t-2 border-gray-900 dark:border-white"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading account information...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-12 dark:bg-gray-900" data-agility-component={contentID}>
        <div className="mx-auto max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800"
          >
            <div className="text-center">
              <ExclamationCircleIcon className="mx-auto size-16 text-red-500" />
              <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Error</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
              <button
                onClick={() => {
                  // Clear session storage
                  sessionStorage.removeItem("customer_id")
                  // Reset error state and show login form
                  setError(null)
                  setIsLoading(false)
                  setVerificationStatus("idle")
                  setLoginStatus("idle")
                  setLoginError("")
                  setEmail("")
                  // Clean URL
                  window.history.replaceState({}, "", "/account")
                }}
                className="mt-6 rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              >
                Login Again
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Show login form when not authenticated
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 dark:bg-gray-900" data-agility-component={contentID}>
      <div className="mx-auto max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800"
        >
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-agility-field="heading">
              {heading}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Enter your email to receive a secure login link
            </p>
          </div>

          <AnimatePresence mode="wait">
            {loginStatus === "sent" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                <CheckCircleIcon className="mx-auto size-16 text-green-500" />
                <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Check Your Email</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  We've sent a login link to <strong>{email}</strong>
                </p>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  The link will expire in 15 minutes. If you don't see the email, check your spam folder.
                </p>
                <button
                  onClick={() => {
                    setLoginStatus("idle")
                    setEmail("")
                  }}
                  className="mt-6 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  Send another link
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSendMagicLink}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <EnvelopeIcon className="size-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-white dark:focus:ring-white"
                    />
                  </div>
                </div>

                {loginError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
                  >
                    <div className="flex items-start gap-2">
                      <ExclamationCircleIcon className="size-5 shrink-0 text-red-600 dark:text-red-400" />
                      <p className="text-sm text-red-700 dark:text-red-300">{loginError}</p>
                    </div>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loginStatus === "sending"}
                  className="w-full rounded-lg bg-gray-900 px-4 py-3 font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                >
                  {loginStatus === "sending" ? (
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
                      Sending...
                    </span>
                  ) : (
                    "Send Login Link"
                  )}
                </button>

                <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                  We'll send you a secure, one-time login link. No password required.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

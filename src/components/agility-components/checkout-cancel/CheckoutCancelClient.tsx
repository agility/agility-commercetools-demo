"use client"

import { XMarkIcon } from "@heroicons/react/24/solid"
import { motion } from "motion/react"
import Link from "next/link"

interface CheckoutCancelClientProps {
  heading: string
  description: string
  supportEmail: string
  contentID: string
}

export function CheckoutCancelClient({
  heading,
  description,
  supportEmail,
  contentID,
}: CheckoutCancelClientProps) {
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
          {/* Cancel Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.2,
            }}
            className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20"
          >
            <XMarkIcon className="size-12 text-red-600 dark:text-red-400" />
          </motion.div>

          {/* Cancellation Message */}
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

            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Don't worry! Your cart has been preserved and all items are still waiting for you.
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
              href="/checkout"
              className="block w-full rounded-lg bg-gray-900 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            >
              Return to Checkout
            </Link>

            <Link
              href="/products"
              className="block w-full rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Continue Shopping
            </Link>

            <Link href="/" className="mt-4 block text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">
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
              Need assistance? Contact our support team at{" "}
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

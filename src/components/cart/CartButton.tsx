"use client"

import { useCart } from "@/lib/hooks/useCart"
import { ShoppingBagIcon } from "@heroicons/react/24/outline"
import { motion } from "motion/react"
import { useEffect, useState } from "react"

export function CartButton() {
  const { cart, openCart, itemJustAdded } = useCart()
  const [shouldPulse, setShouldPulse] = useState(false)

  // Trigger pulse animation when item is added
  useEffect(() => {
    if (itemJustAdded) {
      setShouldPulse(true)
      const timer = setTimeout(() => setShouldPulse(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [itemJustAdded])

  return (
    <button
      onClick={openCart}
      className="relative rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
      aria-label={`Shopping cart with ${cart.itemCount} items`}
    >
      <motion.div
        animate={shouldPulse ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <ShoppingBagIcon className="size-6" />

        {/* Badge */}
        {cart.itemCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white dark:bg-white dark:text-gray-900"
          >
            {cart.itemCount > 99 ? "99+" : cart.itemCount}
          </motion.span>
        )}
      </motion.div>
    </button>
  )
}

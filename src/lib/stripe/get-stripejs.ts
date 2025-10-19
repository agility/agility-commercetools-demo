/**
 * Stripe.js client-side utility
 * Uses singleton pattern to avoid loading Stripe multiple times
 */
import type { Stripe } from "@stripe/stripe-js"
import { loadStripe } from "@stripe/stripe-js"

let stripePromise: Promise<Stripe | null>

/**
 * Get Stripe.js instance
 * Lazy loads Stripe.js for better performance
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

    if (!key) {
      console.error("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable")
      return Promise.resolve(null)
    }

    stripePromise = loadStripe(key)
  }

  return stripePromise
}

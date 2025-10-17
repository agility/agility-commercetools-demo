import { loadStripe, Stripe } from "@stripe/stripe-js"

let stripePromise: Promise<Stripe | null>

/**
 * Get the Stripe instance
 * This is a singleton pattern to ensure we only create one Stripe instance
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

    if (!publishableKey) {
      console.warn(
        "Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable. Stripe will not be initialized."
      )
      return Promise.resolve(null)
    }

    stripePromise = loadStripe(publishableKey)
  }

  return stripePromise
}

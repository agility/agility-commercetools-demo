import type { ICartItem } from "./ICart"

/**
 * Checkout session request payload
 */
export interface CheckoutSessionRequest {
  items: ICartItem[]
  customerId?: string // Stripe customer ID for authenticated users
  email?: string // Optional email for guest checkout or account creation
  createAccount?: boolean
}

/**
 * Checkout session response
 */
export interface CheckoutSessionResponse {
  sessionId: string
  url: string | null
}

/**
 * Stripe webhook event types we handle
 */
export type StripeWebhookEvent =
  | "checkout.session.completed"
  | "payment_intent.succeeded"
  | "payment_intent.payment_failed"

/**
 * Order metadata stored in Stripe checkout session
 */
export interface OrderMetadata {
  cartItemCount: string
  orderItems: string // JSON stringified array
  createAccount?: string // "true" | "false"
  isGuest?: string // "true" | "false"
}

/**
 * Parsed order item from metadata
 */
export interface OrderItem {
  productId: number
  variantSKU: string
  productTitle: string
  quantity: number
  price: number
}

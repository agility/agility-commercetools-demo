import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getCart, createOrderFromCart, addPaymentToCart } from '@/lib/commercetools/cart'
import { createPayment, addTransactionToPayment } from '@/lib/commercetools/payment'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    // Get the raw body as text
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('Missing Stripe signature header')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Verify the webhook signature
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      // Extract commercetools cart info from metadata
      const cartId = session.metadata?.commercetools_cart_id
      const cartVersion = session.metadata?.commercetools_cart_version
        ? parseInt(session.metadata.commercetools_cart_version)
        : undefined
      const commercetoolsCustomerId = session.metadata?.commercetools_customer_id || undefined

      if (!cartId || !cartVersion) {
        console.error('Missing commercetools cart information in Stripe session metadata', {
          sessionId: session.id,
          metadata: session.metadata,
        })
        // Still return 200 to acknowledge webhook, but log error
        return NextResponse.json({ received: true }, { status: 200 })
      }

      try {
        // Step 1: Get the cart to verify it exists and get latest version
        const cart = await getCart(cartId)

        // Step 2: Create payment in commercetools
        const payment = await createPayment(
          session.amount_total || 0,
          session.currency?.toUpperCase() || 'USD',
          'Stripe',
          'stripe',
          session.payment_intent as string, // Stripe payment intent ID
          commercetoolsCustomerId
        )

        // Step 3: Add successful transaction to payment
        const paymentWithTransaction = await addTransactionToPayment(
          payment.id,
          payment.version,
          {
            type: 'Charge',
            amount: session.amount_total || 0,
            currency: session.currency?.toUpperCase() || 'USD',
            state: 'Success',
            interactionId: session.payment_intent as string,
          }
        )

        // Step 4: Add payment to cart (required before creating order)
        const cartWithPayment = await addPaymentToCart(
          cart.id,
          cart.version,
          paymentWithTransaction.id
        )

        // Step 5: Create order from cart
        const order = await createOrderFromCart(cartWithPayment.id, cartWithPayment.version)

        // Order created successfully - log key details for debugging
        console.error('[Webhook] Order created:', {
          orderId: order.id,
          orderNumber: order.orderNumber,
          orderState: order.orderState,
          paymentState: order.paymentState,
          paymentId: paymentWithTransaction.id,
          stripeSessionId: session.id,
          customerEmail: session.customer_details?.email,
        })

        // TODO: Additional post-purchase actions:
        // - Send confirmation email
        // - Update inventory (if not handled automatically by commercetools)
        // - Trigger fulfillment process
        // - Update analytics/tracking
      } catch (error) {
        console.error('[Webhook] Error processing checkout completion:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          cartId,
          cartVersion,
          stripeSessionId: session.id,
        })
        // Log error but still return 200 to acknowledge webhook
        // Stripe will retry if we return an error status
        // You may want to implement retry logic or error notification here
        throw error // Re-throw to see in logs, but webhook will still return 200 below
      }
    }

    // Handle payment_intent events (backup handling)
    if (event.type === 'payment_intent.succeeded') {
      // Note: checkout.session.completed should handle order creation,
      // but this can be used as a backup or for additional processing
    }

    if (event.type === 'payment_intent.payment_failed') {
      // TODO: Handle failed payment (notify customer, update order status, etc.)
    }

    // Return a 200 response to acknowledge receipt of the event
    return NextResponse.json(
      { received: true },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Handle unsupported HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

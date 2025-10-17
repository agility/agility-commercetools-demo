import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
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

      // Log order details
      console.log('Order completed:', {
        sessionId: session.id,
        customerId: session.customer,
        customerEmail: session.customer_details?.email,
        amountTotal: session.amount_total,
        currency: session.currency,
        paymentStatus: session.payment_status,
        metadata: session.metadata,
        timestamp: new Date().toISOString(),
      })

      // Parse order items from metadata if available
      if (session.metadata?.orderItems) {
        try {
          const orderItems = JSON.parse(session.metadata.orderItems)
          console.log('Order items:', orderItems)
        } catch (err) {
          console.error('Failed to parse order items from metadata:', err)
        }
      }

      // TODO: Add your post-purchase logic here:
      // - Save order to database
      // - Send confirmation email
      // - Update inventory
      // - Trigger fulfillment process
      // - Update customer records
    }

    // Handle other event types if needed
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('Payment intent succeeded:', event.data.object.id)
        break
      case 'payment_intent.payment_failed':
        console.log('Payment intent failed:', event.data.object.id)
        break
      default:
        console.log('Unhandled event type:', event.type)
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

import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import type { ICartItem } from "@/lib/types/ICart"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
})

interface CheckoutRequestBody {
  items: ICartItem[]
  customerId?: string // Stripe customer ID for authenticated users
  email?: string // Optional email for guest checkout or account creation
  createAccount?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequestBody = await request.json()

    // Validate request body
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Invalid cart items" }, { status: 400 })
    }

    // Get the site URL - use origin from request headers or fallback to env
    const origin = request.headers.get("origin")
    const siteUrl = origin || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    // Determine customer handling based on authentication and input
    let customerId: string | undefined
    let customerEmail: string | undefined
    let isGuest = false

    // Priority 1: Authenticated user with customer ID from session
    if (body.customerId) {
      customerId = body.customerId
      console.log("[Checkout] Using customer ID from session:", customerId)

      // Verify customer exists and get their email
      try {
        const customer = await stripe.customers.retrieve(body.customerId)
        if (customer.deleted) {
          console.error("[Checkout] Customer account deleted:", customerId)
          return NextResponse.json({ error: "Customer account not found" }, { status: 404 })
        }
        customerEmail = customer.email || undefined
        console.log("[Checkout] Verified customer email:", customerEmail)
      } catch (error) {
        console.error("[Checkout] Error retrieving customer:", error)
        return NextResponse.json({ error: "Invalid customer ID" }, { status: 400 })
      }
    }


    // Create line items for Stripe checkout
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = body.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.product.title,
          description: `${item.variant.color || ""} ${item.variant.size.fields.title || ""}`.trim(),
          images: item.product.featuredImage?.url ? [item.product.featuredImage.url] : [],
          metadata: {
            productSku: item.product.sku,
            variantSKU: item.variantSKU,
          },
        },
        unit_amount: Math.round(item.variant.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }))

    // Create Stripe checkout session with customer association
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancel`,
      customer: customerId,
      customer_creation: customerId ? undefined : "always", // Let Stripe collect email for guest
      metadata: {
        cartItemCount: body.items.length.toString(),
        createAccount: body.createAccount ? "true" : "false",
        isGuest: isGuest.toString(),
        orderItems: JSON.stringify(
          body.items.map((item) => ({
            productId: item.productId,
            variantSKU: item.variantSKU,
            productTitle: item.product.title,
            quantity: item.quantity,
            price: item.variant.price,
          }))
        ),
      },
    }

    // Add customer ID if we have one (authenticated or newly created)
    if (customerId) {
      sessionParams.customer = customerId
    }
    // Add customer email if provided and no customer ID (guest with email)
    else if (customerEmail) {
      sessionParams.customer_email = customerEmail
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json(
      {
        sessionId: session.id,
        url: session.url,
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error creating checkout session:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
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

import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
})

/**
 * Retrieve Stripe Checkout Session details
 * Used on the success page to display order confirmation
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id parameter" }, { status: 400 })
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "customer"],
    })

    // Get customer ID - could be from session.customer or we need to find/create based on email
    let customerId = session.customer

    // If no customer ID but we have customer email, find or create customer
    if (!customerId && session.customer_details?.email) {
      const customers = await stripe.customers.list({
        email: session.customer_details.email.toLowerCase(),
        limit: 1,
      })

      if (customers.data.length > 0) {
        customerId = customers.data[0].id
      } else {
        // Create customer for this guest checkout
        const newCustomer = await stripe.customers.create({
          email: session.customer_details.email.toLowerCase(),
          name: session.customer_details.name || undefined,
          phone: session.customer_details.phone || undefined,
          address: session.customer_details.address || undefined,
          metadata: {
            source: "guest_checkout",
            sessionId: session.id,
          },
        })
        customerId = newCustomer.id

        // Update the session to link it to the customer
        await stripe.checkout.sessions.update(sessionId, {
          metadata: {
            ...session.metadata,
            retroactiveCustomerId: newCustomer.id,
          },
        })
      }
    }

    // Return session details including customer ID
    return NextResponse.json(
      {
        customerId: typeof customerId === "string" ? customerId : customerId?.id,
        session: {
          id: session.id,
          amount_total: session.amount_total,
          currency: session.currency,
          customer_details: session.customer_details,
          payment_status: session.payment_status,
          metadata: session.metadata,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error retrieving checkout session:", error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode || 500 })
    }

    return NextResponse.json({ error: "Failed to retrieve session" }, { status: 500 })
  }
}

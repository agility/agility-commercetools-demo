import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const customerId = searchParams.get("customerId")

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
    }

    // Fetch checkout sessions for this customer
    const sessions = await stripe.checkout.sessions.list({
      customer: customerId,
      limit: 100,
      expand: ["data.line_items", "data.payment_intent"],
    })

    // Transform sessions into order data
    const orders = sessions.data.map((session) => ({
      id: session.id,
      status: session.payment_status,
      amount: session.amount_total,
      currency: session.currency,
      created: session.created,
      items: session.line_items?.data.map((item) => ({
        description: item.description,
        amount: item.amount_total,
        quantity: item.quantity,
      })),
      paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
    }))

    return NextResponse.json({ orders }, { status: 200 })
  } catch (error) {
    console.error("Error fetching customer orders:", error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode || 500 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

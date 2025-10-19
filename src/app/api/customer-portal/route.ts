import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId } = body

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
    }

    // Get the site URL
    const origin = request.headers.get("origin")
    const siteUrl = origin || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    // Create a Stripe Customer Portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${siteUrl}`,
    })

    return NextResponse.json({ url: session.url }, { status: 200 })
  } catch (error) {
    console.error("Error creating customer portal session:", error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode || 500 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}

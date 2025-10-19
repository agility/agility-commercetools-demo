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

    // Fetch customer details from Stripe
    const customer = await stripe.customers.retrieve(customerId, {
      expand: ["subscriptions", "invoice_settings.default_payment_method"],
    })

    if (customer.deleted) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Extract relevant customer information
    const customerData = {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      created: customer.created,
      balance: customer.balance,
      currency: customer.currency,
      defaultPaymentMethod: customer.invoice_settings?.default_payment_method,
      subscriptions: customer.subscriptions?.data.map((sub: any) => ({
        id: sub.id,
        status: sub.status,
        currentPeriodEnd: sub.current_period_end,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      })),
    }

    return NextResponse.json({ customer: customerData }, { status: 200 })
  } catch (error) {
    console.error("Error fetching customer details:", error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode || 500 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

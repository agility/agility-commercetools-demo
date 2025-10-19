import { NextRequest, NextResponse } from "next/server"
import { verifyMagicLinkToken } from "@/lib/auth/magic-link"
import Stripe from "stripe"
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
})
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customer_id } = body

    if (!customer_id) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
    }


    //generate the portal link
    const portalLink = await stripe.billingPortal.sessions.create({
      customer: customer_id!,
      return_url:
        `${process.env.NEXT_PUBLIC_SITE_URL}` ||
        "http://localhost:3000",
    })


    return NextResponse.json(
      {
        success: true,
        customerId: customer_id,
        url: portalLink.url,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error verifying magic link:", error)
    return NextResponse.json({ error: "Failed to verify token" }, { status: 500 })
  }
}

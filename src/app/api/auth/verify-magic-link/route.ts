import { NextRequest, NextResponse } from "next/server"
import { verifyMagicLinkToken } from "@/lib/auth/magic-link"
import Stripe from "stripe"
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
})
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    // Verify the token
    const result = await verifyMagicLinkToken(token)

    if (!result) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    //generate the portal link
    const portalLink = await stripe.billingPortal.sessions.create({
      customer: result?.customerId!,
      return_url:
        `${process.env.NEXT_PUBLIC_SITE_URL}` ||
        "http://localhost:3000",
    })



    return NextResponse.json(
      {
        success: true,
        customerId: result.customerId,
        url: portalLink.url,
        email: result.email,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error verifying magic link:", error)
    return NextResponse.json({ error: "Failed to verify token" }, { status: 500 })
  }
}

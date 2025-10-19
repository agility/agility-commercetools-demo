import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { Resend } from "resend"
import { generateMagicLinkToken } from "@/lib/auth/magic-link"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
})

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Search for customer in Stripe by email
    const customers = await stripe.customers.list({
      email: email.toLowerCase(),
      limit: 1,
    })

    let customer: any

    if (customers.data.length === 0) {
      // Create a new customer if they don't exist
      // This allows post-checkout account creation
      customer = await stripe.customers.create({
        email: email.toLowerCase(),
        metadata: {
          source: "magic_link_request",
          accountCreated: new Date().toISOString(),
        },
      })
    } else {
      customer = customers.data[0]
    }

    // Generate magic link token
    const token = await generateMagicLinkToken(email, customer.id)

    // Get site URL
    const origin = request.headers.get("origin")
    const siteUrl = origin || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const magicLink = `${siteUrl}/account?token=${token}`
    console.log("Generated magic link:", magicLink)
    // Send email with magic link using Resend
    const emailRes = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: email,
      subject: "Your Account Login Link",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Account Login</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin: 20px 0;">
              <h1 style="color: #1a1a1a; margin-top: 0;">Access Your Account</h1>
              <p style="font-size: 16px; color: #555;">Click the button below to securely access your account. This link will expire in 15 minutes.</p>

              <div style="margin: 30px 0;">
                <a href="${magicLink}"
                   style="display: inline-block; background-color: #1a1a1a; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Access My Account
                </a>
              </div>

              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                If you didn't request this link, you can safely ignore this email.
              </p>

              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

              <p style="font-size: 12px; color: #999;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${magicLink}" style="color: #0066cc; word-break: break-all;">${magicLink}</a>
              </p>
            </div>
          </body>
        </html>
      `,
    })

    console.log("Email sent:", emailRes)

    return NextResponse.json(
      {
        success: true,
        message: "If an account exists with this email, a magic link has been sent.",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error sending magic link:", error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: "Failed to verify customer" }, { status: 500 })
    }

    return NextResponse.json({ error: "Failed to send magic link" }, { status: 500 })
  }
}

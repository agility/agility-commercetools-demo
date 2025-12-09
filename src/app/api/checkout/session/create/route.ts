import { NextRequest, NextResponse } from "next/server"
import { env } from "@/lib/env"
import { createCart, addLineItemsToCart, setShippingAddress } from "@/lib/commercetools/cart"
import type { ICartItem } from "@/lib/types/ICart"

interface CreateCheckoutSessionRequestBody {
  items: ICartItem[]
  customerId?: string
  email?: string
  currency?: string
  country?: string
}

/**
 * Create a commercetools Checkout Session
 * This endpoint creates a cart, adds items, and then creates a checkout session
 * that can be used with the commercetools Checkout Browser SDK
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateCheckoutSessionRequestBody = await request.json()

    // Validate request body
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Invalid cart items" }, { status: 400 })
    }

    const projectKey = env.getOptionalByKey("CTP_PROJECT_KEY")
    const region = env.getOptionalByKey("CTP_CHECKOUT_REGION")
    const applicationKey = env.getOptionalByKey("CTP_CHECKOUT_APPLICATION_KEY")
    const sessionClientId = env.getOptionalByKey("CTP_CHECKOUT_SESSION_CLIENT_ID")
    const sessionClientSecret = env.getOptionalByKey("CTP_CHECKOUT_SESSION_CLIENT_SECRET")

    if (!projectKey || !region || !applicationKey || !sessionClientId || !sessionClientSecret) {
      return NextResponse.json(
        {
          error: "Missing required commercetools Checkout configuration",
          details: {
            projectKey: !!projectKey,
            region: !!region,
            applicationKey: !!applicationKey,
            sessionClientId: !!sessionClientId,
            sessionClientSecret: !!sessionClientSecret,
          },
        },
        { status: 500 }
      )
    }

    const currency = body.currency || "USD"
    const country = body.country || "US"

    // Step 1: Create a cart in commercetools
    const cart = await createCart(
      body.customerId,
      body.email,
      currency,
      country
    )

    // Step 2: Add line items to the cart
    const lineItemsToAdd = body.items.map((item) => {
      const productId = item.productId || item.product.commercetoolsId

      if (!productId) {
        throw new Error(`Product ID missing for item: ${item.product.slug}`)
      }

      return {
        productId,
        sku: item.variantSKU,
        quantity: item.quantity,
      }
    })

    const updatedCart = await addLineItemsToCart(
      cart.id,
      lineItemsToAdd,
      cart.version
    )

    // Step 2.5: Set minimal shipping address (country only)
    // commercetools Checkout SDK will collect the full address from the user
    // We only set the country here as a minimal requirement for the checkout session API
    // The commercetools Checkout UI will handle:
    // - Full address collection (street, city, state, postal code)
    // - Shipping method selection
    // - Tax calculation based on full address
    // - Payment processing
    // - Order creation
    const cartWithAddress = await setShippingAddress(
      updatedCart.id,
      updatedCart.version,
      country
    )

    // Step 3: Get auth token for checkout session API
    // Note: The checkout session API uses a different authentication endpoint
    const authUrl = env.getOptionalByKey("CTP_AUTH_URL") || "https://auth.europe-west1.gcp.commercetools.com"
    const authResponse = await fetch(`${authUrl}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${sessionClientId}:${sessionClientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope: `manage_sessions:${projectKey}`,
      }).toString(),
    })

    if (!authResponse.ok) {
      const errorText = await authResponse.text()
      throw new Error(`Failed to authenticate with commercetools: ${errorText}`)
    }

    const authData = await authResponse.json()
    const accessToken = authData.access_token

    // Step 4: Create checkout session
    // The checkout session will handle:
    // - Payment processing (via configured payment connectors)
    // - Order creation AFTER successful payment (best practice)
    // - Handling edge cases (multiple payments, unreachable redirects, etc.)
    // Reference: https://docs.commercetools.com/foundry/best-practice-guides/standard-checkout-flow
    const sessionUrl = `https://session.${region}.commercetools.com/${projectKey}/sessions`
    const sessionResponse = await fetch(sessionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        cart: {
          cartRef: {
            id: finalCart.id,
          },
        },
        metadata: {
          applicationKey: applicationKey,
        },
      }),
    })

    if (!sessionResponse.ok) {
      const errorText = await sessionResponse.text()
      console.error('Checkout session creation failed:', {
        status: sessionResponse.status,
        statusText: sessionResponse.statusText,
        error: errorText,
        cartId: cartWithAddress.id,
        cartVersion: cartWithAddress.version,
        hasShippingAddress: !!cartWithAddress.shippingAddress,
        shippingAddress: cartWithAddress.shippingAddress,
      })
      throw new Error(`Failed to create checkout session: ${errorText}`)
    }

    const sessionData = await sessionResponse.json()

    return NextResponse.json(
      {
        success: true,
        sessionId: sessionData.id,
        cartId: cartWithAddress.id,
        region: region,
        projectKey: projectKey,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error creating checkout session:", error)

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// Handle unsupported HTTP methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}

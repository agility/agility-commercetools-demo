import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { env } from "@/lib/env"
import type { ICartItem } from "@/lib/types/ICart"
import { createCart, addLineItemsToCart, setShippingAddress, getCart } from "@/lib/commercetools/cart"
import { createOrGetCustomer } from "@/lib/commercetools/customer"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
})

interface CreateStripeCheckoutSessionRequest {
  items: ICartItem[]
  customerId?: string // commercetools customer ID
  email?: string // Customer email (for guest checkout)
  shippingAddress?: {
    country: string
    state?: string
    city?: string
    streetName?: string
    streetNumber?: string
    postalCode?: string
    firstName?: string
    lastName?: string
    phone?: string
  }
  currency?: string
}

/**
 * Create a Stripe Checkout Session with commercetools cart integration
 *
 * Flow:
 * 1. Create/find customer in commercetools
 * 2. Create cart in commercetools
 * 3. Add line items to cart
 * 4. Set shipping address (if provided)
 * 5. Create Stripe checkout session with cart metadata
 * 6. Return checkout session URL
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateStripeCheckoutSessionRequest = await request.json()

    // Validate request body
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Invalid cart items" }, { status: 400 })
    }

    const siteUrl = env.getOptionalByKey("NEXT_PUBLIC_SITE_URL") || "http://localhost:3000"
    const currency = body.currency || "USD"

    // Only allow US addresses - products must be priced and tax rates configured for other countries
    const allowedCountries = ["US"]
    const shippingCountry = body.shippingAddress?.country || "US"

    // Validate country is supported
    if (!allowedCountries.includes(shippingCountry)) {
      return NextResponse.json(
        {
          error: "Shipping not available",
          message: `We currently only ship to ${allowedCountries.map(c => {
            const names: Record<string, string> = { US: "United States" }
            return names[c] || c
          }).join(", ")}`
        },
        { status: 400 }
      )
    }

    // Use shipping country for both cart and shipping address
    const cartCountry = shippingCountry

    // Step 1: Handle customer
    // For guest checkout, we don't create a customer - just use the email on the cart
    // Only use customerId if explicitly provided (authenticated users)
    let commercetoolsCustomerId: string | undefined = body.customerId
    let customerEmail: string | undefined = body.email

    // Note: We don't create customers for guest checkout to avoid password requirement
    // The email will be stored on the cart and order, which is sufficient for guest orders

    // Step 2: Create cart in commercetools with default country for pricing
    const cart = await createCart(
      commercetoolsCustomerId,
      customerEmail,
      currency,
      cartCountry
    )

    // Step 3: Add line items to cart
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

    let updatedCart = await addLineItemsToCart(cart.id, lineItemsToAdd, cart.version)

    // Step 4: Set shipping address if provided
    // Use the actual shipping country for tax/shipping calculation
    if (body.shippingAddress) {
      updatedCart = await setShippingAddress(
        updatedCart.id,
        updatedCart.version,
        body.shippingAddress
      )
    } else {
      // Set minimal address (country only) for tax calculation
      updatedCart = await setShippingAddress(updatedCart.id, updatedCart.version, {
        country: shippingCountry,
      })
    }

    // Re-fetch cart to get latest totals with tax/shipping
    updatedCart = await getCart(updatedCart.id)

    // Step 5: Calculate total amount for Stripe (in cents)
    const totalAmount = updatedCart.totalPrice.centAmount

    // Step 6: Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: body.items.map((item) => ({
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: item.product.title,
            description: item.variant?.variantName || item.product.description || undefined,
            images: item.variant?.image?.url
              ? [item.variant.image.url]
              : item.variant?.variantImage?.url
                ? [item.variant.variantImage.url]
                : item.product.featuredImage?.url
                  ? [item.product.featuredImage.url]
                  : undefined,
          },
          unit_amount: Math.round(
            (item.variant?.price || parseFloat(item.product.basePrice) || 0) * 100
          ),
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&cart_id=${updatedCart.id}`,
      cancel_url: `${siteUrl}/checkout/cancel?cart_id=${updatedCart.id}`,
      customer_email: customerEmail,
      metadata: {
        commercetools_cart_id: updatedCart.id,
        commercetools_cart_version: updatedCart.version.toString(),
        ...(commercetoolsCustomerId && { commercetools_customer_id: commercetoolsCustomerId }),
        order_items: JSON.stringify(
          body.items.map((item) => ({
            productId: item.productId,
            variantSKU: item.variantSKU,
            quantity: item.quantity,
            productSlug: item.product.slug,
          }))
        ),
      },
      // Allow Stripe to collect shipping address if not provided
      // Only allow US addresses
      shipping_address_collection: body.shippingAddress
        ? undefined
        : {
          allowed_countries: allowedCountries as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
        },
    })

    return NextResponse.json(
      {
        sessionId: session.id,
        url: session.url,
        cartId: updatedCart.id,
        totalAmount,
        currency: updatedCart.totalPrice.currencyCode,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error creating Stripe checkout session:", error)

    return NextResponse.json(
      {
        error: "Failed to create checkout session",
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

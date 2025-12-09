import { NextRequest, NextResponse } from "next/server"
import type { ICartItem } from "@/lib/types/ICart"
import { createCart, addLineItemsToCart, createOrderFromCart, setShippingAddress } from "@/lib/commercetools/cart"
import { fetchCommercetoolsProductBySlug } from "@/lib/commercetools/products"

interface CheckoutRequestBody {
  items: ICartItem[]
  customerId?: string // commercetools customer ID for authenticated users
  email?: string // Optional email for guest checkout
  createAccount?: boolean
  currency?: string
  country?: string
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

    const currency = body.currency || "USD"
    const country = body.country || "US"

    // Create a cart in commercetools
    const cart = await createCart(
      body.customerId,
      body.email,
      currency,
      country
    )

    // Prepare line items using product IDs from cart items
    // commercetools supports adding by productId + variantId or by SKU
    const lineItemsToAdd = body.items.map((item) => {
      // Use productId from cart item (commercetools product ID)
      const productId = item.productId || item.product.commercetoolsId

      if (!productId) {
        throw new Error(`Product ID missing for item: ${item.product.slug}`)
      }

      // Use SKU for variant identification (commercetools supports SKU-based line items)
      // This is more reliable than trying to match variant IDs
      return {
        productId,
        sku: item.variantSKU,
        quantity: item.quantity,
      }
    })

    // Add line items to the cart using SKUs
    const updatedCart = await addLineItemsToCart(
      cart.id,
      lineItemsToAdd,
      cart.version
    )

    // Set shipping address (required before creating order)
    // commercetools requires a shipping address for tax calculation and shipping method determination
    const cartWithAddress = await setShippingAddress(
      updatedCart.id,
      updatedCart.version,
      { country }
    )

    // Create order from cart
    // Note: In a real implementation, you might want to handle payment first
    // before creating the order. This is a simplified flow.
    const order = await createOrderFromCart(
      cartWithAddress.id,
      cartWithAddress.version
    )

    return NextResponse.json(
      {
        orderId: order.id,
        orderNumber: order.orderNumber,
        cartId: cartWithAddress.id,
        totalPrice: {
          centAmount: order.totalPrice.centAmount,
          currencyCode: order.totalPrice.currencyCode,
        },
        // For compatibility with existing frontend, include a URL
        // In commercetools, you'd typically redirect to a payment provider
        url: `${siteUrl}/checkout/success?order_id=${order.id}`,
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error creating checkout:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
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

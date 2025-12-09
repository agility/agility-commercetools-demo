import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getCommercetoolsApiRoot } from "@/lib/commercetools/client"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
})

/**
 * Retrieve order details from Stripe session or commercetools order ID
 * Used on the success page to display order confirmation
 *
 * Supports two query parameters:
 * - session_id: Stripe checkout session ID (preferred - retrieves order from commercetools via cart ID in metadata)
 * - order_id: commercetools order ID (fallback)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get("session_id")
    const orderId = searchParams.get("order_id")

    const apiRoot = getCommercetoolsApiRoot()

    // If session_id is provided, retrieve order via Stripe session metadata
    if (sessionId) {
      try {
        // Retrieve Stripe session to get cart ID from metadata
        const session = await stripe.checkout.sessions.retrieve(sessionId)
        const cartId = session.metadata?.commercetools_cart_id

        if (!cartId) {
          return NextResponse.json(
            { error: "Cart ID not found in session metadata" },
            { status: 400 }
          )
        }

        // Find order by cart ID (commercetools creates order from cart)
        // Note: We need to query orders by cart reference
        // Since commercetools doesn't have a direct "find order by cart ID" endpoint,
        // we'll need to search orders or use a different approach

        // For now, if we have the cart ID, we can try to find the order
        // In a production system, you might want to store the order ID in session metadata
        // or use a different lookup mechanism

        // Fallback: Try to get order by customer email and recent timestamp
        // This is a workaround - ideally store order ID in session metadata
        if (session.customer_details?.email) {
          // Query recent orders for this customer
          const ordersResponse = await apiRoot
            .orders()
            .get({
              queryArgs: {
                where: `customerEmail="${session.customer_details.email}"`,
                sort: "createdAt desc",
                limit: 1,
              },
            })
            .execute()

          if (ordersResponse.body.results.length > 0) {
            const order = ordersResponse.body.results[0]
            return formatOrderResponse(order)
          }
        }

        // If we can't find the order, return session info
        return NextResponse.json(
          {
            sessionId: session.id,
            paymentStatus: session.payment_status,
            customerEmail: session.customer_details?.email,
            amountTotal: session.amount_total,
            currency: session.currency,
            message: "Payment successful. Order is being processed.",
          },
          { status: 200 }
        )
      } catch (stripeError) {
        console.error("Error retrieving Stripe session:", stripeError)
        // Fall through to order_id lookup
      }
    }

    // If order_id is provided or session lookup failed, retrieve order directly
    if (orderId) {
      const response = await apiRoot
        .orders()
        .withId({ ID: orderId })
        .get()
        .execute()

      return formatOrderResponse(response.body)
    }

    return NextResponse.json(
      { error: "Missing session_id or order_id parameter" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error retrieving order:", error)

    return NextResponse.json(
      {
        error: "Failed to retrieve order",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

function formatOrderResponse(order: any) {
  return NextResponse.json(
    {
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      customerEmail: order.customerEmail,
      totalPrice: {
        centAmount: order.totalPrice.centAmount,
        currencyCode: order.totalPrice.currencyCode,
      },
      lineItems: order.lineItems.map((item: any) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        totalPrice: {
          centAmount: item.totalPrice.centAmount,
          currencyCode: item.totalPrice.currencyCode,
        },
      })),
      orderState: order.orderState,
      paymentState: order.paymentState,
      shipmentState: order.shipmentState,
      createdAt: order.createdAt,
    },
    { status: 200 }
  )
}

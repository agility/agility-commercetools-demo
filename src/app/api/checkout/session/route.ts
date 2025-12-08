import { NextRequest, NextResponse } from "next/server"
import { getCommercetoolsApiRoot } from "@/lib/commercetools/client"

/**
 * Retrieve commercetools Order details
 * Used on the success page to display order confirmation
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get("order_id")

    if (!orderId) {
      return NextResponse.json({ error: "Missing order_id parameter" }, { status: 400 })
    }

    const apiRoot = getCommercetoolsApiRoot()

    // Retrieve the order from commercetools
    const response = await apiRoot
      .orders()
      .withId({ ID: orderId })
      .get()
      .execute()

    const order = response.body

    // Return order details
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
        lineItems: order.lineItems.map((item) => ({
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
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error retrieving order:", error)

    return NextResponse.json(
      { error: "Failed to retrieve order", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

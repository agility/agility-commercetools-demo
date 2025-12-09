import { getCommercetoolsApiRoot } from './client'
import type { Cart, CartDraft, LineItemDraft } from '@commercetools/platform-sdk'

/**
 * Create a new cart in commercetools
 */
export async function createCart(
  customerId?: string,
  customerEmail?: string,
  currency: string = 'USD',
  country?: string
): Promise<Cart> {
  const apiRoot = getCommercetoolsApiRoot()

  const cartDraft: CartDraft = {
    currency,
    country: country || 'US',
  }

  if (customerId) {
    cartDraft.customerId = customerId
  }

  if (customerEmail) {
    cartDraft.customerEmail = customerEmail
  }

  try {
    const response = await apiRoot
      .carts()
      .post({
        body: cartDraft,
      })
      .execute()

    return response.body
  } catch (error) {
    console.error('Error creating cart:', error)
    throw error
  }
}

/**
 * Get a cart by ID
 */
export async function getCart(cartId: string): Promise<Cart> {
  const apiRoot = getCommercetoolsApiRoot()

  try {
    const response = await apiRoot
      .carts()
      .withId({ ID: cartId })
      .get()
      .execute()

    return response.body
  } catch (error) {
    console.error('Error fetching cart:', error)
    throw error
  }
}

/**
 * Add line items to a cart
 */
export async function addLineItemsToCart(
  cartId: string,
  lineItems: Array<{
    productId: string
    variantId?: number
    sku?: string
    quantity: number
  }>,
  cartVersion: number
): Promise<Cart> {
  const apiRoot = getCommercetoolsApiRoot()

  const lineItemDrafts: LineItemDraft[] = lineItems.map((item) => {
    // commercetools requires either productId OR sku, not both
    // If SKU is provided, use only SKU (it uniquely identifies the variant)
    // Otherwise, use productId + variantId
    if (item.sku) {
      return {
        sku: item.sku,
        quantity: item.quantity,
      }
    } else {
      return {
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      }
    }
  })

  try {
    const response = await apiRoot
      .carts()
      .withId({ ID: cartId })
      .post({
        body: {
          version: cartVersion,
          actions: lineItemDrafts.map((draft) => ({
            action: 'addLineItem',
            ...draft,
          })),
        },
      })
      .execute()

    return response.body
  } catch (error) {
    console.error('Error adding line items to cart:', error)
    throw error
  }
}

/**
 * Update line item quantity in a cart
 */
export async function updateLineItemQuantity(
  cartId: string,
  lineItemId: string,
  quantity: number,
  cartVersion: number
): Promise<Cart> {
  const apiRoot = getCommercetoolsApiRoot()

  try {
    const response = await apiRoot
      .carts()
      .withId({ ID: cartId })
      .post({
        body: {
          version: cartVersion,
          actions: [
            {
              action: 'changeLineItemQuantity',
              lineItemId,
              quantity,
            },
          ],
        },
      })
      .execute()

    return response.body
  } catch (error) {
    console.error('Error updating line item quantity:', error)
    throw error
  }
}

/**
 * Remove line item from cart
 */
export async function removeLineItem(
  cartId: string,
  lineItemId: string,
  cartVersion: number
): Promise<Cart> {
  const apiRoot = getCommercetoolsApiRoot()

  try {
    const response = await apiRoot
      .carts()
      .withId({ ID: cartId })
      .post({
        body: {
          version: cartVersion,
          actions: [
            {
              action: 'removeLineItem',
              lineItemId,
            },
          ],
        },
      })
      .execute()

    return response.body
  } catch (error) {
    console.error('Error removing line item:', error)
    throw error
  }
}

/**
 * Set shipping address on a cart
 *
 * Best practice: Set shipping address early in checkout process to allow commercetools
 * to determine appropriate Shipping Methods and Tax Rates for the Cart's Line Items.
 *
 * Reference: https://docs.commercetools.com/foundry/best-practice-guides/standard-checkout-flow
 *
 * @param cartId - The cart ID
 * @param cartVersion - The current cart version (for optimistic locking)
 * @param address - Full address object or minimal address with country
 * @returns Updated cart with shipping address set
 */
export async function setShippingAddress(
  cartId: string,
  cartVersion: number,
  address: {
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
): Promise<Cart> {
  const apiRoot = getCommercetoolsApiRoot()

  try {
    const response = await apiRoot
      .carts()
      .withId({ ID: cartId })
      .post({
        body: {
          version: cartVersion,
          actions: [
            {
              action: 'setShippingAddress',
              address,
            },
          ],
        },
      })
      .execute()

    return response.body
  } catch (error) {
    console.error('Error setting shipping address:', error)
    throw error
  }
}

/**
 * Get available shipping methods for a cart
 * Requires shipping address to be set first
 */
export async function getShippingMethods(cartId: string): Promise<any[]> {
  const apiRoot = getCommercetoolsApiRoot()

  try {
    const cart = await getCart(cartId)

    // Query shipping methods that match the cart's shipping address
    const response = await apiRoot
      .shippingMethods()
      .matchingCart()
      .get({
        queryArgs: {
          cartId,
        },
      })
      .execute()

    return response.body.results
  } catch (error) {
    console.error('Error fetching shipping methods:', error)
    throw error
  }
}

/**
 * Set shipping method on a cart
 */
export async function setShippingMethod(
  cartId: string,
  cartVersion: number,
  shippingMethodId: string
): Promise<Cart> {
  const apiRoot = getCommercetoolsApiRoot()

  try {
    const response = await apiRoot
      .carts()
      .withId({ ID: cartId })
      .post({
        body: {
          version: cartVersion,
          actions: [
            {
              action: 'setShippingMethod',
              shippingMethod: {
                typeId: 'shipping-method',
                id: shippingMethodId,
              },
            },
          ],
        },
      })
      .execute()

    return response.body
  } catch (error) {
    console.error('Error setting shipping method:', error)
    throw error
  }
}

/**
 * Create an order from a cart
 * Optionally include payment information
 */
export async function createOrderFromCart(
  cartId: string,
  cartVersion: number,
  options?: {
    orderNumber?: string
    paymentId?: string // commercetools payment ID
  }
) {
  const apiRoot = getCommercetoolsApiRoot()

  const orderDraft: any = {
    id: cartId,
    version: cartVersion,
  }

  if (options?.orderNumber) {
    orderDraft.orderNumber = options.orderNumber
  }

  // Add payment if provided
  if (options?.paymentId) {
    orderDraft.paymentState = 'Paid'
    // Note: commercetools will automatically link payment if payment transactions are set up correctly
  }

  try {
    const response = await apiRoot
      .orders()
      .post({
        body: orderDraft,
      })
      .execute()

    return response.body
  } catch (error) {
    console.error('Error creating order from cart:', error)
    throw error
  }
}


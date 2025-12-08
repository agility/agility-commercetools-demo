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

  const lineItemDrafts: LineItemDraft[] = lineItems.map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    sku: item.sku,
    quantity: item.quantity,
  }))

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
 * Create an order from a cart
 */
export async function createOrderFromCart(
  cartId: string,
  cartVersion: number,
  orderNumber?: string
) {
  const apiRoot = getCommercetoolsApiRoot()

  try {
    const response = await apiRoot
      .orders()
      .post({
        body: {
          id: cartId,
          version: cartVersion,
          orderNumber,
        },
      })
      .execute()

    return response.body
  } catch (error) {
    console.error('Error creating order from cart:', error)
    throw error
  }
}


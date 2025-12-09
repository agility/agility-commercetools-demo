import { getCommercetoolsApiRoot } from './client'
import type { Payment, PaymentDraft, PaymentMethodInfo, Transaction, TransactionDraft } from '@commercetools/platform-sdk'

/**
 * Create a payment transaction in commercetools
 * This should be called after successful payment processing (e.g., Stripe payment)
 */
export async function createPayment(
  amountCentAmount: number,
  currencyCode: string,
  paymentMethod: 'Stripe' | 'Credit Card' | 'PayPal' | string = 'Stripe',
  paymentInterface?: string, // e.g., 'stripe' for Stripe integration
  externalId?: string, // External payment ID (e.g., Stripe payment intent ID)
  customerId?: string
): Promise<Payment> {
  const apiRoot = getCommercetoolsApiRoot()

  const paymentDraft: PaymentDraft = {
    amountPlanned: {
      centAmount: amountCentAmount,
      currencyCode,
    },
    paymentMethodInfo: {
      method: paymentMethod,
      paymentInterface,
    } as PaymentMethodInfo,
    ...(customerId && {
      customer: {
        typeId: 'customer' as const,
        id: customerId,
      },
    }),
    ...(externalId && { interfaceId: externalId }),
  }

  try {
    const response = await apiRoot
      .payments()
      .post({
        body: paymentDraft,
      })
      .execute()

    return response.body
  } catch (error) {
    console.error('Error creating payment:', error)
    throw error
  }
}

/**
 * Add a transaction to an existing payment
 * Use this to update payment status (e.g., after webhook confirmation)
 */
export async function addTransactionToPayment(
  paymentId: string,
  paymentVersion: number,
  transaction: {
    type: 'Authorization' | 'Charge' | 'Refund' | 'CancelAuthorization'
    amount: number
    currency: string
    state: 'Initial' | 'Pending' | 'Success' | 'Failure'
    interactionId?: string // External transaction ID (e.g., Stripe charge ID)
  }
): Promise<Payment> {
  const apiRoot = getCommercetoolsApiRoot()

  const transactionDraft: TransactionDraft = {
    type: transaction.type,
    amount: {
      centAmount: transaction.amount,
      currencyCode: transaction.currency,
    },
    state: transaction.state,
    ...(transaction.interactionId && { interactionId: transaction.interactionId }),
  }

  try {
    const response = await apiRoot
      .payments()
      .withId({ ID: paymentId })
      .post({
        body: {
          version: paymentVersion,
          actions: [
            {
              action: 'addTransaction',
              transaction: transactionDraft,
            },
          ],
        },
      })
      .execute()

    return response.body
  } catch (error) {
    console.error('Error adding transaction to payment:', error)
    throw error
  }
}

/**
 * Update payment transaction state
 * Use this to mark a transaction as successful or failed
 */
export async function changeTransactionState(
  paymentId: string,
  paymentVersion: number,
  transactionId: string,
  newState: 'Pending' | 'Success' | 'Failure'
): Promise<Payment> {
  const apiRoot = getCommercetoolsApiRoot()

  try {
    const response = await apiRoot
      .payments()
      .withId({ ID: paymentId })
      .post({
        body: {
          version: paymentVersion,
          actions: [
            {
              action: 'changeTransactionState',
              transactionId,
              state: newState,
            },
          ],
        },
      })
      .execute()

    return response.body
  } catch (error) {
    console.error('Error changing transaction state:', error)
    throw error
  }
}

/**
 * Get a payment by ID
 */
export async function getPayment(paymentId: string): Promise<Payment> {
  const apiRoot = getCommercetoolsApiRoot()

  try {
    const response = await apiRoot
      .payments()
      .withId({ ID: paymentId })
      .get()
      .execute()

    return response.body
  } catch (error) {
    console.error('Error fetching payment:', error)
    throw error
  }
}

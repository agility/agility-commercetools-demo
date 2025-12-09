import { getCommercetoolsApiRoot } from './client'
import type { Customer, CustomerDraft, CustomerSignInResult } from '@commercetools/platform-sdk'

/**
 * Create a new customer in commercetools
 */
export async function createCustomer(
  email: string,
  firstName?: string,
  lastName?: string,
  password?: string
): Promise<Customer> {
  const apiRoot = getCommercetoolsApiRoot()

  const customerDraft: CustomerDraft = {
    email,
    firstName,
    lastName,
  }

  // If password is provided, include it (for password-based auth)
  // Otherwise, customer can use passwordless auth (magic links, etc.)
  if (password) {
    customerDraft.password = password
  }

  try {
    const response = await apiRoot
      .customers()
      .post({
        body: customerDraft,
      })
      .execute()

    return response.body.customer
  } catch (error: any) {
    // Handle duplicate email error
    if (error?.code === 'DuplicateField') {
      throw new Error('A customer with this email already exists')
    }
    console.error('Error creating customer:', error)
    throw error
  }
}

/**
 * Find a customer by email
 */
export async function findCustomerByEmail(email: string): Promise<Customer | null> {
  const apiRoot = getCommercetoolsApiRoot()

  try {
    const response = await apiRoot
      .customers()
      .get({
        queryArgs: {
          where: `email="${email}"`,
          limit: 1,
        },
      })
      .execute()

    if (response.body.results.length === 0) {
      return null
    }

    return response.body.results[0]
  } catch (error) {
    console.error('Error finding customer by email:', error)
    throw error
  }
}

/**
 * Get a customer by ID
 */
export async function getCustomer(customerId: string): Promise<Customer> {
  const apiRoot = getCommercetoolsApiRoot()

  try {
    const response = await apiRoot
      .customers()
      .withId({ ID: customerId })
      .get()
      .execute()

    return response.body
  } catch (error) {
    console.error('Error fetching customer:', error)
    throw error
  }
}

/**
 * Create or get customer by email
 * Useful for guest checkout where we want to associate orders with customers
 */
export async function createOrGetCustomer(
  email: string,
  firstName?: string,
  lastName?: string
): Promise<Customer> {
  // First, try to find existing customer
  const existingCustomer = await findCustomerByEmail(email)

  if (existingCustomer) {
    return existingCustomer
  }

  // If not found, create a new customer
  return createCustomer(email, firstName, lastName)
}

/**
 * Format a price in cents to a currency string
 * @param cents - Price in cents (e.g., 1999 for $19.99)
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted price string (e.g., '$19.99')
 */
export function formatPrice(cents: number, currency: string = "USD"): string {
  const dollars = cents / 100

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(dollars)
}

/**
 * Convert dollars to cents
 * @param dollars - Price in dollars (e.g., 19.99)
 * @returns Price in cents (e.g., 1999)
 */
export function convertDollarsToCents(dollars: number): number {
  return Math.round(dollars * 100)
}

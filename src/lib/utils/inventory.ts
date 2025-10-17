const LOW_STOCK_THRESHOLD = 5

/**
 * Get the low stock threshold
 * @returns The low stock threshold number
 */
export function getLowStockThreshold(): number {
  return LOW_STOCK_THRESHOLD
}

/**
 * Check if a product variant is in stock
 * @param stockQuantity - The current stock quantity
 * @returns True if the item is in stock (quantity > 0)
 */
export function isInStock(stockQuantity: number): boolean {
  return stockQuantity > 0
}

/**
 * Get a stock status message for display
 * @param stockQuantity - The current stock quantity
 * @returns A human-readable stock message
 */
export function getStockMessage(stockQuantity: number): string {
  if (stockQuantity <= 0) {
    return "Out of stock"
  }

  if (stockQuantity <= LOW_STOCK_THRESHOLD) {
    return `Only ${stockQuantity} left in stock`
  }

  return "In stock"
}

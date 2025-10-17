import type { IProduct } from "./IProduct"
import type { IVariant } from "./IVariant"

export interface ICartItem {
  productId: number
  variantSKU: string
  product: IProduct
  variant: IVariant
  quantity: number
}

export interface ICart {
  items: ICartItem[]
  total: number
  itemCount: number
}

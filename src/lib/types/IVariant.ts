import type { ImageField, ContentItem } from "@agility/nextjs"
import type { IMeasurements } from "./IMeasurements"
import type { ISize } from "./ISize"

export interface IVariant {
  variantName?: string // Used in ProductDetails
  details?: string // Alternative naming
  variantSKU?: string
  color?: string
  colorName?: string // Used in ProductDetails
  colorHEX: string
  size: ContentItem<ISize>  // Support both expanded and reference
  price: number
  variantImage?: ImageField
  image?: ImageField // Used in ProductDetails
  stockQuantity: number
  measurements?: IMeasurements
}

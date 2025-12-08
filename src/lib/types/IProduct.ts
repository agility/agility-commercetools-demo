import type { ImageField, ContentItem } from "@agility/nextjs"
import type { ICategory } from "./ICategory"
import type { IVariant } from "./IVariant"

export interface IProduct {
  title: string
  sku: string
  slug: string
  description: string
  category?: ContentItem<ICategory> | null
  categoryID?: string
  basePrice: string // CMS returns as string
  featuredImage?: ImageField
  variants?: {
    referencename: string
    fulllist: boolean
  } | IVariant[] // commercetools products have variants as array
  commercetoolsId?: string // commercetools product ID
}

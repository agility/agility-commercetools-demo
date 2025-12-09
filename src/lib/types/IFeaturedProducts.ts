import type { ImageField, URLField } from "@agility/nextjs"

export interface IFeaturedProducts {
  heading: string
  subheading?: string
  ctaText: string
  ctaLink: URLField
  product1?: string // Product slug or ID
  product2?: string // Product slug or ID
  product3?: string // Product slug or ID
  backgroundImage?: ImageField
}

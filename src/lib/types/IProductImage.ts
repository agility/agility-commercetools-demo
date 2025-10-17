import type { ImageField } from "@agility/nextjs"

export interface IProductImage {
	image: ImageField
	altText: string
	sortOrder: number
}

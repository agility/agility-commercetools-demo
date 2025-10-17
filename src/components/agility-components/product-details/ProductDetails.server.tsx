import { getContentItem } from '@/lib/cms/getContentItem'
import { getContentList } from '@/lib/cms/getContentList'
import type { ContentItem, UnloadedModuleProps } from '@agility/nextjs'
import { ProductDetailsClient } from './ProductDetailsClient'
import type { IProductDetails } from '@/lib/types/IProductDetails'
import type { IProduct } from '@/lib/types/IProduct'
import type { IVariant } from '@/lib/types/IVariant'
import type { ISize } from '@/lib/types/ISize'
import type { IProductImage } from '@/lib/types/IProductImage'

interface IRelatedProduct {
	title: string
	price: number
	featuredImage: { url: string; label?: string }
	slug: string
}

// Server component wrapper
export const ProductDetails = async ({ module, languageCode }: UnloadedModuleProps) => {
	// Get ProductDetails configuration
	const {
		fields: config,
		contentID
	} = await getContentItem<IProductDetails>({
		contentID: module.contentid,
		languageCode,
	})

	// In a real implementation, you would get the product slug from URL params
	// For now, we'll use a placeholder approach
	// You would typically do: const { slug } = await params or similar
	const productSlug = 'sample-product' // This should come from URL params

	// Fetch the product - in real implementation, filter by slug
	const productsResponse = await getContentList<IProduct>({
		referenceName: 'products',
		languageCode,
		take: 1,
	})

	if (!productsResponse.items.length) {
		return (
			<div className="mx-auto max-w-7xl px-4 py-12 text-center" data-agility-component={contentID}>
				<p className="text-gray-600 dark:text-gray-400">Product not found</p>
			</div>
		)
	}

	const product = productsResponse.items[0] as ContentItem<IProduct>

	// Fetch product variants
	let variantsResponse = { items: [] as ContentItem<IVariant>[] }
	if (product.fields.variants?.referencename) {
		variantsResponse = await getContentList<IVariant>({
			referenceName: product.fields.variants.referencename,
			languageCode,
			take: 50,
		})
	}

	// Fetch all unique sizes referenced by variants
	const sizeIds = [...new Set(variantsResponse.items.map(v => {
		const size = v.fields.size as { contentid: number } | ContentItem<ISize>
		return 'contentid' in size ? size.contentid : size.contentID
	}))]
	const sizesMap = new Map<number, ContentItem<ISize>>()

	// In a real implementation, you'd fetch sizes in a single call
	// For now, we'll create a placeholder map
	// You would typically fetch from a sizes list and match by contentid

	// Fetch product images if available
	let productImages: ContentItem<IProductImage>[] = []
	// Note: The product.fields.images structure is not defined in IProduct yet
	// You may need to add it to the IProduct interface

	// Fetch related products from same category if enabled
	let relatedProducts: ContentItem<IRelatedProduct>[] = []
	if (config.showRelatedProducts && product.fields.category) {
		// In a real implementation, you'd query products by category
		// For now, we'll leave it empty
	}

	return (
		<ProductDetailsClient
			config={config}
			product={product}
			variants={variantsResponse.items}
			sizes={sizesMap}
			productImages={productImages}
			relatedProducts={relatedProducts}
			contentID={contentID.toString()}
		/>
	)
}

export default ProductDetails

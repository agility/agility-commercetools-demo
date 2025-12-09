import { getContentItem } from '@/lib/cms/getContentItem'
import type { UnloadedModuleProps, ContentItem, ImageField } from '@agility/nextjs'
import { ProductDetailsClient } from './ProductDetailsClient'
import type { IProductDetails } from '@/lib/types/IProductDetails'
import type { IProduct } from '@/lib/types/IProduct'
import type { IVariant } from '@/lib/types/IVariant'
import { fetchCommercetoolsProducts } from '@/lib/commercetools/products'

interface IRelatedProduct {
	title: string
	basePrice: string
	featuredImage?: ImageField
	slug: string
}

// Server component wrapper
export const ProductDetails = async ({ module, languageCode, globalData }: UnloadedModuleProps) => {
	// Get ProductDetails configuration
	const {
		fields: config,
		contentID
	} = await getContentItem<IProductDetails>({
		contentID: module.contentid,
		languageCode,
	})

	// Get product from globalData (set by middleware/getAgilityPage)
	const product = globalData?.product as (IProduct & { commercetoolsId?: string }) | undefined

	if (!product) {
		return (
			<div className="mx-auto max-w-7xl px-4 py-12 text-center" data-agility-component={contentID}>
				<p className="text-gray-600 dark:text-gray-400">Product not found</p>
			</div>
		)
	}

	// Transform commercetools product to ContentItem<IProduct> format for ProductDetailsClient
	const productContentItem: ContentItem<IProduct> = {
		contentID: parseInt(product.commercetoolsId || '0') || 1000,
		fields: {
			...product,
			commercetoolsId: product.commercetoolsId,
		} as IProduct & { commercetoolsId?: string },
		properties: {
			definitionName: 'Product',
			referenceName: product.slug,
			state: 2, // Published
			versionID: 1,
			modified: new Date(),
			itemOrder: 0,
		},
	}

	// Transform variants from commercetools format
	const variantContentItems: ContentItem<IVariant>[] = Array.isArray(product.variants)
		? product.variants.map((variant, index) => ({
			contentID: index + 2000,
			fields: variant,
			properties: {
				definitionName: 'Variant',
				referenceName: variant.variantSKU || `variant-${index}`,
				state: 2, // Published
				versionID: 1,
				modified: new Date(),
				itemOrder: index,
			},
		}))
		: []

	// Fetch related products if enabled
	let relatedProducts: ContentItem<IRelatedProduct>[] = []
	if (config.showRelatedProducts === "true") {
		try {
			const localeCode = languageCode.split('-')[0] || 'en'
			const relatedResponse = await fetchCommercetoolsProducts({
				limit: 4,
				locale: localeCode,
			})
			relatedProducts = relatedResponse.results
				.filter(p => p.commercetoolsId !== product.commercetoolsId)
				.slice(0, 3)
				.map((p, index) => ({
					contentID: index + 3000,
					fields: {
						title: p.title,
						basePrice: p.basePrice,
						featuredImage: p.featuredImage ? {
							url: p.featuredImage.url,
							label: p.featuredImage.label,
							width: p.featuredImage.width,
							height: p.featuredImage.height,
							target: '_self',
							filesize: 0,
						} as ImageField : undefined,
						slug: p.slug,
					},
					properties: {
						definitionName: 'Product',
						referenceName: p.slug,
						state: 2, // Published
						versionID: 1,
						modified: new Date(),
						itemOrder: index,
					},
				}))
		} catch (error) {
			console.error('Error fetching related products:', error)
		}
	}

	return (
		<ProductDetailsClient
			config={config}
			product={productContentItem}
			variants={variantContentItems}
			sizes={new Map()} // Sizes come from variant attributes in commercetools
			productImages={[]} // Product images come from featuredImage and variant images
			relatedProducts={relatedProducts}
			contentID={contentID.toString()}
		/>
	)
}

export default ProductDetails

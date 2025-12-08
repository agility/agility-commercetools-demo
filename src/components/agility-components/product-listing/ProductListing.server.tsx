import { getContentItem } from "@/lib/cms/getContentItem"
import type { UnloadedModuleProps } from "@agility/nextjs"
import { ProductListingClient } from "./ProductListing.client"
import type { IProductListing } from "@/lib/types/IProductListing"
import type { IProduct } from "@/lib/types/IProduct"
import { fetchCommercetoolsProducts } from "@/lib/commercetools/products"

export const ProductListing = async ({ module, languageCode }: UnloadedModuleProps) => {
	const {
		fields: {
			heading,
			description,
			displayStyle,
			itemsPerRow,
			showFilters,
			showSortOptions,
			ctaLabel
		},
		contentID
	} = await getContentItem<IProductListing>({
		contentID: module.contentid,
		languageCode
	})

	// Fetch products from commercetools
	const locale = languageCode.split('-')[0] || 'en'
	let products: (IProduct & { commercetoolsId?: string })[] = []

	try {
		const productsResponse = await fetchCommercetoolsProducts({
			limit: 100,
			locale,
		})

		products = productsResponse.results
	} catch (error) {
		console.error('Error fetching products from commercetools:', error)
		// Fallback to empty list on error
	}

	return (
		<ProductListingClient
			heading={heading}
			description={description}
			displayStyle={displayStyle}
			itemsPerRow={itemsPerRow}
			showFilters={showFilters === "true"}
			showSortOptions={showSortOptions === "true"}
			ctaLabel={ctaLabel}
			products={products}
			contentID={contentID}
			languageCode={languageCode}
		/>
	)
}

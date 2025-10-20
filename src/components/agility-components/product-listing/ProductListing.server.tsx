import { getContentItem } from "@/lib/cms/getContentItem"
import { getContentList } from "@/lib/cms/getContentList"
import type { UnloadedModuleProps } from "@agility/nextjs"
import { ProductListingClient } from "./ProductListing.client"
import type { IProductListing } from "@/lib/types/IProductListing"
import type { IProduct } from "@/lib/types/IProduct"

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

	// Fetch products from Agility CMS
	const productsList = await getContentList<IProduct>({
		referenceName: "products",
		languageCode,
		take: 100 // Adjust as needed
	})

	return (
		<ProductListingClient
			heading={heading}
			description={description}
			displayStyle={displayStyle}
			itemsPerRow={itemsPerRow}
			showFilters={showFilters === "true"}
			showSortOptions={showSortOptions === "true"}
			ctaLabel={ctaLabel}
			products={productsList.items}
			contentID={contentID}
			languageCode={languageCode}
		/>
	)
}

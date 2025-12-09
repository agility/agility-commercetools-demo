import { getContentItem } from "@/lib/cms/getContentItem"
import type { UnloadedModuleProps } from "@agility/nextjs"
import { ProductListingClient } from "./ProductListing.client"
import { Pagination } from "./Pagination"
import { Container } from "@/components/container"
import type { IProductListing } from "@/lib/types/IProductListing"
import type { IProduct } from "@/lib/types/IProduct"
import { fetchCommercetoolsProducts } from "@/lib/commercetools/products"

const PRODUCTS_PER_PAGE = 20

export const ProductListing = async ({ module, languageCode, globalData }: UnloadedModuleProps) => {
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

	// Get URL params from globalData (set by getAgilityPage)
	//
	// IMPORTANT: Search params flow through the system like this:
	// 1. Middleware encodes query params into the path: /products?page=2 -> /products/~~~page=2~~~
	//    This preserves static routing benefits in Next.js App Router
	// 2. getAgilityPage.ts decodes them from the slug and sets globalData.searchParams
	// 3. Components access them via globalData.searchParams
	//
	// See: src/middleware.ts (lines 123-138) and src/lib/cms/getAgilityPage.ts (lines 31-49)
	const searchParams = globalData?.searchParams || {}
	const pageParam = searchParams.page
	const categoryParam = searchParams.category
	const sortParam = searchParams.sort

	// Parse URL params
	const page = typeof pageParam === 'string' ? parseInt(pageParam, 10) : 1
	const category = typeof categoryParam === 'string' ? categoryParam : 'all'
	const sort = typeof sortParam === 'string' ? sortParam : 'default'

	// Calculate offset based on page (like post listing)
	const offset = (page - 1) * PRODUCTS_PER_PAGE

	// Fetch products for the current page only
	const locale = languageCode.split('-')[0] || 'en'
	let products: (IProduct & { commercetoolsId?: string })[] = []
	let totalCount = 0

	try {
		// Build where clause for commercetools
		const where: string[] = []
		if (category && category !== 'all') {
			where.push(`categories(id="${category}")`)
		}

		// Build sort clause for commercetools
		let sortClause: string[] = []
		switch (sort) {
			case 'price-low':
				sortClause = ['price asc']
				break
			case 'price-high':
				sortClause = ['price desc']
				break
			case 'name-az':
				sortClause = ['name.en asc']
				break
			case 'name-za':
				sortClause = ['name.en desc']
				break
			case 'newest':
				sortClause = ['createdAt desc']
				break
			default:
				// Default sort
				break
		}

		// Fetch only the products for the current page
		const productsResponse = await fetchCommercetoolsProducts({
			limit: PRODUCTS_PER_PAGE,
			offset: offset,
			where: where.length > 0 ? where : undefined,
			sort: sortClause.length > 0 ? sortClause : undefined,
			locale,
		})

		products = productsResponse.results
		totalCount = productsResponse.total || 0
	} catch (error) {
		console.error('Error fetching products from commercetools:', error)
		// Fallback to empty list on error
	}

	return (
		<>
			<ProductListingClient
				heading={heading}
				description={description}
				displayStyle={displayStyle}
				itemsPerRow={itemsPerRow}
				showFilters={showFilters === "true"}
				showSortOptions={showSortOptions === "true"}
				ctaLabel={ctaLabel}
				products={products}
				totalCount={totalCount}
				page={page}
				category={category}
				sort={sort}
				contentID={contentID}
				languageCode={languageCode}
			/>
			<Container>
				<Pagination
					page={page}
					category={category !== 'all' ? category : undefined}
					sort={sort !== 'default' ? sort : undefined}
					totalProducts={totalCount}
					productsPerPage={PRODUCTS_PER_PAGE}
					languageCode={languageCode}
				/>
			</Container>
		</>
	)
}

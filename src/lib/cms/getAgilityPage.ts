import "server-only";
import { getAgilityPageProps } from "@agility/nextjs/node";
import { getAgilityContext } from "./getAgilityContext";
import { fetchCommercetoolsProductBySlug } from "@/lib/commercetools/products";

export interface PageProps {
	params: Promise<{ slug: string[], locale: string }>
	searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}


/**
 * Get a page with caching information added.
 * @param param0
 * @returns
 */
export const getAgilityPage = async ({ params }: PageProps) => {

	const awaitedParams = await params
	const { isPreview: preview, locale } = await getAgilityContext(awaitedParams.locale)


	if (!awaitedParams.slug) awaitedParams.slug = [""]

	// Check if this is a product route: /products/[slug]
	// Pattern: slug array could be ["products", "some-product-slug"] or ["en-us", "products", "some-product-slug"]
	// depending on whether locale is in the path
	let productSlug: string | null = null
	const slugArray = awaitedParams.slug

	// Find the "products" index in the slug array
	const productsIndex = slugArray.findIndex(s => s === "products")

	if (productsIndex >= 0 && productsIndex < slugArray.length - 1) {
		const slugValue = slugArray[productsIndex + 1]

		// Only process if it's not already "product-details"
		if (slugValue !== "product-details" && slugValue !== "") {
			productSlug = slugValue
			// Rewrite slug to product-details so it routes to the correct Agility page
			// Preserve any locale prefix if present
			if (productsIndex === 0) {
				// No locale prefix: ["products", "slug"] -> ["products", "product-details"]
				awaitedParams.slug = ["products", "product-details"]
			} else {
				// Has locale prefix: ["en-us", "products", "slug"] -> ["en-us", "products", "product-details"]
				awaitedParams.slug = [
					...slugArray.slice(0, productsIndex),
					"products",
					"product-details"
				]
			}
		}
	}

	//check the last element of the slug to see if it has search params encoded (from middleware)
	let lastSlug = awaitedParams.slug[awaitedParams.slug.length - 1]
	let searchParams: { [key: string]: string } = {}
	if (lastSlug && lastSlug.startsWith("~~~") && lastSlug.endsWith("~~~")) {
		//we have search params encoded here
		lastSlug = lastSlug.replace(/~~~+/g, "")
		const decoded = decodeURIComponent(lastSlug)
		const parts = decoded.split("&").map(part => part.trim())

		parts.forEach(part => {
			const kvp = part.split("=")
			if (kvp.length === 2) {
				searchParams[kvp[0]] = kvp[1]
			}
		})

		awaitedParams.slug = awaitedParams.slug.slice(0, awaitedParams.slug.length - 1)
		if (awaitedParams.slug.length === 0) awaitedParams.slug = [""]
	}

	//get the page
	const page = await getAgilityPageProps({
		params: awaitedParams, preview, locale, apiOptions: {
			contentLinkDepth: 0
		}
	})

	page.globalData = page.globalData || {};
	page.globalData["searchParams"] = searchParams;

	// If we detected a product slug, fetch the product from commercetools
	if (productSlug) {
		try {
			const localeCode = locale.split('-')[0] || 'en'
			const product = await fetchCommercetoolsProductBySlug(productSlug, { locale: localeCode })

			if (product) {
				// Add product to globalData
				page.globalData["product"] = product
			} else {
				console.warn(`[Product Route] Product not found in commercetools with slug: "${productSlug}" and locale: "${localeCode}"`)
			}
		} catch (error) {
			console.error(`[Product Route] Error fetching product ${productSlug} from commercetools:`, error)
		}
	}

	// Debug: Log if we rewrote to product-details but page doesn't exist
	if (productSlug && !page.page) {
		console.error(`[Product Route] Page not found after rewrite. Original slug: ${slugArray.join('/')}, Rewritten to: ${awaitedParams.slug.join('/')}, Locale: ${locale}`)
		console.error(`[Product Route] Make sure a page exists in Agility CMS at /products/product-details for locale ${locale}`)
	}

	return page

}


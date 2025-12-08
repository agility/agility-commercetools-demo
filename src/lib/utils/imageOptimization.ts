import type { ImageField } from "@agility/nextjs"

/**
 * Image display contexts with their optimal dimensions
 */
export type ImageDisplayContext =
	| 'thumbnail'      // Small thumbnails (96x96)
	| 'card'           // Product cards in listings (400x400)
	| 'featured-card'  // Featured product cards (600x750)
	| 'detail-main'    // Main product detail image (800x800)
	| 'detail-thumb'   // Product detail thumbnails (200x200)
	| 'cart'           // Cart line items (96x96)
	| 'post-overlay'   // Product image overlay on posts (200-400)
	| 'post-card'      // Post listing cards (400-1200)

/**
 * Get optimized image dimensions for a display context
 */
export function getImageDimensions(context: ImageDisplayContext): {
	width: number
	height: number
	fallbackWidth: number
} {
	switch (context) {
		case 'thumbnail':
			return { width: 96, height: 96, fallbackWidth: 96 }
		case 'card':
			return { width: 400, height: 400, fallbackWidth: 400 }
		case 'featured-card':
			return { width: 600, height: 750, fallbackWidth: 600 }
		case 'detail-main':
			return { width: 800, height: 800, fallbackWidth: 800 }
		case 'detail-thumb':
			return { width: 200, height: 200, fallbackWidth: 200 }
		case 'cart':
			return { width: 96, height: 96, fallbackWidth: 96 }
		case 'post-overlay':
			return { width: 400, height: 400, fallbackWidth: 400 }
		case 'post-card':
			return { width: 400, height: 300, fallbackWidth: 400 }
		default:
			return { width: 400, height: 400, fallbackWidth: 400 }
	}
}

/**
 * Get responsive image sources for a display context
 */
export function getResponsiveSources(context: ImageDisplayContext): Array<{
	media: string
	width: number
}> {
	switch (context) {
		case 'card':
			return [
				{ media: "(max-width: 639px)", width: 400 },
				{ media: "(max-width: 1023px)", width: 600 },
				{ width: 800 },
			]
		case 'featured-card':
			return [
				{ media: "(max-width: 639px)", width: 400 },
				{ width: 600 },
			]
		case 'detail-main':
			return [
				{ media: "(max-width: 639px)", width: 600 },
				{ media: "(max-width: 1023px)", width: 800 },
				{ width: 1200 },
			]
		case 'post-card':
			return [
				{ media: "(max-width: 639px)", width: 640 },
				{ media: "(max-width: 767px)", width: 800 },
				{ media: "(max-width: 1023px)", width: 1200 },
			]
		case 'post-overlay':
			return [
				{ media: "(max-width: 639px)", width: 200 },
				{ width: 400 },
			]
		default:
			return []
	}
}

/**
 * Optimize a commercetools image URL
 * Note: commercetools CDN doesn't support URL-based transformations,
 * but we can ensure proper dimensions are used for Next.js Image optimization
 */
export function optimizeCommercetoolsImageUrl(
	image: ImageField | undefined,
	context: ImageDisplayContext
): ImageField | undefined {
	if (!image?.url) return undefined

	const dimensions = getImageDimensions(context)

	// Return optimized image with proper dimensions
	// The actual optimization happens at the component level (Next.js Image or AgilityPic)
	return {
		...image,
		width: image.width || dimensions.width,
		height: image.height || dimensions.height,
	}
}

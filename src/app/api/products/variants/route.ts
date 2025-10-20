import { NextRequest, NextResponse } from 'next/server'
import { getContentList } from '@/lib/cms/getContentList'
import type { ContentItem } from '@agility/nextjs'
import type { IVariant } from '@/lib/types/IVariant'

/**
 * GET /api/products/variants
 * Fetch the default (first) variant for a product
 *
 * Query Parameters:
 * - referenceName: The reference name for the variants list (required)
 * - languageCode: Content language (default: en-us)
 */
export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams
		const referenceName = searchParams.get('referenceName')
		const languageCode = searchParams.get('languageCode') || 'en-us'

		if (!referenceName) {
			return NextResponse.json(
				{
					success: false,
					error: 'referenceName is required',
				},
				{ status: 400 }
			)
		}

		// Fetch variants from Agility CMS
		const variantsResponse = await getContentList<IVariant>({
			referenceName,
			languageCode,
			take: 1, // Only get the first variant
		})

		const variant = variantsResponse.items[0]

		if (!variant) {
			return NextResponse.json(
				{
					success: false,
					error: 'No variants found',
				},
				{ status: 404 }
			)
		}

		// Format the variant data
		const formattedVariant = {
			variantSKU: variant.fields.variantSKU,
			color: variant.fields.color || variant.fields.colorName,
			colorName: variant.fields.colorName || variant.fields.color,
			colorHEX: variant.fields.colorHEX,
			price: variant.fields.price,
			stockQuantity: variant.fields.stockQuantity,
			size: variant.fields.size,
			variantImage: variant.fields.variantImage || variant.fields.image,
		}

		return NextResponse.json(
			{
				success: true,
				variant: formattedVariant,
			},
			{
				status: 200,
				headers: {
					'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
				},
			}
		)

	} catch (error) {
		console.error('Error fetching variant:', error)
		return NextResponse.json(
			{
				success: false,
				error: 'Failed to fetch variant',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		)
	}
}

// Handle unsupported HTTP methods
export async function POST() {
	return NextResponse.json(
		{ error: 'Method not allowed' },
		{ status: 405 }
	)
}

import { NextRequest, NextResponse } from 'next/server'
import { fetchCommercetoolsProductBySlug } from '@/lib/commercetools/products'
import type { IProduct } from '@/lib/types/IProduct'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const searchParams = request.nextUrl.searchParams
    const languageCode = searchParams.get('languageCode') || 'en-us'

    // Map language code to commercetools locale
    const locale = languageCode.split('-')[0] || 'en'

    // Fetch product from commercetools by slug
    const product = await fetchCommercetoolsProductBySlug(slug, { locale })

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
        },
        { status: 404 }
      )
    }

    // Format response data to match existing API structure
    const formattedProduct = {
      id: product.sku || product.slug,
      title: product.title,
      sku: product.sku,
      slug: product.slug,
      description: product.description,
      basePrice: product.basePrice,
      category: null, // Category handling may need adjustment based on commercetools setup
      featuredImage: product.featuredImage
        ? {
            url: product.featuredImage.url,
            label: product.featuredImage.label,
            width: product.featuredImage.width,
            height: product.featuredImage.height,
          }
        : null,
      variants: product.variants || [],
    }

    return NextResponse.json(
      {
        success: true,
        product: formattedProduct,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    )

  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch product',
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

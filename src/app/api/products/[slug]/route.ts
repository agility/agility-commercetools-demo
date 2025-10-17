import { NextRequest, NextResponse } from 'next/server'
import { getContentList } from '@/lib/cms/getContentList'
import type { IProduct } from '@/lib/types/IProduct'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const searchParams = request.nextUrl.searchParams
    const languageCode = searchParams.get('languageCode') || 'en-us'
    const referenceName = searchParams.get('referenceName') || 'products'

    // Fetch all products from Agility CMS
    const productsResponse = await getContentList<IProduct>({
      referenceName,
      languageCode,
      take: 100,
    })

    // Find the product with matching slug
    const product = productsResponse.items.find(
      (p) => p.fields.slug === slug
    )

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
        },
        { status: 404 }
      )
    }

    // Format response data
    const formattedProduct = {
      id: product.contentID,
      title: product.fields.title,
      sku: product.fields.sku,
      slug: product.fields.slug,
      description: product.fields.description,
      basePrice: product.fields.basePrice,
      category: product.fields.category?.fields?.title || null,
      featuredImage: product.fields.featuredImage
        ? {
            url: product.fields.featuredImage.url,
            label: product.fields.featuredImage.label,
            width: product.fields.featuredImage.width,
            height: product.fields.featuredImage.height,
          }
        : null,
      variants: product.fields.variants || [],
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

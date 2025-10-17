import { NextRequest, NextResponse } from 'next/server'
import { getContentList } from '@/lib/cms/getContentList'
import type { IProduct } from '@/lib/types/IProduct'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const sort = searchParams.get('sort') || 'default'
    const limit = parseInt(searchParams.get('limit') || '100', 10)
    const languageCode = searchParams.get('languageCode') || 'en-us'
    const referenceName = searchParams.get('referenceName') || 'products'

    // Fetch products from Agility CMS
    const productsResponse = await getContentList<IProduct>({
      referenceName,
      languageCode,
      take: limit,
    })

    let products = productsResponse.items

    // Filter by category if specified
    if (category && category !== 'all') {
      products = products.filter((product) => {
        const productCategory = product.fields.category?.fields?.title
        return productCategory === category
      })
    }

    // Sort products based on sort parameter
    switch (sort) {
      case 'price-low':
        products.sort((a, b) => a.fields.basePrice - b.fields.basePrice)
        break
      case 'price-high':
        products.sort((a, b) => b.fields.basePrice - a.fields.basePrice)
        break
      case 'name-az':
        products.sort((a, b) => a.fields.title.localeCompare(b.fields.title))
        break
      case 'name-za':
        products.sort((a, b) => b.fields.title.localeCompare(a.fields.title))
        break
      case 'newest':
        // Sort by contentID descending (newer items typically have higher IDs)
        products.sort((a, b) => b.contentID - a.contentID)
        break
      default:
        // Keep original order from CMS
        break
    }

    // Format response data
    const formattedProducts = products.map((product) => ({
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
    }))

    return NextResponse.json(
      {
        success: true,
        total: formattedProducts.length,
        totalCount: productsResponse.totalCount,
        products: formattedProducts,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    )

  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products',
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

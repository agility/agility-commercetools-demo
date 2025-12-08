import { NextRequest, NextResponse } from 'next/server'
import { fetchCommercetoolsProducts } from '@/lib/commercetools/products'
import type { IProduct } from '@/lib/types/IProduct'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const sort = searchParams.get('sort') || 'default'
    const limit = parseInt(searchParams.get('limit') || '100', 10)
    const languageCode = searchParams.get('languageCode') || 'en-us'
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Map language code to commercetools locale
    const locale = languageCode.split('-')[0] || 'en'

    // Build where clause for commercetools
    const where: string[] = []
    if (category && category !== 'all') {
      // Assuming categories are stored as product type or custom attribute
      // Adjust based on your commercetools setup
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

    // Fetch products from commercetools
    const productsResponse = await fetchCommercetoolsProducts({
      limit,
      offset,
      where: where.length > 0 ? where : undefined,
      sort: sortClause.length > 0 ? sortClause : undefined,
      locale,
    })

    let products = productsResponse.results

    // Format response data to match existing API structure
    const formattedProducts = products.map((product: IProduct, index: number) => ({
      id: product.sku || `product-${index}`, // Use SKU as ID or generate
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
    }))

    return NextResponse.json(
      {
        success: true,
        total: formattedProducts.length,
        totalCount: productsResponse.total,
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

import { notFound } from 'next/navigation'
import { fetchCommercetoolsProductBySlug } from '@/lib/commercetools/products'
import type { IProduct } from '@/lib/types/IProduct'
import type { Metadata } from 'next'

interface ProductPageProps {
  params: Promise<{
    locale: string
    slug: string
  }>
}

export async function generateMetadata(
  { params }: ProductPageProps
): Promise<Metadata> {
  const { locale, slug } = await params
  const product = await fetchCommercetoolsProductBySlug(slug, {
    locale: locale.split('-')[0] || 'en',
  })

  if (!product) {
    return {}
  }

  return {
    title: product.title,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: product.featuredImage ? [product.featuredImage.url] : [],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, slug } = await params
  const product = await fetchCommercetoolsProductBySlug(slug, {
    locale: locale.split('-')[0] || 'en',
  })

  if (!product) {
    notFound()
  }

  // For now, return a simple product display
  // You can enhance this with a proper ProductDetails component
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div>
            {product.featuredImage && (
              <img
                src={product.featuredImage.url}
                alt={product.featuredImage.label || product.title}
                className="w-full h-auto rounded-lg"
              />
            )}
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
            <p className="text-2xl font-semibold mb-4">
              ${product.basePrice}
            </p>
            <div className="prose mb-6">
              <p>{product.description}</p>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Variants</h2>
                <div className="space-y-2">
                  {product.variants.map((variant, index) => (
                    <div
                      key={variant.variantSKU || index}
                      className="border rounded p-3"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          {variant.colorName && (
                            <span className="font-medium">{variant.colorName}</span>
                          )}
                          {variant.size && (
                            <span className="ml-2">
                              Size: {variant.size.fields?.title || 'N/A'}
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold">${variant.price.toFixed(2)}</span>
                          {variant.stockQuantity > 0 ? (
                            <span className="ml-2 text-green-600">
                              In Stock ({variant.stockQuantity})
                            </span>
                          ) : (
                            <span className="ml-2 text-red-600">Out of Stock</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              onClick={() => {
                // Add to cart logic will be handled by client component
                console.log('Add to cart:', product)
              }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


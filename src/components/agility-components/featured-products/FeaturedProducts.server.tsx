import { getContentItem } from "@/lib/cms/getContentItem"
import type { UnloadedModuleProps } from "@agility/nextjs"
import type { IFeaturedProducts } from "@/lib/types/IFeaturedProducts"
import type { IProduct } from "@/lib/types/IProduct"
import { fetchCommercetoolsProductBySlug } from "@/lib/commercetools/products"
import { ProductCard } from "./ProductCard"
import Link from "next/link"

export const FeaturedProducts = async ({ module, languageCode }: UnloadedModuleProps) => {
  const {
    fields: { heading, subheading, ctaText, ctaLink, product1, product2, product3, backgroundImage },
    contentID,
  } = await getContentItem<IFeaturedProducts>({
    contentID: module.contentid,
    languageCode,
  })

  // Map language code to commercetools locale (e.g., "en-us" -> "en")
  const locale = languageCode.split('-')[0] || 'en'

  // Parse JSON strings from the product fields and extract slugs
  // The fields contain JSON like: '{"id":"...","path":"ben-pillow-cover","sku":"...","name":"..."}'
  const parseProductField = (fieldValue: string | undefined): string | null => {
    if (!fieldValue) return null
    try {
      const parsed = JSON.parse(fieldValue)
      // Extract the slug from the "path" field in the JSON
      return parsed.path || parsed.slug || null
    } catch (error) {
      // If it's not JSON, treat it as a plain slug string
      console.warn(`[FeaturedProducts] Field value is not JSON, treating as slug: ${fieldValue}`)
      return fieldValue
    }
  }

  // Get product slugs from the component fields (parsing JSON if needed)
  const productSlugs = [product1, product2, product3]
    .map(parseProductField)
    .filter((slug): slug is string => slug !== null)

  // Fetch products directly from commercetools
  const productPromises = productSlugs.map(async (slug) => {
    try {
      const product = await fetchCommercetoolsProductBySlug(slug, { locale })
      return product
    } catch (error) {
      console.error(`[FeaturedProducts] Error fetching product ${slug} from commercetools:`, error)
      return null
    }
  })

  const productResults = await Promise.all(productPromises)
  const products = productResults.filter((p): p is IProduct & { commercetoolsId?: string } => p !== null)

  if (products.length === 0 && productSlugs.length > 0) {
    console.warn(`[FeaturedProducts] No products were found. Check that the slugs in Agility CMS match the product slugs in commercetools.`)
  }

  return (
    <div className="relative bg-white dark:bg-gray-900" data-agility-component={contentID}>
      {/* Background image and overlap */}
      <div aria-hidden="true" className="absolute inset-0 hidden sm:flex sm:flex-col">
        <div className="relative w-full flex-1 bg-gray-800 dark:bg-gray-950">
          {backgroundImage && (
            <div className="absolute inset-0 overflow-hidden">
              <img
                alt=""
                src={backgroundImage.url}
                className="size-full object-cover dark:opacity-70 dark:saturate-0"
                data-agility-field="backgroundImage"
              />
            </div>
          )}
          <div className="absolute inset-0 bg-gray-900 opacity-10 dark:bg-black dark:opacity-30" />
        </div>
        <div className="h-32 w-full bg-white dark:bg-gray-900 md:h-40 lg:h-48" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 pb-96 text-center sm:px-6 sm:pb-0 lg:px-8">
        {/* Background image and overlap for mobile */}
        <div aria-hidden="true" className="absolute inset-0 flex flex-col sm:hidden">
          <div className="relative w-full flex-1 bg-gray-800 dark:bg-gray-950">
            {backgroundImage && (
              <div className="absolute inset-0 overflow-hidden">
                <img alt="" src={backgroundImage.url} className="size-full object-cover dark:opacity-80" />
              </div>
            )}
            <div className="absolute inset-0 bg-gray-900 opacity-50 dark:bg-black dark:opacity-40" />
          </div>
          <div className="h-48 w-full bg-white dark:bg-gray-900" />
        </div>
        <div className="relative py-32">
          <h1
            className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl text-shadow-lg  text-balance"
            data-agility-field="heading"
          >
            {heading}
          </h1>
          {subheading && (
            <p
              className="mt-4 text-lg text-white/90 sm:text-xl md:text-2xl text-balance text-shadow-md"
              data-agility-field="subheading"
            >
              {subheading}
            </p>
          )}
          {ctaLink?.href && ctaText && (
            <div className="mt-4 sm:mt-6" data-agility-field="ctaLink">
              <Link
                href={ctaLink.href}
                target={ctaLink.target || "_self"}
                className="inline-block rounded-md border border-white/20 dark:border-white/30 bg-white/10 dark:bg-white/20 backdrop-blur-md px-8 py-3 font-medium text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] hover:bg-white/20 dark:hover:bg-white/30 hover:border-white/30 dark:hover:border-white/40 hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.5)] dark:hover:shadow-[0_12px_40px_0_rgba(255,255,255,0.15)] active:shadow-[0_4px_16px_0_rgba(0,0,0,0.25)] dark:active:shadow-[0_4px_16px_0_rgba(255,255,255,0.05)] active:translate-y-0.5 transition-all duration-200"
              >
                <span data-agility-field="ctaText">{ctaText}</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      <section aria-labelledby="collection-heading" className="relative -mt-96 sm:mt-0">
        <h2 id="collection-heading" className="sr-only">
          Featured Products
        </h2>
        <div
          className="mx-auto grid max-w-md grid-cols-1 gap-y-6 px-4 sm:max-w-7xl sm:grid-cols-3 sm:gap-x-6 sm:gap-y-0 sm:px-6 lg:gap-x-8 lg:px-8"
        >
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.commercetoolsId || product.slug} product={product} />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-400">
              <p>No featured products found. Please check the product slugs in Agility CMS.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

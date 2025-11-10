import { getContentItem } from "@/lib/cms/getContentItem"
import type { UnloadedModuleProps } from "@agility/nextjs"
import type { IFeaturedProducts } from "@/lib/types/IFeaturedProducts"
import { ProductCard } from "./ProductCard"
import Link from "next/link"

export const FeaturedProducts = async ({ module, languageCode }: UnloadedModuleProps) => {
  const {
    fields: { heading, ctaText, ctaLink, featuredProducts, backgroundImage },
    contentID,
  } = await getContentItem<IFeaturedProducts>({
    contentID: module.contentid,
    languageCode,
  })

  // IMPORTANT: featuredProducts is already populated with full ContentItem<IProduct>[] objects
  // No need to fetch separately - the SDK does this automatically for search list box fields
  const products = featuredProducts || []

  return (
    <div className="relative bg-white" data-agility-component={contentID}>
      {/* Background image and overlap */}
      <div aria-hidden="true" className="absolute inset-0 hidden sm:flex sm:flex-col">
        <div className="relative w-full flex-1 bg-gray-800">
          {backgroundImage && (
            <div className="absolute inset-0 overflow-hidden">
              <img
                alt=""
                src={backgroundImage.url}
                className="size-full object-cover"
                data-agility-field="backgroundImage"
              />
            </div>
          )}
          <div className="absolute inset-0 bg-gray-900 opacity-50" />
        </div>
        <div className="h-32 w-full bg-white md:h-40 lg:h-48" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 pb-96 text-center sm:px-6 sm:pb-0 lg:px-8">
        {/* Background image and overlap for mobile */}
        <div aria-hidden="true" className="absolute inset-0 flex flex-col sm:hidden">
          <div className="relative w-full flex-1 bg-gray-800">
            {backgroundImage && (
              <div className="absolute inset-0 overflow-hidden">
                <img alt="" src={backgroundImage.url} className="size-full object-cover" />
              </div>
            )}
            <div className="absolute inset-0 bg-gray-900 opacity-50" />
          </div>
          <div className="h-48 w-full bg-white" />
        </div>
        <div className="relative py-32">
          <h1
            className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
            data-agility-field="heading"
          >
            {heading}
          </h1>
          {ctaLink?.href && ctaText && (
            <div className="mt-4 sm:mt-6" data-agility-field="ctaLink">
              <Link
                href={ctaLink.href}
                target={ctaLink.target || "_self"}
                className="inline-block rounded-md border border-transparent bg-indigo-600 px-8 py-3 font-medium text-white hover:bg-indigo-700"
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
          data-agility-field="featuredProducts"
        >
          {products.map((product) => (
            <ProductCard key={product.contentID} product={product} />
          ))}
        </div>
      </section>
    </div>
  )
}

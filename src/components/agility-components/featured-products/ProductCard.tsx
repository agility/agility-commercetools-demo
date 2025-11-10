import type { ContentItem } from "@agility/nextjs"
import type { IProduct } from "@/lib/types/IProduct"
import { AgilityPic } from "@agility/nextjs"
import Link from "next/link"

interface ProductCardProps {
  product: ContentItem<IProduct>
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { fields, contentID } = product
  const { title, slug, featuredImage, basePrice } = fields

  // Format price for display
  const formattedPrice = basePrice
    ? `$${parseFloat(basePrice).toFixed(2)}`
    : "Price not available"

  return (
    <div
      className="group relative h-96 rounded-lg bg-white shadow-xl sm:aspect-4/5 sm:h-auto"
      data-agility-content={contentID}
    >
      <Link href={`/products/${slug}`} className="absolute inset-0">
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-lg">
          <div className="absolute inset-0 overflow-hidden group-hover:opacity-75">
            {featuredImage && (
              <AgilityPic
                image={featuredImage}
                fallbackWidth={600}
                className="size-full object-cover"
                data-agility-field="featuredImage"
                priority={false}
              />
            )}
          </div>
          <div className="absolute inset-0 bg-linear-to-b from-transparent to-black opacity-50" />
        </div>
        <div className="absolute inset-0 flex items-end rounded-lg p-6">
          <div>
            <p aria-hidden="true" className="text-sm text-white">
              {formattedPrice}
            </p>
            <h3 className="mt-1 font-semibold text-white" data-agility-field="title">
              <span className="absolute inset-0" />
              {title}
            </h3>
          </div>
        </div>
      </Link>
    </div>
  )
}

import type { IProduct } from "@/lib/types/IProduct"
import Link from "next/link"
import Image from "next/image"
import { getImageDimensions } from "@/lib/utils/imageOptimization"

interface ProductCardProps {
  product: IProduct & { commercetoolsId?: string }
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { title, slug, featuredImage, basePrice } = product

  // Format price for display
  const formattedPrice = basePrice
    ? `$${parseFloat(basePrice).toFixed(2)}`
    : "Price not available"

  return (
    <div className="group relative h-96 rounded-lg bg-white shadow-xl sm:aspect-4/5 sm:h-auto">
      <Link href={`/products/${slug}`} className="absolute inset-0">
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-lg">
          <div className="absolute inset-0 overflow-hidden group-hover:opacity-75">
            {featuredImage && (
              <Image
                src={featuredImage.url}
                alt={featuredImage.label || title}
                width={featuredImage.width || getImageDimensions('featured-card').width}
                height={featuredImage.height || getImageDimensions('featured-card').height}
                className="size-full object-cover"
                sizes="(max-width: 639px) 400px, 600px"
                quality={85}
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
            <h3 className="mt-1 font-semibold text-white">
              <span className="absolute inset-0" />
              {title}
            </h3>
          </div>
        </div>
      </Link>
    </div>
  )
}

"use client"

import { useCart } from "@/lib/hooks/useCart"
import type { ICartItem } from "@/lib/types/ICart"
import { formatPrice } from "@/lib/utils"
import { MinusIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline"
import Image from "next/image"
import { getImageDimensions } from "@/lib/utils/imageOptimization"

interface CartLineItemProps {
  item: ICartItem
  showControls?: boolean // If false, hides quantity controls and remove button
}

export function CartLineItem({ item, showControls = true }: CartLineItemProps) {
  const { updateQuantity, removeItem } = useCart()
  const lineTotal = item.variant.price * item.quantity

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateQuantity(item.variantSKU, item.quantity - 1)
    } else {
      removeItem(item.variantSKU)
    }
  }

  const handleIncrease = () => {
    updateQuantity(item.variantSKU, item.quantity + 1)
  }

  const handleRemove = () => {
    removeItem(item.variantSKU)
  }

  return (
    <div className="flex gap-4 py-4">
      {/* Product Image */}
      <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
        {item.variant.variantImage?.url ? (
          <Image
            src={item.variant.variantImage.url}
            alt={item.variant.variantImage.label || item.product.title}
            width={item.variant.variantImage.width || getImageDimensions('cart').width}
            height={item.variant.variantImage.height || getImageDimensions('cart').height}
            className="size-full object-cover"
            sizes="96px"
            quality={85}
          />
        ) : item.product.featuredImage?.url ? (
          <Image
            src={item.product.featuredImage.url}
            alt={item.product.featuredImage.label || item.product.title}
            width={item.product.featuredImage.width || getImageDimensions('cart').width}
            height={item.product.featuredImage.height || getImageDimensions('cart').height}
            className="size-full object-cover"
            sizes="96px"
            quality={85}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {item.product.title}
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {item.variant.details}
            </p>
            {item.variant.color && (
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Color:
                </span>
                <div
                  className="size-4 rounded-full border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: item.variant.colorHEX }}
                  title={item.variant.color}
                />
                <span className="text-xs text-gray-700 dark:text-gray-300">
                  {item.variant.color}
                </span>
              </div>
            )}
            {'fields' in item.variant.size && (item.variant.size.fields.sizeName || item.variant.size.fields.title) && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Size: {item.variant.size.fields.sizeName || item.variant.size.fields.title}
              </p>
            )}
          </div>

          {/* Remove Button */}
          {showControls && (
            <button
              onClick={handleRemove}
              className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
              aria-label="Remove item"
            >
              <XMarkIcon className="size-5" />
            </button>
          )}
        </div>

        {/* Quantity and Price */}
        <div className="mt-2 flex items-center justify-between">
          {/* Quantity Selector */}
          {showControls ? (
            <div className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600">
              <button
                onClick={handleDecrease}
                className="p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                aria-label="Decrease quantity"
              >
                <MinusIcon className="size-4" />
              </button>
              <span className="min-w-[2ch] text-center text-sm font-medium text-gray-900 dark:text-white">
                {item.quantity}
              </span>
              <button
                onClick={handleIncrease}
                className="p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                aria-label="Increase quantity"
              >
                <PlusIcon className="size-4" />
              </button>
            </div>
          ) : (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Qty: {item.quantity}
            </span>
          )}

          {/* Line Total */}
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {formatPrice(lineTotal)}
          </p>
        </div>
      </div>
    </div>
  )
}

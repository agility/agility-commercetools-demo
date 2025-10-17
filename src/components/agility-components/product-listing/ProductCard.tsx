'use client'

import { motion } from "motion/react"
import { clsx } from "clsx"
import { ShoppingCartIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import type { ContentItem } from "@agility/nextjs"
import type { IProduct } from "@/lib/types/IProduct"

interface ProductCardProps {
	product: ContentItem<IProduct>
	displayStyle: 'grid' | 'list'
	ctaLabel: string
	index: number
}

export const ProductCard = ({ product, displayStyle, ctaLabel, index }: ProductCardProps) => {
	const {
		fields: { title, description, basePrice, category, slug },
		contentID
	} = product

	const categoryName = category?.fields?.name
	const productUrl = `/products/${slug}`

	// Animation delay for staggered effect
	const delay = 0.05 + (index % 12) * 0.05

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay }}
			className={clsx(
				"group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700",
				displayStyle === 'list' && "sm:flex sm:flex-row"
			)}
		>
			<Link href={productUrl} className={clsx(
				"block",
				displayStyle === 'list' ? "sm:flex sm:flex-row w-full" : ""
			)}>
				{/* Product Image */}
				<div
					className={clsx(
						"relative overflow-hidden bg-gray-100 dark:bg-gray-900",
						displayStyle === 'grid' ? "aspect-square" : "sm:w-64 sm:flex-shrink-0 aspect-square sm:aspect-auto"
					)}
				>
					<div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
						<div className="text-6xl mb-2">📦</div>
						<span className="text-sm text-gray-500 dark:text-gray-400">Image Coming Soon</span>
					</div>
					{categoryName && (
						<div className="absolute top-3 left-3">
							<span className="inline-block px-3 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 dark:text-gray-300">
								{categoryName}
							</span>
						</div>
					)}
				</div>

				{/* Product Info */}
				<div className={clsx(
					"p-6",
					displayStyle === 'list' && "flex-1 flex flex-col justify-between"
				)}>
					<div>
						<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
							{title}
						</h3>
						{description && (
							<p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
								{description}
							</p>
						)}
					</div>

					{/* Price and CTA */}
					<div className={clsx(
						"flex items-center justify-between gap-4",
						displayStyle === 'list' ? "mt-4" : "mt-6"
					)}>
						<div className="text-2xl font-bold text-gray-900 dark:text-white">
							${basePrice || '0.00'}
						</div>
						<button
							onClick={(e) => {
								e.preventDefault()
								// TODO: Add to cart functionality
								console.log('Add to cart:', contentID)
							}}
							className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm hover:shadow-md"
						>
							<ShoppingCartIcon className="w-5 h-5" />
							{ctaLabel || 'Add to Cart'}
						</button>
					</div>
				</div>
			</Link>
		</motion.div>
	)
}

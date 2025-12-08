'use client'

import { Container } from "../../container"
import { Heading } from "../../text"
import { clsx } from "clsx"
import { useState, useMemo } from "react"
import {
	AdjustmentsHorizontalIcon,
	Squares2X2Icon,
	ListBulletIcon
} from "@heroicons/react/24/outline"
import type { IProduct } from "@/lib/types/IProduct"
import { ProductCard } from "./ProductCard"

interface ProductListingClientProps {
	heading: string
	description: string
	displayStyle: string
	itemsPerRow: string
	showFilters: boolean
	showSortOptions: boolean
	ctaLabel: string
	products: (IProduct & { commercetoolsId?: string })[]
	contentID: number
	languageCode: string
}

export const ProductListingClient = ({
	heading,
	description,
	displayStyle: initialDisplayStyle,
	itemsPerRow,
	showFilters,
	showSortOptions,
	ctaLabel,
	products,
	contentID,
	languageCode
}: ProductListingClientProps) => {
	const [displayStyle, setDisplayStyle] = useState<'grid' | 'list'>(initialDisplayStyle as 'grid' | 'list')
	const [selectedCategory, setSelectedCategory] = useState<string>('all')
	const [sortOption, setSortOption] = useState<string>('default')

	// Extract unique categories from products
	const categories = useMemo(() => {
		const categorySet = new Set<string>()
		products.forEach((product) => {
			// commercetools products don't have nested category structure
			// Categories would need to be handled differently if needed
		})
		return Array.from(categorySet).sort()
	}, [products])

	// Filter and sort products
	const filteredAndSortedProducts = useMemo(() => {
		let result = [...products]

		// Filter by category (if categories are implemented)
		if (selectedCategory !== 'all') {
			// Category filtering would need to be implemented based on commercetools category structure
		}

		// Sort products
		switch (sortOption) {
			case 'price-low':
				result.sort((a, b) => {
					const priceA = parseFloat(a.basePrice || '0')
					const priceB = parseFloat(b.basePrice || '0')
					return priceA - priceB
				})
				break
			case 'price-high':
				result.sort((a, b) => {
					const priceA = parseFloat(a.basePrice || '0')
					const priceB = parseFloat(b.basePrice || '0')
					return priceB - priceA
				})
				break
			case 'name-az':
				result.sort((a, b) => a.title.localeCompare(b.title))
				break
			default:
				// Keep original order
				break
		}

		return result
	}, [products, selectedCategory, sortOption])

	// Grid column classes based on itemsPerRow
	const gridCols = {
		'2': 'lg:grid-cols-2',
		'3': 'lg:grid-cols-3',
		'4': 'lg:grid-cols-4'
	}[itemsPerRow] || 'lg:grid-cols-3'

	return (
		<Container className="mt-20" data-agility-component={contentID}>
			{/* Header Section */}
			<div className="text-center max-w-3xl mx-auto mb-12">
				<Heading as="h2" className="mb-4" data-agility-field="heading">
					{heading}
				</Heading>
				{description && (
					<p className="text-lg text-gray-600 dark:text-gray-400" data-agility-field="description">
						{description}
					</p>
				)}
			</div>

			{/* Filters and Controls Bar */}
			{(showFilters || showSortOptions) && (
				<div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
					{/* Category Filters */}
					{showFilters && categories.length > 0 && (
						<div className="flex items-center gap-2 flex-wrap" data-agility-field="showFilters">
							<AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-500" />
							<button
								onClick={() => setSelectedCategory('all')}
								className={clsx(
									"px-4 py-2 rounded-full text-sm font-medium transition-colors",
									selectedCategory === 'all'
										? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
										: "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
								)}
							>
								All Products
							</button>
							{categories.map((category) => (
								<button
									key={category}
									onClick={() => setSelectedCategory(category)}
									className={clsx(
										"px-4 py-2 rounded-full text-sm font-medium transition-colors",
										selectedCategory === category
											? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
											: "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
									)}
								>
									{category}
								</button>
							))}
						</div>
					)}

					{/* Sort and View Toggle */}
					<div className="flex items-center gap-4">
						{/* Sort Dropdown */}
						{showSortOptions && (
							<div data-agility-field="showSortOptions">
								<select
									value={sortOption}
									onChange={(e) => setSortOption(e.target.value)}
									className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
								>
									<option value="default">Default</option>
									<option value="price-low">Price: Low to High</option>
									<option value="price-high">Price: High to Low</option>
									<option value="name-az">Name: A-Z</option>
								</select>
							</div>
						)}

						{/* View Toggle */}
						<div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-lg p-1" data-agility-field="displayStyle">
							<button
								onClick={() => setDisplayStyle('grid')}
								className={clsx(
									"p-2 rounded transition-colors",
									displayStyle === 'grid'
										? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
										: "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
								)}
								aria-label="Grid view"
							>
								<Squares2X2Icon className="w-5 h-5" />
							</button>
							<button
								onClick={() => setDisplayStyle('list')}
								className={clsx(
									"p-2 rounded transition-colors",
									displayStyle === 'list'
										? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
										: "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
								)}
								aria-label="List view"
							>
								<ListBulletIcon className="w-5 h-5" />
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Products Grid/List */}
			<div
				className={clsx(
					"grid gap-6",
					displayStyle === 'grid'
						? `grid-cols-1 sm:grid-cols-2 ${gridCols}`
						: "grid-cols-1"
				)}
			>
				{filteredAndSortedProducts.map((product, index) => (
					<ProductCard
						key={product.commercetoolsId || product.slug}
						product={product}
						displayStyle={displayStyle}
						ctaLabel={ctaLabel}
						index={index}
						languageCode={languageCode}
					/>
				))}
			</div>

			{/* Empty State */}
			{filteredAndSortedProducts.length === 0 && (
				<div className="text-center py-16">
					<p className="text-lg text-gray-500 dark:text-gray-400">
						No products found matching your criteria.
					</p>
				</div>
			)}
		</Container>
	)
}

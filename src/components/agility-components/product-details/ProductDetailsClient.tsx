'use client'

import { useState, useEffect } from 'react'
import { AgilityPic, type ContentItem, type ImageField } from '@agility/nextjs'
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import { ShoppingCartIcon, TruckIcon, XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { motion } from 'motion/react'
import { clsx } from 'clsx'
import { useCart } from '@/lib/hooks/useCart'
import type { IProductDetails } from '@/lib/types/IProductDetails'
import type { IProduct } from '@/lib/types/IProduct'
import type { IVariant } from '@/lib/types/IVariant'
import type { ISize } from '@/lib/types/ISize'
import type { IProductImage } from '@/lib/types/IProductImage'

interface IRelatedProduct {
	title: string
	basePrice: string
	featuredImage?: ImageField
	slug: string
}

// Stock status helper
const getStockStatus = (quantity: number) => {
	if (quantity === 0) return { label: 'Out of Stock', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-900/20' }
	if (quantity < 10) return { label: `Low Stock (${quantity} left)`, color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' }
	return { label: 'In Stock', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-900/20' }
}

interface ProductDetailsClientProps {
	config: IProductDetails
	product: ContentItem<IProduct>
	variants: ContentItem<IVariant>[]
	sizes: Map<number, ContentItem<ISize>>
	productImages: ContentItem<IProductImage>[]
	relatedProducts?: ContentItem<IRelatedProduct>[]
	contentID: string
}

// Client component that handles interactivity
export function ProductDetailsClient({
	config,
	product,
	variants,
	sizes,
	productImages,
	relatedProducts = [],
	contentID
}: ProductDetailsClientProps) {
	const { fields } = product
	const { addItem, openCart } = useCart()
	console.log("fields.featuredImage", fields.featuredImage)
	// State management
	const [selectedVariant, setSelectedVariant] = useState<ContentItem<IVariant> | null>(null)
	const [selectedSize, setSelectedSize] = useState<string>('')
	const [quantity, setQuantity] = useState(1)
	const [selectedImage, setSelectedImage] = useState(fields.featuredImage)
	const [sizeGuideOpen, setSizeGuideOpen] = useState(false)

	// Update selected image when variant changes
	useEffect(() => {
		if (selectedVariant) {
			// Show variant image if available
			if (selectedVariant.fields.image?.url) {
				setSelectedImage(selectedVariant.fields.image)
			} else if (selectedVariant.fields.variantImage?.url) {
				setSelectedImage(selectedVariant.fields.variantImage)
			}
		} else {
			// Show default featured image when no variant is selected
			setSelectedImage(fields.featuredImage)
		}
	}, [selectedVariant, fields.featuredImage])

	// Get available sizes for selected color
	const availableSizes = selectedVariant
		? variants
			.filter(v => {
				const colorName = v.fields.colorName || v.fields.color
				const selectedColorName = selectedVariant.fields.colorName || selectedVariant.fields.color
				return colorName === selectedColorName
			})
			.map(v => {
				const size = v.fields.size as { contentid: number } | ContentItem<ISize>
				const sizeId = 'contentid' in size ? size.contentid : size.contentID
				return sizes.get(sizeId)
			})
			.filter(Boolean) as ContentItem<ISize>[]
		: []

	// Handle add to cart
	const handleAddToCart = () => {
		// Auto-select first variant if none selected
		const variantToAdd = selectedVariant || variants[0]

		if (!variantToAdd) {
			alert('No variants available')
			return
		}
		if (!selectedSize && availableSizes.length > 0) {
			alert('Please select a size')
			return
		}
		if (variantToAdd.fields.stockQuantity === 0) {
			alert('This variant is out of stock')
			return
		}

		// Add item to cart using the proper interface
		addItem(fields, variantToAdd.fields, quantity)

		// Open the cart drawer to show the added item
		openCart()
	}

	// Use selected variant or first variant for display info
	const displayVariant = selectedVariant || variants[0]
	const stockStatus = displayVariant ? getStockStatus(displayVariant.fields.stockQuantity) : null
	const displayPrice = displayVariant?.fields.price
		? (typeof displayVariant.fields.price === 'string' ? parseFloat(displayVariant.fields.price) : displayVariant.fields.price)
		: (typeof fields.basePrice === 'string' ? parseFloat(fields.basePrice) : fields.basePrice)

	// Get unique colors for variant selection
	const uniqueColors = Array.from(
		new Map(variants.map(v => {
			const colorName = v.fields.colorName || v.fields.color || ''
			return [colorName, v]
		})).values()
	)

	return (
		<div className="bg-white dark:bg-gray-900" data-agility-component={contentID}>
			<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
				<div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
					{/* Image Gallery */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						className="flex flex-col gap-4"
					>
						{/* Main Image */}
						<div className="aspect-square w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
							{selectedImage?.url ? (
								<AgilityPic
									image={selectedImage}
									fallbackWidth={800}
									className="h-full w-full object-cover object-center"
									sources={[
										{ media: "(max-width: 639px)", width: 600 },
										{ media: "(max-width: 1023px)", width: 800 },
										{ media: "(min-width: 1024px)", width: 1000 }
									]}
								/>
							) : (
								<div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
									<div className="text-8xl mb-4">📦</div>
									<span className="text-lg text-gray-500 dark:text-gray-400">Image Coming Soon</span>
								</div>
							)}
						</div>

						{/* Thumbnails */}
						<div className="grid grid-cols-4 gap-4">
							{/* Always show featured image as first thumbnail */}
							{fields.featuredImage?.url && (
								<button
									onClick={() => {
										setSelectedImage(fields.featuredImage)
										setSelectedVariant(null)
									}}
									className={clsx(
										'aspect-square overflow-hidden rounded-lg border-2 transition-all',
										selectedImage?.url === fields.featuredImage?.url && !selectedVariant
											? 'border-blue-600 dark:border-blue-400'
											: 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
									)}
								>
									<AgilityPic
										image={fields.featuredImage}
										fallbackWidth={200}
										className="h-full w-full object-cover"
									/>
								</button>
							)}

							{/* Show variant images */}
							{uniqueColors.slice(0, fields.featuredImage?.url ? 3 : 4).map((variant) => {
								const variantImage = variant.fields.image || variant.fields.variantImage
								if (!variantImage?.url) return null

								return (
									<button
										key={variant.contentID}
										onClick={() => {
											setSelectedVariant(variant)
											setSelectedSize('')
										}}
										className={clsx(
											'aspect-square overflow-hidden rounded-lg border-2 transition-all',
											selectedVariant?.contentID === variant.contentID
												? 'border-blue-600 dark:border-blue-400'
												: 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
										)}
									>
										<AgilityPic
											image={variantImage}
											fallbackWidth={200}
											className="h-full w-full object-cover"
										/>
									</button>
								)
							})}
						</div>
					</motion.div>

					{/* Product Info */}
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						className="mt-10 lg:mt-0"
					>
						<h1
							className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white"
							data-agility-field="title"
						>
							{fields.title}
						</h1>

						{/* Price */}
						<div className="mt-4">
							<p className="text-3xl font-bold text-gray-900 dark:text-white">
								${displayPrice.toFixed(2)}
							</p>
						</div>

						{/* Stock Status */}
						{stockStatus && (
							<div className={clsx('mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2', stockStatus.bgColor)}>
								{stockStatus.label.includes('Out of Stock') ? (
									<XMarkIcon className={clsx('h-5 w-5', stockStatus.color)} />
								) : stockStatus.label.includes('Low') ? (
									<ExclamationTriangleIcon className={clsx('h-5 w-5', stockStatus.color)} />
								) : (
									<CheckCircleIcon className={clsx('h-5 w-5', stockStatus.color)} />
								)}
								<span className={clsx('text-sm font-medium', stockStatus.color)}>
									{stockStatus.label}
								</span>
							</div>
						)}

						{/* Description */}
						<div
							className="mt-6 text-base text-gray-700 dark:text-gray-300"
							data-agility-field="description"
						>
							{fields.description}
						</div>

						{/* Variant Selection */}
						<div className="mt-8 space-y-6">
							{/* Color Selection */}
							{uniqueColors.length > 0 && (
								<div>
									<h3 className="text-sm font-medium text-gray-900 dark:text-white">
										Color: {selectedVariant?.fields.colorName || selectedVariant?.fields.color}
									</h3>
									<div className="mt-3 flex gap-3">
										{uniqueColors.map((variant) => {
											const colorName = variant.fields.colorName || variant.fields.color
											return (
												<button
													key={variant.contentID}
													onClick={() => {
														setSelectedVariant(variant)
														setSelectedSize('')
													}}
													className={clsx(
														'h-10 w-10 rounded-full border-2 transition-all',
														(selectedVariant?.fields.colorName || selectedVariant?.fields.color) === colorName
															? 'border-blue-600 dark:border-blue-400 ring-2 ring-blue-600 dark:ring-blue-400 ring-offset-2 dark:ring-offset-gray-900'
															: 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
													)}
													style={{ backgroundColor: variant.fields.colorHEX }}
													title={colorName}
												/>
											)
										})}
									</div>
								</div>
							)}

							{/* Size Selection */}
							{availableSizes.length > 0 && (
								<div>
									<div className="flex items-center justify-between">
										<h3 className="text-sm font-medium text-gray-900 dark:text-white">Size</h3>
										{config.enableSizeGuide && config.sizeGuideLink && (
											<button
												onClick={() => setSizeGuideOpen(true)}
												className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
											>
												Size Guide
											</button>
										)}
									</div>
									<select
										value={selectedSize}
										onChange={(e) => setSelectedSize(e.target.value)}
										className="mt-3 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
									>
										<option value="">Select a size</option>
										{availableSizes.map((size) => (
											<option key={size.contentID} value={size.fields.sizeCode || size.fields.code}>
												{size.fields.sizeName || size.fields.title}
											</option>
										))}
									</select>
								</div>
							)}

							{/* Quantity Selector */}
							<div>
								<h3 className="text-sm font-medium text-gray-900 dark:text-white">Quantity</h3>
								<select
									value={quantity}
									onChange={(e) => setQuantity(Number(e.target.value))}
									className="mt-3 block w-32 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
								>
									{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
										<option key={num} value={num}>{num}</option>
									))}
								</select>
							</div>

							{/* Add to Cart Button */}
							<button
								onClick={handleAddToCart}
								disabled={!displayVariant || displayVariant.fields.stockQuantity === 0}
								className={clsx(
									'w-full flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-semibold text-white transition-colors',
									displayVariant && displayVariant.fields.stockQuantity > 0
										? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
										: 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
								)}
							>
								<ShoppingCartIcon className="h-5 w-5" />
								Add to Cart
							</button>

							{/* Shipping Info */}
							{config.showShippingInfo === "true" && config.shippingMessage && (
								<div
									className="flex items-start gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4"
									data-agility-field="shippingMessage"
								>
									<TruckIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
									<p className="text-sm text-gray-600 dark:text-gray-300">
										{config.shippingMessage}
									</p>
								</div>
							)}
						</div>
					</motion.div>
				</div>

				{/* Related Products */}
				{config.showRelatedProducts && relatedProducts.length > 0 && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="mt-16"
					>
						<h2
							className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
							data-agility-field="relatedProductsHeading"
						>
							{config.relatedProductsHeading || 'Related Products'}
						</h2>
						<div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
							{relatedProducts.map((relatedProduct, idx) => (
								<motion.a
									key={relatedProduct.contentID}
									href={`/products/${relatedProduct.fields.slug}`}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.1 * idx }}
									className="group"
								>
									<div className="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
										{relatedProduct.fields.featuredImage?.url ? (
											<AgilityPic
												image={relatedProduct.fields.featuredImage}
												fallbackWidth={400}
												className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
												sources={[
													{ media: "(max-width: 639px)", width: 300 },
													{ media: "(min-width: 640px)", width: 400 }
												]}
											/>
										) : (
											<div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
												<div className="text-4xl mb-1">📦</div>
												<span className="text-xs text-gray-500 dark:text-gray-400">Coming Soon</span>
											</div>
										)}
									</div>
									<h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
										{relatedProduct.fields.title}
									</h3>
									<p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
										${relatedProduct.fields.basePrice || '0.00'}
									</p>
								</motion.a>
							))}
						</div>
					</motion.div>
				)}
			</div>

			{/* Size Guide Modal */}
			{config.enableSizeGuide === "true" && (
				<Dialog open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} className="relative z-50">
					<DialogBackdrop
						as={motion.div}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-gray-900/50 dark:bg-gray-900/75 backdrop-blur-sm"
					/>

					<div className="fixed inset-0 z-10 w-screen overflow-y-auto">
						<div className="flex min-h-full items-center justify-center p-4">
							<DialogPanel
								as={motion.div}
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.95 }}
								className="relative w-full max-w-2xl transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-2xl"
							>
								<div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-4">
									<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
										Size Guide
									</h2>
									<button
										onClick={() => setSizeGuideOpen(false)}
										className="rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
									>
										<XMarkIcon className="h-6 w-6" />
									</button>
								</div>
								<div className="p-6">
									{config.sizeGuideLink ? (
										<iframe
											src={config.sizeGuideLink}
											className="w-full h-96 border-0"
											title="Size Guide"
										/>
									) : (
										<p className="text-gray-600 dark:text-gray-300">
											Size guide information will be displayed here.
										</p>
									)}
								</div>
							</DialogPanel>
						</div>
					</div>
				</Dialog>
			)}
		</div>
	)
}

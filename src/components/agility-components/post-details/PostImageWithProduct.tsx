'use client'

import React from "react"
import { AgilityPic, type ImageField } from "@agility/nextjs"
import Image from "next/image"
import { createPostImageTransitionName } from "@/lib/hooks/useViewTransition"
import { unstable_ViewTransition as ViewTransition } from 'react'
import { getImageDimensions, getResponsiveSources } from "@/lib/utils/imageOptimization"

interface PostImageWithProductProps {
	postImage: ImageField | null
	productImage: ImageField | null
	contentID: string | number
	className?: string
}

/**
 * Component that displays post image and product image together.
 * If both are available, shows product image overlaid on post image (like the reference design).
 * If only one is available, shows that one.
 * If neither is available, shows a placeholder.
 */
export const PostImageWithProduct: React.FC<PostImageWithProductProps> = ({
	postImage,
	productImage,
	contentID,
	className = "mb-10 aspect-3/2 w-full rounded-2xl object-cover shadow-xl dark:grayscale"
}) => {
	// If both images are available, show overlay style
	if (postImage && productImage) {
		return (
			<div className="relative mb-10 aspect-3/2 w-full rounded-2xl overflow-hidden shadow-xl">
				<ViewTransition name={createPostImageTransitionName(contentID)}>
					{/* Post image as background */}
					<AgilityPic
						data-agility-field="image"
						image={postImage}
						fallbackWidth={1200}
						className="absolute inset-0 w-full h-full object-cover"
						sources={[
							{ media: "(max-width: 639px)", width: 640 },
							{ media: "(max-width: 1023px)", width: 1200 },
							{ width: 1600 },
						]}
					/>
					{/* Product image overlaid in bottom-left corner */}
					<div className="absolute bottom-0 left-0 p-4 sm:p-6 lg:p-8">
						<div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-xl overflow-hidden shadow-2xl ring-2 ring-white/20 backdrop-blur-sm bg-white/10">
							<Image
								src={productImage.url}
								alt={productImage.label || 'Product image'}
								width={productImage.width || getImageDimensions('post-overlay').width}
								height={productImage.height || getImageDimensions('post-overlay').height}
								className="w-full h-full object-cover"
								sizes="(max-width: 639px) 200px, 400px"
								quality={85}
							/>
						</div>
					</div>
				</ViewTransition>
			</div>
		)
	}

	// If only post image is available
	if (postImage) {
		return (
			<ViewTransition name={createPostImageTransitionName(contentID)}>
				<AgilityPic
					data-agility-field="image"
					image={postImage}
					fallbackWidth={800}
					className={className}
				/>
			</ViewTransition>
		)
	}

	// If only product image is available
	if (productImage) {
		return (
			<ViewTransition name={createPostImageTransitionName(contentID)}>
				<Image
					src={productImage.url}
					alt={productImage.label || 'Product image'}
					width={productImage.width || getImageDimensions('post-card').width}
					height={productImage.height || getImageDimensions('post-card').height}
					className={className}
					sizes="(max-width: 639px) 640px, (max-width: 767px) 800px, (max-width: 1023px) 1200px, 1200px"
					quality={85}
				/>
			</ViewTransition>
		)
	}

	// No images available - show placeholder
	return (
		<div className={`${className} bg-gray-100 dark:bg-gray-800 flex items-center justify-center`}>
			<span className="text-gray-400 dark:text-gray-600 text-sm">No image available</span>
		</div>
	)
}

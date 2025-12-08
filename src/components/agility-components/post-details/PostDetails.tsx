import React from "react"
import { AgilityPic, type UnloadedModuleProps, renderHTML, type ImageField, type ContentItem } from "@agility/nextjs"
import { DateTime } from "luxon"
import type { IPost } from "@/lib/types/IPost"
import type { IProduct } from "@/lib/types/IProduct"
import { ChevronLeftIcon } from "@heroicons/react/16/solid"
import dayjs from "dayjs"
import Link from "next/link"
import { Container } from "../../container"
import { Subheading, Heading } from "../../text"
import { Button } from "../../button"
import { PostImageWithProduct } from "./PostImageWithProduct"
import { localizeUrl } from "@/lib/i18n/localizeUrl"
import { fetchCommercetoolsProductBySlug } from "@/lib/commercetools/products"

const PostDetails = async ({ dynamicPageItem, languageCode }: UnloadedModuleProps) => {
	if (!dynamicPageItem) {
		return <div>Post not found</div>
	}

	// post fields
	const post = dynamicPageItem.fields as IPost

	// category
	const category = post.category?.fields.name || "Uncategorized"

	// format date
	const dateStr = DateTime.fromJSDate(new Date(post.postDate)).toFormat(
		"LLL. dd, yyyy"
	)

	// content id
	const contentID = dynamicPageItem.contentID

	// Extract product image from embedded featuredProduct field
	let productImage: ImageField | null = null
	if (post.featuredProduct) {
		try {
			// Handle embedded product format (same as FeaturedProducts component)
			// Could be: JSON string, ContentItem<IProduct>, or ContentItem<IProduct>[]
			let product: IProduct | null = null

			if (typeof post.featuredProduct === 'string') {
				// Parse JSON string format like: '{"id":"...","path":"ben-pillow-cover","sku":"...","name":"..."}'
				try {
					const parsed = JSON.parse(post.featuredProduct)
					// If it's a JSON object with product data, extract the slug and fetch
					if (parsed.path || parsed.slug) {
						const localeCode = languageCode.split('-')[0] || 'en'
						product = await fetchCommercetoolsProductBySlug(
							parsed.path || parsed.slug,
							{ locale: localeCode }
						)
					}
				} catch (jsonError) {
					// Not JSON, treat as plain slug string
					const localeCode = languageCode.split('-')[0] || 'en'
					product = await fetchCommercetoolsProductBySlug(
						post.featuredProduct.toLowerCase().replace(/\s+/g, '-'),
						{ locale: localeCode }
					)
				}
			} else if (post.featuredProduct && typeof post.featuredProduct === 'object') {
				// Handle ContentItem<IProduct> or ContentItem<IProduct>[]
				if (Array.isArray(post.featuredProduct) && post.featuredProduct.length > 0) {
					// Take first product from array
					product = post.featuredProduct[0].fields as IProduct
				} else if ('fields' in post.featuredProduct) {
					// Single ContentItem<IProduct>
					product = post.featuredProduct.fields as IProduct
				}
			}

			if (product?.featuredImage) {
				productImage = product.featuredImage
			}
		} catch (error) {
			console.error(`Error extracting product for post ${contentID}:`, error)
		}
	}

	return (
		<Container data-agility-component={contentID}>
			<Subheading
				className="mt-16"
				data-agility-field="postDate"
			>
				{dayjs(post.postDate).format('dddd, MMMM D, YYYY')}
			</Subheading>
			<Heading
				as="h1"
				className="mt-2"
				data-agility-field="heading"
			>
				{post.heading}
			</Heading>
			<div className="mt-16 grid grid-cols-1 gap-8 pb-24 lg:grid-cols-[15rem_1fr] xl:grid-cols-[15rem_1fr_15rem]">
				<div className="flex flex-wrap items-center gap-8 max-lg:justify-between lg:flex-col lg:items-start">
					{post.author && (
						<div className="flex items-center gap-3">
							{post.author.fields.headShot && (
								<AgilityPic
									image={post.author.fields.headShot}
									fallbackWidth={64}
									className="aspect-square size-6 rounded-full object-cover"

								/>
							)}
							<div className="text-sm/5 text-gray-700 dark:text-gray-300">
								{post.author.fields.name}
							</div>
						</div>
					)}

					{post.category && (
						<div className="flex flex-wrap gap-2">
							<Link
								key={post.category.contentID}
								href={`/blog?category=${post.category.fields.name}`}
								className="rounded-full border border-dotted border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-2 text-sm/6 font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
							>
								{post.category.fields.name}
							</Link>
						</div>
					)}
				</div>
				<div className="text-gray-700 dark:text-gray-300">
					<div className="max-w-2xl xl:mx-auto">
						{(post.image || productImage) && (
							<PostImageWithProduct
								postImage={post.image || null}
								productImage={productImage}
								contentID={contentID}
							/>
						)}

						<div
							data-agility-field="content"
							data-agility-html="true"
							className="prose dark:prose-invert max-w-full mb-20"
							dangerouslySetInnerHTML={renderHTML(post.content)}
						/>

						<div className="mt-10">
							<Button variant="outline" href={localizeUrl("/blog", languageCode)}>
								<ChevronLeftIcon className="size-4" />
								Back to blog
							</Button>
						</div>
					</div>
				</div>
			</div>
		</Container>
	)
}

export default PostDetails
export { PostImage } from "./PostImage"

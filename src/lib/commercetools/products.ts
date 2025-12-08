import { getCommercetoolsApiRoot } from './client'
import type { IProduct } from '@/lib/types/IProduct'
import type { IVariant } from '@/lib/types/IVariant'
import type { Product, ProductProjection } from '@commercetools/platform-sdk'

/**
 * Transform commercetools ProductProjection to our IProduct format
 * Returns both the transformed product and the original commercetools product ID
 */
export function transformCommercetoolsProduct(
  ctProduct: ProductProjection | Product
): IProduct & { commercetoolsId?: string } {
  // Get the master variant and all variants
  const masterVariant = ctProduct.masterVariant
  const variants = ctProduct.variants || []

  // Get localized values (defaulting to en if available, or first available)
  const getName = (localizedString?: { [key: string]: string }) => {
    if (!localizedString) return ''
    return localizedString['en'] || localizedString['en-US'] || Object.values(localizedString)[0] || ''
  }

  const getDescription = (localizedText?: { [key: string]: string }) => {
    if (!localizedText) return ''
    return localizedText['en'] || localizedText['en-US'] || Object.values(localizedText)[0] || ''
  }

  // Get slug from URL slug attribute or generate from name
  const slugAttribute = ctProduct.slug
  const slug = typeof slugAttribute === 'string'
    ? slugAttribute
    : getName(slugAttribute as any) || ctProduct.id || ''

  // Get base price from master variant
  const basePrice = masterVariant?.prices?.[0]?.value?.centAmount
    ? (masterVariant.prices[0].value.centAmount / 100).toFixed(2)
    : '0.00'

  // Get featured image from master variant
  const featuredImage = masterVariant?.images?.[0]
    ? {
      url: masterVariant.images[0].url,
      label: masterVariant.images[0].label || '',
      width: masterVariant.images[0].dimensions?.w || 0,
      height: masterVariant.images[0].dimensions?.h || 0,
    }
    : undefined

  // Transform variants
  const transformedVariants: IVariant[] = [masterVariant, ...variants]
    .filter(Boolean)
    .map((variant) => {
      const price = variant.prices?.[0]?.value?.centAmount
        ? variant.prices[0].value.centAmount / 100
        : 0

      // Get SKU
      const sku = variant.sku || ''

      // Get attributes for color, size, etc.
      const colorAttr = variant.attributes?.find(attr =>
        attr.name === 'color' || attr.name === 'Color'
      )
      const sizeAttr = variant.attributes?.find(attr =>
        attr.name === 'size' || attr.name === 'Size'
      )

      const color = colorAttr?.value as string || ''
      const colorName = color
      const colorHEX = colorAttr?.value as string || '#000000'

      // Size handling - commercetools typically uses attributes
      const sizeValue = sizeAttr?.value as string || ''

      return {
        variantSKU: sku,
        color: colorName,
        colorName: colorName,
        colorHEX: colorHEX,
        size: {
          contentID: 0,
          fields: {
            title: sizeValue,
          },
        } as any,
        price,
        variantImage: variant.images?.[0] ? {
          url: variant.images[0].url,
          label: variant.images[0].label || '',
          width: variant.images[0].dimensions?.w || 0,
          height: variant.images[0].dimensions?.h || 0,
        } : undefined,
        stockQuantity: variant.availability?.availableQuantity || 0,
      } as IVariant
    })

  return {
    title: getName(ctProduct.name),
    sku: masterVariant?.sku || ctProduct.id || '',
    slug: slug.toLowerCase().replace(/\s+/g, '-'),
    description: getDescription(ctProduct.description),
    basePrice,
    featuredImage,
    variants: transformedVariants,
    commercetoolsId: ctProduct.id,
  } as IProduct & { commercetoolsId?: string }
}

/**
 * Fetch all products from commercetools
 */
export async function fetchCommercetoolsProducts(options?: {
  limit?: number
  offset?: number
  where?: string[]
  sort?: string[]
  locale?: string
}) {
  const apiRoot = getCommercetoolsApiRoot()
  const limit = options?.limit || 100
  const offset = options?.offset || 0
  const locale = options?.locale || 'en'

  try {
    const response = await apiRoot
      .productProjections()
      .get({
        queryArgs: {
          limit,
          offset,
          where: options?.where,
          sort: options?.sort,
          localeProjection: locale,
        },
      })
      .execute()

    return {
      results: response.body.results.map(transformCommercetoolsProduct),
      total: response.body.total || 0,
      count: response.body.count || 0,
      offset: response.body.offset || 0,
      limit: response.body.limit || 0,
    }
  } catch (error) {
    console.error('Error fetching products from commercetools:', error)
    throw error
  }
}

/**
 * Fetch a single product by slug from commercetools
 * Uses exact slug matching - the slug must match exactly what's stored in commercetools
 */
export async function fetchCommercetoolsProductBySlug(
  slug: string,
  options?: {
    locale?: string
  }
) {
  const apiRoot = getCommercetoolsApiRoot()
  const locale = options?.locale || 'en'

  try {
    // commercetools slug query format: slug(locale="value")
    // Try the provided locale first, then fallback to common locales
    const localeVariants = [
      locale, // e.g., "en"
      'en',   // English fallback
      'en-US', // US English
      locale.split('-')[0], // Base locale if locale is like "en-US" -> "en"
    ].filter((v, i, arr) => arr.indexOf(v) === i) // Remove duplicates

    for (const loc of localeVariants) {
      try {
        const whereClause = `slug(${loc}="${slug}")`

        const response = await apiRoot
          .productProjections()
          .get({
            queryArgs: {
              where: [whereClause],
              limit: 1,
              localeProjection: locale,
            },
          })
          .execute()

        if (response.body.results.length > 0) {
          return transformCommercetoolsProduct(response.body.results[0])
        }
      } catch (err) {
        // If query syntax is invalid, try next locale variant
        console.warn(`[commercetools] Query failed for locale "${loc}":`, err)
        continue
      }
    }

    // If we get here, product wasn't found with any locale variant
    console.error(`[commercetools] Product not found with slug: "${slug}"`)
    console.error(`[commercetools] Tried locales: ${localeVariants.join(', ')}`)
    console.error(`[commercetools] Make sure the slug "${slug}" exists in commercetools and matches exactly (including case and special characters)`)

    return null
  } catch (error) {
    console.error('[commercetools] Error fetching product by slug:', error)
    throw error
  }
}

/**
 * Fetch a single product by ID from commercetools
 */
export async function fetchCommercetoolsProductById(
  id: string,
  options?: {
    locale?: string
  }
) {
  const apiRoot = getCommercetoolsApiRoot()
  const locale = options?.locale || 'en'

  try {
    const response = await apiRoot
      .products()
      .withId({ ID: id })
      .get({
        queryArgs: {
          localeProjection: locale,
        },
      })
      .execute()

    return transformCommercetoolsProduct(response.body)
  } catch (error) {
    console.error('Error fetching product by ID from commercetools:', error)
    throw error
  }
}


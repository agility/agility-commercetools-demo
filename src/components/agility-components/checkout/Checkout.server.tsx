import { getContentItem } from "@/lib/cms/getContentItem"
import type { UnloadedModuleProps } from "@agility/nextjs"
import { CheckoutClient } from "./CheckoutClient"

interface ICheckout {
  heading?: string
  description?: string
  taxRate?: string
}

/**
 * Checkout Server Component
 * Fetches configuration from Agility CMS and renders checkout page
 */
export const Checkout = async ({ module, languageCode }: UnloadedModuleProps) => {
  const {
    fields: { heading = "Checkout", description, taxRate = "0.1" },
    contentID,
  } = await getContentItem<ICheckout>({
    contentID: module.contentid,
    languageCode,
  })

  return (
    <CheckoutClient
      heading={heading}
      description={description}
      taxRate={parseFloat(taxRate)}
      contentID={contentID.toString()}
    />
  )
}

export default Checkout

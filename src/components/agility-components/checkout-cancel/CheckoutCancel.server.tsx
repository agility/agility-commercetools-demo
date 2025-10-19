import { getContentItem } from "@/lib/cms/getContentItem"
import type { UnloadedModuleProps } from "@agility/nextjs"
import { CheckoutCancelClient } from "./CheckoutCancelClient"

interface ICheckoutCancel {
  heading?: string
  description?: string
  supportEmail?: string
}

/**
 * Checkout Cancel Server Component
 * Fetches configuration from Agility CMS and renders cancel page
 */
export const CheckoutCancel = async ({ module, languageCode }: UnloadedModuleProps) => {
  const {
    fields: {
      heading = "Checkout Cancelled",
      description = "Your checkout has been cancelled. No charges have been made to your payment method.",
      supportEmail = "support@example.com",
    },
    contentID,
  } = await getContentItem<ICheckoutCancel>({
    contentID: module.contentid,
    languageCode,
  })

  return (
    <CheckoutCancelClient
      heading={heading}
      description={description}
      supportEmail={supportEmail}
      contentID={contentID.toString()}
    />
  )
}

export default CheckoutCancel

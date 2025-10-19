import { getContentItem } from "@/lib/cms/getContentItem"
import type { UnloadedModuleProps } from "@agility/nextjs"
import { CheckoutSuccessClient } from "./CheckoutSuccessClient"

interface ICheckoutSuccess {
  heading?: string
  description?: string
  supportEmail?: string
}

/**
 * Checkout Success Server Component
 * Fetches configuration from Agility CMS and renders success page
 */
export const CheckoutSuccess = async ({ module, languageCode }: UnloadedModuleProps) => {
  const {
    fields: {
      heading = "Order Confirmed!",
      description = "Thank you for your purchase. Your order has been successfully processed.",
      supportEmail = "support@example.com",
    },
    contentID,
  } = await getContentItem<ICheckoutSuccess>({
    contentID: module.contentid,
    languageCode,
  })

  return (
    <CheckoutSuccessClient
      heading={heading}
      description={description}
      supportEmail={supportEmail}
      contentID={contentID.toString()}
    />
  )
}

export default CheckoutSuccess

import { getContentItem } from "@/lib/cms/getContentItem"
import type { UnloadedModuleProps } from "@agility/nextjs"
import { AccountOverviewClient } from "./AccountOverviewClient"

interface IAccountOverview {
  heading?: string
  description?: string
  portalButtonText?: string
}

/**
 * Account Overview Server Component
 * Fetches configuration from Agility CMS and renders account page
 */
export const AccountOverview = async ({ module, languageCode }: UnloadedModuleProps) => {
  const {
    fields: {
      heading = "My Account",
      description,
      portalButtonText = "Manage Billing & Subscriptions",
    },
    contentID,
  } = await getContentItem<IAccountOverview>({
    contentID: module.contentid,
    languageCode,
  })

  return (
    <AccountOverviewClient
      heading={heading}
      description={description}
      portalButtonText={portalButtonText}
      contentID={contentID.toString()}
    />
  )
}

export default AccountOverview

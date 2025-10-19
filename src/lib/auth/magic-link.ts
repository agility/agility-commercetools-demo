import crypto from "crypto"
import { put, del, head } from "@vercel/blob"

interface TokenData {
  email: string
  customerId: string
  expiresAt: number
}

/**
 * Generate a secure magic link token and store it in Vercel Blob
 */
export async function generateMagicLinkToken(email: string, customerId: string): Promise<string> {
  console.log("[magic-link] Generating token for:", { email, customerId })
  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = Date.now() + 15 * 60 * 1000 // 15 minutes

  const tokenData: TokenData = {
    email,
    customerId,
    expiresAt,
  }

  // Store token in Vercel Blob with a unique blob name
  // Using the token as the blob name for easy retrieval
  const blobName = `magic-link-tokens/${token}.json`

  try {
    await put(blobName, JSON.stringify(tokenData), {
      access: "public",
      addRandomSuffix: false,
    })

    console.log("[magic-link] Token generated and stored:", {
      token: token.substring(0, 8) + "...",
      expiresAt: new Date(expiresAt).toISOString(),
      blobName,
    })

    return token
  } catch (error) {
    console.error("[magic-link] Failed to store token:", error)
    throw new Error("Failed to generate magic link token")
  }
}

/**
 * Verify and consume a magic link token from Vercel Blob
 * Returns customer ID if valid, null otherwise
 */
export async function verifyMagicLinkToken(
  token: string
): Promise<{ email: string; customerId: string } | null> {
  console.log("[magic-link] Verifying token:", {
    token: token.substring(0, 8) + "...",
  })

  const blobName = `magic-link-tokens/${token}.json`

  try {
    // Check if the blob exists
    const blobInfo = await head(blobName)

    if (!blobInfo) {
      console.log("[magic-link] Token not found in blob storage")
      return null
    }

    // Fetch the token data
    const response = await fetch(blobInfo.url)
    if (!response.ok) {
      console.log("[magic-link] Failed to fetch token data")
      return null
    }

    const data: TokenData = await response.json()

    // Check if token has expired
    if (Date.now() > data.expiresAt) {
      console.log("[magic-link] Token expired:", {
        expiresAt: new Date(data.expiresAt).toISOString(),
        now: new Date().toISOString(),
      })
      // Delete expired token
      await del(blobInfo.url)
      return null
    }

    // Token is valid - consume it (one-time use) by deleting from blob storage
    await del(blobInfo.url)

    console.log("[magic-link] Token verified successfully:", {
      email: data.email,
      customerId: data.customerId,
    })

    return {
      email: data.email,
      customerId: data.customerId,
    }
  } catch (error) {
    console.error("[magic-link] Error verifying token:", error)
    return null
  }
}

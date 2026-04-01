import { logger } from './logger'

// ─── Meta OAuth Helpers ──────────────────────────────────────────────────────
// Shared utilities for Instagram, Messenger, and WhatsApp OAuth flows

const META_GRAPH_URL = 'https://graph.facebook.com/v21.0'

interface MetaTokenResponse {
  access_token: string
  token_type: string
  expires_in?: number
  error?: { message: string; type: string; code: number }
}

interface MetaPageData {
  id: string
  name: string
  access_token: string
  instagram_business_account?: { id: string }
}

interface MetaPagesResponse {
  data: MetaPageData[]
  error?: { message: string }
}

export interface ConnectedPage {
  pageId: string
  pageName: string
  pageAccessToken: string
  instagramAccountId: string | null
}

/**
 * Exchange short-lived token for long-lived token (60 days).
 */
export async function exchangeForLongLivedToken(
  shortLivedToken: string
): Promise<{ token: string; expiresIn: number } | null> {
  const appId = process.env.META_APP_ID
  const appSecret = process.env.META_APP_SECRET

  if (!appId || !appSecret) {
    logger.error('META_APP_ID or META_APP_SECRET not configured')
    return null
  }

  try {
    const res = await fetch(
      `${META_GRAPH_URL}/oauth/access_token?` +
        new URLSearchParams({
          grant_type: 'fb_exchange_token',
          client_id: appId,
          client_secret: appSecret,
          fb_exchange_token: shortLivedToken,
        })
    )
    const data = (await res.json()) as MetaTokenResponse
    if (data.error) {
      logger.error('Meta token exchange error', { error: data.error.message })
      return null
    }
    return { token: data.access_token, expiresIn: data.expires_in ?? 5184000 }
  } catch (error) {
    logger.error('Meta token exchange failed', { error: String(error) })
    return null
  }
}

/**
 * Refresh a long-lived user token before it expires.
 */
export async function refreshLongLivedToken(
  currentToken: string
): Promise<{ token: string; expiresIn: number } | null> {
  const appId = process.env.META_APP_ID
  const appSecret = process.env.META_APP_SECRET

  if (!appId || !appSecret) return null

  try {
    const res = await fetch(
      `${META_GRAPH_URL}/oauth/access_token?` +
        new URLSearchParams({
          grant_type: 'fb_exchange_token',
          client_id: appId,
          client_secret: appSecret,
          fb_exchange_token: currentToken,
        })
    )
    const data = (await res.json()) as MetaTokenResponse
    if (data.error) {
      logger.error('Meta token refresh error', { error: data.error.message })
      return null
    }
    return { token: data.access_token, expiresIn: data.expires_in ?? 5184000 }
  } catch {
    return null
  }
}

/**
 * Get all Facebook Pages the user manages, including Instagram accounts.
 */
export async function getUserPages(userToken: string): Promise<ConnectedPage[]> {
  try {
    const res = await fetch(
      `${META_GRAPH_URL}/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${userToken}`
    )
    const data = (await res.json()) as MetaPagesResponse
    if (data.error) {
      logger.error('Meta pages fetch error', { error: data.error.message })
      return []
    }

    return data.data.map((page) => ({
      pageId: page.id,
      pageName: page.name,
      pageAccessToken: page.access_token,
      instagramAccountId: page.instagram_business_account?.id ?? null,
    }))
  } catch {
    return []
  }
}

/**
 * Subscribe a page to webhook events (messages, messaging_postbacks, etc.).
 */
export async function subscribePageToWebhook(
  pageId: string,
  pageAccessToken: string,
  fields: string[] = ['messages', 'messaging_postbacks', 'messaging_optins']
): Promise<boolean> {
  try {
    const res = await fetch(
      `${META_GRAPH_URL}/${pageId}/subscribed_apps`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscribed_fields: fields,
          access_token: pageAccessToken,
        }),
      }
    )
    const data = (await res.json()) as { success?: boolean; error?: { message: string } }
    if (data.error) {
      logger.error('Webhook subscription error', { pageId, error: data.error.message })
      return false
    }
    return data.success === true
  } catch {
    return false
  }
}

/**
 * Verify webhook signature from Meta (X-Hub-Signature-256).
 */
export async function verifyWebhookSignature(
  payload: string,
  signature: string | null
): Promise<boolean> {
  const appSecret = process.env.META_APP_SECRET
  if (!appSecret) {
    console.warn('[Meta OAuth] META_APP_SECRET not set — skipping signature verification')
    return true
  }
  if (!signature) return false

  try {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(appSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
    const expectedSig = 'sha256=' + Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    return signature === expectedSig
  } catch {
    return false
  }
}

/**
 * Get WhatsApp Business Account info after Embedded Signup.
 */
export async function getWhatsAppBusinessInfo(
  userToken: string,
  wabaId: string
): Promise<{
  phoneNumberId: string
  displayPhoneNumber: string
} | null> {
  try {
    const res = await fetch(
      `${META_GRAPH_URL}/${wabaId}/phone_numbers?access_token=${userToken}`
    )
    const data = (await res.json()) as {
      data?: Array<{ id: string; display_phone_number: string }>
      error?: { message: string }
    }
    if (data.error || !data.data?.length) return null

    return {
      phoneNumberId: data.data[0].id,
      displayPhoneNumber: data.data[0].display_phone_number,
    }
  } catch {
    return null
  }
}

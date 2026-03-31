import crypto from 'crypto'

export interface TelegramLoginData {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

/**
 * Verify Telegram Login Widget data using HMAC-SHA-256.
 * https://core.telegram.org/widgets/login#checking-authorization
 */
export function verifyTelegramLogin(data: TelegramLoginData, botToken: string): boolean {
  const { hash, ...rest } = data

  // Check auth_date is not too old (allow 1 hour)
  const now = Math.floor(Date.now() / 1000)
  if (now - data.auth_date > 3600) return false

  // Build check string: sorted key=value pairs
  const checkString = Object.keys(rest)
    .sort()
    .map((key) => `${key}=${rest[key as keyof typeof rest]}`)
    .join('\n')

  // Secret key = SHA256(bot_token)
  const secretKey = crypto.createHash('sha256').update(botToken).digest()

  // HMAC-SHA-256
  const hmac = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex')

  return hmac === hash
}

/**
 * Normalize Uzbek phone number to +998XXXXXXXXX format.
 * Accepts: +998901234567, 998901234567, 901234567, +998 90 123 45 67, etc.
 */
export function formatPhoneUz(raw: string): string {
  const digits = raw.replace(/\D/g, '')

  if (digits.length === 9) {
    return `+998${digits}`
  }
  if (digits.length === 12 && digits.startsWith('998')) {
    return `+${digits}`
  }
  if (digits.length === 13 && digits.startsWith('998')) {
    return `+${digits.slice(0, 12)}`
  }

  // Fallback: try to extract 9 digits after country code
  if (digits.startsWith('998') && digits.length >= 12) {
    return `+${digits.slice(0, 12)}`
  }
  if (digits.length === 9) {
    return `+998${digits}`
  }

  // Return as-is with + prefix if we can't parse
  return digits.startsWith('998') ? `+${digits}` : `+998${digits}`
}

/**
 * Generate 6-digit verification code.
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Display phone in readable format: +998 (90) 123-45-67
 */
export function displayPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('998')) {
    const cc = digits.slice(0, 3)
    const op = digits.slice(3, 5)
    const p1 = digits.slice(5, 8)
    const p2 = digits.slice(8, 10)
    const p3 = digits.slice(10, 12)
    return `+${cc} (${op}) ${p1}-${p2}-${p3}`
  }
  return phone
}

/**
 * Validate Uzbek phone number format.
 */
export function isValidUzPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, '')
  // 9 digits (local) or 12 digits (with country code 998)
  if (digits.length === 9) return true
  if (digits.length === 12 && digits.startsWith('998')) return true
  return false
}

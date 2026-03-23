/**
 * Sanitize user input — remove potential XSS patterns.
 */
export function sanitizeUserInput(text: string): string {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .trim()
}

/**
 * Sanitize text before sending to AI — detect prompt injection attempts.
 * Returns sanitized text and whether injection was detected.
 */
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+|previous\s+|your\s+)?instructions/i,
  /you\s+are\s+now/i,
  /system:\s/i,
  /\[INST\]/i,
  /\[\/INST\]/i,
  /<<SYS>>/i,
  /pretend\s+you\s+are/i,
  /act\s+as\s+if/i,
  /new\s+instructions:/i,
  /override\s+(previous\s+)?instructions/i,
  /disregard\s+(all\s+|previous\s+)?/i,
  /forget\s+(everything|all|your)\s/i,
]

export function sanitizeForAI(text: string): { text: string; injectionDetected: boolean } {
  let injectionDetected = false

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      injectionDetected = true
      break
    }
  }

  // Remove common injection markers but keep the content
  const sanitized = text
    .replace(/\[INST\]/gi, '')
    .replace(/\[\/INST\]/gi, '')
    .replace(/<<SYS>>/gi, '')
    .replace(/<\/SYS>/gi, '')
    .trim()

  return { text: sanitized, injectionDetected }
}

/**
 * Validate Telegram bot token format.
 */
export function isValidTelegramToken(token: string): boolean {
  return /^\d{8,10}:[A-Za-z0-9_-]{35}$/.test(token.trim())
}

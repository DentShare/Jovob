const requests = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(ip: string, limit: number = 60, windowMs: number = 60000): boolean {
  const now = Date.now()
  const record = requests.get(ip)

  if (!record || now > record.resetAt) {
    requests.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (record.count >= limit) return false
  record.count++
  return true
}

// Cleanup old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [ip, record] of requests) {
      if (now > record.resetAt) requests.delete(ip)
    }
  }, 300000)
}

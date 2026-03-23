import Redis from 'ioredis'

let redis: Redis | null = null

function getRedis(): Redis | null {
  if (redis) return redis
  const url = process.env.REDIS_URL
  if (!url) return null
  try {
    redis = new Redis(url, { maxRetriesPerRequest: 1, lazyConnect: true })
    redis.connect().catch(() => {
      redis = null
    })
    return redis
  } catch {
    return null
  }
}

// In-memory fallback when Redis is unavailable
const memoryStore = new Map<string, { count: number; resetAt: number }>()

export async function rateLimit(
  ip: string,
  limit: number = 60,
  windowMs: number = 60000
): Promise<boolean> {
  const client = getRedis()

  if (client) {
    try {
      const key = `rl:${ip}`
      const windowSec = Math.ceil(windowMs / 1000)
      const count = await client.incr(key)
      if (count === 1) {
        await client.expire(key, windowSec)
      }
      return count <= limit
    } catch {
      // Fall through to in-memory
    }
  }

  // In-memory fallback
  const now = Date.now()
  const record = memoryStore.get(ip)

  if (!record || now > record.resetAt) {
    memoryStore.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (record.count >= limit) return false
  record.count++
  return true
}

// Cleanup in-memory entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [ip, record] of memoryStore) {
      if (now > record.resetAt) memoryStore.delete(ip)
    }
  }, 300000)
}

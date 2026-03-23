import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/server/routers/_app'
import { createContext } from '@/server/trpc'
import { rateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

const handler = async (req: Request) => {
  // Rate limiting by IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown'

  if (!(await rateLimit(ip))) {
    logger.warn('Rate limit exceeded', { ip, path: req.url })
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': '60' },
    })
  }

  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext(),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(
              `tRPC error on '${path ?? '<no-path>'}':`,
              error.message
            )
          }
        : ({ path, error }) => {
            logger.error('tRPC error', { path: path ?? '<no-path>', message: error.message })
          },
  })
}

export { handler as GET, handler as POST }

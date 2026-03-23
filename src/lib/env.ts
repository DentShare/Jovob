import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  NEXTAUTH_URL: z.string().url().optional(),
  OPENAI_API_KEY: z.string().optional(),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_WEBHOOK_URL: z.string().url().optional(),
  REDIS_URL: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().optional(),
  NEXT_PUBLIC_BOT_USERNAME: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors)
    // Don't throw during build — just warn
    if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
      console.warn('Some environment variables are missing. Features may not work.')
    }
    return process.env as unknown as Env
  }
  return parsed.data
}

export const env = validateEnv()

import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import type { PrismaClient } from '@prisma/client'
import type { Session } from 'next-auth'

// ─── Extend NextAuth types to include user.id ────────────────────────────────

declare module 'next-auth' {
  interface Session {
    user?: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

export interface Context {
  prisma: PrismaClient
  session: Session | null
}

export async function createContext(): Promise<Context> {
  const session = await getServerSession().catch(() => null)

  return {
    prisma,
    session,
  }
}

// ─── tRPC Init ───────────────────────────────────────────────────────────────

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape
  },
})

// ─── Middlewares ──────────────────────────────────────────────────────────────

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to perform this action',
    })
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  })
})

// ─── Exports ─────────────────────────────────────────────────────────────────

export const router = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(isAuthed)

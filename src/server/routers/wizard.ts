import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import type { Prisma } from '@prisma/client'
import { router, protectedProcedure } from '../trpc'

// ─── Wizard step schemas ─────────────────────────────────────────────────────

const wizardStepDataSchema = z.record(z.string(), z.unknown())

/**
 * Wizard state is stored as a JSON object in cookies via a WizardSession
 * concept. Since we need persistence across requests, we store it in a
 * simple key-value table or use the user's session metadata.
 *
 * For simplicity, we use a prisma-backed approach: store wizard progress
 * in a JSON field associated with the user. We'll use a convention where
 * the bot's creation is tracked with a temporary "draft" bot approach.
 *
 * Implementation: We store wizard state as JSON in memory keyed by
 * `userId:wizardId`. In production, replace with Redis or a DB table.
 */

// In-memory store for wizard sessions (replace with Redis in production)
const wizardStore = new Map<
  string,
  {
    steps: Record<number, unknown>
    updatedAt: Date
  }
>()

// Clean up old wizard sessions (older than 24 hours)
function cleanupWizardStore() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
  for (const [key, value] of wizardStore.entries()) {
    if (value.updatedAt < cutoff) {
      wizardStore.delete(key)
    }
  }
}

export const wizardRouter = router({
  // ─── Save a wizard step ────────────────────────────────────────────────────
  saveStep: protectedProcedure
    .input(
      z.object({
        wizardId: z.string().default('default'),
        step: z.number().int().min(1).max(10),
        data: wizardStepDataSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const key = `${userId}:${input.wizardId}`

      const existing = wizardStore.get(key) ?? {
        steps: {},
        updatedAt: new Date(),
      }

      existing.steps[input.step] = input.data
      existing.updatedAt = new Date()
      wizardStore.set(key, existing)

      // Periodic cleanup
      if (Math.random() < 0.1) cleanupWizardStore()

      return {
        step: input.step,
        totalSteps: Object.keys(existing.steps).length,
      }
    }),

  // ─── Get wizard progress ──────────────────────────────────────────────────
  getProgress: protectedProcedure
    .input(
      z.object({
        wizardId: z.string().default('default'),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const key = `${userId}:${input.wizardId}`

      const session = wizardStore.get(key)
      if (!session) {
        return {
          steps: {} as Record<number, unknown>,
          currentStep: 0,
          isComplete: false,
        }
      }

      const completedSteps = Object.keys(session.steps)
        .map(Number)
        .sort((a, b) => a - b)
      const currentStep =
        completedSteps.length > 0
          ? completedSteps[completedSteps.length - 1]
          : 0

      return {
        steps: session.steps,
        currentStep,
        isComplete: false,
      }
    }),

  // ─── Complete wizard — create bot from all steps ──────────────────────────
  complete: protectedProcedure
    .input(
      z.object({
        wizardId: z.string().default('default'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id as string
      const key = `${userId}:${input.wizardId}`

      const session = wizardStore.get(key)
      if (!session || Object.keys(session.steps).length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No wizard data found. Please complete the wizard steps first.',
        })
      }

      // Aggregate all step data
      const allData = Object.values(session.steps).reduce<
        Record<string, unknown>
      >((acc, stepData) => {
        if (stepData && typeof stepData === 'object') {
          return { ...acc, ...(stepData as Record<string, unknown>) }
        }
        return acc
      }, {})

      // Validate required fields for bot creation
      const name = allData.name as string | undefined
      const description = allData.description as string | undefined
      const businessType = allData.businessType as string | undefined
      const welcomeMessage = allData.welcomeMessage as string | undefined

      if (!name || !description || !businessType || !welcomeMessage) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Missing required fields: name, description, businessType, and welcomeMessage are required.',
        })
      }

      // Create the bot with all aggregated data
      const bot = await ctx.prisma.bot.create({
        data: {
          userId,
          name,
          description,
          businessType,
          botLanguages: (allData.botLanguages as string[]) ?? ['ru'],
          personality: (allData.personality as string) ?? 'friendly',
          welcomeMessage,
          workingHours: allData.workingHours as Prisma.InputJsonValue | undefined,
          address: allData.address as string | undefined,
          managerContact: allData.managerContact as string | undefined,
          telegramToken: allData.telegramToken as string | undefined,
          capabilities: (allData.capabilities as string[]) ?? [],
          scenario: allData.scenario as Prisma.InputJsonValue | undefined,
        },
      })

      // Create products if provided in wizard
      const products = allData.products as
        | Array<{
            name: string
            price: number
            description?: string
            category?: string
          }>
        | undefined

      if (products && products.length > 0) {
        await ctx.prisma.product.createMany({
          data: products.map((p, index) => ({
            botId: bot.id,
            name: p.name,
            price: p.price,
            description: p.description,
            category: p.category,
            sortOrder: index,
          })),
        })
      }

      // Create FAQ items if provided
      const faqItems = allData.faqItems as
        | Array<{ question: string; answer: string }>
        | undefined

      if (faqItems && faqItems.length > 0) {
        await ctx.prisma.fAQItem.createMany({
          data: faqItems.map((f, index) => ({
            botId: bot.id,
            question: f.question,
            answer: f.answer,
            sortOrder: index,
          })),
        })
      }

      // Clean up wizard session
      wizardStore.delete(key)

      // Return the created bot with relations
      const fullBot = await ctx.prisma.bot.findUnique({
        where: { id: bot.id },
        include: {
          products: true,
          faqItems: true,
        },
      })

      return fullBot
    }),
})

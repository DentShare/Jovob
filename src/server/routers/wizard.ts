import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import type { Prisma } from '@prisma/client'
import { router, publicProcedure } from '../trpc'

// ─── Wizard step schemas ─────────────────────────────────────────────────────

const wizardStepDataSchema = z.record(z.string(), z.unknown())

/**
 * Wizard state is stored in the WizardSession Prisma model.
 * Steps are persisted as a JSON object keyed by step number.
 *
 * All procedures are publicProcedure so the wizard works before auth.
 * We resolve the identifier as: session userId (if authenticated) OR clientId from input.
 */

function resolveUserId(
  session: { user?: { id?: string } } | null,
  clientId?: string
): string {
  const userId = session?.user?.id
  if (userId) return userId
  if (clientId) return `client:${clientId}`
  throw new TRPCError({
    code: 'BAD_REQUEST',
    message: 'Either authentication or clientId is required.',
  })
}

export const wizardRouter = router({
  // ─── Save a wizard step ────────────────────────────────────────────────────
  saveStep: publicProcedure
    .input(
      z.object({
        wizardId: z.string().default('default'),
        step: z.number().int().min(1).max(10),
        data: wizardStepDataSchema,
        clientId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = resolveUserId(ctx.session, input.clientId)

      // Read existing session to merge steps
      const existing = await ctx.prisma.wizardSession.findUnique({
        where: { userId },
      })

      const currentSteps =
        (existing?.steps as Record<string, unknown>) ?? {}
      const updatedSteps = {
        ...currentSteps,
        [input.step]: input.data,
      }

      await ctx.prisma.wizardSession.upsert({
        where: { userId },
        create: {
          userId,
          steps: updatedSteps as Prisma.InputJsonValue,
        },
        update: {
          steps: updatedSteps as Prisma.InputJsonValue,
        },
      })

      return {
        step: input.step,
        totalSteps: Object.keys(updatedSteps).length,
      }
    }),

  // ─── Get wizard progress ──────────────────────────────────────────────────
  getProgress: publicProcedure
    .input(
      z.object({
        wizardId: z.string().default('default'),
        clientId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = resolveUserId(ctx.session, input.clientId)

      const session = await ctx.prisma.wizardSession.findUnique({
        where: { userId },
      })

      if (!session) {
        return {
          steps: {} as Record<string, unknown>,
          currentStep: 0,
          isComplete: false,
        }
      }

      const steps = (session.steps as Record<string, unknown>) ?? {}
      const completedSteps = Object.keys(steps)
        .map(Number)
        .filter((n) => !isNaN(n))
        .sort((a, b) => a - b)
      const currentStep =
        completedSteps.length > 0
          ? completedSteps[completedSteps.length - 1]
          : 0

      return {
        steps,
        currentStep,
        isComplete: false,
      }
    }),

  // ─── Complete wizard — create bot from all steps ──────────────────────────
  complete: publicProcedure
    .input(
      z.object({
        wizardId: z.string().default('default'),
        clientId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = resolveUserId(ctx.session, input.clientId)

      const wizardSession = await ctx.prisma.wizardSession.findUnique({
        where: { userId },
      })

      if (
        !wizardSession ||
        !wizardSession.steps ||
        Object.keys(wizardSession.steps as Record<string, unknown>).length === 0
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No wizard data found. Please complete the wizard steps first.',
        })
      }

      const stepsData = wizardSession.steps as Record<string, unknown>

      // Aggregate all step data into a flat object
      const allData = Object.values(stepsData).reduce<
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

      // For bot creation we need a real user ID (not client:xxx)
      // If authenticated, use session user id; otherwise the userId from resolveUserId
      const realUserId = ctx.session?.user?.id
      if (!realUserId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to create a bot.',
        })
      }

      // Create the bot with all aggregated data
      const bot = await ctx.prisma.bot.create({
        data: {
          userId: realUserId,
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

      // Clean up wizard session from DB
      await ctx.prisma.wizardSession.delete({
        where: { userId },
      })

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

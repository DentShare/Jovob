import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

/**
 * Transcribe voice file using OpenAI Whisper API.
 */
export async function transcribeVoice(fileBuffer: Buffer, fileName: string = 'voice.ogg'): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured')

  const openai = new OpenAI({ apiKey })

  const file = new File([new Uint8Array(fileBuffer)], fileName, { type: 'audio/ogg' })

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    language: 'ru',
  })

  return transcription.text
}

/**
 * Structure transcribed text into FAQ pairs using GPT.
 */
export async function structureKnowledge(
  text: string
): Promise<Array<{ question: string; answer: string }>> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured')

  const openai = new OpenAI({ apiKey })

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Ты помощник по структурированию знаний для чат-бота.
Получи текст и преобразуй его в пары "вопрос-ответ" для FAQ.
Каждый вопрос должен быть таким, какой мог бы задать клиент.
Ответ должен быть информативным и полным.
Верни JSON массив: [{"question": "...", "answer": "..."}]
Только валидный JSON, без markdown.`,
      },
      {
        role: 'user',
        content: text,
      },
    ],
    temperature: 0.3,
    max_tokens: 2048,
  })

  const responseText = completion.choices[0]?.message?.content?.trim() ?? '[]'

  try {
    return JSON.parse(responseText)
  } catch {
    logger.error('Failed to parse FAQ from voice', { responseText })
    return []
  }
}

/**
 * Process voice message from bot owner: transcribe → structure → save as FAQ.
 */
export async function processOwnerVoice(
  botId: string,
  fileBuffer: Buffer,
  fileName?: string
): Promise<Array<{ question: string; answer: string }>> {
  // 1. Transcribe
  const text = await transcribeVoice(fileBuffer, fileName)
  if (!text.trim()) return []

  // 2. Structure into FAQ
  const faqPairs = await structureKnowledge(text)
  if (faqPairs.length === 0) return []

  // 3. Save to DB
  const existingCount = await prisma.fAQItem.count({ where: { botId } })

  await prisma.fAQItem.createMany({
    data: faqPairs.map((f, i) => ({
      botId,
      question: f.question,
      answer: f.answer,
      isAutoGen: true,
      sortOrder: existingCount + i,
    })),
  })

  logger.info('Voice FAQ created', { botId, count: faqPairs.length })

  return faqPairs
}

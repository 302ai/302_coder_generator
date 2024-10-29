'use server'
import { logger } from '@/lib/logger'
import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { createStreamableValue } from 'ai/rsc'
import dedent from 'dedent'
import { env } from 'next-runtime-env'

export async function optimizePrompt({
  apiKey,
  model,
  prompt,
}: {
  apiKey: string
  model: string
  prompt: string
}) {
  const stream = createStreamableValue('')
  try {
    const openai = createOpenAI({
      apiKey,
      baseURL: env('NEXT_PUBLIC_API_URL') + '/v1',
    })

    ;(async () => {
      try {
        const { textStream } = await streamText({
          model: openai(model),
         prompt: dedent`
        I want you to improve the user prompt that is wrapped in \`<original_prompt>\` tags.

        IMPORTANT: Only respond with the improved prompt and nothing else!

        <original_prompt>
          ${prompt}
        </original_prompt>
         `
        });
        for await (const delta of textStream) {
          stream.update(delta)
        }

        stream.done()
      } catch (e: any) {
        logger.error(e)
        stream.error(e.responseBody)
      }
    })()
  } catch (error) {
    console.error(error)
  }
  return { output: stream.value }
}

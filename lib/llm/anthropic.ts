import Anthropic from '@anthropic-ai/sdk'
import type { LLMProvider, LLMMessage } from './types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export class AnthropicProvider implements LLMProvider {
  async *generateStream(params: {
    systemPrompt: string
    messages: LLMMessage[]
  }): AsyncIterable<string> {
    const stream = anthropic.messages.stream({
      model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: params.systemPrompt,
      messages: params.messages,
    })

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        yield event.delta.text
      }
    }
  }
}

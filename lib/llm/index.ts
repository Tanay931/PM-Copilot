import type { LLMProvider } from './types'
import { AnthropicProvider } from './anthropic'

export function getLLMProvider(): LLMProvider {
  const provider = process.env.LLM_PROVIDER || 'anthropic'
  switch (provider) {
    case 'anthropic':
      return new AnthropicProvider()
    default:
      return new AnthropicProvider()
  }
}

export type { LLMProvider, LLMMessage } from './types'

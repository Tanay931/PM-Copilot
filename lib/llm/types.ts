export interface LLMMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface LLMProvider {
  generateStream(params: {
    systemPrompt: string
    messages: LLMMessage[]
  }): AsyncIterable<string>
}

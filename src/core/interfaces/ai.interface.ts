export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiChatResponse {
  message: string;
  recommendedProviderIds: string[];
}

export interface IAiService {
  chat(
    messages: AiChatMessage[],
    systemPrompt: string,
  ): Promise<AiChatResponse>;
}


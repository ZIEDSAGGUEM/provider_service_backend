import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import type {
  IAiService,
  AiChatMessage,
  AiChatResponse,
} from '../../core/interfaces/ai.interface';

@Injectable()
export class GroqAiService implements IAiService {
  private readonly logger = new Logger(GroqAiService.name);
  private readonly client: Groq;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      this.logger.warn('GROQ_API_KEY is not set — AI chat will be unavailable');
    }
    this.client = new Groq({ apiKey: apiKey || '' });
    this.model = this.configService.get<string>('GROQ_MODEL') || 'llama-3.3-70b-versatile';
  }

  async chat(
    messages: AiChatMessage[],
    systemPrompt: string,
  ): Promise<AiChatResponse> {
    try {
      const groqMessages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ];

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: groqMessages,
        temperature: 0.7,
        max_tokens: 1024,
        response_format: { type: 'json_object' },
      });

      const rawContent = completion.choices?.[0]?.message?.content || '{}';
      this.logger.debug(`Groq raw response: ${rawContent}`);

      // Parse JSON response
      const parsed = JSON.parse(rawContent) as {
        message?: string;
        recommendedProviderIds?: string[];
      };

      return {
        message: parsed.message || 'Sorry, I could not process your request.',
        recommendedProviderIds: parsed.recommendedProviderIds || [],
      };
    } catch (error: any) {
      this.logger.error(`Groq API error: ${error.message}`);

      // Graceful fallback
      return {
        message:
          'I apologize, but I am temporarily unable to process your request. Please try again in a moment.',
        recommendedProviderIds: [],
      };
    }
  }
}


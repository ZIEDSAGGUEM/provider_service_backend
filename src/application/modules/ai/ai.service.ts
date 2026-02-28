import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IAiService, AiChatMessage } from '../../../core/interfaces/ai.interface';
import type { IProviderRepository } from '../../../core/repositories/provider.repository.interface';
import type { ICategoryRepository } from '../../../core/repositories/category.repository.interface';
import { AiChatResponseDto } from './dto/chat.dto';

@Injectable()
export class AiAppService {
  private readonly logger = new Logger(AiAppService.name);

  constructor(
    @Inject('IAiService')
    private readonly aiService: IAiService,
    @Inject('IProviderRepository')
    private readonly providerRepository: IProviderRepository,
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async chat(messages: AiChatMessage[]): Promise<AiChatResponseDto> {
    // 1. Fetch real data from DB
    const [categories, providers] = await Promise.all([
      this.categoryRepository.findAll(),
      this.providerRepository.findAll(),
    ]);

    // 2. Build the system prompt with real DB data
    const systemPrompt = this.buildSystemPrompt(categories, providers);
    this.logger.debug(
      `System prompt built with ${categories.length} categories and ${providers.length} providers`,
    );

    // 3. Call Groq via the AI service
    const aiResponse = await this.aiService.chat(messages, systemPrompt);

    // 4. Fetch full provider data for any recommended IDs
    let recommendedProviders: any[] = [];
    if (aiResponse.recommendedProviderIds.length > 0) {
      const fullProviders = await Promise.all(
        aiResponse.recommendedProviderIds.map((id) =>
          this.providerRepository.findById(id).catch(() => null),
        ),
      );
      recommendedProviders = fullProviders.filter(Boolean);
    }

    return new AiChatResponseDto(aiResponse.message, recommendedProviders);
  }

  private buildSystemPrompt(categories: any[], providers: any[]): string {
    const categoryList = categories
      .map((c) => `- ${c.name} (id: ${c.id}): ${c.description}`)
      .join('\n');

    const providerList = providers
      .map(
        (p) =>
          `- ${p.user?.name || 'Unknown'} | Category: ${p.category?.name || 'N/A'} | Rating: ${p.rating}/5 (${p.reviewCount} reviews) | $${p.hourlyRate}/hr | ${p.availability} | Skills: ${p.skills?.join(', ') || 'N/A'} | Experience: ${p.yearsExperience}yrs | Location: ${p.user?.location || 'N/A'} | ID: ${p.id}`,
      )
      .join('\n');

    return `You are LocalPro AI Assistant — a helpful, friendly assistant for a local services marketplace platform.

AVAILABLE SERVICE CATEGORIES:
${categoryList || '(No categories available)'}

REGISTERED SERVICE PROVIDERS:
${providerList || '(No providers registered yet)'}

INSTRUCTIONS:
1. You can answer ANY question about our platform: services, providers, categories, pricing, availability, how to book, etc.
2. When the user asks to find or recommend providers, pick the best matches from the list above and include their IDs in "recommendedProviderIds".
3. When no specific provider recommendation is needed (e.g. general questions, greetings, help), leave "recommendedProviderIds" as an empty array.
4. Only recommend providers that actually exist in the data above. Never invent providers.
5. Be conversational, helpful, and concise.
6. If a user asks for something outside our platform scope, politely redirect them.

You MUST always respond in this exact JSON format:
{
  "message": "Your response text here. Use markdown for formatting (bold, lists, etc.).",
  "recommendedProviderIds": ["provider-id-1", "provider-id-2"]
}`;
  }
}


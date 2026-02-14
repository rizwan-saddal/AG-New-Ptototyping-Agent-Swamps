// Google Gemini Provider Implementation

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ModelProvider, ModelConfig } from './ModelProvider.js';
import type { GenerateOptions, ModelCapabilities } from '../shared/types.js';

export class GeminiProvider implements ModelProvider {
  name = 'gemini';
  capabilities: ModelCapabilities;
  
  private client: GoogleGenerativeAI;
  private modelName: string;

  constructor(config: ModelConfig) {
    this.client = new GoogleGenerativeAI(config.apiKey);
    this.modelName = config.model || 'gemini-1.5-pro';
    
    this.capabilities = {
      maxTokens: 1000000,
      supportsStreaming: true,
      supportsEmbedding: true,
      supportedModalities: ['text', 'image']
    };
  }

  async generate(prompt: string, options?: GenerateOptions): Promise<string> {
    const model = this.client.getGenerativeModel({ 
      model: this.modelName 
    });

    const generationConfig = {
      temperature: options?.temperature ?? 0.7,
      topP: options?.topP ?? 0.95,
      topK: options?.topK ?? 40,
      maxOutputTokens: options?.maxTokens ?? 2048,
    };

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig
    });

    const response = result.response;
    return response.text();
  }

  async *generateStream(prompt: string, options?: GenerateOptions): AsyncIterator<string> {
    const model = this.client.getGenerativeModel({ 
      model: this.modelName 
    });

    const generationConfig = {
      temperature: options?.temperature ?? 0.7,
      topP: options?.topP ?? 0.95,
      topK: options?.topK ?? 40,
      maxOutputTokens: options?.maxTokens ?? 2048,
    };

    const result = await model.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig
    });

    for await (const chunk of result.stream) {
      yield chunk.text();
    }
  }

  async embed(text: string): Promise<number[]> {
    const model = this.client.getGenerativeModel({ 
      model: 'text-embedding-004'
    });

    const result = await model.embedContent(text);
    return result.embedding.values;
  }

  getCapabilities(): ModelCapabilities {
    return this.capabilities;
  }
}

// Model Router - Manages multiple model providers with load balancing

import type { ModelProvider } from './ModelProvider.js';
import type { GenerateOptions } from '../shared/types.js';

interface ProviderStats {
  requestCount: number;
  errorCount: number;
  lastUsed: Date;
}

export class ModelRouter {
  private providers: Map<string, ModelProvider> = new Map();
  private providerStats: Map<string, ProviderStats> = new Map();
  private defaultProvider: string = 'gemini';

  registerProvider(name: string, provider: ModelProvider): void {
    this.providers.set(name, provider);
    this.providerStats.set(name, {
      requestCount: 0,
      errorCount: 0,
      lastUsed: new Date()
    });
  }

  setDefaultProvider(name: string): void {
    if (!this.providers.has(name)) {
      throw new Error(`Provider ${name} not registered`);
    }
    this.defaultProvider = name;
  }

  async generate(prompt: string, options?: GenerateOptions): Promise<string> {
    const provider = this.selectProvider(options);
    const stats = this.providerStats.get(provider.name)!;

    try {
      stats.requestCount++;
      stats.lastUsed = new Date();
      
      const result = await provider.generate(prompt, options);
      return result;
    } catch (error) {
      stats.errorCount++;
      
      // Try fallback if primary fails
      if (options?.preferredProvider && this.providers.size > 1) {
        console.warn(`Provider ${provider.name} failed, trying fallback`);
        return this.generateWithFallback(prompt, options, provider.name);
      }
      
      throw error;
    }
  }

  async *generateStream(prompt: string, options?: GenerateOptions): AsyncIterator<string> {
    const provider = this.selectProvider(options);
    const stats = this.providerStats.get(provider.name)!;

    stats.requestCount++;
    stats.lastUsed = new Date();

    try {
      yield* provider.generateStream(prompt, options);
    } catch (error) {
      stats.errorCount++;
      throw error;
    }
  }

  async embed(text: string, providerName?: string): Promise<number[]> {
    const provider = providerName 
      ? this.providers.get(providerName)
      : this.providers.get(this.defaultProvider);

    if (!provider) {
      throw new Error(`Provider ${providerName || this.defaultProvider} not found`);
    }

    return provider.embed(text);
  }

  private selectProvider(options?: GenerateOptions): ModelProvider {
    // Use preferred provider if specified
    if (options?.preferredProvider) {
      const provider = this.providers.get(options.preferredProvider);
      if (provider) return provider;
    }

    // Use default provider
    const provider = this.providers.get(this.defaultProvider);
    if (!provider) {
      throw new Error('No providers available');
    }

    return provider;
  }

  private async generateWithFallback(
    prompt: string,
    options: GenerateOptions,
    excludeProvider: string
  ): Promise<string> {
    for (const [name, provider] of this.providers) {
      if (name !== excludeProvider) {
        try {
          return await provider.generate(prompt, options);
        } catch (error) {
          console.warn(`Fallback provider ${name} also failed`);
        }
      }
    }

    throw new Error('All providers failed');
  }

  getStats(): Map<string, ProviderStats> {
    return new Map(this.providerStats);
  }

  healthCheck(): Map<string, boolean> {
    const health = new Map<string, boolean>();
    
    for (const [name, stats] of this.providerStats) {
      // Consider healthy if error rate < 50%
      const errorRate = stats.requestCount > 0 
        ? stats.errorCount / stats.requestCount 
        : 0;
      health.set(name, errorRate < 0.5);
    }

    return health;
  }
}

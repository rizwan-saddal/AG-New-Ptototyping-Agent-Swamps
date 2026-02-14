// Model Router - Manages multiple model providers with load balancing

import type { ModelProvider } from './ModelProvider.js';
import type { GenerateOptions } from '../shared/types.js';

interface ProviderStats {
  requestCount: number;
  errorCount: number;
  lastUsed: Date;
}

interface CircuitState {
  consecutiveFailures: number;
  lastFailure?: Date;
  openUntil?: number;
}

export class ModelRouter {
  private providers: Map<string, ModelProvider> = new Map();
  private providerStats: Map<string, ProviderStats> = new Map();
  private circuitBreakers: Map<string, CircuitState> = new Map();
  private defaultProvider: string = 'gemini';
  private failureThreshold = 3;
  private cooldownMs = 30000;

  registerProvider(name: string, provider: ModelProvider): void {
    this.providers.set(name, provider);
    this.providerStats.set(name, {
      requestCount: 0,
      errorCount: 0,
      lastUsed: new Date()
    });
    this.circuitBreakers.set(name, { consecutiveFailures: 0 });
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

    if (!this.isProviderAvailable(provider.name)) {
      return this.generateWithFallback(prompt, options || {}, provider.name);
    }

    try {
      stats.requestCount++;
      stats.lastUsed = new Date();
      this.recordSuccess(provider.name);
      
      const result = await provider.generate(prompt, options);
      return result;
    } catch (error) {
      stats.errorCount++;
      this.recordFailure(provider.name);
      
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

    if (!this.isProviderAvailable(provider.name)) {
      const fallbackStream = this.generateStreamWithFallback(prompt, options || {}, provider.name);
      for await (const chunk of fallbackStream) {
        yield chunk;
      }
      return;
    }

    stats.requestCount++;
    stats.lastUsed = new Date();

    try {
      const stream = provider.generateStream(prompt, options);
      for (;;) {
        const { value, done } = await stream.next();
        if (done) break;
        yield value;
      }
      this.recordSuccess(provider.name);
    } catch (error) {
      stats.errorCount++;
      this.recordFailure(provider.name);
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
      if (provider && this.isProviderAvailable(options.preferredProvider)) return provider;
    }

    const available = Array.from(this.providers.entries()).find(([name]) => 
      this.isProviderAvailable(name)
    );

    if (available) {
      return available[1];
    }

    throw new Error('No providers available');
  }

  private async generateWithFallback(
    prompt: string,
    options: GenerateOptions,
    excludeProvider: string
  ): Promise<string> {
    for (const [name, provider] of this.providers) {
      if (name !== excludeProvider && this.isProviderAvailable(name)) {
        try {
          const result = await provider.generate(prompt, options);
          this.recordSuccess(name);
          return result;
        } catch (error) {
          console.warn(`Fallback provider ${name} also failed`);
          this.recordFailure(name);
        }
      }
    }

    throw new Error('All providers failed');
  }

  private async *generateStreamWithFallback(
    prompt: string,
    options: GenerateOptions,
    excludeProvider: string
  ): AsyncGenerator<string> {
    for (const [name, provider] of this.providers) {
      if (name !== excludeProvider && this.isProviderAvailable(name)) {
        try {
          const stream = provider.generateStream(prompt, options);
          for (;;) {
            const { value, done } = await stream.next();
            if (done) break;
            yield value;
          }
          this.recordSuccess(name);
          return;
        } catch (error) {
          console.warn(`Fallback provider ${name} also failed`);
          this.recordFailure(name);
        }
      }
    }
    throw new Error('All providers failed');
  }

  private isProviderAvailable(name: string): boolean {
    const state = this.circuitBreakers.get(name);
    if (!state) return true;

    if (state.openUntil && Date.now() < state.openUntil) {
      return false;
    }

    return true;
  }

  private recordFailure(name: string): void {
    const state = this.circuitBreakers.get(name);
    if (!state) return;

    state.consecutiveFailures += 1;
    state.lastFailure = new Date();

    if (state.consecutiveFailures >= this.failureThreshold) {
      state.openUntil = Date.now() + this.cooldownMs;
    }
  }

  private recordSuccess(name: string): void {
    const state = this.circuitBreakers.get(name);
    if (!state) return;

    state.consecutiveFailures = 0;
    state.openUntil = undefined;
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
      const breaker = this.circuitBreakers.get(name);
      const isOpen = breaker?.openUntil ? Date.now() < breaker.openUntil : false;
      health.set(name, errorRate < 0.5 && !isOpen);
    }

    return health;
  }
}

// Model Provider Interface - supports multiple AI providers

import type { GenerateOptions, ModelCapabilities } from '../shared/types.js';

export interface ModelProvider {
  name: string;
  capabilities: ModelCapabilities;
  
  generate(prompt: string, options?: GenerateOptions): Promise<string>;
  generateStream(prompt: string, options?: GenerateOptions): AsyncIterator<string>;
  embed(text: string): Promise<number[]>;
  getCapabilities(): ModelCapabilities;
}

export interface ModelConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
}

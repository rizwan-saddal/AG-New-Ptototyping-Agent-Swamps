// SEO Agent - Specializes in search engine optimization and content optimization

import { Agent } from './Agent.js';
import type { ModelRouter } from '../models/ModelRouter.js';
import type { Task, TaskAnalysis, ValidationResult, AgentCapabilities } from '../shared/types.js';

export class SEOAgent extends Agent {
  private seoTools: string[];
  private focusAreas: string[];

  constructor(modelRouter: ModelRouter, config?: {
    tools?: string[];
    focusAreas?: string[];
  }) {
    const capabilities: AgentCapabilities = {
      skills: [
        'keyword-research',
        'on-page-seo',
        'technical-seo',
        'content-optimization',
        'meta-tags',
        'schema-markup',
        'seo-audit',
        'competitor-analysis',
        ...(config?.tools || []),
        ...(config?.focusAreas || [])
      ],
      maxConcurrentTasks: 3,
      specializations: ['seo', 'content-optimization', 'search-marketing'],
      supportedTaskTypes: ['SEO_OPTIMIZATION' as any, 'CONTENT_MARKETING' as any]
    };

    super('SEO Agent', 'SEO' as any, capabilities, modelRouter);
    
    this.seoTools = config?.tools || [
      'Google Search Console',
      'SEMrush',
      'Ahrefs',
      'Screaming Frog'
    ];
    
    this.focusAreas = config?.focusAreas || [
      'Keyword Optimization',
      'Technical SEO',
      'Content Strategy',
      'Link Building'
    ];
  }

  protected async analyzeTask(task: Task): Promise<TaskAnalysis> {
    const prompt = `
Analyze this SEO task:
Title: ${task.title}
Description: ${task.description}
Available tools: ${this.seoTools.join(', ')}
Focus areas: ${this.focusAreas.join(', ')}

Determine:
1. SEO focus area (keyword research, on-page, technical, content, etc.)
2. Target keywords or optimization goals
3. Recommended SEO tools to use
4. Content optimization strategy
5. Expected SEO improvements
6. Estimated complexity (low/medium/high)

Respond in JSON format with keys: focusArea, targetKeywords, tools, strategy, improvements, complexity, steps.
    `;

    const response = await this.executeWithModel(prompt, {
      temperature: 0.4,
      maxTokens: 1500
    });

    try {
      const parsed = JSON.parse(response);
      return {
        estimatedComplexity: parsed.complexity || 'medium',
        requiredSteps: parsed.steps || [],
        potentialChallenges: [],
        recommendedApproach: parsed.strategy || '',
        additionalInfo: parsed
      };
    } catch (error) {
      return {
        estimatedComplexity: 'medium',
        requiredSteps: ['Analyze SEO requirements', 'Implement optimizations'],
        potentialChallenges: [],
        recommendedApproach: response,
        additionalInfo: {}
      };
    }
  }

  protected async execute(analysis: TaskAnalysis, task: Task): Promise<any> {
    const prompt = `
As an SEO specialist, complete this task:
${task.description}

Analysis:
${JSON.stringify(analysis, null, 2)}

Provide comprehensive SEO recommendations including:
- Keyword strategy and target keywords
- On-page SEO optimizations (meta tags, headings, content)
- Technical SEO improvements
- Content optimization suggestions
- Link building strategy
- Expected impact and metrics to track

Format the response as actionable recommendations with specific implementation steps.
    `;

    const seoResponse = await this.executeWithModel(prompt, {
      temperature: 0.5,
      maxTokens: 3000
    });

    return {
      recommendations: seoResponse,
      focusArea: analysis.additionalInfo.focusArea,
      targetKeywords: analysis.additionalInfo.targetKeywords,
      tools: analysis.additionalInfo.tools,
      analysis
    };
  }

  protected async validate(result: any): Promise<ValidationResult> {
    if (!result.recommendations || result.recommendations.trim().length === 0) {
      return {
        isValid: false,
        reason: 'No SEO recommendations generated'
      };
    }

    // Validate that key SEO elements are addressed
    const recommendations = result.recommendations.toLowerCase();
    const hasKeywords = recommendations.includes('keyword') || recommendations.includes('search term');
    const hasMetaTags = recommendations.includes('meta') || recommendations.includes('title tag');
    const hasContent = recommendations.includes('content') || recommendations.includes('heading');

    if (!hasKeywords && !hasMetaTags && !hasContent) {
      return {
        isValid: false,
        reason: 'Recommendations lack essential SEO elements',
        suggestions: ['Include keyword strategy', 'Add meta tag recommendations', 'Include content optimization']
      };
    }

    return { isValid: true };
  }

  async optimizeContent(content: string, targetKeywords: string[]): Promise<string> {
    const prompt = `
Optimize this content for SEO:

Content: ${content}
Target Keywords: ${targetKeywords.join(', ')}

Provide:
1. Optimized content with natural keyword integration
2. Suggested headings (H1, H2, H3)
3. Meta title and description
4. Schema markup recommendations
    `;

    return this.executeWithModel(prompt, { temperature: 0.4 });
  }

  async performSEOAudit(url: string): Promise<string> {
    const prompt = `
Perform an SEO audit for: ${url}

Analyze and provide recommendations for:
1. Technical SEO (site speed, mobile-friendliness, crawlability)
2. On-page SEO (meta tags, headings, content quality)
3. Off-page SEO (backlinks, domain authority)
4. User experience (navigation, engagement metrics)
5. Content strategy

Provide specific, actionable recommendations prioritized by impact.
    `;

    return this.executeWithModel(prompt, { temperature: 0.5 });
  }
}

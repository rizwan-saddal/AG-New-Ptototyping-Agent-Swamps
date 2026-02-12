// Lead Generation Agent - Specializes in lead generation strategies and campaigns

import { Agent } from './Agent.js';
import type { ModelRouter } from '../models/ModelRouter.js';
import type { Task, TaskAnalysis, ValidationResult, AgentCapabilities } from '../shared/types.js';

export class LeadGenerationAgent extends Agent {
  private channels: string[];
  private tactics: string[];

  constructor(modelRouter: ModelRouter, config?: {
    channels?: string[];
    tactics?: string[];
  }) {
    const capabilities: AgentCapabilities = {
      skills: [
        'lead-strategy',
        'campaign-planning',
        'funnel-optimization',
        'email-marketing',
        'social-media-outreach',
        'content-marketing',
        'landing-page-optimization',
        'lead-scoring',
        'crm-integration',
        ...(config?.channels || []),
        ...(config?.tactics || [])
      ],
      maxConcurrentTasks: 3,
      specializations: ['lead-generation', 'marketing-automation', 'conversion-optimization'],
      supportedTaskTypes: ['LEAD_GENERATION' as any, 'CONTENT_MARKETING' as any]
    };

    super('Lead Generation Agent', 'LEAD_GENERATION' as any, capabilities, modelRouter);
    
    this.channels = config?.channels || [
      'Email',
      'Social Media',
      'Content Marketing',
      'Paid Ads',
      'SEO',
      'Webinars'
    ];
    
    this.tactics = config?.tactics || [
      'Lead Magnets',
      'Landing Pages',
      'Nurture Campaigns',
      'Retargeting',
      'Referral Programs'
    ];
  }

  protected async analyzeTask(task: Task): Promise<TaskAnalysis> {
    const prompt = `
Analyze this lead generation task:
Title: ${task.title}
Description: ${task.description}

Determine:
1. Target audience and ideal customer profile
2. Lead generation channels to use
3. Lead magnets or incentives needed
4. Campaign structure and funnel stages
5. Success metrics and KPIs
6. Estimated complexity (low/medium/high)

Respond in JSON format with keys: targetAudience, channels, leadMagnets, funnelStages, metrics, complexity, steps.
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
        recommendedApproach: JSON.stringify(parsed.funnelStages || {}),
        additionalInfo: parsed
      };
    } catch (error) {
      return {
        estimatedComplexity: 'medium',
        requiredSteps: ['Define target audience', 'Create campaign strategy', 'Implement tracking'],
        potentialChallenges: [],
        recommendedApproach: response,
        additionalInfo: {}
      };
    }
  }

  protected async execute(analysis: TaskAnalysis, task: Task): Promise<any> {
    const prompt = `
As a lead generation specialist, create a comprehensive strategy for:
${task.description}

Analysis:
${JSON.stringify(analysis, null, 2)}

Provide a complete lead generation plan including:

1. **Target Audience Definition**
   - Demographics and psychographics
   - Pain points and motivations
   - Buyer personas

2. **Lead Generation Channels**
   - Primary and secondary channels
   - Channel-specific tactics
   - Budget allocation recommendations

3. **Lead Magnets & Content**
   - Valuable content offers
   - Landing page recommendations
   - Call-to-action strategies

4. **Nurture Campaign**
   - Email sequence outline
   - Touchpoint strategy
   - Personalization approaches

5. **Conversion Optimization**
   - Funnel optimization tactics
   - A/B testing recommendations
   - Lead scoring criteria

6. **Metrics & Tracking**
   - KPIs to monitor
   - Analytics setup
   - Success benchmarks

Provide specific, actionable recommendations with implementation steps.
    `;

    const strategyResponse = await this.executeWithModel(prompt, {
      temperature: 0.5,
      maxTokens: 4000
    });

    return {
      strategy: strategyResponse,
      targetAudience: analysis.additionalInfo.targetAudience,
      channels: analysis.additionalInfo.channels,
      leadMagnets: analysis.additionalInfo.leadMagnets,
      metrics: analysis.additionalInfo.metrics,
      analysis
    };
  }

  protected async validate(result: any): Promise<ValidationResult> {
    if (!result.strategy || result.strategy.trim().length === 0) {
      return {
        isValid: false,
        reason: 'No lead generation strategy generated'
      };
    }

    // Validate that key components are addressed
    const strategy = result.strategy.toLowerCase();
    const hasAudience = strategy.includes('audience') || strategy.includes('persona');
    const hasChannels = strategy.includes('channel') || strategy.includes('email') || strategy.includes('social');
    const hasMetrics = strategy.includes('metric') || strategy.includes('kpi') || strategy.includes('conversion');

    if (!hasAudience || !hasChannels || !hasMetrics) {
      return {
        isValid: false,
        reason: 'Strategy missing essential components',
        suggestions: [
          !hasAudience ? 'Define target audience' : '',
          !hasChannels ? 'Specify lead generation channels' : '',
          !hasMetrics ? 'Include success metrics' : ''
        ].filter(s => s)
      };
    }

    return { isValid: true };
  }

  async createCampaign(campaignGoals: string, targetAudience: string): Promise<string> {
    const prompt = `
Create a comprehensive lead generation campaign:

Goals: ${campaignGoals}
Target Audience: ${targetAudience}

Provide:
1. Campaign concept and messaging
2. Multi-channel approach (email, social, content, paid)
3. Lead magnet ideas
4. Landing page structure
5. Nurture sequence (5-7 emails)
6. Success metrics and tracking plan
    `;

    return this.executeWithModel(prompt, { temperature: 0.6 });
  }

  async optimizeFunnel(currentFunnel: string, metrics: Record<string, number>): Promise<string> {
    const prompt = `
Analyze and optimize this lead generation funnel:

Current Funnel: ${currentFunnel}
Current Metrics: ${JSON.stringify(metrics, null, 2)}

Provide:
1. Funnel analysis and bottleneck identification
2. Conversion rate optimization recommendations
3. Content and messaging improvements
4. A/B testing suggestions
5. Quick wins vs long-term optimizations
    `;

    return this.executeWithModel(prompt, { temperature: 0.5 });
  }

  async generateLeadMagnet(topic: string, audiencePainPoints: string[]): Promise<string> {
    const prompt = `
Create a compelling lead magnet:

Topic: ${topic}
Audience Pain Points: ${audiencePainPoints.join(', ')}

Provide:
1. Lead magnet title and description
2. Outline or table of contents
3. Key value propositions
4. Landing page copy (headline, subheadline, bullet points)
5. Email delivery sequence
    `;

    return this.executeWithModel(prompt, { temperature: 0.6 });
  }
}

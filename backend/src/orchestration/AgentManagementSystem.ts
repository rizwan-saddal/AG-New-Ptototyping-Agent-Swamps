// Agent Management System - Handles agent training, creation, and lifecycle

import type { Agent } from '../agents/Agent.js';
import type {
  AgentLearningProfile,
  AgentTrainingData,
  AgentTemplate,
  AgentCreationRequest,
  ReinforcementTrainingConfig,
  AgentType
} from '../shared/types.js';
import type { ModelRouter } from '../models/ModelRouter.js';
import { DeveloperAgent } from '../agents/DeveloperAgent.js';
import { QAAgent } from '../agents/QAAgent.js';
import { ProductManagerAgent } from '../agents/ProductManagerAgent.js';
import { SEOAgent } from '../agents/SEOAgent.js';
import { LeadGenerationAgent } from '../agents/LeadGenerationAgent.js';
import { AIMLAgent } from '../agents/AIMLAgent.js';
import { MentorAgent } from '../agents/MentorAgent.js';

export class AgentManagementSystem {
  private learningProfiles: Map<string, AgentLearningProfile> = new Map();
  private agentTemplates: Map<string, AgentTemplate> = new Map();
  private modelRouter: ModelRouter;

  constructor(modelRouter: ModelRouter) {
    this.modelRouter = modelRouter;
    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates(): void {
    // Developer Agent Template
    this.agentTemplates.set('developer-template', {
      id: 'developer-template',
      name: 'Developer Agent Template',
      type: 'DEVELOPER' as AgentType,
      description: 'Specialized in software development, code generation, and review',
      defaultCapabilities: ['code-generation', 'code-review', 'refactoring', 'debugging'],
      defaultSpecializations: ['software-development', 'programming'],
      promptTemplate: 'You are an expert software developer specializing in {languages}. Your task is to {task}.',
      trainingStrategy: 'continuous'
    });

    // QA Agent Template
    this.agentTemplates.set('qa-template', {
      id: 'qa-template',
      name: 'QA Agent Template',
      type: 'QA' as AgentType,
      description: 'Specialized in testing and quality assurance',
      defaultCapabilities: ['test-generation', 'test-execution', 'quality-assurance'],
      defaultSpecializations: ['testing', 'qa'],
      promptTemplate: 'You are an expert QA engineer. Your task is to {task}.',
      trainingStrategy: 'continuous'
    });

    // SEO Agent Template
    this.agentTemplates.set('seo-template', {
      id: 'seo-template',
      name: 'SEO Agent Template',
      type: 'SEO' as AgentType,
      description: 'Specialized in search engine optimization',
      defaultCapabilities: ['keyword-research', 'on-page-seo', 'technical-seo', 'content-optimization'],
      defaultSpecializations: ['seo', 'content-optimization'],
      promptTemplate: 'You are an expert SEO specialist. Your task is to {task}.',
      trainingStrategy: 'continuous'
    });

    // Lead Generation Agent Template
    this.agentTemplates.set('lead-gen-template', {
      id: 'lead-gen-template',
      name: 'Lead Generation Agent Template',
      type: 'LEAD_GENERATION' as AgentType,
      description: 'Specialized in lead generation and conversion optimization',
      defaultCapabilities: ['lead-strategy', 'campaign-planning', 'funnel-optimization'],
      defaultSpecializations: ['lead-generation', 'marketing-automation'],
      promptTemplate: 'You are an expert lead generation specialist. Your task is to {task}.',
      trainingStrategy: 'continuous'
    });

    // AI/ML Expert Agent Template
    this.agentTemplates.set('aiml-template', {
      id: 'aiml-template',
      name: 'AI/ML Expert Agent Template',
      type: 'AI_ML' as AgentType,
      description: 'Specialized in model selection, evaluation, and MLOps readiness',
      defaultCapabilities: ['model-selection', 'evaluation-design', 'ml-observability', 'feature-engineering'],
      defaultSpecializations: ['ai-ml', 'mlops', 'research'],
      promptTemplate: 'You are an AI/ML expert. Design robust, evaluable solutions that follow open standards. Task: {task}.',
      trainingStrategy: 'continuous'
    });

    // Mentor/Lead Agent Template
    this.agentTemplates.set('mentor-template', {
      id: 'mentor-template',
      name: 'Mentor Lead Agent Template',
      type: 'MENTOR' as AgentType,
      description: 'Guides agents with mentorship, retrospectives, and continuous improvement plans',
      defaultCapabilities: ['mentorship', 'retrospective', 'skill-mapping', 'feedback-loop'],
      defaultSpecializations: ['leadership', 'coaching'],
      promptTemplate: 'You are a lead mentor focused on skill growth and feedback loops. Task: {task}.',
      trainingStrategy: 'continuous'
    });
  }

  createAgent(request: AgentCreationRequest): Agent {
    const template = request.templateId 
      ? this.agentTemplates.get(request.templateId)
      : this.getTemplateByType(request.type);

    if (!template) {
      throw new Error(`No template found for agent type: ${request.type}`);
    }

    // Create agent based on type
    let agent: Agent;
    
    switch (request.type) {
      case 'DEVELOPER' as AgentType:
        agent = new DeveloperAgent(this.modelRouter, {
          languages: request.customCapabilities?.filter(c => c.includes('language')) || [],
          frameworks: request.customCapabilities?.filter(c => c.includes('framework')) || []
        });
        break;
      
      case 'QA' as AgentType:
        agent = new QAAgent(this.modelRouter, {
          frameworks: request.customCapabilities || []
        });
        break;
      
      case 'PRODUCT_MANAGER' as AgentType:
        agent = new ProductManagerAgent(this.modelRouter);
        break;
      
      case 'SEO' as AgentType:
        agent = new SEOAgent(this.modelRouter, {
          tools: request.customCapabilities,
          focusAreas: request.customSpecializations
        });
        break;
      
      case 'LEAD_GENERATION' as AgentType:
        agent = new LeadGenerationAgent(this.modelRouter, {
          channels: request.customCapabilities,
          tactics: request.customSpecializations
        });
        break;

      case 'AI_ML' as AgentType:
        agent = new AIMLAgent(this.modelRouter);
        break;

      case 'MENTOR' as AgentType:
        agent = new MentorAgent(this.modelRouter);
        break;
      
      default:
        throw new Error(`Agent type ${request.type} not yet implemented`);
    }

    // Initialize learning profile
    this.initializeLearningProfile(agent.id, request.trainingStrategy || 'continuous');

    // Apply initial training if provided
    if (request.initialTrainingData && request.initialTrainingData.length > 0) {
      this.trainAgent(agent.id, request.initialTrainingData);
    }

    return agent;
  }

  private getTemplateByType(type: AgentType): AgentTemplate | undefined {
    for (const template of this.agentTemplates.values()) {
      if (template.type === type) {
        return template;
      }
    }
    return undefined;
  }

  initializeLearningProfile(agentId: string, strategy: 'supervised' | 'reinforced' | 'continuous' = 'continuous'): void {
    const baseLearningRate = strategy === 'reinforced' ? 0.08 : strategy === 'supervised' ? 0.1 : 0.12;

    this.learningProfiles.set(agentId, {
      agentId,
      trainingHistory: [],
      strengthAreas: [],
      improvementAreas: [],
      preferredTaskTypes: [],
      learningRate: baseLearningRate,
      lastTrainingDate: new Date(),
      learningStrategy: strategy
    });
  }

  trainAgent(agentId: string, trainingData: AgentTrainingData[]): void {
    const profile = this.learningProfiles.get(agentId);
    
    if (!profile) {
      throw new Error(`No learning profile found for agent ${agentId}`);
    }

    // Add training data to history
    profile.trainingHistory.push(...trainingData);
    profile.lastTrainingDate = new Date();

    // Analyze training data to update profile
    this.analyzeTrainingData(profile, trainingData);
  }

  private analyzeTrainingData(profile: AgentLearningProfile, newData: AgentTrainingData[]): void {
    // Calculate success rate
    const successfulTasks = newData.filter(d => d.success);
    const successRate = successfulTasks.length / newData.length;

    // Identify strength areas (tasks with high success rate)
    const taskPatterns = new Map<string, { success: number; total: number }>();
    
    for (const data of newData) {
      // Extract task patterns from input
      const pattern = this.extractTaskPattern(data.input);
      
      if (!taskPatterns.has(pattern)) {
        taskPatterns.set(pattern, { success: 0, total: 0 });
      }
      
      const stats = taskPatterns.get(pattern)!;
      stats.total++;
      if (data.success) stats.success++;
    }

    // Update strength and improvement areas
    profile.strengthAreas = [];
    profile.improvementAreas = [];

    for (const [pattern, stats] of taskPatterns) {
      const rate = stats.success / stats.total;
      if (rate > 0.8) {
        profile.strengthAreas.push(pattern);
      } else if (rate < 0.5) {
        profile.improvementAreas.push(pattern);
      }
    }

    // Adjust learning rate based on performance
    if (successRate > 0.9) {
      profile.learningRate = Math.max(0.01, profile.learningRate * 0.9);
    } else if (successRate < 0.5) {
      profile.learningRate = Math.min(0.5, profile.learningRate * 1.1);
    }
  }

  private extractTaskPattern(input: string): string {
    // Simple pattern extraction - can be enhanced with NLP
    const keywords = ['create', 'generate', 'optimize', 'analyze', 'review', 'test', 'debug', 'refactor'];
    
    for (const keyword of keywords) {
      if (input.toLowerCase().includes(keyword)) {
        return keyword;
      }
    }
    
    return 'general';
  }

  async performReinforcementTraining(config: ReinforcementTrainingConfig): Promise<void> {
    const profile = this.learningProfiles.get(config.agentId);
    
    if (!profile) {
      throw new Error(`No learning profile found for agent ${config.agentId}`);
    }

    // Implement reinforcement learning logic
    console.log(`Starting reinforcement training for agent ${config.agentId}`);
    console.log(`Epochs: ${config.epochs}, Learning Rate: ${config.learningRate}`);

    // Train in batches
    for (let epoch = 0; epoch < config.epochs; epoch++) {
      const batchCount = Math.ceil(config.trainingDataset.length / config.batchSize);
      
      for (let batchIdx = 0; batchIdx < batchCount; batchIdx++) {
        const startIdx = batchIdx * config.batchSize;
        const endIdx = Math.min(startIdx + config.batchSize, config.trainingDataset.length);
        const batch = config.trainingDataset.slice(startIdx, endIdx);

        // Process batch
        for (const data of batch) {
          const reward = this.calculateReward(config.rewardConfig, data);
          
          // Update agent's learning based on reward
          // This is a simplified version - real RL would involve model updates
          if (reward > 0.5) {
            // Positive reinforcement
            profile.strengthAreas.push(this.extractTaskPattern(data.input));
          } else {
            // Negative reinforcement
            profile.improvementAreas.push(this.extractTaskPattern(data.input));
          }
        }
      }
    }

    profile.lastTrainingDate = new Date();
    console.log(`Reinforcement training completed for agent ${config.agentId}`);
  }

  private calculateReward(config: ReinforcementTrainingConfig['rewardConfig'], data: AgentTrainingData): number {
    if (config.strategy === 'feedback_bonus') {
      const base = data.success ? 0.7 : 0.2;
      const feedbackWeight = config.feedbackWeight ?? 0.3;
      return Math.min(1, base + (data.feedback ? feedbackWeight : 0));
    }

    // success_rate strategy
    const successWeight = config.successWeight ?? 1;
    return data.success ? successWeight : 0;
  }

  getLearningProfile(agentId: string): AgentLearningProfile | undefined {
    return this.learningProfiles.get(agentId);
  }

  getAgentTemplate(templateId: string): AgentTemplate | undefined {
    return this.agentTemplates.get(templateId);
  }

  listTemplates(): AgentTemplate[] {
    return Array.from(this.agentTemplates.values());
  }

  addCustomTemplate(template: AgentTemplate): void {
    this.agentTemplates.set(template.id, template);
  }

  recordTaskExecution(agentId: string, taskId: string, input: string, output: string, success: boolean, feedback?: string): void {
    const profile = this.learningProfiles.get(agentId);
    
    if (!profile) {
      this.initializeLearningProfile(agentId);
    }

    const trainingData: AgentTrainingData = {
      taskId,
      input,
      output,
      success,
      feedback,
      timestamp: new Date()
    };

    this.trainAgent(agentId, [trainingData]);
  }

  getAgentInsights(agentId: string): any {
    const profile = this.learningProfiles.get(agentId);
    
    if (!profile) {
      return null;
    }

    const totalTasks = profile.trainingHistory.length;
    const successfulTasks = profile.trainingHistory.filter(t => t.success).length;
    const successRate = totalTasks > 0 ? successfulTasks / totalTasks : 0;

    return {
      totalTasks,
      successRate,
      strengthAreas: profile.strengthAreas,
      improvementAreas: profile.improvementAreas,
      preferredTaskTypes: profile.preferredTaskTypes,
      learningRate: profile.learningRate,
      lastTrainingDate: profile.lastTrainingDate,
      recentPerformance: this.calculateRecentPerformance(profile)
    };
  }

  private calculateRecentPerformance(profile: AgentLearningProfile): number {
    // Calculate performance over last 10 tasks
    const recentTasks = profile.trainingHistory.slice(-10);
    
    if (recentTasks.length === 0) return 0;
    
    const recentSuccess = recentTasks.filter(t => t.success).length;
    return recentSuccess / recentTasks.length;
  }
}

// Product Manager Agent - Specializes in requirements and planning

import { Agent } from './Agent.js';
import type { ModelRouter } from '../models/ModelRouter.js';
import type { Task, TaskAnalysis, ValidationResult, AgentCapabilities } from '../shared/types.js';

export class ProductManagerAgent extends Agent {
  constructor(modelRouter: ModelRouter) {
    const capabilities: AgentCapabilities = {
      skills: [
        'requirements-analysis',
        'task-prioritization',
        'roadmap-planning',
        'stakeholder-management',
        'product-strategy'
      ],
      maxConcurrentTasks: 5,
      specializations: ['product-management', 'planning'],
      supportedTaskTypes: ['REQUIREMENTS_ANALYSIS' as any, 'GENERAL' as any]
    };

    super('Product Manager Agent', 'PRODUCT_MANAGER' as any, capabilities, modelRouter);
  }

  protected async analyzeTask(task: Task): Promise<TaskAnalysis> {
    const prompt = `
Analyze this product/requirements task:
${task.description}

Provide:
1. Key requirements
2. Success criteria
3. Stakeholder needs
4. Priority level
5. Dependencies
6. Complexity estimation

Respond in JSON format.
    `;

    const response = await this.executeWithModel(prompt, {
      temperature: 0.5,
      maxTokens: 1500
    });

    try {
      const parsed = JSON.parse(response);
      return {
        estimatedComplexity: parsed.complexity || 'medium',
        requiredSteps: parsed.requirements || [],
        potentialChallenges: parsed.dependencies || [],
        recommendedApproach: parsed.approach || '',
        additionalInfo: parsed
      };
    } catch (error) {
      return {
        estimatedComplexity: 'medium',
        requiredSteps: [],
        potentialChallenges: [],
        recommendedApproach: response,
        additionalInfo: {}
      };
    }
  }

  protected async execute(analysis: TaskAnalysis, task: Task): Promise<any> {
    const prompt = `
As a Product Manager, address this task:
${task.description}

Analysis:
${JSON.stringify(analysis, null, 2)}

Provide:
- Clear requirements document
- Prioritized task list
- Success metrics
- Timeline estimation
- Risk assessment
    `;

    const response = await this.executeWithModel(prompt, {
      temperature: 0.6,
      maxTokens: 3000
    });

    return {
      requirements: response,
      priority: analysis.additionalInfo.priority,
      successCriteria: analysis.additionalInfo.successCriteria,
      analysis
    };
  }

  protected async validate(result: any): Promise<ValidationResult> {
    if (!result.requirements || result.requirements.trim().length === 0) {
      return {
        isValid: false,
        reason: 'No requirements generated'
      };
    }

    return { isValid: true };
  }

  async analyzeRequirements(input: string): Promise<string> {
    const prompt = `
Analyze these requirements and create a structured document:
${input}

Include:
1. Functional requirements
2. Non-functional requirements
3. User stories
4. Acceptance criteria
    `;

    return this.executeWithModel(prompt);
  }

  async prioritizeTasks(tasksDescription: string): Promise<string> {
    const prompt = `
Prioritize these tasks using MoSCoW method:
${tasksDescription}

Provide prioritized list with rationale.
    `;

    return this.executeWithModel(prompt);
  }
}

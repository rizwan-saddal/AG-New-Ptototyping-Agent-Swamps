// AI/ML Expert Agent - Focused on model selection, evaluation, and MLOps readiness

import { Agent } from './Agent.js';
import type { ModelRouter } from '../models/ModelRouter.js';
import type { Task, TaskAnalysis, ValidationResult, AgentCapabilities } from '../shared/types.js';

export class AIMLAgent extends Agent {
  constructor(modelRouter: ModelRouter) {
    const capabilities: AgentCapabilities = {
      skills: [
        'model-selection',
        'data-preprocessing',
        'feature-engineering',
        'evaluation-design',
        'ml-observability',
        'prompt-engineering',
        'vector-search'
      ],
      maxConcurrentTasks: 2,
      specializations: ['ai-ml', 'mlops', 'research'],
      supportedTaskTypes: ['RESEARCH' as any, 'GENERAL' as any]
    };

    super('AI/ML Expert Agent', 'AI_ML' as any, capabilities, modelRouter);
  }

  protected async analyzeTask(task: Task): Promise<TaskAnalysis> {
    const prompt = `
You are an AI/ML expert. Analyze the following task and propose an ML strategy.
Task title: ${task.title}
Task description: ${task.description}
Task type: ${task.type}

Return JSON with keys:
- problemType
- dataNeeds
- modelOptions (array)
- evaluationPlan
- risks
- steps (array)
`;

    const response = await this.executeWithModel(prompt, { temperature: 0.3, maxTokens: 1200 });

    try {
      const parsed = JSON.parse(response);
      return {
        estimatedComplexity: parsed.problemType ? 'high' : 'medium',
        requiredSteps: parsed.steps || [],
        potentialChallenges: parsed.risks || [],
        recommendedApproach: parsed.evaluationPlan || 'Use standard train/val/test split with reproducible seeds.',
        additionalInfo: parsed
      };
    } catch (error) {
      return {
        estimatedComplexity: 'medium',
        requiredSteps: ['Clarify data sources', 'Choose baseline model', 'Define metrics'],
        potentialChallenges: ['Unclear data quality'],
        recommendedApproach: response,
        additionalInfo: {}
      };
    }
  }

  protected async execute(analysis: TaskAnalysis, task: Task): Promise<any> {
    const prompt = `
Using this analysis:
${JSON.stringify(analysis, null, 2)}

Provide a concise AI/ML implementation plan for:
${task.description}

Include:
- Data pipeline design (using open standards like JSON Schema for inputs)
- Model choice and rationale
- Evaluation metrics and guardrails
- MLOps hooks (model registry, drift monitoring, connectors)
- How to expose this as an OpenAPI/BPMN compatible workflow step
`;

    const plan = await this.executeWithModel(prompt, { temperature: 0.35, maxTokens: 1800 });

    return {
      plan,
      analysis,
      recommendedConnectors: [
        'openapi-webhook',
        'bpmn-workflow',
        'jsonschema-dataset-contract'
      ]
    };
  }

  protected async validate(result: any): Promise<ValidationResult> {
    if (!result?.plan) {
      return { isValid: false, reason: 'No plan generated' };
    }

    const validationPrompt = `
Check this AI/ML plan for soundness.
Plan:
${result.plan}

Ensure it includes evaluation, monitoring, and uses open standards.
Respond as JSON: { "isValid": boolean, "issues": string[] }
`;

    try {
      const validation = await this.executeWithModel(validationPrompt, { temperature: 0.2, maxTokens: 800 });
      const parsed = JSON.parse(validation);
      return {
        isValid: parsed.isValid !== false,
        reason: parsed.issues?.join(', ')
      };
    } catch (error) {
      return { isValid: true };
    }
  }
}

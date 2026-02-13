// Mentor/Lead Agent - Provides coaching, retrospectives, and skill development guidance

import { Agent } from './Agent.js';
import type { ModelRouter } from '../models/ModelRouter.js';
import type { Task, TaskAnalysis, ValidationResult, AgentCapabilities } from '../shared/types.js';

export class MentorAgent extends Agent {
  constructor(modelRouter: ModelRouter) {
    const capabilities: AgentCapabilities = {
      skills: [
        'mentorship',
        'retrospective',
        'skill-mapping',
        'pairing',
        'feedback-loop',
        'playbook-curation'
      ],
      maxConcurrentTasks: 4,
      specializations: ['leadership', 'coaching', 'continuous-improvement'],
      supportedTaskTypes: ['GENERAL' as any, 'RESEARCH' as any]
    };

    super('Mentor Lead Agent', 'MENTOR' as any, capabilities, modelRouter);
  }

  protected async analyzeTask(task: Task): Promise<TaskAnalysis> {
    const prompt = `
You are a lead mentor. Assess this task for coaching and continuous improvement.
Title: ${task.title}
Description: ${task.description}

Return JSON with keys:
- goals (array)
- skillGaps (array)
- pairingRecommendations (array)
- feedbackCadence
- successMetrics
`;

    const response = await this.executeWithModel(prompt, { temperature: 0.35, maxTokens: 900 });

    try {
      const parsed = JSON.parse(response);
      return {
        estimatedComplexity: 'medium',
        requiredSteps: parsed.goals || [],
        potentialChallenges: parsed.skillGaps || [],
        recommendedApproach: parsed.successMetrics || 'Track improvements week over week.',
        additionalInfo: parsed
      };
    } catch (error) {
      return {
        estimatedComplexity: 'low',
        requiredSteps: ['Run retro', 'Identify gaps', 'Create pairing plan'],
        potentialChallenges: [],
        recommendedApproach: response,
        additionalInfo: {}
      };
    }
  }

  protected async execute(analysis: TaskAnalysis, task: Task): Promise<any> {
    const prompt = `
Create a mentorship and lead-coaching plan based on this analysis:
${JSON.stringify(analysis, null, 2)}

Include:
- Task context: ${task.description}
- Skill growth objectives
- Pairing/lead checkpoints
- How to update the learning profile after each task
- Feedback artifacts and cadence
- Link to workflow canvas node for visibility
`;

    const plan = await this.executeWithModel(prompt, { temperature: 0.4, maxTokens: 1400 });

    return {
      plan,
      coachingFocus: analysis.additionalInfo?.skillGaps || [],
      learningProfileUpdates: {
        preferredTaskTypes: analysis.requiredSteps || [],
        feedbackLoops: ['retro', 'pairing', 'async review']
      }
    };
  }

  protected async validate(result: any): Promise<ValidationResult> {
    if (!result?.plan) {
      return { isValid: false, reason: 'Missing mentorship plan' };
    }

    const validationPrompt = `
Validate this mentorship plan for clarity and measurable growth outcomes.
Plan:
${result.plan}

Respond JSON: { "isValid": boolean, "issues": string[] }
`;

    try {
      const validation = await this.executeWithModel(validationPrompt, { temperature: 0.25, maxTokens: 600 });
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

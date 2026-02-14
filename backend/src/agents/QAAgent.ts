// QA Agent - Specializes in testing and quality assurance

import { Agent } from './Agent.js';
import type { ModelRouter } from '../models/ModelRouter.js';
import type { Task, TaskAnalysis, ValidationResult, AgentCapabilities } from '../shared/types.js';

export class QAAgent extends Agent {
  private testingFrameworks: string[];

  constructor(modelRouter: ModelRouter, config?: {
    frameworks?: string[];
  }) {
    const capabilities: AgentCapabilities = {
      skills: [
        'test-generation',
        'test-execution',
        'bug-reporting',
        'quality-assurance',
        'test-planning',
        ...(config?.frameworks || [])
      ],
      maxConcurrentTasks: 2,
      specializations: ['testing', 'quality-assurance'],
      supportedTaskTypes: ['TESTING' as any]
    };

    super('QA Agent', 'QA' as any, capabilities, modelRouter);
    
    this.testingFrameworks = config?.frameworks || [
      'Jest',
      'Vitest',
      'Pytest',
      'JUnit',
      'Mocha'
    ];
  }

  protected async analyzeTask(task: Task): Promise<TaskAnalysis> {
    const prompt = `
Analyze this testing task:
Title: ${task.title}
Description: ${task.description}
Available frameworks: ${this.testingFrameworks.join(', ')}

Determine:
1. Type of testing needed (unit, integration, e2e)
2. Testing framework to use
3. Test cases to create
4. Edge cases to consider
5. Estimated complexity

Respond in JSON format.
    `;

    const response = await this.executeWithModel(prompt, {
      temperature: 0.3,
      maxTokens: 1500
    });

    try {
      const parsed = JSON.parse(response);
      return {
        estimatedComplexity: parsed.complexity || 'medium',
        requiredSteps: parsed.testCases || [],
        potentialChallenges: parsed.edgeCases || [],
        recommendedApproach: parsed.approach || '',
        additionalInfo: parsed
      };
    } catch (error) {
      return {
        estimatedComplexity: 'medium',
        requiredSteps: ['Create test cases'],
        potentialChallenges: [],
        recommendedApproach: response,
        additionalInfo: {}
      };
    }
  }

  protected async execute(analysis: TaskAnalysis, task: Task): Promise<any> {
    const prompt = `
Create comprehensive tests for:
${task.description}

Based on analysis:
${JSON.stringify(analysis, null, 2)}

Include:
- Test setup and teardown
- Positive test cases
- Negative test cases
- Edge cases
- Mock data where needed

Provide complete test implementation.
    `;

    const testsResponse = await this.executeWithModel(prompt, {
      temperature: 0.3,
      maxTokens: 3000
    });

    return {
      tests: testsResponse,
      framework: analysis.additionalInfo.framework,
      testCases: analysis.requiredSteps,
      analysis
    };
  }

  protected async validate(result: any): Promise<ValidationResult> {
    if (!result.tests || result.tests.trim().length === 0) {
      return {
        isValid: false,
        reason: 'No tests generated'
      };
    }

    return { isValid: true };
  }

  async createTestPlan(requirements: string): Promise<string> {
    const prompt = `
Create a comprehensive test plan for:
${requirements}

Include:
1. Test objectives
2. Test scope
3. Test cases
4. Testing types (unit, integration, e2e)
5. Success criteria
    `;

    return this.executeWithModel(prompt);
  }
}

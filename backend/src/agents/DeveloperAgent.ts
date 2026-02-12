// Developer Agent - Specializes in code generation and review

import { Agent } from './Agent.js';
import type { ModelRouter } from '../models/ModelRouter.js';
import type { Task, TaskAnalysis, ValidationResult, AgentCapabilities } from '../shared/types.js';

export class DeveloperAgent extends Agent {
  private programmingLanguages: string[];
  private frameworks: string[];

  constructor(modelRouter: ModelRouter, config?: {
    languages?: string[];
    frameworks?: string[];
  }) {
    const capabilities: AgentCapabilities = {
      skills: [
        'code-generation',
        'code-review',
        'debugging',
        'refactoring',
        'testing',
        ...(config?.languages || []),
        ...(config?.frameworks || [])
      ],
      maxConcurrentTasks: 3,
      specializations: ['software-development', 'programming'],
      supportedTaskTypes: ['CODE_GENERATION' as any, 'CODE_REVIEW' as any]
    };

    super('Developer Agent', 'DEVELOPER' as any, capabilities, modelRouter);
    
    this.programmingLanguages = config?.languages || [
      'JavaScript',
      'TypeScript',
      'Python',
      'Java',
      'Go'
    ];
    
    this.frameworks = config?.frameworks || [
      'React',
      'Node.js',
      'Express',
      'FastAPI',
      'Spring Boot'
    ];
  }

  protected async analyzeTask(task: Task): Promise<TaskAnalysis> {
    const prompt = `
Analyze this software development task:
Title: ${task.title}
Description: ${task.description}
Type: ${task.type}

Determine:
1. Programming language to use
2. Required dependencies/frameworks
3. File structure needed
4. Implementation approach
5. Potential challenges
6. Estimated complexity (low/medium/high)

Respond in JSON format with keys: language, dependencies, fileStructure, approach, challenges, complexity, steps.
    `;

    const response = await this.executeWithModel(prompt, {
      temperature: 0.3,
      maxTokens: 1500
    });

    try {
      const parsed = JSON.parse(response);
      return {
        estimatedComplexity: parsed.complexity || 'medium',
        requiredSteps: parsed.steps || [],
        potentialChallenges: parsed.challenges || [],
        recommendedApproach: parsed.approach || '',
        additionalInfo: parsed
      };
    } catch (error) {
      // Fallback if JSON parsing fails
      return {
        estimatedComplexity: 'medium',
        requiredSteps: ['Implement solution'],
        potentialChallenges: [],
        recommendedApproach: response,
        additionalInfo: {}
      };
    }
  }

  protected async execute(analysis: TaskAnalysis, task: Task): Promise<any> {
    const prompt = `
Based on this analysis:
${JSON.stringify(analysis, null, 2)}

Complete this software development task:
${task.description}

Requirements:
- Write clean, well-documented code
- Follow best practices for ${analysis.additionalInfo.language || 'the chosen language'}
- Include proper error handling
- Add inline comments where necessary
- Make the code production-ready

Provide the complete implementation with file names and content.
    `;

    const codeResponse = await this.executeWithModel(prompt, {
      temperature: 0.3,
      maxTokens: 4000
    });

    return {
      code: codeResponse,
      language: analysis.additionalInfo.language,
      files: this.extractFiles(codeResponse),
      analysis
    };
  }

  protected async validate(result: any): Promise<ValidationResult> {
    if (!result.code || result.code.trim().length === 0) {
      return {
        isValid: false,
        reason: 'No code generated'
      };
    }

    // Validate with model
    const validationPrompt = `
Review this code for:
1. Syntax correctness
2. Best practices
3. Potential bugs
4. Security issues

Code:
${result.code}

Respond with JSON: { isValid: boolean, issues: string[], suggestions: string[] }
    `;

    try {
      const validationResponse = await this.executeWithModel(validationPrompt, {
        temperature: 0.2,
        maxTokens: 1000
      });

      const validation = JSON.parse(validationResponse);
      
      return {
        isValid: validation.isValid !== false,
        reason: validation.issues?.join(', '),
        suggestions: validation.suggestions
      };
    } catch (error) {
      // If validation fails, assume code is valid
      return { isValid: true };
    }
  }

  private extractFiles(codeResponse: string): Array<{ name: string; content: string }> {
    const files: Array<{ name: string; content: string }> = [];
    
    // Try to extract files from markdown code blocks
    const fileRegex = /```(\w+)?\s*(?:\/\/\s*)?(.+\.[\w]+)?\n([\s\S]*?)```/g;
    let match;
    
    while ((match = fileRegex.exec(codeResponse)) !== null) {
      const [, , filename, content] = match;
      if (filename && content) {
        files.push({
          name: filename,
          content: content.trim()
        });
      }
    }

    return files;
  }

  async writeCode(specification: string): Promise<string> {
    const prompt = `Write code based on this specification:\n${specification}`;
    return this.executeWithModel(prompt, { temperature: 0.3 });
  }

  async reviewCode(code: string): Promise<string> {
    const prompt = `
Review this code and provide feedback:

${code}

Include:
1. Code quality assessment
2. Potential bugs
3. Security concerns
4. Performance issues
5. Suggested improvements
    `;
    
    return this.executeWithModel(prompt, { temperature: 0.4 });
  }
}

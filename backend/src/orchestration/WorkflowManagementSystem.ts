// Workflow Management System - Handles predefined workflows and process automation

import { v4 as uuidv4 } from 'uuid';
import type {
  WorkflowTemplate,
  WorkflowStep,
  WorkflowExecution,
  WorkflowStepExecution,
  AgentType,
  TaskType
} from '../shared/types.js';
import type { Orchestrator } from './Orchestrator.js';

export class WorkflowManagementSystem {
  private templates: Map<string, WorkflowTemplate> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private orchestrator: Orchestrator;

  constructor(orchestrator: Orchestrator) {
    this.orchestrator = orchestrator;
    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates(): void {
    // Software Development Workflow
    this.templates.set('software-development', {
      id: 'software-development',
      name: 'Complete Software Development',
      description: 'End-to-end software development workflow from requirements to deployment',
      category: 'development',
      requiredAgentTypes: ['PRODUCT_MANAGER' as AgentType, 'DEVELOPER' as AgentType, 'QA' as AgentType, 'DEVOPS' as AgentType],
      estimatedDuration: 3600000, // 1 hour in ms
      steps: [
        {
          id: 'requirements',
          name: 'Analyze Requirements',
          agentType: 'PRODUCT_MANAGER' as AgentType,
          taskType: 'REQUIREMENTS_ANALYSIS' as TaskType,
          dependencies: [],
          inputs: { description: 'project requirements' },
          expectedOutputs: ['requirements document', 'user stories']
        },
        {
          id: 'development',
          name: 'Develop Solution',
          agentType: 'DEVELOPER' as AgentType,
          taskType: 'CODE_GENERATION' as TaskType,
          dependencies: ['requirements'],
          inputs: { requirements: 'from_previous_step' },
          expectedOutputs: ['source code', 'documentation']
        },
        {
          id: 'testing',
          name: 'Create Tests',
          agentType: 'QA' as AgentType,
          taskType: 'TESTING' as TaskType,
          dependencies: ['development'],
          inputs: { code: 'from_previous_step' },
          expectedOutputs: ['test suite', 'test results']
        },
        {
          id: 'deployment',
          name: 'Deploy Application',
          agentType: 'DEVOPS' as AgentType,
          taskType: 'DEPLOYMENT' as TaskType,
          dependencies: ['testing'],
          inputs: { code: 'from_development', tests: 'from_testing' },
          expectedOutputs: ['deployment confirmation', 'monitoring setup']
        }
      ]
    });

    // Marketing Campaign Workflow
    this.templates.set('marketing-campaign', {
      id: 'marketing-campaign',
      name: 'Complete Marketing Campaign',
      description: 'Launch a comprehensive marketing campaign with SEO and lead generation',
      category: 'marketing',
      requiredAgentTypes: ['PRODUCT_MANAGER' as AgentType, 'SEO' as AgentType, 'LEAD_GENERATION' as AgentType, 'MARKETING' as AgentType],
      estimatedDuration: 7200000, // 2 hours in ms
      steps: [
        {
          id: 'strategy',
          name: 'Define Campaign Strategy',
          agentType: 'PRODUCT_MANAGER' as AgentType,
          taskType: 'REQUIREMENTS_ANALYSIS' as TaskType,
          dependencies: [],
          inputs: { campaign_goals: 'input' },
          expectedOutputs: ['campaign strategy', 'target audience']
        },
        {
          id: 'seo',
          name: 'SEO Optimization',
          agentType: 'SEO' as AgentType,
          taskType: 'SEO_OPTIMIZATION' as TaskType,
          dependencies: ['strategy'],
          inputs: { strategy: 'from_previous_step' },
          expectedOutputs: ['seo recommendations', 'keyword strategy']
        },
        {
          id: 'lead-gen',
          name: 'Lead Generation Strategy',
          agentType: 'LEAD_GENERATION' as AgentType,
          taskType: 'LEAD_GENERATION' as TaskType,
          dependencies: ['strategy'],
          inputs: { strategy: 'from_strategy', seo: 'from_seo' },
          expectedOutputs: ['lead generation plan', 'funnel design']
        },
        {
          id: 'content',
          name: 'Create Marketing Content',
          agentType: 'MARKETING' as AgentType,
          taskType: 'CONTENT_MARKETING' as TaskType,
          dependencies: ['seo', 'lead-gen'],
          inputs: { seo: 'from_seo', strategy: 'from_lead-gen' },
          expectedOutputs: ['marketing content', 'campaign materials']
        }
      ]
    });

    // Website Launch Workflow
    this.templates.set('website-launch', {
      id: 'website-launch',
      name: 'Complete Website Launch',
      description: 'Full website development and launch with SEO optimization',
      category: 'development',
      requiredAgentTypes: ['DESIGNER' as AgentType, 'DEVELOPER' as AgentType, 'SEO' as AgentType, 'QA' as AgentType],
      estimatedDuration: 5400000, // 1.5 hours in ms
      steps: [
        {
          id: 'design',
          name: 'Design Website',
          agentType: 'DESIGNER' as AgentType,
          taskType: 'DESIGN' as TaskType,
          dependencies: [],
          inputs: { requirements: 'input' },
          expectedOutputs: ['design mockups', 'style guide']
        },
        {
          id: 'development',
          name: 'Develop Website',
          agentType: 'DEVELOPER' as AgentType,
          taskType: 'CODE_GENERATION' as TaskType,
          dependencies: ['design'],
          inputs: { design: 'from_previous_step' },
          expectedOutputs: ['website code', 'documentation']
        },
        {
          id: 'seo',
          name: 'SEO Optimization',
          agentType: 'SEO' as AgentType,
          taskType: 'SEO_OPTIMIZATION' as TaskType,
          dependencies: ['development'],
          inputs: { website: 'from_previous_step' },
          expectedOutputs: ['seo optimizations', 'meta tags']
        },
        {
          id: 'testing',
          name: 'Test Website',
          agentType: 'QA' as AgentType,
          taskType: 'TESTING' as TaskType,
          dependencies: ['seo'],
          inputs: { website: 'from_development' },
          expectedOutputs: ['test results', 'bug reports']
        }
      ]
    });

    // Product Launch Workflow
    this.templates.set('product-launch', {
      id: 'product-launch',
      name: 'Complete Product Launch',
      description: 'Full product launch with development, marketing, and lead generation',
      category: 'operations',
      requiredAgentTypes: ['PRODUCT_MANAGER' as AgentType, 'DEVELOPER' as AgentType, 'MARKETING' as AgentType, 'LEAD_GENERATION' as AgentType],
      estimatedDuration: 10800000, // 3 hours in ms
      steps: [
        {
          id: 'planning',
          name: 'Product Planning',
          agentType: 'PRODUCT_MANAGER' as AgentType,
          taskType: 'REQUIREMENTS_ANALYSIS' as TaskType,
          dependencies: [],
          inputs: { product_concept: 'input' },
          expectedOutputs: ['product roadmap', 'feature list']
        },
        {
          id: 'development',
          name: 'Build Product',
          agentType: 'DEVELOPER' as AgentType,
          taskType: 'CODE_GENERATION' as TaskType,
          dependencies: ['planning'],
          inputs: { roadmap: 'from_previous_step' },
          expectedOutputs: ['product code', 'api documentation']
        },
        {
          id: 'marketing',
          name: 'Marketing Strategy',
          agentType: 'MARKETING' as AgentType,
          taskType: 'CONTENT_MARKETING' as TaskType,
          dependencies: ['planning'],
          inputs: { product: 'from_planning' },
          expectedOutputs: ['marketing plan', 'content calendar']
        },
        {
          id: 'lead-gen',
          name: 'Lead Generation Campaign',
          agentType: 'LEAD_GENERATION' as AgentType,
          taskType: 'LEAD_GENERATION' as TaskType,
          dependencies: ['marketing'],
          inputs: { marketing: 'from_previous_step' },
          expectedOutputs: ['lead generation plan', 'landing pages']
        }
      ]
    });
  }

  async executeWorkflow(templateId: string, initialInputs: Record<string, any>): Promise<string> {
    const template = this.templates.get(templateId);
    
    if (!template) {
      throw new Error(`Workflow template ${templateId} not found`);
    }

    const executionId = uuidv4();
    const execution: WorkflowExecution = {
      id: executionId,
      templateId,
      status: 'pending',
      currentStep: 0,
      steps: template.steps.map(step => ({
        stepId: step.id,
        status: 'pending'
      })),
      startedAt: new Date(),
      results: { ...initialInputs }
    };

    this.executions.set(executionId, execution);

    // Start executing workflow asynchronously
    this.executeWorkflowSteps(execution, template).catch(error => {
      execution.status = 'failed';
      execution.completedAt = new Date();
      execution.results.error = error instanceof Error ? error.message : 'Unknown error';
    });

    return executionId;
  }

  private async executeWorkflowSteps(execution: WorkflowExecution, template: WorkflowTemplate): Promise<void> {
    execution.status = 'running';

    try {
      for (let i = 0; i < template.steps.length; i++) {
        const step = template.steps[i];
        const stepExecution = execution.steps[i];
        execution.currentStep = i;

        const result = await this.runStepWithRetry(step, execution, stepExecution, 2);
        stepExecution.status = 'completed';
        stepExecution.result = result;
        execution.results[step.id] = result;
      }

      execution.status = 'completed';
      execution.completedAt = new Date();
    } catch (error) {
      execution.status = 'failed';
      execution.completedAt = new Date();
      execution.results.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  private async runStepWithRetry(
    step: WorkflowStep,
    execution: WorkflowExecution,
    stepExecution: WorkflowStepExecution,
    maxAttempts: number
  ): Promise<any> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const dependenciesMet = await this.checkDependencies(step, execution);
        if (!dependenciesMet) {
          throw new Error(`Dependencies not met for step ${step.id}`);
        }

        stepExecution.status = 'running';

        const inputs = this.prepareStepInputs(step, execution);
        const taskId = await this.orchestrator.submitTask({
          title: step.name,
          description: `${step.name}: ${JSON.stringify(inputs)}`,
          type: step.taskType,
          priority: 'HIGH' as any,
          requiredCapabilities: []
        });

        stepExecution.taskId = taskId;
        stepExecution.assignedAgentId = 'auto-assigned';

        const result = await this.orchestrator.waitForTask(taskId, 300000);

        if (result.success) {
          return result.result;
        }

        throw new Error(`Step ${step.id} failed: ${result.error}`);
      } catch (error) {
        lastError = error;
        stepExecution.status = 'failed';
        stepExecution.error = error instanceof Error ? error.message : 'Unknown error';

        if (attempt < maxAttempts) {
          await this.delay(1000);
          stepExecution.error = undefined;
          stepExecution.status = 'pending';
          continue;
        }
      }
    }

    throw lastError instanceof Error ? lastError : new Error('Workflow step failed');
  }

  private async checkDependencies(step: WorkflowStep, execution: WorkflowExecution): Promise<boolean> {
    if (step.dependencies.length === 0) {
      return true;
    }

    for (const depId of step.dependencies) {
      const depStep = execution.steps.find(s => s.stepId === depId);
      
      if (!depStep || depStep.status !== 'completed') {
        return false;
      }
    }

    return true;
  }

  private prepareStepInputs(step: WorkflowStep, execution: WorkflowExecution): Record<string, any> {
    const inputs: Record<string, any> = {};

    for (const [key, value] of Object.entries(step.inputs)) {
      if (typeof value === 'string' && value.startsWith('from_')) {
        const sourceStep = value.substring(5); // Remove 'from_' prefix
        inputs[key] = execution.results[sourceStep];
      } else if (value === 'input') {
        inputs[key] = execution.results[key];
      } else {
        inputs[key] = value;
      }
    }

    return inputs;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getWorkflowExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }

  listTemplates(category?: 'development' | 'marketing' | 'operations' | 'custom'): WorkflowTemplate[] {
    const templates = Array.from(this.templates.values());
    
    if (category) {
      return templates.filter(t => t.category === category);
    }
    
    return templates;
  }

  getTemplate(templateId: string): WorkflowTemplate | undefined {
    return this.templates.get(templateId);
  }

  addCustomTemplate(template: WorkflowTemplate): void {
    this.templates.set(template.id, template);
  }

  deleteTemplate(templateId: string): boolean {
    return this.templates.delete(templateId);
  }

  getWorkflowStatus(executionId: string): any {
    const execution = this.executions.get(executionId);
    
    if (!execution) {
      return null;
    }

    const template = this.templates.get(execution.templateId);
    const progress = execution.currentStep / (template?.steps.length || 1);

    return {
      id: execution.id,
      status: execution.status,
      progress: Math.round(progress * 100),
      currentStep: execution.currentStep,
      totalSteps: template?.steps.length || 0,
      steps: execution.steps,
      startedAt: execution.startedAt,
      completedAt: execution.completedAt,
      results: execution.results
    };
  }
}

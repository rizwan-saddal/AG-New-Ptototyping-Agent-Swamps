// Base Agent Class - Abstract class for all agent types

import { v4 as uuidv4 } from 'uuid';
import type { ModelRouter } from '../models/ModelRouter.js';
import type {
  AgentType,
  AgentStatus,
  AgentCapabilities,
  PerformanceMetrics,
  Task,
  TaskResult,
  TaskAnalysis,
  ValidationResult,
  GenerateOptions
} from '../shared/types.js';

export abstract class Agent {
  public readonly id: string;
  public readonly name: string;
  public readonly type: AgentType;
  public status: AgentStatus;
  public capabilities: AgentCapabilities;
  public metrics: PerformanceMetrics;
  
  protected modelRouter: ModelRouter;
  protected context: Map<string, any> = new Map();

  constructor(
    name: string,
    type: AgentType,
    capabilities: AgentCapabilities,
    modelRouter: ModelRouter
  ) {
    this.id = uuidv4();
    this.name = name;
    this.type = type;
    this.status = 'INITIALIZED' as AgentStatus;
    this.capabilities = capabilities;
    this.modelRouter = modelRouter;
    
    this.metrics = {
      totalTasks: 0,
      successfulTasks: 0,
      failedTasks: 0,
      averageCompletionTime: 0,
      successRate: 0,
      taskTypeMetrics: {},
      lastUpdated: new Date()
    };
  }

  async processTask(task: Task): Promise<TaskResult> {
    const startTime = Date.now();
    
    try {
      // Update status
      this.updateStatus('THINKING' as AgentStatus);
      
      // Analyze task
      const analysis = await this.analyzeTask(task);
      
      // Execute
      this.updateStatus('EXECUTING' as AgentStatus);
      const result = await this.execute(analysis, task);
      
      // Validate
      this.updateStatus('VALIDATING' as AgentStatus);
      const validation = await this.validate(result);
      
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.reason}`);
      }
      
      // Complete
      this.updateStatus('COMPLETED' as AgentStatus);
      
      const executionTime = Date.now() - startTime;
      
      // Update metrics
      this.updateMetrics(true, executionTime, task.type);
      
      return {
        taskId: task.id,
        success: true,
        result,
        executionTime,
        agentId: this.id,
        completedAt: new Date()
      };
      
    } catch (error) {
      this.updateStatus('ERROR' as AgentStatus);
      
      const executionTime = Date.now() - startTime;
      this.updateMetrics(false, executionTime, task.type);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        taskId: task.id,
        success: false,
        error: errorMessage,
        executionTime,
        agentId: this.id,
        completedAt: new Date()
      };
    } finally {
      // Return to idle after completion or error
      setTimeout(() => {
        if (this.status === 'COMPLETED' as AgentStatus || this.status === 'ERROR' as AgentStatus) {
          this.updateStatus('IDLE' as AgentStatus);
        }
      }, 1000);
    }
  }

  canHandle(task: Task): boolean {
    // Check if agent has required capabilities
    return task.requiredCapabilities.every(
      cap => this.capabilities.skills.includes(cap)
    );
  }

  updateStatus(status: AgentStatus): void {
    this.status = status;
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  protected async executeWithModel(
    prompt: string,
    options?: GenerateOptions
  ): Promise<string> {
    const fullPrompt = this.buildPrompt(prompt);
    return this.modelRouter.generate(fullPrompt, options);
  }

  protected buildPrompt(userPrompt: string): string {
    const contextSummary = Array.from(this.context.entries())
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join('\n');

    return `
You are ${this.name}, a specialized ${this.type} agent.

Your capabilities:
${this.capabilities.skills.join(', ')}

Current context:
${contextSummary || 'No context available'}

Task:
${userPrompt}

Provide a detailed, actionable response.
    `.trim();
  }

  protected updateMetrics(success: boolean, executionTime: number, taskType: string): void {
    this.metrics.totalTasks++;
    
    if (success) {
      this.metrics.successfulTasks++;
    } else {
      this.metrics.failedTasks++;
    }

    // Update average completion time
    const totalTime = this.metrics.averageCompletionTime * (this.metrics.totalTasks - 1) + executionTime;
    this.metrics.averageCompletionTime = totalTime / this.metrics.totalTasks;

    // Update success rate
    this.metrics.successRate = this.metrics.successfulTasks / this.metrics.totalTasks;

    // Update task type metrics
    if (!this.metrics.taskTypeMetrics[taskType]) {
      this.metrics.taskTypeMetrics[taskType] = 0;
    }
    this.metrics.taskTypeMetrics[taskType]++;

    this.metrics.lastUpdated = new Date();
  }

  // Abstract methods to be implemented by concrete agent classes
  protected abstract analyzeTask(task: Task): Promise<TaskAnalysis>;
  protected abstract execute(analysis: TaskAnalysis, task: Task): Promise<any>;
  protected abstract validate(result: any): Promise<ValidationResult>;
}

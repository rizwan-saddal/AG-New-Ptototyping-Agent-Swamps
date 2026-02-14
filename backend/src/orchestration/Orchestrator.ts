// Main Orchestrator - Coordinates all agents and tasks

import { v4 as uuidv4 } from 'uuid';
import { AgentRegistry } from './AgentRegistry.js';
import { AgentSelector } from './AgentSelector.js';
import { TaskQueue } from './TaskQueue.js';
import { EventEmitter } from 'events';
import type { Task, TaskResult, TaskType, TaskPriority, TaskStatus } from '../shared/types.js';

interface TaskRequest {
  title: string;
  description: string;
  type?: TaskType;
  priority?: TaskPriority;
  requiredCapabilities?: string[];
  context?: any;
}

export class Orchestrator {
  private agentRegistry: AgentRegistry;
  private agentSelector: AgentSelector;
  private taskQueue: TaskQueue;
  private processing: boolean = false;
  private taskResults: Map<string, TaskResult> = new Map();
  private taskEvents: EventEmitter;

  constructor() {
    this.agentRegistry = new AgentRegistry();
    this.agentSelector = new AgentSelector(this.agentRegistry);
    this.taskQueue = new TaskQueue();
    this.taskEvents = new EventEmitter();
  }

  getRegistry(): AgentRegistry {
    return this.agentRegistry;
  }

  getSelector(): AgentSelector {
    return this.agentSelector;
  }

  getQueue(): TaskQueue {
    return this.taskQueue;
  }

  async submitTask(taskRequest: TaskRequest): Promise<string> {
    // Create task
    const task: Task = {
      id: uuidv4(),
      title: taskRequest.title,
      description: taskRequest.description,
      type: taskRequest.type || 'GENERAL' as TaskType,
      priority: taskRequest.priority || 'MEDIUM' as TaskPriority,
      status: 'PENDING' as TaskStatus,
      requiredCapabilities: taskRequest.requiredCapabilities || [],
      context: taskRequest.context || { additionalData: {} },
      dependencies: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Enqueue task
    this.taskQueue.enqueue(task);

    // Start processing if not already running
    if (!this.processing) {
      this.processQueue();
    }

    return task.id;
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return;
    
    this.processing = true;

    while (true) {
      const task = this.taskQueue.dequeue();
      
      if (!task) {
        // No more tasks
        break;
      }

      await this.processTask(task);
    }

    this.processing = false;
  }

  private async processTask(task: Task): Promise<void> {
    try {
      // Select best agent
      const agent = this.agentSelector.selectAgent(task);

      if (!agent) {
        // No available agent, requeue
        this.taskQueue.enqueue(task);
        await this.delay(1000);
        return;
      }

      // Assign task
      task.assignedAgentId = agent.id;
      task.status = 'ASSIGNED' as TaskStatus;
      this.taskQueue.updateTaskStatus(task.id, 'ASSIGNED' as TaskStatus);
      
      this.agentRegistry.updateAgentStatus(agent.id, 'ASSIGNED' as any);
      this.agentRegistry.incrementLoad(agent.id);

      // Process task
      task.status = 'IN_PROGRESS' as TaskStatus;
      this.taskQueue.updateTaskStatus(task.id, 'IN_PROGRESS' as TaskStatus);

      const result = await agent.processTask(task);

      // Store result
      this.taskResults.set(task.id, result);
      this.taskEvents.emit('task:completed', task.id, result);

      // Update task status
      if (result.success) {
        task.status = 'COMPLETED' as TaskStatus;
        this.taskQueue.updateTaskStatus(task.id, 'COMPLETED' as TaskStatus);
      } else {
        task.status = 'FAILED' as TaskStatus;
        this.taskQueue.updateTaskStatus(task.id, 'FAILED' as TaskStatus);
      }

      // Update agent
      this.agentRegistry.decrementLoad(agent.id);
      
    } catch (error) {
      console.error(`Error processing task ${task.id}:`, error);
      task.status = 'FAILED' as TaskStatus;
      this.taskQueue.updateTaskStatus(task.id, 'FAILED' as TaskStatus);
      
      if (task.assignedAgentId) {
        this.agentRegistry.decrementLoad(task.assignedAgentId);
      }
    }
  }

  getTaskStatus(taskId: string): Task | undefined {
    return this.taskQueue.getTask(taskId);
  }

  getTaskResult(taskId: string): TaskResult | undefined {
    return this.taskResults.get(taskId);
  }

  cancelTask(taskId: string): boolean {
    const task = this.taskQueue.getTask(taskId);
    
    if (!task) return false;
    
    if (task.status === 'PENDING' as TaskStatus || task.status === 'ASSIGNED' as TaskStatus) {
      this.taskQueue.removeTask(taskId);
      task.status = 'CANCELLED' as TaskStatus;
      return true;
    }

    return false;
  }

  getSystemStats() {
    return {
      agents: this.agentRegistry.getSystemStats(),
      tasks: this.taskQueue.getStats(),
      results: {
        total: this.taskResults.size,
        successful: Array.from(this.taskResults.values()).filter(r => r.success).length,
        failed: Array.from(this.taskResults.values()).filter(r => !r.success).length
      }
    };
  }

  async waitForTask(taskId: string, timeout: number = 30000): Promise<TaskResult> {
    const existing = this.taskResults.get(taskId);
    if (existing) return existing;

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error(`Task ${taskId} timeout`));
      }, timeout);

      const onComplete = (completedId: string, result: TaskResult) => {
        if (completedId === taskId) {
          cleanup();
          resolve(result);
        }
      };

      const cleanup = () => {
        clearTimeout(timer);
        this.taskEvents.off('task:completed', onComplete);
      };

      this.taskEvents.on('task:completed', onComplete);
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

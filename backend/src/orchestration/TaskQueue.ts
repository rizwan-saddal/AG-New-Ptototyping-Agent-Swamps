// Task Queue - Priority-based task queue management

import type { Task, TaskPriority, TaskStatus } from '../shared/types.js';

interface QueuedTask {
  task: Task;
  enqueuedAt: Date;
}

export class TaskQueue {
  private queues: Map<TaskPriority, QueuedTask[]> = new Map([
    ['CRITICAL' as TaskPriority, []],
    ['HIGH' as TaskPriority, []],
    ['MEDIUM' as TaskPriority, []],
    ['LOW' as TaskPriority, []]
  ]);

  private activeTasks: Map<string, Task> = new Map();
  private completedTasks: Map<string, Task> = new Map();

  enqueue(task: Task): void {
    const queue = this.queues.get(task.priority);
    if (queue) {
      queue.push({
        task,
        enqueuedAt: new Date()
      });
    }
  }

  dequeue(): Task | null {
    // Check queues in priority order
    const priorities: TaskPriority[] = ['CRITICAL' as TaskPriority, 'HIGH' as TaskPriority, 'MEDIUM' as TaskPriority, 'LOW' as TaskPriority];
    
    for (const priority of priorities) {
      const queue = this.queues.get(priority);
      if (queue && queue.length > 0) {
        const queuedTask = queue.shift();
        if (queuedTask) {
          this.activeTasks.set(queuedTask.task.id, queuedTask.task);
          return queuedTask.task;
        }
      }
    }

    return null;
  }

  peek(): Task | null {
    const priorities: TaskPriority[] = ['CRITICAL' as TaskPriority, 'HIGH' as TaskPriority, 'MEDIUM' as TaskPriority, 'LOW' as TaskPriority];
    
    for (const priority of priorities) {
      const queue = this.queues.get(priority);
      if (queue && queue.length > 0) {
        return queue[0].task;
      }
    }

    return null;
  }

  getTask(taskId: string): Task | undefined {
    // Check active tasks
    let task = this.activeTasks.get(taskId);
    if (task) return task;

    // Check queued tasks
    for (const queue of this.queues.values()) {
      task = queue.find(qt => qt.task.id === taskId)?.task;
      if (task) return task;
    }

    // Check completed tasks
    return this.completedTasks.get(taskId);
  }

  updateTaskStatus(taskId: string, status: TaskStatus): void {
    const task = this.getTask(taskId);
    if (task) {
      task.status = status;
      task.updatedAt = new Date();

      if (status === 'COMPLETED' as TaskStatus || status === 'FAILED' as TaskStatus || status === 'CANCELLED' as TaskStatus) {
        task.completedAt = new Date();
        this.activeTasks.delete(taskId);
        this.completedTasks.set(taskId, task);
      }
    }
  }

  removeTask(taskId: string): boolean {
    // Remove from active
    if (this.activeTasks.delete(taskId)) {
      return true;
    }

    // Remove from queues
    for (const queue of this.queues.values()) {
      const index = queue.findIndex(qt => qt.task.id === taskId);
      if (index >= 0) {
        queue.splice(index, 1);
        return true;
      }
    }

    return false;
  }

  getPendingTasks(): Task[] {
    const tasks: Task[] = [];
    
    for (const queue of this.queues.values()) {
      tasks.push(...queue.map(qt => qt.task));
    }

    return tasks;
  }

  getActiveTasks(): Task[] {
    return Array.from(this.activeTasks.values());
  }

  getCompletedTasks(): Task[] {
    return Array.from(this.completedTasks.values());
  }

  getQueueSize(): number {
    let size = 0;
    for (const queue of this.queues.values()) {
      size += queue.length;
    }
    return size;
  }

  getStats() {
    return {
      pending: this.getQueueSize(),
      active: this.activeTasks.size,
      completed: this.completedTasks.size,
      byPriority: {
        critical: this.queues.get('CRITICAL' as TaskPriority)?.length || 0,
        high: this.queues.get('HIGH' as TaskPriority)?.length || 0,
        medium: this.queues.get('MEDIUM' as TaskPriority)?.length || 0,
        low: this.queues.get('LOW' as TaskPriority)?.length || 0
      }
    };
  }

  clear(): void {
    for (const queue of this.queues.values()) {
      queue.length = 0;
    }
    this.activeTasks.clear();
  }

  clearCompleted(): void {
    this.completedTasks.clear();
  }
}

// Agent Selector - Intelligent agent selection based on multiple factors

import type { Agent } from '../agents/Agent.js';
import type { Task, TaskType } from '../shared/types.js';
import type { AgentRegistry } from './AgentRegistry.js';

interface ScoringWeights {
  specialization: number;
  historicalSuccess: number;
  availability: number;
  recentPerformance: number;
  loadBalance: number;
}

export class AgentSelector {
  private registry: AgentRegistry;
  private weights: ScoringWeights = {
    specialization: 0.35,
    historicalSuccess: 0.25,
    availability: 0.20,
    recentPerformance: 0.15,
    loadBalance: 0.05
  };

  constructor(registry: AgentRegistry) {
    this.registry = registry;
  }

  selectAgent(task: Task): Agent | null {
    const availableAgents = this.registry.getAvailableAgents();
    
    if (availableAgents.length === 0) {
      return null;
    }

    // Filter agents by capability
    const capableAgents = availableAgents.filter(
      agent => this.hasRequiredCapabilities(agent, task)
    );

    if (capableAgents.length === 0) {
      // If no exact match, try any available agent
      return availableAgents[0];
    }

    // Score and select best agent
    const scoredAgents = capableAgents.map(agent => ({
      agent,
      score: this.calculateScore(agent, task)
    }));

    scoredAgents.sort((a, b) => b.score - a.score);

    return scoredAgents[0].agent;
  }

  selectAgents(task: Task, count: number): Agent[] {
    const selected: Agent[] = [];
    const availableAgents = this.registry.getAvailableAgents();

    for (let i = 0; i < count && i < availableAgents.length; i++) {
      const agent = this.selectAgent(task);
      if (agent && !selected.includes(agent)) {
        selected.push(agent);
      }
    }

    return selected;
  }

  private calculateScore(agent: Agent, task: Task): number {
    const specializationScore = this.getSpecializationScore(agent, task);
    const historicalScore = this.getHistoricalSuccessScore(agent, task);
    const availabilityScore = this.getAvailabilityScore(agent);
    const performanceScore = this.getRecentPerformanceScore(agent);
    const loadScore = this.getLoadBalanceScore(agent);

    return (
      specializationScore * this.weights.specialization +
      historicalScore * this.weights.historicalSuccess +
      availabilityScore * this.weights.availability +
      performanceScore * this.weights.recentPerformance +
      loadScore * this.weights.loadBalance
    );
  }

  private getSpecializationScore(agent: Agent, task: Task): number {
    // Check if agent can handle this task type
    if (!agent.capabilities.supportedTaskTypes.includes(task.type)) {
      return 0.3; // Low but not zero - can still attempt
    }

    // Calculate skill match
    const requiredCaps = new Set(task.requiredCapabilities);
    const agentCaps = new Set(agent.capabilities.skills);

    if (requiredCaps.size === 0) {
      return 0.8; // No specific requirements
    }

    const intersection = new Set(
      [...requiredCaps].filter(x => agentCaps.has(x))
    );

    return intersection.size / requiredCaps.size;
  }

  private getHistoricalSuccessScore(agent: Agent, task: Task): number {
    const metrics = agent.metrics;
    
    // Check task type specific metrics
    const taskTypeCount = metrics.taskTypeMetrics[task.type] || 0;
    
    if (taskTypeCount > 0 && metrics.totalTasks > 0) {
      // Has experience with this task type
      return metrics.successRate;
    }

    // No specific experience, use overall success rate
    if (metrics.totalTasks > 0) {
      return metrics.successRate * 0.7; // Penalize for lack of specific experience
    }

    // No history, neutral score
    return 0.5;
  }

  private getAvailabilityScore(agent: Agent): number {
    const currentLoad = this.registry.getCurrentLoad(agent.id);
    const capacity = agent.capabilities.maxConcurrentTasks;

    if (currentLoad >= capacity) {
      return 0;
    }

    return 1 - (currentLoad / capacity);
  }

  private getRecentPerformanceScore(agent: Agent): number {
    // Use overall success rate as proxy for recent performance
    // Could be enhanced with time-weighted metrics
    return agent.metrics.successRate;
  }

  private getLoadBalanceScore(agent: Agent): number {
    const currentLoad = this.registry.getCurrentLoad(agent.id);
    const allAgents = this.registry.getAllAgents();
    
    if (allAgents.length === 0) return 1;

    const avgLoad = allAgents.reduce(
      (sum, a) => sum + this.registry.getCurrentLoad(a.id),
      0
    ) / allAgents.length;

    // Prefer agents with below-average load
    if (currentLoad < avgLoad) {
      return 1;
    } else if (currentLoad === avgLoad) {
      return 0.5;
    } else {
      return Math.max(0, 1 - (currentLoad - avgLoad) / avgLoad);
    }
  }

  private hasRequiredCapabilities(agent: Agent, task: Task): boolean {
    if (task.requiredCapabilities.length === 0) {
      return true;
    }

    return task.requiredCapabilities.some(
      cap => agent.capabilities.skills.includes(cap)
    );
  }

  updateWeights(newWeights: Partial<ScoringWeights>): void {
    this.weights = { ...this.weights, ...newWeights };
  }

  getWeights(): ScoringWeights {
    return { ...this.weights };
  }
}

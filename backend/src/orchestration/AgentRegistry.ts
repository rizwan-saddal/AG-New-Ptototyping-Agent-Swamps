// Agent Registry - Manages all available agents

import type { Agent } from '../agents/Agent.js';
import type { AgentType, AgentStatus, PerformanceMetrics } from '../shared/types.js';

interface AgentMetadata {
  registeredAt: Date;
  lastActive: Date;
  currentLoad: number;
}

export class AgentRegistry {
  private agents: Map<string, Agent> = new Map();
  private metadata: Map<string, AgentMetadata> = new Map();

  registerAgent(agent: Agent): void {
    this.agents.set(agent.id, agent);
    this.metadata.set(agent.id, {
      registeredAt: new Date(),
      lastActive: new Date(),
      currentLoad: 0
    });

    agent.updateStatus('IDLE' as AgentStatus);
  }

  unregisterAgent(agentId: string): void {
    this.agents.delete(agentId);
    this.metadata.delete(agentId);
  }

  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  getAvailableAgents(): Agent[] {
    return this.getAllAgents().filter(
      agent => agent.status === 'IDLE' as AgentStatus
    );
  }

  getAgentsByType(type: AgentType): Agent[] {
    return this.getAllAgents().filter(agent => agent.type === type);
  }

  updateAgentStatus(agentId: string, status: AgentStatus): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.updateStatus(status);
      const meta = this.metadata.get(agentId);
      if (meta) {
        meta.lastActive = new Date();
      }
    }
  }

  getAgentMetrics(agentId: string): PerformanceMetrics | undefined {
    const agent = this.agents.get(agentId);
    return agent?.getMetrics();
  }

  incrementLoad(agentId: string): void {
    const meta = this.metadata.get(agentId);
    if (meta) {
      meta.currentLoad++;
    }
  }

  decrementLoad(agentId: string): void {
    const meta = this.metadata.get(agentId);
    if (meta && meta.currentLoad > 0) {
      meta.currentLoad--;
    }
  }

  getCurrentLoad(agentId: string): number {
    return this.metadata.get(agentId)?.currentLoad || 0;
  }

  getMetadata(agentId: string): AgentMetadata | undefined {
    return this.metadata.get(agentId);
  }

  getSystemStats() {
    const agents = this.getAllAgents();
    const available = this.getAvailableAgents();

    return {
      totalAgents: agents.length,
      availableAgents: available.length,
      busyAgents: agents.length - available.length,
      agentsByType: this.getAgentTypeDistribution(),
      totalTasks: agents.reduce((sum, agent) => sum + agent.metrics.totalTasks, 0),
      overallSuccessRate: this.calculateOverallSuccessRate()
    };
  }

  private getAgentTypeDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    for (const agent of this.agents.values()) {
      const type = agent.type;
      distribution[type] = (distribution[type] || 0) + 1;
    }

    return distribution;
  }

  private calculateOverallSuccessRate(): number {
    const agents = this.getAllAgents();
    if (agents.length === 0) return 0;

    const totalTasks = agents.reduce((sum, agent) => sum + agent.metrics.totalTasks, 0);
    if (totalTasks === 0) return 0;

    const successfulTasks = agents.reduce((sum, agent) => sum + agent.metrics.successfulTasks, 0);
    return successfulTasks / totalTasks;
  }
}

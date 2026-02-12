// API Server with REST and WebSocket support

import express, { type Request, type Response } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import cors from 'cors';
import { Orchestrator } from '../orchestration/Orchestrator.js';
import { AgentManagementSystem } from '../orchestration/AgentManagementSystem.js';
import { WorkflowManagementSystem } from '../orchestration/WorkflowManagementSystem.js';
import type { Agent } from '../agents/Agent.js';

export class APIServer {
  private app: express.Application;
  private httpServer: ReturnType<typeof createServer>;
  private io: SocketIOServer;
  private orchestrator: Orchestrator;
  private agentManagement?: AgentManagementSystem;
  private workflowManagement?: WorkflowManagementSystem;
  private port: number;

  constructor(
    orchestrator: Orchestrator, 
    port: number = 3000,
    agentManagement?: AgentManagementSystem,
    workflowManagement?: WorkflowManagementSystem
  ) {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });
    this.orchestrator = orchestrator;
    this.agentManagement = agentManagement;
    this.workflowManagement = workflowManagement;
    this.port = port;

    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Logging middleware
    this.app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Task endpoints
    this.app.post('/api/tasks', this.createTask.bind(this));
    this.app.get('/api/tasks', this.listTasks.bind(this));
    this.app.get('/api/tasks/:id', this.getTask.bind(this));
    this.app.delete('/api/tasks/:id', this.cancelTask.bind(this));

    // Agent endpoints
    this.app.get('/api/agents', this.listAgents.bind(this));
    this.app.get('/api/agents/:id', this.getAgent.bind(this));
    this.app.get('/api/agents/:id/metrics', this.getAgentMetrics.bind(this));

    // Agent Management endpoints
    if (this.agentManagement) {
      this.app.post('/api/agents/create', this.createAgent.bind(this));
      this.app.post('/api/agents/:id/train', this.trainAgent.bind(this));
      this.app.get('/api/agents/:id/insights', this.getAgentInsights.bind(this));
      this.app.get('/api/agents/:id/learning-profile', this.getLearningProfile.bind(this));
      this.app.get('/api/agent-templates', this.listAgentTemplates.bind(this));
      this.app.post('/api/agent-templates', this.addAgentTemplate.bind(this));
    }

    // Workflow endpoints
    if (this.workflowManagement) {
      this.app.get('/api/workflows/templates', this.listWorkflowTemplates.bind(this));
      this.app.get('/api/workflows/templates/:id', this.getWorkflowTemplate.bind(this));
      this.app.post('/api/workflows/templates', this.createWorkflowTemplate.bind(this));
      this.app.post('/api/workflows/execute', this.executeWorkflow.bind(this));
      this.app.get('/api/workflows/executions/:id', this.getWorkflowStatus.bind(this));
    }

    // System endpoints
    this.app.get('/api/system/stats', this.getSystemStats.bind(this));
  }

  private setupWebSocket(): void {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('subscribe:tasks', () => {
        socket.join('tasks');
      });

      socket.on('subscribe:agents', () => {
        socket.join('agents');
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  // Task handlers
  private async createTask(req: Request, res: Response): Promise<void> {
    try {
      const taskRequest = req.body;
      const taskId = await this.orchestrator.submitTask(taskRequest);

      // Emit task created event
      this.io.to('tasks').emit('task:created', {
        taskId,
        task: this.orchestrator.getTaskStatus(taskId)
      });

      res.json({
        success: true,
        taskId,
        message: 'Task submitted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private listTasks(req: Request, res: Response): void {
    try {
      const queue = this.orchestrator.getQueue();
      const pending = queue.getPendingTasks();
      const active = queue.getActiveTasks();
      const completed = queue.getCompletedTasks();

      res.json({
        success: true,
        tasks: {
          pending,
          active,
          completed
        },
        total: pending.length + active.length + completed.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private getTask(req: Request, res: Response): void {
    try {
      const taskId = req.params.id;
      const task = this.orchestrator.getTaskStatus(taskId);
      const result = this.orchestrator.getTaskResult(taskId);

      if (!task) {
        res.status(404).json({
          success: false,
          error: 'Task not found'
        });
        return;
      }

      res.json({
        success: true,
        task,
        result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private cancelTask(req: Request, res: Response): void {
    try {
      const taskId = req.params.id;
      const cancelled = this.orchestrator.cancelTask(taskId);

      if (cancelled) {
        this.io.to('tasks').emit('task:cancelled', { taskId });
        
        res.json({
          success: true,
          message: 'Task cancelled'
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Task cannot be cancelled'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Agent handlers
  private listAgents(req: Request, res: Response): void {
    try {
      const registry = this.orchestrator.getRegistry();
      const agents = registry.getAllAgents();

      const agentData = agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        type: agent.type,
        status: agent.status,
        capabilities: agent.capabilities,
        metrics: agent.metrics,
        currentLoad: registry.getCurrentLoad(agent.id)
      }));

      res.json({
        success: true,
        agents: agentData,
        total: agentData.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private getAgent(req: Request, res: Response): void {
    try {
      const agentId = req.params.id;
      const registry = this.orchestrator.getRegistry();
      const agent = registry.getAgent(agentId);

      if (!agent) {
        res.status(404).json({
          success: false,
          error: 'Agent not found'
        });
        return;
      }

      res.json({
        success: true,
        agent: {
          id: agent.id,
          name: agent.name,
          type: agent.type,
          status: agent.status,
          capabilities: agent.capabilities,
          metrics: agent.metrics,
          currentLoad: registry.getCurrentLoad(agent.id)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private getAgentMetrics(req: Request, res: Response): void {
    try {
      const agentId = req.params.id;
      const registry = this.orchestrator.getRegistry();
      const metrics = registry.getAgentMetrics(agentId);

      if (!metrics) {
        res.status(404).json({
          success: false,
          error: 'Agent not found'
        });
        return;
      }

      res.json({
        success: true,
        metrics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private getSystemStats(req: Request, res: Response): void {
    try {
      const stats = this.orchestrator.getSystemStats();

      res.json({
        success: true,
        stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Agent Management handlers
  private async createAgent(req: Request, res: Response): Promise<void> {
    try {
      if (!this.agentManagement) {
        res.status(503).json({
          success: false,
          error: 'Agent management system not available'
        });
        return;
      }

      const agentRequest = req.body;
      const agent = this.agentManagement.createAgent(agentRequest);

      // Register with orchestrator
      this.orchestrator.getRegistry().registerAgent(agent);

      res.json({
        success: true,
        agent: {
          id: agent.id,
          name: agent.name,
          type: agent.type,
          capabilities: agent.capabilities
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private trainAgent(req: Request, res: Response): void {
    try {
      if (!this.agentManagement) {
        res.status(503).json({
          success: false,
          error: 'Agent management system not available'
        });
        return;
      }

      const agentId = req.params.id;
      const { trainingData } = req.body;

      this.agentManagement.trainAgent(agentId, trainingData);

      res.json({
        success: true,
        message: 'Agent training completed'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private getAgentInsights(req: Request, res: Response): void {
    try {
      if (!this.agentManagement) {
        res.status(503).json({
          success: false,
          error: 'Agent management system not available'
        });
        return;
      }

      const agentId = req.params.id;
      const insights = this.agentManagement.getAgentInsights(agentId);

      if (!insights) {
        res.status(404).json({
          success: false,
          error: 'Agent not found or no insights available'
        });
        return;
      }

      res.json({
        success: true,
        insights
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private getLearningProfile(req: Request, res: Response): void {
    try {
      if (!this.agentManagement) {
        res.status(503).json({
          success: false,
          error: 'Agent management system not available'
        });
        return;
      }

      const agentId = req.params.id;
      const profile = this.agentManagement.getLearningProfile(agentId);

      if (!profile) {
        res.status(404).json({
          success: false,
          error: 'Learning profile not found'
        });
        return;
      }

      res.json({
        success: true,
        profile
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private listAgentTemplates(req: Request, res: Response): void {
    try {
      if (!this.agentManagement) {
        res.status(503).json({
          success: false,
          error: 'Agent management system not available'
        });
        return;
      }

      const templates = this.agentManagement.listTemplates();

      res.json({
        success: true,
        templates,
        total: templates.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private addAgentTemplate(req: Request, res: Response): void {
    try {
      if (!this.agentManagement) {
        res.status(503).json({
          success: false,
          error: 'Agent management system not available'
        });
        return;
      }

      const template = req.body;
      this.agentManagement.addCustomTemplate(template);

      res.json({
        success: true,
        message: 'Template added successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Workflow Management handlers
  private listWorkflowTemplates(req: Request, res: Response): void {
    try {
      if (!this.workflowManagement) {
        res.status(503).json({
          success: false,
          error: 'Workflow management system not available'
        });
        return;
      }

      const category = req.query.category as any;
      const templates = this.workflowManagement.listTemplates(category);

      res.json({
        success: true,
        templates,
        total: templates.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private getWorkflowTemplate(req: Request, res: Response): void {
    try {
      if (!this.workflowManagement) {
        res.status(503).json({
          success: false,
          error: 'Workflow management system not available'
        });
        return;
      }

      const templateId = req.params.id;
      const template = this.workflowManagement.getTemplate(templateId);

      if (!template) {
        res.status(404).json({
          success: false,
          error: 'Template not found'
        });
        return;
      }

      res.json({
        success: true,
        template
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private createWorkflowTemplate(req: Request, res: Response): void {
    try {
      if (!this.workflowManagement) {
        res.status(503).json({
          success: false,
          error: 'Workflow management system not available'
        });
        return;
      }

      const template = req.body;
      this.workflowManagement.addCustomTemplate(template);

      res.json({
        success: true,
        message: 'Workflow template created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async executeWorkflow(req: Request, res: Response): Promise<void> {
    try {
      if (!this.workflowManagement) {
        res.status(503).json({
          success: false,
          error: 'Workflow management system not available'
        });
        return;
      }

      const { templateId, inputs } = req.body;
      const executionId = await this.workflowManagement.executeWorkflow(templateId, inputs);

      res.json({
        success: true,
        executionId,
        message: 'Workflow execution started'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private getWorkflowStatus(req: Request, res: Response): void {
    try {
      if (!this.workflowManagement) {
        res.status(503).json({
          success: false,
          error: 'Workflow management system not available'
        });
        return;
      }

      const executionId = req.params.id;
      const status = this.workflowManagement.getWorkflowStatus(executionId);

      if (!status) {
        res.status(404).json({
          success: false,
          error: 'Workflow execution not found'
        });
        return;
      }

      res.json({
        success: true,
        workflow: status
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // WebSocket emitters
  emitTaskUpdate(taskId: string, task: any): void {
    this.io.to('tasks').emit('task:updated', { taskId, task });
  }

  emitAgentUpdate(agentId: string, agent: any): void {
    this.io.to('agents').emit('agent:updated', { agentId, agent });
  }

  start(): void {
    this.httpServer.listen(this.port, () => {
      console.log(`🚀 API Server running on port ${this.port}`);
      console.log(`   REST API: http://localhost:${this.port}/api`);
      console.log(`   WebSocket: ws://localhost:${this.port}`);
    });
  }

  stop(): void {
    this.httpServer.close();
  }
}

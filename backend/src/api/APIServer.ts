// API Server with REST and WebSocket support

import express, { type NextFunction, type Request, type Response } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import cors from 'cors';
import { z } from 'zod';
import { Orchestrator } from '../orchestration/Orchestrator.js';
import { AgentManagementSystem } from '../orchestration/AgentManagementSystem.js';
import { WorkflowManagementSystem } from '../orchestration/WorkflowManagementSystem.js';
import { AgentType, TaskPriority, TaskType } from '../shared/types.js';

const taskRequestSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.nativeEnum(TaskType).default(TaskType.GENERAL),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  requiredCapabilities: z.array(z.string()).optional(),
  context: z.record(z.any()).optional()
});

const agentCreateSchema = z.object({
  name: z.string().min(1),
  type: z.nativeEnum(AgentType),
  templateId: z.string().optional(),
  customCapabilities: z.array(z.string()).optional(),
  customSpecializations: z.array(z.string()).optional(),
  trainingStrategy: z.enum(['supervised', 'reinforced', 'continuous']).optional(),
  initialTrainingData: z.array(
    z.object({
      taskId: z.string(),
      input: z.string(),
      output: z.string(),
      success: z.boolean(),
      feedback: z.string().optional(),
      timestamp: z.coerce.date()
    })
  ).optional()
});

const trainingSchema = z.object({
  trainingData: z.array(
    z.object({
      taskId: z.string(),
      input: z.string(),
      output: z.string(),
      success: z.boolean(),
      feedback: z.string().optional(),
      timestamp: z.coerce.date()
    })
  ).min(1)
});

const agentTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.nativeEnum(AgentType),
  description: z.string().min(1),
  defaultCapabilities: z.array(z.string()),
  defaultSpecializations: z.array(z.string()),
  promptTemplate: z.string().min(1),
  trainingStrategy: z.enum(['supervised', 'reinforced', 'continuous']).optional()
});

const workflowTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  steps: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    agentType: z.nativeEnum(AgentType),
    taskType: z.nativeEnum(TaskType),
    dependencies: z.array(z.string()),
    inputs: z.record(z.any()),
    expectedOutputs: z.array(z.string())
  })),
  requiredAgentTypes: z.array(z.nativeEnum(AgentType)),
  estimatedDuration: z.number().optional(),
  category: z.enum(['development', 'marketing', 'operations', 'custom'])
});

const workflowExecuteSchema = z.object({
  templateId: z.string().min(1),
  inputs: z.record(z.any()).default({})
});

export class APIServer {
  private app: express.Application;
  private httpServer: ReturnType<typeof createServer>;
  private io: SocketIOServer;
  private orchestrator: Orchestrator;
  private agentManagement?: AgentManagementSystem;
  private workflowManagement?: WorkflowManagementSystem;
  private connectorRegistry?: ConnectorRegistry;
  private port: number;
  private apiKey?: string;

  constructor(
    orchestrator: Orchestrator, 
    port: number = 3000,
    agentManagement?: AgentManagementSystem,
    workflowManagement?: WorkflowManagementSystem,
    connectorRegistry?: ConnectorRegistry
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
    this.connectorRegistry = connectorRegistry;
    this.port = port;
    this.apiKey = process.env.API_KEY;

    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Logging middleware
    this.app.use((req, _res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });

    // Simple API key authentication for protected endpoints
    this.app.use(this.authenticateRequest.bind(this));
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (_req: Request, res: Response) => {
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
      this.app.get('/api/workflows/templates/:id/canvas', this.getWorkflowCanvas.bind(this));
      this.app.post('/api/workflows/templates', this.createWorkflowTemplate.bind(this));
      this.app.post('/api/workflows/execute', this.executeWorkflow.bind(this));
      this.app.get('/api/workflows/executions/:id', this.getWorkflowStatus.bind(this));
    }

    // Connector endpoints (open standards)
    if (this.connectorRegistry) {
      this.app.get('/api/connectors', this.listConnectors.bind(this));
      this.app.get('/api/connectors/:id', this.getConnector.bind(this));
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

  private authenticateRequest(req: Request, res: Response, next: NextFunction): void {
    if (!this.apiKey || req.path === '/health') {
      next();
      return;
    }

    const provided = (req.headers['x-api-key'] as string | undefined) || (req.query.api_key as string | undefined);
    if (provided === this.apiKey) {
      next();
      return;
    }

    res.status(401).json({
      success: false,
      error: 'Unauthorized'
    });
  }

  private validateRequest<T>(schema: z.ZodSchema<T>, payload: unknown, res: Response): T | undefined {
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: 'Invalid request payload',
        details: parsed.error.flatten()
      });
      return undefined;
    }
    return parsed.data;
  }

  // Task handlers
  private async createTask(req: Request, res: Response): Promise<void> {
    try {
      const taskRequest = this.validateRequest(taskRequestSchema, req.body, res);
      if (!taskRequest) return;
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

  private listTasks(_req: Request, res: Response): void {
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
  private listAgents(_req: Request, res: Response): void {
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

  private getSystemStats(_req: Request, res: Response): void {
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

      const agentRequest = this.validateRequest(agentCreateSchema, req.body, res);
      if (!agentRequest) return;

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
      const body = this.validateRequest(trainingSchema, req.body, res);
      if (!body) return;

      this.agentManagement.trainAgent(agentId, body.trainingData);

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

  private listAgentTemplates(_req: Request, res: Response): void {
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

      const template = this.validateRequest(agentTemplateSchema, req.body, res);
      if (!template) return;

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

      const categoryParam = typeof req.query.category === 'string' ? req.query.category : undefined;
      const templates = this.workflowManagement.listTemplates(categoryParam as any);

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

      const template = this.validateRequest(workflowTemplateSchema, req.body, res);
      if (!template) return;

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

      const payload = this.validateRequest(workflowExecuteSchema, req.body, res);
      if (!payload) return;

      const { templateId } = payload;
      const inputs = payload.inputs ?? {};
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

  private getWorkflowCanvas(req: Request, res: Response): void {
    try {
      if (!this.workflowManagement) {
        res.status(503).json({
          success: false,
          error: 'Workflow management system not available'
        });
        return;
      }

      const canvas = this.workflowManagement.getWorkflowCanvas(req.params.id);

      if (!canvas) {
        res.status(404).json({
          success: false,
          error: 'Workflow template not found'
        });
        return;
      }

      res.json({
        success: true,
        canvas
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private listConnectors(_req: Request, res: Response): void {
    try {
      if (!this.connectorRegistry) {
        res.status(503).json({
          success: false,
          error: 'Connector registry not available'
        });
        return;
      }

      res.json({
        success: true,
        connectors: this.connectorRegistry.list()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private getConnector(req: Request, res: Response): void {
    try {
      if (!this.connectorRegistry) {
        res.status(503).json({
          success: false,
          error: 'Connector registry not available'
        });
        return;
      }

      const connector = this.connectorRegistry.get(req.params.id);
      if (!connector) {
        res.status(404).json({
          success: false,
          error: 'Connector not found'
        });
        return;
      }

      res.json({
        success: true,
        connector
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

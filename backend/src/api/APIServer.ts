// API Server with REST and WebSocket support

import express, { type Request, type Response } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import cors from 'cors';
import { Orchestrator } from '../orchestration/Orchestrator.js';
import type { Agent } from '../agents/Agent.js';

export class APIServer {
  private app: express.Application;
  private httpServer: ReturnType<typeof createServer>;
  private io: SocketIOServer;
  private orchestrator: Orchestrator;
  private port: number;

  constructor(orchestrator: Orchestrator, port: number = 3000) {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });
    this.orchestrator = orchestrator;
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

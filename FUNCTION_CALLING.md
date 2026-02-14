# Function Calling and API Documentation - Agent Swamps

This document describes all function calls, API interfaces, and interaction patterns in the Agent Swamps system.

## Table of Contents

1. [Frontend API Calls](#frontend-api-calls)
2. [Backend API Endpoints](#backend-api-endpoints)
3. [Inter-Agent Communication](#inter-agent-communication)
4. [Ollama Integration](#ollama-integration)
5. [WebSocket Protocol](#websocket-protocol)
6. [Internal Function Calls](#internal-function-calls)

## Frontend API Calls

### Task Management Functions

#### createTask
```typescript
async function createTask(taskInput: TaskInput): Promise<Task> {
  const response = await apiService.post<Task>('/api/tasks', {
    type: taskInput.type,
    description: taskInput.description,
    priority: taskInput.priority || 'MEDIUM',
    metadata: taskInput.metadata
  });
  return response;
}

// Usage
const task = await createTask({
  type: 'FEATURE',
  description: 'Build user authentication system',
  priority: 'HIGH',
  metadata: { deadline: '2024-03-01' }
});
```

#### getTasks
```typescript
async function getTasks(filter?: TaskFilter): Promise<Task[]> {
  const params = {
    status: filter?.status,
    type: filter?.type,
    priority: filter?.priority,
    assignedTo: filter?.assignedTo,
    page: filter?.page || 1,
    limit: filter?.limit || 50
  };
  
  return await apiService.get<Task[]>('/api/tasks', params);
}

// Usage
const activeTasks = await getTasks({ status: 'IN_PROGRESS' });
```

#### updateTask
```typescript
async function updateTask(
  taskId: string, 
  updates: Partial<Task>
): Promise<Task> {
  return await apiService.put<Task>(`/api/tasks/${taskId}`, updates);
}

// Usage
await updateTask('task-123', { status: 'COMPLETED' });
```

#### deleteTask
```typescript
async function deleteTask(taskId: string): Promise<void> {
  await apiService.delete(`/api/tasks/${taskId}`);
}
```

### Agent Management Functions

#### spawnAgent
```typescript
async function spawnAgent(
  type: AgentType, 
  config?: AgentConfig
): Promise<Agent> {
  return await apiService.post<Agent>('/api/agents', {
    type,
    configuration: config || getDefaultConfig(type)
  });
}

// Usage
const devAgent = await spawnAgent('DEVELOPER', {
  model: 'codellama:13b',
  temperature: 0.7,
  maxTokens: 4096
});
```

#### getAgents
```typescript
async function getAgents(filter?: AgentFilter): Promise<Agent[]> {
  const params = {
    type: filter?.type,
    status: filter?.status
  };
  
  return await apiService.get<Agent[]>('/api/agents', params);
}

// Usage
const activeAgents = await getAgents({ status: 'CODING' });
```

#### terminateAgent
```typescript
async function terminateAgent(agentId: string): Promise<void> {
  await apiService.delete(`/api/agents/${agentId}`);
}
```

#### sendAgentCommand
```typescript
async function sendAgentCommand(
  agentId: string, 
  command: AgentCommand
): Promise<void> {
  await apiService.post(`/api/agents/${agentId}/command`, {
    command: command.type,
    parameters: command.parameters
  });
}

// Usage
await sendAgentCommand('agent-456', {
  type: 'PAUSE',
  parameters: {}
});
```

### WebSocket Functions

#### connect
```typescript
function connectWebSocket(url: string): void {
  const ws = new WebSocket(url);
  
  ws.onopen = () => {
    console.log('WebSocket connected');
    subscribe(['tasks', 'agents', 'system']);
  };
  
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    handleWebSocketMessage(message);
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  ws.onclose = () => {
    console.log('WebSocket disconnected');
    setTimeout(() => connectWebSocket(url), 5000);
  };
}
```

#### subscribe
```typescript
function subscribe(channels: string[]): void {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'subscribe',
      channels
    }));
  }
}
```

#### handleWebSocketMessage
```typescript
function handleWebSocketMessage(message: WebSocketMessage): void {
  switch (message.type) {
    case 'agent.status':
      updateAgentStatus(message.agentId, message.status);
      break;
    case 'task.progress':
      updateTaskProgress(message.taskId, message.progress);
      break;
    case 'task.complete':
      handleTaskCompletion(message.taskId);
      break;
    case 'system.metric':
      updateSystemMetric(message.metric, message.value);
      break;
    default:
      console.warn('Unknown message type:', message.type);
  }
}
```

## Backend API Endpoints

### Task Endpoints

#### POST /api/tasks
```typescript
// Create a new task
router.post('/api/tasks', async (req, res) => {
  try {
    const taskInput = validateTaskInput(req.body);
    const task = await taskManager.createTask(taskInput);
    
    // Assign to appropriate agent
    const agentId = await orchestrator.assignTask(task);
    
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Request Body
interface TaskInput {
  type: TaskType;
  description: string;
  priority?: Priority;
  dependencies?: string[];
  metadata?: Record<string, any>;
}

// Response
interface Task {
  id: string;
  type: TaskType;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assignedTo?: string;
  createdAt: string;
  // ... other fields
}
```

#### GET /api/tasks
```typescript
// Get list of tasks with optional filtering
router.get('/api/tasks', async (req, res) => {
  try {
    const filter: TaskFilter = {
      status: req.query.status as TaskStatus,
      type: req.query.type as TaskType,
      priority: req.query.priority as Priority,
      assignedTo: req.query.assignedTo as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 50
    };
    
    const tasks = await taskManager.getTasks(filter);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### GET /api/tasks/:id
```typescript
// Get a specific task by ID
router.get('/api/tasks/:id', async (req, res) => {
  try {
    const task = await taskManager.getTask(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### PUT /api/tasks/:id
```typescript
// Update a task
router.put('/api/tasks/:id', async (req, res) => {
  try {
    const updates = validateTaskUpdates(req.body);
    const task = await taskManager.updateTask(req.params.id, updates);
    
    // Notify via WebSocket
    broadcastTaskUpdate(task);
    
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### Agent Endpoints

#### POST /api/agents
```typescript
// Spawn a new agent
router.post('/api/agents', async (req, res) => {
  try {
    const { type, configuration } = req.body;
    const agent = await orchestrator.spawnAgent(type, configuration);
    
    res.status(201).json(agent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

#### GET /api/agents
```typescript
// Get list of agents
router.get('/api/agents', async (req, res) => {
  try {
    const filter = {
      type: req.query.type as AgentType,
      status: req.query.status as AgentStatus
    };
    
    const agents = await orchestrator.getAgents(filter);
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### DELETE /api/agents/:id
```typescript
// Terminate an agent
router.delete('/api/agents/:id', async (req, res) => {
  try {
    await orchestrator.terminateAgent(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

#### POST /api/agents/:id/command
```typescript
// Send command to agent
router.post('/api/agents/:id/command', async (req, res) => {
  try {
    const { command, parameters } = req.body;
    await orchestrator.sendCommand(req.params.id, command, parameters);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### System Endpoints

#### GET /api/system/status
```typescript
// Get system health status
router.get('/api/system/status', async (req, res) => {
  try {
    const status = {
      healthy: true,
      timestamp: new Date().toISOString(),
      services: {
        database: await checkDatabase(),
        redis: await checkRedis(),
        ollama: await checkOllama(),
        messageBus: await checkMessageBus()
      },
      agents: {
        total: await orchestrator.getAgentCount(),
        active: await orchestrator.getActiveAgentCount(),
        idle: await orchestrator.getIdleAgentCount()
      },
      tasks: {
        pending: await taskManager.getPendingTaskCount(),
        inProgress: await taskManager.getInProgressTaskCount(),
        completed: await taskManager.getCompletedTaskCount()
      }
    };
    
    res.json(status);
  } catch (error) {
    res.status(500).json({ 
      healthy: false, 
      error: error.message 
    });
  }
});
```

#### GET /api/system/metrics
```typescript
// Get system metrics
router.get('/api/system/metrics', async (req, res) => {
  try {
    const metrics = {
      cpu: await getSystemCPU(),
      memory: await getSystemMemory(),
      disk: await getSystemDisk(),
      network: await getNetworkMetrics(),
      agents: await getAgentMetrics(),
      tasks: await getTaskMetrics()
    };
    
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Inter-Agent Communication

### Message Publishing

```typescript
class BaseAgent {
  protected async publishMessage(
    to: string | string[],
    type: MessageType,
    payload: any,
    priority: Priority = 'MEDIUM'
  ): Promise<void> {
    const message: AgentMessage = {
      id: generateUUID(),
      from: this.id,
      to,
      type,
      payload,
      timestamp: Date.now(),
      priority
    };
    
    await this.messageBus.publish('agent.messages', message);
  }
}
```

### Request-Response Pattern

```typescript
class BaseAgent {
  protected async requestFromAgent(
    targetAgentId: string,
    requestType: string,
    payload: any
  ): Promise<any> {
    const correlationId = generateUUID();
    
    // Publish request
    await this.publishMessage(
      targetAgentId,
      'REQUEST',
      { requestType, payload, correlationId },
      'HIGH'
    );
    
    // Wait for response
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 30000);
      
      const handler = (message: AgentMessage) => {
        if (
          message.type === 'RESPONSE' &&
          message.payload.correlationId === correlationId
        ) {
          clearTimeout(timeout);
          this.messageBus.unsubscribe(subscriptionId);
          resolve(message.payload.data);
        }
      };
      
      const subscriptionId = this.messageBus.subscribe(
        `agent.${this.id}`,
        handler
      );
    });
  }
}
```

### Example: Developer-QA Collaboration

```typescript
class DeveloperAgent extends BaseAgent {
  async execute(task: Task): Promise<Result> {
    // Generate code
    const code = await this.generateCode(task);
    
    // Request QA agent to generate tests
    const tests = await this.requestFromAgent(
      'qa-agent-id',
      'GENERATE_TESTS',
      { code, task }
    );
    
    // Run tests
    const results = await this.requestFromAgent(
      'qa-agent-id',
      'RUN_TESTS',
      { tests, code }
    );
    
    if (results.passed) {
      return { success: true, code, tests };
    } else {
      // Fix code based on test failures
      const fixedCode = await this.fixCode(code, results.failures);
      return await this.execute({ ...task, code: fixedCode });
    }
  }
}

class QAAgent extends BaseAgent {
  protected async processMessage(message: AgentMessage): Promise<void> {
    if (message.type === 'REQUEST') {
      const { requestType, payload, correlationId } = message.payload;
      
      let response;
      switch (requestType) {
        case 'GENERATE_TESTS':
          response = await this.generateTests(payload.code);
          break;
        case 'RUN_TESTS':
          response = await this.runTests(payload.tests, payload.code);
          break;
        default:
          throw new Error(`Unknown request type: ${requestType}`);
      }
      
      await this.publishMessage(
        message.from,
        'RESPONSE',
        { correlationId, data: response },
        'HIGH'
      );
    }
  }
}
```

## Ollama Integration

### Client Functions

#### generate
```typescript
async function generate(
  prompt: string,
  model: string = 'llama3',
  options?: GenerateOptions
): Promise<GenerateResponse> {
  const response = await ollamaClient.request('/api/generate', {
    model,
    prompt,
    temperature: options?.temperature || 0.7,
    max_tokens: options?.maxTokens || 2048,
    top_p: options?.topP || 0.9,
    stream: false
  });
  
  return {
    text: response.response,
    model: response.model,
    totalDuration: response.total_duration,
    loadDuration: response.load_duration,
    promptEvalCount: response.prompt_eval_count,
    evalCount: response.eval_count
  };
}

// Usage
const response = await generate(
  'Write a Python function to sort a list',
  'codellama:13b',
  { temperature: 0.5, maxTokens: 1024 }
);
```

#### chat
```typescript
async function chat(
  messages: ChatMessage[],
  model: string = 'llama3',
  options?: ChatOptions
): Promise<ChatResponse> {
  const response = await ollamaClient.request('/api/chat', {
    model,
    messages: messages.map(m => ({
      role: m.role,
      content: m.content
    })),
    temperature: options?.temperature || 0.7,
    stream: false
  });
  
  return {
    message: response.message,
    model: response.model,
    totalDuration: response.total_duration
  };
}

// Usage
const response = await chat([
  { role: 'system', content: 'You are a helpful coding assistant.' },
  { role: 'user', content: 'How do I implement a binary search?' }
], 'llama3');
```

#### embeddings
```typescript
async function embeddings(
  text: string,
  model: string = 'nomic-embed-text'
): Promise<number[]> {
  const response = await ollamaClient.request('/api/embeddings', {
    model,
    prompt: text
  });
  
  return response.embedding;
}

// Usage for RAG
const queryEmbedding = await embeddings('user authentication');
const similarDocs = await vectorDB.search(queryEmbedding, 5);
```

### Agent-Ollama Integration

```typescript
class DeveloperAgent extends BaseAgent {
  private async generateCode(specification: string): Promise<string> {
    const prompt = this.promptBuilder.build('code_generation', {
      specification,
      language: 'typescript',
      framework: 'react',
      context: await this.getRelevantContext(specification)
    });
    
    const response = await this.ollamaClient.generate(
      prompt,
      'codellama:13b',
      {
        temperature: 0.5,
        maxTokens: 4096
      }
    );
    
    return this.responseParser.extractCode(response.text);
  }
  
  private async getRelevantContext(query: string): Promise<string> {
    const embedding = await this.ollamaClient.embeddings(query);
    const docs = await this.memory.searchByEmbedding(embedding, 3);
    return docs.map(d => d.content).join('\n\n');
  }
}
```

## WebSocket Protocol

### Client → Server Messages

#### Subscribe
```typescript
{
  type: 'subscribe',
  channels: ['tasks', 'agents', 'system']
}
```

#### Unsubscribe
```typescript
{
  type: 'unsubscribe',
  channels: ['tasks']
}
```

#### Command
```typescript
{
  type: 'command',
  target: 'agent',
  targetId: 'agent-123',
  command: 'pause' | 'resume' | 'cancel',
  parameters: {}
}
```

#### Chat Message
```typescript
{
  type: 'chat',
  message: 'Create a login form',
  conversationId: 'conv-456'
}
```

### Server → Client Messages

#### Agent Status Update
```typescript
{
  type: 'agent.status',
  agentId: 'agent-123',
  status: 'CODING',
  currentTask: 'task-789',
  timestamp: 1234567890
}
```

#### Task Progress
```typescript
{
  type: 'task.progress',
  taskId: 'task-789',
  progress: 65,
  message: 'Generating test cases...',
  currentPhase: 'testing',
  timestamp: 1234567890
}
```

#### Task Complete
```typescript
{
  type: 'task.complete',
  taskId: 'task-789',
  result: {
    success: true,
    artifacts: [
      { id: 'art-1', type: 'CODE', path: 'src/login.tsx' },
      { id: 'art-2', type: 'TEST', path: 'src/login.test.tsx' }
    ]
  },
  timestamp: 1234567890
}
```

#### System Metric
```typescript
{
  type: 'system.metric',
  metric: 'cpu' | 'memory' | 'activeAgents',
  value: 45.2,
  unit: 'percent' | 'count',
  timestamp: 1234567890
}
```

#### Agent Message
```typescript
{
  type: 'agent.message',
  from: 'agent-123',
  to: 'agent-456',
  messageType: 'REQUEST',
  summary: 'Developer requested QA to generate tests',
  timestamp: 1234567890
}
```

## Internal Function Calls

### Agent Orchestrator

```typescript
class AgentOrchestrator {
  async spawnAgent(
    type: AgentType, 
    config: AgentConfig
  ): Promise<AgentInstance> {
    // Validate configuration
    this.validateConfig(type, config);
    
    // Create agent instance
    const agent = this.agentFactory.create(type, {
      ...this.getDefaultConfig(type),
      ...config,
      id: generateUUID(),
      messageBus: this.messageBus,
      ollamaClient: this.ollamaClient
    });
    
    // Initialize agent
    await agent.initialize();
    
    // Register agent
    this.agents.set(agent.id, agent);
    
    // Notify system
    await this.broadcastAgentSpawned(agent);
    
    return agent;
  }
  
  async assignTask(task: Task): Promise<string> {
    // Select appropriate agent
    const agentId = await this.selectAgentForTask(task);
    
    if (!agentId) {
      // Spawn new agent if needed
      const agent = await this.spawnAgent(
        this.getAgentTypeForTask(task)
      );
      agentId = agent.id;
    }
    
    // Assign task
    await this.messageBus.publish(`agent.${agentId}`, {
      type: 'TASK_ASSIGNMENT',
      task
    });
    
    // Update task
    await this.taskManager.updateTask(task.id, {
      assignedTo: agentId,
      status: 'IN_PROGRESS'
    });
    
    return agentId;
  }
  
  private async selectAgentForTask(task: Task): Promise<string | null> {
    const requiredType = this.getAgentTypeForTask(task);
    const availableAgents = Array.from(this.agents.values())
      .filter(a => a.type === requiredType && a.status === 'IDLE');
    
    if (availableAgents.length === 0) {
      return null;
    }
    
    // Select least loaded agent
    return availableAgents.reduce((best, current) => 
      current.currentLoad < best.currentLoad ? current : best
    ).id;
  }
}
```

### Task Manager

```typescript
class TaskManager {
  async createTask(input: TaskInput): Promise<Task> {
    // Decompose if needed
    const subtasks = this.needsDecomposition(input)
      ? await this.decomposeTask(input)
      : [];
    
    // Create task
    const task: Task = {
      id: generateUUID(),
      type: input.type,
      description: input.description,
      priority: input.priority || 'MEDIUM',
      status: 'PENDING',
      dependencies: input.dependencies || [],
      createdAt: new Date(),
      metadata: input.metadata || {}
    };
    
    // Save to database
    await this.db.saveTask(task);
    
    // Create subtasks
    for (const subtask of subtasks) {
      await this.createTask({
        ...subtask,
        dependencies: [task.id, ...(subtask.dependencies || [])]
      });
    }
    
    // Notify
    await this.notifyTaskCreated(task);
    
    return task;
  }
  
  private async decomposeTask(input: TaskInput): Promise<TaskInput[]> {
    // Use AI to decompose complex tasks
    const prompt = `Decompose this task into subtasks: ${input.description}`;
    const response = await this.ollamaClient.generate(
      prompt,
      'llama3',
      { temperature: 0.3 }
    );
    
    return this.parseSubtasks(response.text);
  }
}
```

### State Manager

```typescript
class StateManager {
  async updateState(
    key: string, 
    updates: Partial<any>
  ): Promise<void> {
    // Get current state
    const current = await this.loadState(key);
    
    // Merge updates
    const newState = { ...current, ...updates };
    
    // Save to database
    await this.db.saveState(key, newState);
    
    // Update cache
    await this.cache.set(key, newState, 3600);
    
    // Publish change event
    await this.messageBus.publish('state.changed', {
      key,
      changes: updates,
      timestamp: Date.now()
    });
  }
  
  async createSnapshot(label: string): Promise<Snapshot> {
    const snapshot: Snapshot = {
      id: generateUUID(),
      label,
      timestamp: new Date(),
      state: {
        agents: await this.captureAgentStates(),
        tasks: await this.captureTaskStates(),
        system: await this.captureSystemState()
      }
    };
    
    await this.db.saveSnapshot(snapshot);
    
    return snapshot;
  }
}
```

## Function Call Flow Examples

### Complete Task Flow

```
1. User creates task via UI
   └─> createTask() → POST /api/tasks

2. Backend processes request
   └─> TaskManager.createTask()
       └─> decomposeTask() (if needed)
       └─> db.saveTask()
       └─> notifyTaskCreated()

3. Orchestrator assigns task
   └─> AgentOrchestrator.assignTask()
       └─> selectAgentForTask()
       └─> messageBus.publish('TASK_ASSIGNMENT')

4. Agent receives and executes
   └─> Agent.execute()
       └─> think() → Ollama.generate()
       └─> act() → performAction()
       └─> observe() → validateResult()
       └─> messageBus.publish('TASK_COMPLETE')

5. UI updates
   └─> WebSocket receives 'task.complete'
       └─> updateTaskInState()
       └─> re-render components
```

This comprehensive function calling documentation provides a complete reference for all interactions within the Agent Swamps system.

# Class Diagrams - Agent Swamps

This document contains detailed class diagrams for all major components of the Agent Swamps system.

## Frontend Class Structure

### Component Class Hierarchy

```mermaid
classDiagram
    class Component {
        <<abstract>>
        +props: Props
        +state: State
        +render() ReactElement
        +componentDidMount() void
        +componentWillUnmount() void
    }
    
    class App {
        -agents: Agent[]
        -tasks: Task[]
        -systemStatus: SystemStatus
        +render() ReactElement
        +handleTaskCreate(task: Task) void
        +handleAgentCommand(cmd: Command) void
    }
    
    class SwampCanvas {
        -canvasRef: RefObject
        -agents: Agent[]
        -connections: Connection[]
        -animationFrame: number
        +render() ReactElement
        +drawAgents() void
        +drawConnections() void
        +animate() void
        +handleAgentClick(agent: Agent) void
        +handleAgentDrag(agent: Agent, pos: Position) void
    }
    
    class AgentNode {
        -agent: Agent
        -position: Position
        -status: AgentStatus
        +render() ReactElement
        +getStatusColor() string
        +getStatusIcon() Icon
        +handleClick() void
    }
    
    class CommandDashboard {
        -metrics: Metrics
        -filters: FilterState
        +render() ReactElement
        +updateMetrics() void
        +handleFilterChange(filter: Filter) void
    }
    
    class NeuralLink {
        -messages: Message[]
        -input: string
        -ws: WebSocket
        +render() ReactElement
        +sendMessage(msg: string) void
        +handleIncomingMessage(msg: Message) void
        +scrollToBottom() void
    }
    
    class TaskList {
        -tasks: Task[]
        -selectedTask: Task | null
        -sortBy: SortOption
        +render() ReactElement
        +handleTaskSelect(task: Task) void
        +handleTaskSort(option: SortOption) void
        +filterTasks(filter: TaskFilter) Task[]
    }
    
    Component <|-- App
    Component <|-- SwampCanvas
    Component <|-- AgentNode
    Component <|-- CommandDashboard
    Component <|-- NeuralLink
    Component <|-- TaskList
    
    App --> SwampCanvas
    App --> CommandDashboard
    App --> NeuralLink
    App --> TaskList
    SwampCanvas --> AgentNode
```

### Context Providers

```mermaid
classDiagram
    class AgentContext {
        -agents: Agent[]
        -selectedAgent: Agent | null
        +addAgent(agent: Agent) void
        +removeAgent(id: string) void
        +updateAgent(id: string, updates: Partial~Agent~) void
        +selectAgent(id: string) void
    }
    
    class TaskContext {
        -tasks: Task[]
        -activeTasks: Task[]
        -completedTasks: Task[]
        +createTask(task: TaskInput) Task
        +updateTask(id: string, updates: Partial~Task~) void
        +deleteTask(id: string) void
        +getTaskById(id: string) Task | null
    }
    
    class WebSocketContext {
        -ws: WebSocket | null
        -connected: boolean
        -messageQueue: Message[]
        +connect(url: string) void
        +disconnect() void
        +send(message: Message) void
        +subscribe(channel: string, handler: Function) void
        +unsubscribe(channel: string) void
    }
    
    class UIContext {
        -theme: Theme
        -sidebarOpen: boolean
        -modalState: ModalState
        +toggleSidebar() void
        +openModal(type: string, props: any) void
        +closeModal() void
        +setTheme(theme: Theme) void
    }
```

### Service Classes

```mermaid
classDiagram
    class APIService {
        -baseURL: string
        -token: string | null
        +setToken(token: string) void
        +get~T~(endpoint: string, params?: any) Promise~T~
        +post~T~(endpoint: string, data: any) Promise~T~
        +put~T~(endpoint: string, data: any) Promise~T~
        +delete~T~(endpoint: string) Promise~T~
    }
    
    class TaskService {
        -api: APIService
        +getTasks(filters?: TaskFilter) Promise~Task[]~
        +getTask(id: string) Promise~Task~
        +createTask(task: TaskInput) Promise~Task~
        +updateTask(id: string, updates: Partial~Task~) Promise~Task~
        +deleteTask(id: string) Promise~void~
        +getTaskArtifacts(id: string) Promise~Artifact[]~
    }
    
    class AgentService {
        -api: APIService
        +getAgents() Promise~Agent[]~
        +getAgent(id: string) Promise~Agent~
        +spawnAgent(type: AgentType, config: AgentConfig) Promise~Agent~
        +terminateAgent(id: string) Promise~void~
        +sendCommand(id: string, command: Command) Promise~void~
        +getAgentMessages(id: string) Promise~Message[]~
    }
    
    class WebSocketService {
        -ws: WebSocket | null
        -handlers: Map~string, Function[]~
        -reconnectAttempts: number
        +connect(url: string) void
        +disconnect() void
        +send(message: any) void
        +on(event: string, handler: Function) void
        +off(event: string, handler: Function) void
        -reconnect() void
        -handleMessage(message: MessageEvent) void
    }
    
    class StorageService {
        +get~T~(key: string) T | null
        +set~T~(key: string, value: T) void
        +remove(key: string) void
        +clear() void
    }
    
    TaskService --> APIService
    AgentService --> APIService
```

## Backend Class Structure

### Core Service Classes

```mermaid
classDiagram
    class Server {
        -app: Express
        -port: number
        -wsServer: WebSocketServer
        +start() void
        +stop() void
        -setupMiddleware() void
        -setupRoutes() void
        -setupWebSocket() void
    }
    
    class AgentOrchestrator {
        -agents: Map~string, AgentInstance~
        -messageRouter: MessageRouter
        -scheduler: TaskScheduler
        -monitor: HealthMonitor
        +spawnAgent(type: AgentType, config: AgentConfig) AgentInstance
        +terminateAgent(id: string) void
        +assignTask(agentId: string, task: Task) void
        +getAgentStatus(id: string) AgentStatus
        +getAllAgents() AgentInstance[]
        -selectAgentForTask(task: Task) string
    }
    
    class TaskManager {
        -tasks: Map~string, Task~
        -db: Database
        +createTask(input: TaskInput) Task
        +updateTask(id: string, updates: Partial~Task~) Task
        +deleteTask(id: string) void
        +getTask(id: string) Task
        +getTasks(filter: TaskFilter) Task[]
        +decomposeTask(task: Task) Task[]
        -validateTask(task: Task) boolean
        -resolveDependencies(task: Task) Task[]
    }
    
    class StateManager {
        -db: Database
        -cache: RedisClient
        +saveState(key: string, state: any) void
        +loadState(key: string) any
        +updateState(key: string, updates: any) void
        +deleteState(key: string) void
        +createSnapshot(label: string) Snapshot
        +restoreSnapshot(id: string) void
        -persist(key: string, data: any) void
    }
    
    class MessageBus {
        -queue: Queue
        -subscribers: Map~string, Subscriber[]~
        +publish(topic: string, message: Message) void
        +subscribe(topic: string, handler: Function) string
        +unsubscribe(subscriptionId: string) void
        +request(topic: string, message: Message) Promise~Message~
        -routeMessage(message: Message) void
        -filterMessage(message: Message, filter: Filter) boolean
    }
    
    Server --> AgentOrchestrator
    Server --> TaskManager
    Server --> StateManager
    Server --> MessageBus
```

### Agent Classes

```mermaid
classDiagram
    class BaseAgent {
        <<abstract>>
        #id: string
        #type: AgentType
        #status: AgentStatus
        #memory: Memory
        #tools: Tool[]
        #messageBus: MessageBus
        +execute(task: Task) Promise~Result~
        +processMessage(message: Message) void
        +updateStatus(status: AgentStatus) void
        #think(context: Context) Promise~Decision~
        #act(decision: Decision) Promise~Result~
        #observe(result: Result) void
    }
    
    class DeveloperAgent {
        -codeGenerator: CodeGenerator
        -codeReviewer: CodeReviewer
        -refactoringEngine: RefactoringEngine
        +execute(task: Task) Promise~Result~
        +generateCode(spec: Specification) Promise~Code~
        +reviewCode(code: Code) Promise~Review~
        +refactorCode(code: Code, rules: Rule[]) Promise~Code~
        -analyzeRequirements(task: Task) Requirements
        -selectTechnologies(requirements: Requirements) TechStack
    }
    
    class QAAgent {
        -testGenerator: TestGenerator
        -testRunner: TestRunner
        -coverageAnalyzer: CoverageAnalyzer
        +execute(task: Task) Promise~Result~
        +generateTests(code: Code) Promise~TestSuite~
        +runTests(tests: TestSuite) Promise~TestResults~
        +analyzeCoverage(results: TestResults) Promise~Coverage~
        -identifyEdgeCases(code: Code) Scenario[]
        -generateTestData() TestData
    }
    
    class DevOpsAgent {
        -deployer: Deployer
        -infraManager: InfrastructureManager
        -cicdManager: CICDManager
        +execute(task: Task) Promise~Result~
        +deploy(artifact: Artifact, env: Environment) Promise~Deployment~
        +setupInfrastructure(spec: InfraSpec) Promise~Infrastructure~
        +configureCICD(config: CICDConfig) Promise~Pipeline~
        -validateDeployment(deployment: Deployment) boolean
    }
    
    class ProductManagerAgent {
        -requirementAnalyzer: RequirementAnalyzer
        -prioritizer: Prioritizer
        +execute(task: Task) Promise~Result~
        +analyzeRequirements(input: UserInput) Requirements
        +prioritizeFeatures(features: Feature[]) Feature[]
        +createRoadmap(features: Feature[]) Roadmap
        -defineAcceptanceCriteria(feature: Feature) Criteria[]
    }
    
    class ArchitectAgent {
        -designGenerator: DesignGenerator
        -patternMatcher: PatternMatcher
        +execute(task: Task) Promise~Result~
        +designSystem(requirements: Requirements) Architecture
        +selectPatterns(context: Context) Pattern[]
        +generateDiagrams(architecture: Architecture) Diagram[]
        -evaluateTradeoffs(options: Option[]) Decision
    }
    
    BaseAgent <|-- DeveloperAgent
    BaseAgent <|-- QAAgent
    BaseAgent <|-- DevOpsAgent
    BaseAgent <|-- ProductManagerAgent
    BaseAgent <|-- ArchitectAgent
```

### Tool and Utility Classes

```mermaid
classDiagram
    class Tool {
        <<interface>>
        +name: string
        +description: string
        +execute(params: any) Promise~any~
        +validate(params: any) boolean
    }
    
    class CodeGenerator {
        -ollamaClient: OllamaClient
        -templates: TemplateEngine
        +generate(spec: Specification) Promise~Code~
        +generateFromTemplate(template: string, vars: any) Code
        -buildPrompt(spec: Specification) string
        -parseResponse(response: string) Code
    }
    
    class TestGenerator {
        -ollamaClient: OllamaClient
        -analyzer: CodeAnalyzer
        +generateUnitTests(code: Code) Promise~Test[]~
        +generateIntegrationTests(modules: Module[]) Promise~Test[]~
        +generateE2ETests(flows: UserFlow[]) Promise~Test[]~
        -identifyTestCases(code: Code) TestCase[]
    }
    
    class Deployer {
        -containerEngine: ContainerEngine
        -orchestrator: Orchestrator
        +buildImage(artifact: Artifact) Promise~Image~
        +pushImage(image: Image) Promise~void~
        +deploy(image: Image, config: DeployConfig) Promise~Deployment~
        +rollback(deploymentId: string) Promise~void~
    }
    
    class Memory {
        -shortTerm: Map~string, any~
        -longTerm: VectorStore
        +store(key: string, value: any, type: MemoryType) void
        +retrieve(key: string) any
        +search(query: string) any[]
        +clear(type: MemoryType) void
    }
    
    Tool <|.. CodeGenerator
    Tool <|.. TestGenerator
    Tool <|.. Deployer
```

## Ollama Integration Classes

```mermaid
classDiagram
    class OllamaClient {
        -baseURL: string
        -timeout: number
        -retryPolicy: RetryPolicy
        +generate(prompt: string, model: string, options: Options) Promise~Response~
        +chat(messages: Message[], model: string) Promise~Response~
        +listModels() Promise~Model[]~
        +pullModel(name: string) Promise~void~
        +embeddings(text: string, model: string) Promise~number[]~
        -request(endpoint: string, data: any) Promise~any~
        -retry(fn: Function, attempts: number) Promise~any~
    }
    
    class ModelManager {
        -registry: Map~string, ModelInfo~
        -cache: ModelCache
        +loadModel(name: string) Promise~Model~
        +unloadModel(name: string) void
        +getAvailableModels() Model[]
        +getModelInfo(name: string) ModelInfo
        +optimizeModel(model: Model, config: OptimizationConfig) Model
    }
    
    class PromptBuilder {
        -templates: Map~string, Template~
        +buildPrompt(type: PromptType, context: any) string
        +addContext(prompt: string, context: any) string
        +formatMessages(messages: Message[]) string
        -applyTemplate(template: Template, vars: any) string
    }
    
    class ResponseParser {
        -patterns: RegExp[]
        +parse(response: string, format: Format) any
        +extractCode(response: string) Code
        +extractJSON(response: string) any
        +validate(parsed: any, schema: Schema) boolean
    }
    
    class ConnectionPool {
        -connections: Connection[]
        -maxSize: number
        -currentSize: number
        +acquire() Promise~Connection~
        +release(connection: Connection) void
        +drain() Promise~void~
        -createConnection() Connection
        -validateConnection(connection: Connection) boolean
    }
    
    OllamaClient --> ConnectionPool
    OllamaClient --> ModelManager
    OllamaClient --> PromptBuilder
    OllamaClient --> ResponseParser
```

## Data Model Classes

```mermaid
classDiagram
    class Task {
        +id: string
        +type: TaskType
        +description: string
        +assignedTo?: string
        +dependencies: string[]
        +status: TaskStatus
        +priority: Priority
        +createdAt: Date
        +completedAt?: Date
        +artifacts: Artifact[]
        +metadata: Map~string, any~
    }
    
    class Agent {
        +id: string
        +type: AgentType
        +status: AgentStatus
        +configuration: AgentConfig
        +createdAt: Date
        +lastActive: Date
        +currentTask?: string
        +capabilities: Capability[]
        +metrics: AgentMetrics
    }
    
    class Message {
        +id: string
        +from: string
        +to: string | string[]
        +type: MessageType
        +payload: any
        +timestamp: Date
        +priority: Priority
        +correlationId?: string
    }
    
    class Artifact {
        +id: string
        +taskId: string
        +type: ArtifactType
        +content: string
        +filePath?: string
        +createdAt: Date
        +metadata: Map~string, any~
    }
    
    class AgentMetrics {
        +tasksCompleted: number
        +tasksInProgress: number
        +tasksFailed: number
        +averageTaskTime: number
        +successRate: number
        +lastTaskDuration: number
    }
    
    class AgentConfig {
        +model: string
        +temperature: number
        +maxTokens: number
        +systemPrompt: string
        +tools: string[]
        +customSettings: Map~string, any~
    }
    
    Task --> Artifact
    Agent --> AgentConfig
    Agent --> AgentMetrics
```

## Enum and Type Definitions

```mermaid
classDiagram
    class AgentType {
        <<enumeration>>
        DEVELOPER
        QA
        DEVOPS
        PRODUCT_MANAGER
        ARCHITECT
        DESIGNER
    }
    
    class AgentStatus {
        <<enumeration>>
        IDLE
        THINKING
        CODING
        TESTING
        DEPLOYING
        ERROR
        PAUSED
    }
    
    class TaskStatus {
        <<enumeration>>
        PENDING
        IN_PROGRESS
        BLOCKED
        COMPLETED
        FAILED
        CANCELLED
    }
    
    class TaskType {
        <<enumeration>>
        FEATURE
        BUG_FIX
        REFACTOR
        DOCUMENTATION
        DEPLOYMENT
        TESTING
        RESEARCH
    }
    
    class MessageType {
        <<enumeration>>
        TASK_ASSIGNMENT
        TASK_PROGRESS
        TASK_COMPLETE
        REQUEST
        RESPONSE
        BROADCAST
        ERROR
    }
    
    class Priority {
        <<enumeration>>
        LOW
        MEDIUM
        HIGH
        CRITICAL
    }
```

## Interface Definitions

```mermaid
classDiagram
    class IAgentExecutor {
        <<interface>>
        +execute(task: Task) Promise~Result~
        +cancel() void
        +pause() void
        +resume() void
    }
    
    class IMessageHandler {
        <<interface>>
        +handleMessage(message: Message) void
        +canHandle(message: Message) boolean
    }
    
    class IStateProvider {
        <<interface>>
        +getState() State
        +setState(state: Partial~State~) void
        +subscribe(listener: Function) void
        +unsubscribe(listener: Function) void
    }
    
    class IToolExecutor {
        <<interface>>
        +execute(params: any) Promise~any~
        +validate(params: any) boolean
        +getSchema() Schema
    }
    
    class ICache {
        <<interface>>
        +get~T~(key: string) Promise~T | null~
        +set~T~(key: string, value: T, ttl?: number) Promise~void~
        +delete(key: string) Promise~void~
        +clear() Promise~void~
    }
```

## Relationship Summary

### Key Relationships

1. **Inheritance**
   - All specialized agents inherit from `BaseAgent`
   - All React components inherit from base `Component`
   - Tool classes implement the `Tool` interface

2. **Composition**
   - `AgentOrchestrator` contains multiple `AgentInstance`s
   - `TaskManager` manages multiple `Task`s
   - `MessageBus` routes messages between agents
   - `StateManager` uses both database and cache

3. **Dependency**
   - Services depend on `APIService` for HTTP communication
   - Agents depend on `OllamaClient` for AI capabilities
   - Components depend on Context providers for state

4. **Association**
   - Tasks are assigned to Agents
   - Messages are sent between Agents
   - Artifacts are produced by Tasks
   - Metrics track Agent performance

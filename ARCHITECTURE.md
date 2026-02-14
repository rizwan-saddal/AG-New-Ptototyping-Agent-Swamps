# Low-Level Architecture - Agent Swamps

## System Architecture Overview

This document provides detailed low-level architecture diagrams and specifications for the Agent Swamps system.

## System Layers Architecture

```mermaid
graph TB
    subgraph "Presentation Layer"
        UI[React Frontend]
        VIZ[Visualization Engine]
        DASH[Dashboard Components]
    end
    
    subgraph "Application Layer"
        API[API Gateway]
        ORCH[Agent Orchestrator]
        MSG[Message Bus]
        TASK[Task Manager]
        STATE[State Manager]
    end
    
    subgraph "Agent Layer"
        DEV[Developer Agent]
        QA[QA Agent]
        DEVOPS[DevOps Agent]
        PM[Product Manager Agent]
        ARCH[Architect Agent]
    end
    
    subgraph "AI/ML Layer"
        OLLAMA[Ollama Server]
        EMB[Embedding Service]
        VDB[Vector Database]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL)]
        CACHE[(Redis Cache)]
        FS[File System]
    end
    
    UI --> API
    VIZ --> API
    DASH --> API
    
    API --> ORCH
    API --> TASK
    API --> STATE
    
    ORCH --> MSG
    TASK --> MSG
    
    MSG --> DEV
    MSG --> QA
    MSG --> DEVOPS
    MSG --> PM
    MSG --> ARCH
    
    DEV --> OLLAMA
    QA --> OLLAMA
    DEVOPS --> OLLAMA
    PM --> OLLAMA
    ARCH --> OLLAMA
    
    DEV --> EMB
    QA --> EMB
    
    EMB --> VDB
    
    STATE --> DB
    STATE --> CACHE
    TASK --> DB
    ORCH --> DB
    
    DEV --> FS
    QA --> FS
    DEVOPS --> FS
```

## Component Architecture

### 1. Frontend Architecture

```mermaid
graph TB
    subgraph "React Application"
        APP[App Component]
        
        subgraph "Layout Components"
            LAYOUT[Main Layout]
            HEADER[Header]
            SIDEBAR[Sidebar]
            MAIN[Main Content]
        end
        
        subgraph "Feature Components"
            SWAMP[Swamp Canvas]
            ANODE[Agent Node]
            CHAT[Neural Link Chat]
            METRICS[Metrics Dashboard]
            TASKLIST[Task List]
        end
        
        subgraph "State Management"
            ACTX[Agent Context]
            TCTX[Task Context]
            UICTX[UI Context]
            WSCTX[WebSocket Context]
        end
        
        subgraph "Services"
            API_SVC[API Service]
            WS_SVC[WebSocket Service]
            STORAGE_SVC[Local Storage]
        end
    end
    
    APP --> LAYOUT
    LAYOUT --> HEADER
    LAYOUT --> SIDEBAR
    LAYOUT --> MAIN
    
    MAIN --> SWAMP
    MAIN --> METRICS
    MAIN --> CHAT
    MAIN --> TASKLIST
    
    SWAMP --> ANODE
    
    SWAMP --> ACTX
    SWAMP --> WSCTX
    
    CHAT --> TCTX
    CHAT --> API_SVC
    
    METRICS --> ACTX
    METRICS --> TCTX
    
    TASKLIST --> TCTX
    
    API_SVC --> ACTX
    API_SVC --> TCTX
    
    WS_SVC --> WSCTX
    WS_SVC --> ACTX
    
    UICTX --> STORAGE_SVC
```

### 2. Backend Service Architecture

```mermaid
graph TB
    subgraph "API Gateway"
        REST[REST Endpoints]
        WS[WebSocket Server]
        AUTH[Authentication]
        RATE[Rate Limiter]
    end
    
    subgraph "Core Services"
        ORCH[Agent Orchestrator]
        
        subgraph "Orchestrator Components"
            SPAWN[Agent Spawner]
            ROUTER[Message Router]
            SCHED[Task Scheduler]
            MONITOR[Health Monitor]
        end
        
        TASK[Task Manager]
        
        subgraph "Task Components"
            DECOMP[Task Decomposer]
            DEP[Dependency Tracker]
            VALID[Validator]
        end
        
        STATE[State Manager]
        
        subgraph "State Components"
            PERSIST[Persistence Layer]
            SNAPSHOT[Snapshot Manager]
            RECOVERY[Recovery Manager]
        end
    end
    
    subgraph "Message Bus"
        QUEUE[Message Queue]
        PUB[Publisher]
        SUB[Subscriber]
        FILTER[Message Filter]
    end
    
    REST --> AUTH
    WS --> AUTH
    
    AUTH --> RATE
    
    RATE --> ORCH
    RATE --> TASK
    RATE --> STATE
    
    ORCH --> SPAWN
    ORCH --> ROUTER
    ORCH --> SCHED
    ORCH --> MONITOR
    
    ROUTER --> QUEUE
    
    TASK --> DECOMP
    TASK --> DEP
    TASK --> VALID
    
    STATE --> PERSIST
    STATE --> SNAPSHOT
    STATE --> RECOVERY
    
    QUEUE --> PUB
    QUEUE --> SUB
    SUB --> FILTER
```

### 3. Agent System Architecture

```mermaid
graph TB
    subgraph "Agent Framework"
        BASE[Base Agent Class]
        
        subgraph "Agent Components"
            BRAIN[Decision Engine]
            MEM[Memory System]
            TOOLS[Tool Interface]
            COMM[Communication Module]
        end
        
        subgraph "Specialized Agents"
            DEV[Developer Agent]
            QA[QA Agent]
            DEVOPS[DevOps Agent]
            PM[PM Agent]
            ARCH[Architect Agent]
        end
    end
    
    subgraph "Agent Capabilities"
        subgraph "Developer Tools"
            CODEGEN[Code Generator]
            REVIEW[Code Reviewer]
            REFACTOR[Refactoring Engine]
            DEBUG[Debugger]
        end
        
        subgraph "QA Tools"
            TESTGEN[Test Generator]
            TESTRUN[Test Runner]
            COVERAGE[Coverage Analyzer]
            BUGTRACK[Bug Tracker]
        end
        
        subgraph "DevOps Tools"
            DEPLOY[Deployer]
            INFRA[Infrastructure Manager]
            CICD[CI/CD Manager]
            MONITOR_TOOL[Monitor Setup]
        end
    end
    
    BASE --> BRAIN
    BASE --> MEM
    BASE --> TOOLS
    BASE --> COMM
    
    DEV -.inherits.-> BASE
    QA -.inherits.-> BASE
    DEVOPS -.inherits.-> BASE
    PM -.inherits.-> BASE
    ARCH -.inherits.-> BASE
    
    DEV --> CODEGEN
    DEV --> REVIEW
    DEV --> REFACTOR
    DEV --> DEBUG
    
    QA --> TESTGEN
    QA --> TESTRUN
    QA --> COVERAGE
    QA --> BUGTRACK
    
    DEVOPS --> DEPLOY
    DEVOPS --> INFRA
    DEVOPS --> CICD
    DEVOPS --> MONITOR_TOOL
```

### 4. Ollama Integration Architecture

```mermaid
graph TB
    subgraph "Agent System"
        AGENT[Agent Instance]
        PROMPT[Prompt Builder]
        PARSER[Response Parser]
    end
    
    subgraph "Ollama Interface"
        CLIENT[Ollama Client]
        POOL[Connection Pool]
        RETRY[Retry Logic]
        CACHE[Response Cache]
    end
    
    subgraph "Ollama Server"
        API[Ollama API]
        
        subgraph "Models"
            LLAMA[Llama 3]
            MISTRAL[Mistral]
            CODELLAMA[CodeLlama]
            CUSTOM[Custom Models]
        end
        
        ENGINE[Inference Engine]
        GPU[GPU/CPU Resources]
    end
    
    subgraph "Model Management"
        REGISTRY[Model Registry]
        LOADER[Model Loader]
        OPTIMIZER[Model Optimizer]
    end
    
    AGENT --> PROMPT
    PROMPT --> CLIENT
    
    CLIENT --> POOL
    CLIENT --> RETRY
    CLIENT --> CACHE
    
    POOL --> API
    
    API --> LLAMA
    API --> MISTRAL
    API --> CODELLAMA
    API --> CUSTOM
    
    LLAMA --> ENGINE
    MISTRAL --> ENGINE
    CODELLAMA --> ENGINE
    CUSTOM --> ENGINE
    
    ENGINE --> GPU
    
    API --> REGISTRY
    REGISTRY --> LOADER
    LOADER --> OPTIMIZER
    
    CLIENT --> PARSER
    PARSER --> AGENT
```

## Data Flow Diagrams

### Task Execution Flow

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant API
    participant TaskMgr as Task Manager
    participant Orch as Orchestrator
    participant MsgBus as Message Bus
    participant Agent
    participant Ollama
    participant State as State Manager
    
    User->>UI: Submit Task
    UI->>API: POST /api/tasks
    API->>TaskMgr: Create Task
    TaskMgr->>TaskMgr: Decompose Task
    TaskMgr->>State: Save Task
    TaskMgr->>Orch: Request Agent
    Orch->>Orch: Select Agent Type
    Orch->>MsgBus: Assign Task
    MsgBus->>Agent: Task Assignment
    Agent->>Agent: Analyze Task
    Agent->>Ollama: Generate Solution
    Ollama-->>Agent: Response
    Agent->>Agent: Process Response
    Agent->>MsgBus: Task Progress
    MsgBus->>State: Update State
    State->>UI: WebSocket Update
    UI->>User: Show Progress
    Agent->>MsgBus: Task Complete
    MsgBus->>TaskMgr: Mark Complete
    TaskMgr->>State: Update Task Status
    State->>UI: WebSocket Update
    UI->>User: Show Completion
```

### Agent Communication Flow

```mermaid
sequenceDiagram
    participant Dev as Developer Agent
    participant Bus as Message Bus
    participant QA as QA Agent
    participant State as State Manager
    participant UI
    
    Dev->>Dev: Generate Code
    Dev->>Bus: Publish(CODE_READY)
    Bus->>State: Log Message
    Bus->>QA: Route Message
    State->>UI: Update Event Log
    QA->>QA: Receive Code
    QA->>QA: Generate Tests
    QA->>Bus: Publish(TESTS_READY)
    Bus->>State: Log Message
    Bus->>Dev: Route Message
    State->>UI: Update Event Log
    Dev->>Dev: Receive Tests
    Dev->>Bus: Request(RUN_TESTS)
    Bus->>QA: Route Request
    QA->>QA: Execute Tests
    QA->>Bus: Response(TEST_RESULTS)
    Bus->>Dev: Route Response
    Bus->>State: Log Results
    State->>UI: Update Results
```

### Real-time Update Flow

```mermaid
sequenceDiagram
    participant Agent
    participant State as State Manager
    participant Redis
    participant WS as WebSocket Server
    participant UI
    
    Agent->>State: Update Agent Status
    State->>Redis: Publish Event
    Redis->>WS: Event Notification
    WS->>UI: Push Update
    UI->>UI: Re-render Component
    
    Agent->>State: Update Task Progress
    State->>Redis: Publish Event
    Redis->>WS: Event Notification
    WS->>UI: Push Update
    UI->>UI: Update Progress Bar
```

## Database Schema

### Core Tables

```mermaid
erDiagram
    TASKS ||--o{ TASK_DEPENDENCIES : has
    TASKS ||--o{ ARTIFACTS : produces
    TASKS }o--|| AGENTS : assigned_to
    
    AGENTS ||--o{ AGENT_MESSAGES : sends
    AGENTS ||--o{ AGENT_MESSAGES : receives
    AGENTS }o--|| AGENT_TYPES : has_type
    
    TASKS {
        uuid id PK
        string type
        text description
        uuid assigned_agent_id FK
        string status
        int priority
        timestamp created_at
        timestamp completed_at
        jsonb metadata
    }
    
    TASK_DEPENDENCIES {
        uuid task_id FK
        uuid depends_on_task_id FK
        string dependency_type
    }
    
    AGENTS {
        uuid id PK
        string type FK
        string status
        jsonb configuration
        timestamp created_at
        timestamp last_active
        jsonb state
    }
    
    AGENT_TYPES {
        string type PK
        string description
        jsonb capabilities
        jsonb default_config
    }
    
    AGENT_MESSAGES {
        uuid id PK
        uuid from_agent_id FK
        uuid to_agent_id FK
        string message_type
        jsonb payload
        int priority
        timestamp created_at
        boolean processed
    }
    
    ARTIFACTS {
        uuid id PK
        uuid task_id FK
        string type
        text content
        string file_path
        timestamp created_at
    }
```

## API Specification

### REST Endpoints

```typescript
// Task Management
POST   /api/tasks                  // Create new task
GET    /api/tasks                  // List all tasks
GET    /api/tasks/:id              // Get task details
PUT    /api/tasks/:id              // Update task
DELETE /api/tasks/:id              // Delete task
GET    /api/tasks/:id/artifacts    // Get task artifacts

// Agent Management
GET    /api/agents                 // List all agents
GET    /api/agents/:id             // Get agent details
POST   /api/agents                 // Create/spawn agent
DELETE /api/agents/:id             // Terminate agent
GET    /api/agents/:id/messages    // Get agent messages
POST   /api/agents/:id/command     // Send command to agent

// System
GET    /api/system/status          // System health
GET    /api/system/metrics         // System metrics
POST   /api/system/config          // Update configuration

// Ollama Integration
GET    /api/ollama/models          // List available models
POST   /api/ollama/generate        // Generate completion
GET    /api/ollama/status          // Ollama server status
```

### WebSocket Events

```typescript
// Client → Server
{
  "type": "subscribe",
  "channels": ["tasks", "agents", "system"]
}

{
  "type": "command",
  "agentId": "uuid",
  "command": "pause" | "resume" | "cancel"
}

// Server → Client
{
  "type": "agent.status",
  "agentId": "uuid",
  "status": "idle" | "thinking" | "coding" | "error",
  "timestamp": 1234567890
}

{
  "type": "task.progress",
  "taskId": "uuid",
  "progress": 75,
  "message": "Generating tests...",
  "timestamp": 1234567890
}

{
  "type": "system.metric",
  "metric": "cpu" | "memory" | "activeAgents",
  "value": 45.2,
  "timestamp": 1234567890
}
```

## Performance Specifications

### Response Time Targets
- API Response: < 100ms (95th percentile)
- WebSocket Latency: < 50ms
- UI Render: < 16ms (60 FPS)
- Ollama Inference: < 2s for small prompts, < 10s for large prompts

### Scalability Targets
- Concurrent Agents: 50-100 per instance
- Concurrent Tasks: 500+ queued tasks
- WebSocket Connections: 1000+ concurrent users
- Message Throughput: 1000+ messages/second

### Resource Requirements
- Frontend: 2 CPU cores, 4GB RAM
- Backend: 4 CPU cores, 8GB RAM
- Ollama: 8 CPU cores, 16GB RAM (32GB recommended with GPU)
- Database: 2 CPU cores, 4GB RAM
- Redis: 1 CPU core, 2GB RAM

## Security Architecture

### Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Auth
    participant DB
    
    Client->>API: Login Request
    API->>Auth: Validate Credentials
    Auth->>DB: Check User
    DB-->>Auth: User Data
    Auth->>Auth: Generate JWT
    Auth-->>API: JWT Token
    API-->>Client: Token + User Info
    
    Client->>API: API Request + JWT
    API->>Auth: Validate JWT
    Auth-->>API: User Context
    API->>API: Process Request
    API-->>Client: Response
```

### Security Layers

1. **Network Security**: HTTPS, WSS, CORS policies
2. **Authentication**: JWT-based auth with refresh tokens
3. **Authorization**: Role-based access control (RBAC)
4. **Data Security**: Encryption at rest and in transit
5. **Agent Sandboxing**: Containerized execution environments
6. **Audit Logging**: Complete activity audit trail
7. **Rate Limiting**: API and resource usage limits
8. **Secret Management**: Secure credential storage

## Deployment Architecture

### Development Environment

```mermaid
graph TB
    DEV[Developer Machine]
    
    subgraph "Local Stack"
        VITE[Vite Dev Server :5173]
        NODE[Node.js API :3000]
        OLLAMA_LOCAL[Ollama :11434]
        PG_LOCAL[PostgreSQL :5432]
        REDIS_LOCAL[Redis :6379]
    end
    
    DEV --> VITE
    VITE --> NODE
    NODE --> OLLAMA_LOCAL
    NODE --> PG_LOCAL
    NODE --> REDIS_LOCAL
```

### Production Environment

```mermaid
graph TB
    USER[Users]
    
    subgraph "Load Balancer"
        LB[Nginx/Traefik]
    end
    
    subgraph "Frontend Cluster"
        FE1[Frontend Instance 1]
        FE2[Frontend Instance 2]
        FE3[Frontend Instance 3]
    end
    
    subgraph "Backend Cluster"
        BE1[Backend Instance 1]
        BE2[Backend Instance 2]
        BE3[Backend Instance 3]
    end
    
    subgraph "AI Cluster"
        OLLAMA1[Ollama Instance 1]
        OLLAMA2[Ollama Instance 2]
    end
    
    subgraph "Data Layer"
        PG_MASTER[(PostgreSQL Master)]
        PG_REPLICA[(PostgreSQL Replica)]
        REDIS_CLUSTER[(Redis Cluster)]
    end
    
    USER --> LB
    LB --> FE1
    LB --> FE2
    LB --> FE3
    
    FE1 --> BE1
    FE2 --> BE2
    FE3 --> BE3
    
    BE1 --> OLLAMA1
    BE2 --> OLLAMA1
    BE3 --> OLLAMA2
    BE1 --> OLLAMA2
    
    BE1 --> PG_MASTER
    BE2 --> PG_MASTER
    BE3 --> PG_REPLICA
    
    BE1 --> REDIS_CLUSTER
    BE2 --> REDIS_CLUSTER
    BE3 --> REDIS_CLUSTER
```

## Monitoring and Observability

### Metrics Collection

```mermaid
graph TB
    subgraph "Application"
        APP[Application]
        METRICS[Metrics Collector]
    end
    
    subgraph "Monitoring Stack"
        PROM[Prometheus]
        GRAF[Grafana]
        ALERT[Alertmanager]
    end
    
    subgraph "Logging Stack"
        LOGS[Application Logs]
        LOKI[Loki]
        DASH_LOG[Log Dashboard]
    end
    
    subgraph "Tracing"
        TRACE[Trace Data]
        JAEGER[Jaeger]
    end
    
    APP --> METRICS
    APP --> LOGS
    APP --> TRACE
    
    METRICS --> PROM
    PROM --> GRAF
    PROM --> ALERT
    
    LOGS --> LOKI
    LOKI --> DASH_LOG
    
    TRACE --> JAEGER
```

### Key Metrics

- **Agent Metrics**: Active count, success rate, average task time
- **Task Metrics**: Queue depth, completion rate, failure rate
- **System Metrics**: CPU, memory, disk I/O, network
- **Ollama Metrics**: Inference time, token throughput, model load
- **API Metrics**: Request rate, error rate, latency percentiles

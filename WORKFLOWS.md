# System Workflow - Agent Swamps

## Overview

This document provides detailed workflow diagrams showing how the Agent Swamps system operates from end to end.

## Complete System Workflow

```mermaid
graph TB
    START([User Submits Task])
    
    START --> UI[UI Receives Request]
    UI --> VALIDATE{Valid Request?}
    
    VALIDATE -->|No| ERROR1[Show Error]
    VALIDATE -->|Yes| API[POST /api/tasks]
    
    API --> TASKMGR[Task Manager]
    TASKMGR --> COMPLEX{Complex Task?}
    
    COMPLEX -->|Yes| DECOMPOSE[Decompose into Subtasks]
    COMPLEX -->|No| SAVE[Save Task to DB]
    DECOMPOSE --> SAVE
    
    SAVE --> NOTIFY1[Notify via Message Bus]
    NOTIFY1 --> ORCH[Agent Orchestrator]
    
    ORCH --> SELECT{Select Agent}
    SELECT -->|Agent Available| ASSIGN[Assign to Agent]
    SELECT -->|No Agent| SPAWN[Spawn New Agent]
    
    SPAWN --> ASSIGN
    ASSIGN --> AGENT[Agent Receives Task]
    
    AGENT --> THINK[Think: Analyze Task]
    THINK --> PLAN[Plan: Create Strategy]
    PLAN --> OLLAMA1[Ollama: Generate Plan]
    
    OLLAMA1 --> ACT[Act: Execute Plan]
    ACT --> IMPL[Implementation]
    
    IMPL --> COLLAB{Need Collaboration?}
    COLLAB -->|Yes| MSG[Send Message to Other Agent]
    MSG --> WAIT[Wait for Response]
    WAIT --> IMPL
    
    COLLAB -->|No| RESULT[Generate Result]
    RESULT --> VALIDATE_RESULT{Valid Result?}
    
    VALIDATE_RESULT -->|No| RETRY{Retry Count < Max?}
    RETRY -->|Yes| THINK
    RETRY -->|No| FAIL[Mark as Failed]
    
    VALIDATE_RESULT -->|Yes| ARTIFACT[Create Artifacts]
    ARTIFACT --> SAVEDB[Save to Database]
    SAVEDB --> NOTIFY2[Notify Completion]
    
    NOTIFY2 --> WS[WebSocket Update]
    WS --> UIUPDATE[UI Updates]
    UIUPDATE --> END([Task Complete])
    
    FAIL --> NOTIFY3[Notify Failure]
    NOTIFY3 --> WS
    
    ERROR1 --> END
    
    style START fill:#00ff88,stroke:#0a0e27,stroke-width:3px
    style END fill:#00ff88,stroke:#0a0e27,stroke-width:3px
    style FAIL fill:#ff4444,stroke:#0a0e27,stroke-width:2px
    style OLLAMA1 fill:#4a90e2,stroke:#0a0e27,stroke-width:2px
    style AGENT fill:#9b59b6,stroke:#0a0e27,stroke-width:2px
```

## Agent Collaboration Workflow

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant Orchestrator
    participant Dev as Developer Agent
    participant QA as QA Agent
    participant DevOps
    participant Ollama
    participant DB
    
    User->>UI: Create "Build Login Feature"
    UI->>Orchestrator: Submit Task
    Orchestrator->>DB: Save Task
    Orchestrator->>Dev: Assign Task
    
    Dev->>Dev: Analyze Requirements
    Dev->>Ollama: Generate Architecture
    Ollama-->>Dev: Architecture Design
    
    Dev->>Dev: Plan Implementation
    Dev->>Ollama: Generate Code
    Ollama-->>Dev: Login Component Code
    
    Dev->>QA: Request: Generate Tests
    QA->>Ollama: Generate Test Cases
    Ollama-->>QA: Test Suite
    QA-->>Dev: Response: Test Suite
    
    Dev->>Dev: Review Tests
    Dev->>QA: Request: Run Tests
    QA->>QA: Execute Tests
    QA-->>Dev: Response: Test Results (2 failures)
    
    Dev->>Ollama: Fix Code Based on Failures
    Ollama-->>Dev: Fixed Code
    
    Dev->>QA: Request: Run Tests Again
    QA->>QA: Execute Tests
    QA-->>Dev: Response: All Tests Pass
    
    Dev->>DevOps: Request: Deploy to Staging
    DevOps->>DevOps: Build & Deploy
    DevOps-->>Dev: Response: Deployed Successfully
    
    Dev->>DB: Save Artifacts
    Dev->>UI: Task Complete
    UI->>User: Show Completion + Preview
```

## Real-Time Update Flow

```mermaid
sequenceDiagram
    participant Agent
    participant State as State Manager
    participant Redis
    participant WS as WebSocket Server
    participant UI as User Interface
    
    loop Every Status Change
        Agent->>State: updateAgentStatus(CODING)
        State->>Redis: PUBLISH agent.status
        Redis->>WS: Event Notification
        WS->>UI: {type: 'agent.status', status: 'CODING'}
        UI->>UI: Update Agent Node Color
    end
    
    loop Every Progress Update
        Agent->>State: updateTaskProgress(45%)
        State->>Redis: PUBLISH task.progress
        Redis->>WS: Event Notification
        WS->>UI: {type: 'task.progress', progress: 45}
        UI->>UI: Update Progress Bar
    end
    
    loop Every Completion
        Agent->>State: taskComplete(artifacts)
        State->>Redis: PUBLISH task.complete
        Redis->>WS: Event Notification
        WS->>UI: {type: 'task.complete', artifacts: [...]}
        UI->>UI: Show Success + Results
    end
```

## Ollama Integration Workflow

```mermaid
graph TB
    AGENT_REQ[Agent Needs AI Response]
    
    AGENT_REQ --> BUILD[Build Prompt]
    BUILD --> TEMPLATE[Select Template]
    TEMPLATE --> CONTEXT[Add Context from Memory]
    CONTEXT --> VARS[Insert Variables]
    
    VARS --> CLIENT[Ollama Client]
    CLIENT --> CACHE{Check Cache}
    
    CACHE -->|Hit| RETURN_CACHE[Return Cached Response]
    CACHE -->|Miss| POOL[Get Connection from Pool]
    
    POOL --> REQUEST[HTTP POST to Ollama]
    REQUEST --> OLLAMA[Ollama Server]
    
    OLLAMA --> MODEL{Select Model}
    MODEL -->|Code Task| CODELLAMA[CodeLlama 13B]
    MODEL -->|General| LLAMA[Llama 3]
    MODEL -->|Fast| MISTRAL[Mistral]
    
    CODELLAMA --> INFERENCE[Run Inference]
    LLAMA --> INFERENCE
    MISTRAL --> INFERENCE
    
    INFERENCE --> RESPONSE[Generate Response]
    RESPONSE --> PARSE[Parse Response]
    
    PARSE --> EXTRACT{Extract Type}
    EXTRACT -->|Code| EXTRACT_CODE[Extract Code Block]
    EXTRACT -->|JSON| EXTRACT_JSON[Parse JSON]
    EXTRACT -->|Text| EXTRACT_TEXT[Clean Text]
    
    EXTRACT_CODE --> CACHE_SAVE[Save to Cache]
    EXTRACT_JSON --> CACHE_SAVE
    EXTRACT_TEXT --> CACHE_SAVE
    
    CACHE_SAVE --> RETURN[Return to Agent]
    RETURN_CACHE --> RETURN
    
    RETURN --> AGENT_USE[Agent Uses Response]
    
    style OLLAMA fill:#4a90e2,stroke:#0a0e27,stroke-width:2px
    style CACHE fill:#00ff88,stroke:#0a0e27,stroke-width:2px
```

## Task Decomposition Workflow

```mermaid
graph TB
    TASK[Complex Task Received]
    
    TASK --> ANALYZE[Analyze Task Description]
    ANALYZE --> OLLAMA_DECOMP[Ask Ollama to Decompose]
    
    OLLAMA_DECOMP --> SUBTASKS[Receive Subtasks]
    SUBTASKS --> VALIDATE[Validate Subtasks]
    
    VALIDATE --> DEPS[Identify Dependencies]
    DEPS --> ORDER[Determine Execution Order]
    
    ORDER --> CREATE[Create Subtask Records]
    CREATE --> PRIORITY[Assign Priorities]
    
    PRIORITY --> PARALLEL{Can Run in Parallel?}
    
    PARALLEL -->|Yes| GROUP1[Group 1: Independent Tasks]
    PARALLEL -->|No| GROUP2[Group 2: Sequential Tasks]
    
    GROUP1 --> ASSIGN1[Assign to Multiple Agents]
    GROUP2 --> ASSIGN2[Assign to Single Agent]
    
    ASSIGN1 --> EXEC1[Execute in Parallel]
    ASSIGN2 --> EXEC2[Execute Sequentially]
    
    EXEC1 --> MONITOR[Monitor Progress]
    EXEC2 --> MONITOR
    
    MONITOR --> COMPLETE{All Complete?}
    
    COMPLETE -->|No| WAIT[Wait for Updates]
    WAIT --> MONITOR
    
    COMPLETE -->|Yes| AGGREGATE[Aggregate Results]
    AGGREGATE --> FINAL[Mark Parent Task Complete]
    
    style OLLAMA_DECOMP fill:#4a90e2,stroke:#0a0e27,stroke-width:2px
```

## Agent Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Spawning: spawn()
    
    Spawning --> Initializing: created
    Initializing --> Idle: initialized
    
    Idle --> Thinking: task assigned
    Thinking --> Planning: analyzed
    Planning --> Acting: plan ready
    
    Acting --> Coding: coding task
    Acting --> Testing: testing task
    Acting --> Deploying: deploy task
    
    Coding --> Collaborating: need help
    Testing --> Collaborating: need help
    Deploying --> Collaborating: need help
    
    Collaborating --> Acting: received response
    
    Coding --> Validating: done coding
    Testing --> Validating: done testing
    Deploying --> Validating: done deploying
    
    Validating --> Success: valid
    Validating --> Error: invalid
    
    Error --> Thinking: retry
    Error --> Failed: max retries
    
    Success --> Idle: task complete
    Failed --> Idle: marked failed
    
    Idle --> Paused: pause command
    Paused --> Idle: resume command
    
    Idle --> Terminating: terminate()
    Paused --> Terminating: terminate()
    Failed --> Terminating: cleanup
    
    Terminating --> [*]: terminated
```

## Message Flow Patterns

### Request-Response Pattern

```mermaid
sequenceDiagram
    participant A as Agent A
    participant Bus as Message Bus
    participant B as Agent B
    
    A->>Bus: PUBLISH Request (correlationId: 123)
    Bus->>B: ROUTE Request
    B->>B: Process Request
    B->>Bus: PUBLISH Response (correlationId: 123)
    Bus->>A: ROUTE Response
    A->>A: Handle Response
```

### Broadcast Pattern

```mermaid
sequenceDiagram
    participant A as Agent A
    participant Bus as Message Bus
    participant B as Agent B
    participant C as Agent C
    participant D as Agent D
    
    A->>Bus: PUBLISH Broadcast
    Bus->>B: ROUTE to All
    Bus->>C: ROUTE to All
    Bus->>D: ROUTE to All
    B->>B: Handle Message
    C->>C: Handle Message
    D->>D: Handle Message
```

### Event Stream Pattern

```mermaid
sequenceDiagram
    participant Agent
    participant Bus as Message Bus
    participant Sub1 as Subscriber 1
    participant Sub2 as Subscriber 2
    
    Sub1->>Bus: SUBSCRIBE('agent.events')
    Sub2->>Bus: SUBSCRIBE('agent.events')
    
    loop Every Event
        Agent->>Bus: PUBLISH Event
        Bus->>Sub1: DELIVER Event
        Bus->>Sub2: DELIVER Event
    end
```

## Error Handling Flow

```mermaid
graph TB
    ERROR[Error Occurs]
    
    ERROR --> TYPE{Error Type}
    
    TYPE -->|Validation Error| LOG1[Log Error]
    TYPE -->|Network Error| RETRY1[Retry with Backoff]
    TYPE -->|Ollama Error| FALLBACK[Try Fallback Model]
    TYPE -->|Database Error| ROLLBACK[Rollback Transaction]
    
    LOG1 --> NOTIFY1[Notify User]
    
    RETRY1 --> SUCCESS1{Success?}
    SUCCESS1 -->|Yes| CONTINUE1[Continue]
    SUCCESS1 -->|No| MAX1{Max Retries?}
    MAX1 -->|No| RETRY1
    MAX1 -->|Yes| FAIL1[Mark Failed]
    
    FALLBACK --> SUCCESS2{Success?}
    SUCCESS2 -->|Yes| CONTINUE2[Continue]
    SUCCESS2 -->|No| FAIL2[Mark Failed]
    
    ROLLBACK --> CLEANUP[Cleanup Resources]
    CLEANUP --> FAIL3[Mark Failed]
    
    NOTIFY1 --> END1[End]
    CONTINUE1 --> END2[End]
    CONTINUE2 --> END2
    FAIL1 --> NOTIFY2[Notify Failure]
    FAIL2 --> NOTIFY2
    FAIL3 --> NOTIFY2
    NOTIFY2 --> END3[End]
    
    style ERROR fill:#ff4444,stroke:#0a0e27,stroke-width:2px
    style FAIL1 fill:#ff4444,stroke:#0a0e27,stroke-width:2px
    style FAIL2 fill:#ff4444,stroke:#0a0e27,stroke-width:2px
    style FAIL3 fill:#ff4444,stroke:#0a0e27,stroke-width:2px
```

## Deployment Workflow

```mermaid
graph TB
    CODE[Code Complete]
    
    CODE --> TESTS[Run Tests]
    TESTS --> PASS{Tests Pass?}
    
    PASS -->|No| FIX[Fix Issues]
    FIX --> TESTS
    
    PASS -->|Yes| BUILD[Build Artifacts]
    BUILD --> LINT[Run Linters]
    
    LINT --> LINT_OK{Linting OK?}
    LINT_OK -->|No| FIX
    LINT_OK -->|Yes| SECURITY[Security Scan]
    
    SECURITY --> SEC_OK{Secure?}
    SEC_OK -->|No| FIX
    SEC_OK -->|Yes| STAGE[Deploy to Staging]
    
    STAGE --> STAGE_OK{Staging OK?}
    STAGE_OK -->|No| ROLLBACK1[Rollback Staging]
    ROLLBACK1 --> FIX
    
    STAGE_OK -->|Yes| APPROVE{Manual Approval?}
    APPROVE -->|Required| WAIT[Wait for Approval]
    WAIT --> APPROVED{Approved?}
    
    APPROVED -->|No| CANCEL[Cancel Deployment]
    APPROVED -->|Yes| PROD[Deploy to Production]
    APPROVE -->|Not Required| PROD
    
    PROD --> MONITOR[Monitor Metrics]
    MONITOR --> HEALTHY{Healthy?}
    
    HEALTHY -->|No| ROLLBACK2[Rollback Production]
    HEALTHY -->|Yes| SUCCESS[Deployment Success]
    
    ROLLBACK2 --> INVESTIGATE[Investigate Issues]
    CANCEL --> END1[End]
    SUCCESS --> END2[End]
    INVESTIGATE --> END3[End]
    
    style SUCCESS fill:#00ff88,stroke:#0a0e27,stroke-width:2px
    style ROLLBACK1 fill:#ff4444,stroke:#0a0e27,stroke-width:2px
    style ROLLBACK2 fill:#ff4444,stroke:#0a0e27,stroke-width:2px
```

## Data Persistence Flow

```mermaid
sequenceDiagram
    participant App as Application
    participant State as State Manager
    participant Cache as Redis Cache
    participant DB as PostgreSQL
    participant WS as WebSocket
    
    App->>State: Update State
    
    par Parallel Operations
        State->>Cache: SET (key, value, TTL)
        State->>DB: INSERT/UPDATE
    end
    
    Cache-->>State: OK
    DB-->>State: OK
    
    State->>WS: Publish State Change
    WS-->>App: Notify Subscribers
    
    App->>State: Get State
    State->>Cache: GET (key)
    
    alt Cache Hit
        Cache-->>State: Value
        State-->>App: Return Value
    else Cache Miss
        State->>DB: SELECT
        DB-->>State: Value
        State->>Cache: SET (key, value, TTL)
        State-->>App: Return Value
    end
```

---

These workflows provide a complete view of how the Agent Swamps system operates, from user interaction to AI processing to data persistence and real-time updates.

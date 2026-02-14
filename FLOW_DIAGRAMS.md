# System Flow Diagrams - Agent Swamps

## 1. Task Submission and Processing Flow

```
┌──────────────┐
│    Client    │
│   Request    │
└──────┬───────┘
       │
       ↓ POST /api/tasks
┌──────────────────────────────────────────────┐
│          API Server (Express)                │
│  ┌────────────────────────────────────────┐ │
│  │ Validate Request                       │ │
│  │ Create Task Object                     │ │
│  │ Generate Task ID                       │ │
│  └────────────┬───────────────────────────┘ │
└───────────────┼──────────────────────────────┘
                │
                ↓
┌──────────────────────────────────────────────┐
│          Orchestrator                        │
│  ┌────────────────────────────────────────┐ │
│  │ submitTask(taskRequest)                │ │
│  │   • Create Task entity                 │ │
│  │   • Enqueue to TaskQueue               │ │
│  │   • Trigger processQueue()             │ │
│  └────────────┬───────────────────────────┘ │
└───────────────┼──────────────────────────────┘
                │
                ↓
┌──────────────────────────────────────────────┐
│          Task Queue                          │
│  ┌────────────────────────────────────────┐ │
│  │ Priority-based Queuing                 │ │
│  │   CRITICAL → HIGH → MEDIUM → LOW       │ │
│  └────────────┬───────────────────────────┘ │
└───────────────┼──────────────────────────────┘
                │
                ↓ dequeue()
┌──────────────────────────────────────────────┐
│          Agent Selector                      │
│  ┌────────────────────────────────────────┐ │
│  │ Score Available Agents                 │ │
│  │   • Specialization Match (35%)         │ │
│  │   • Historical Success (25%)           │ │
│  │   • Availability (20%)                 │ │
│  │   • Recent Performance (15%)           │ │
│  │   • Load Balance (5%)                  │ │
│  │                                         │ │
│  │ Select Best Agent                      │ │
│  └────────────┬───────────────────────────┘ │
└───────────────┼──────────────────────────────┘
                │
                ↓
┌──────────────────────────────────────────────┐
│          Selected Agent                      │
│  ┌────────────────────────────────────────┐ │
│  │ processTask(task)                      │ │
│  │   1. THINKING - analyzeTask()          │ │
│  │      ↓                                  │ │
│  │   2. EXECUTING - execute()             │ │
│  │      ↓                                  │ │
│  │   3. VALIDATING - validate()           │ │
│  │      ↓                                  │ │
│  │   4. COMPLETED                         │ │
│  └────────────┬───────────────────────────┘ │
└───────────────┼──────────────────────────────┘
                │
                ↓ Each step queries model
┌──────────────────────────────────────────────┐
│          Model Router                        │
│  ┌────────────────────────────────────────┐ │
│  │ Select Provider                        │ │
│  │   • Check preferred provider           │ │
│  │   • Load balancing                     │ │
│  │   • Fallback on failure                │ │
│  └────────────┬───────────────────────────┘ │
└───────────────┼──────────────────────────────┘
                │
                ↓
┌──────────────────────────────────────────────┐
│    Model Provider (e.g., Gemini)            │
│  ┌────────────────────────────────────────┐ │
│  │ generate(prompt, options)              │ │
│  │   • Build API request                  │ │
│  │   • Call Gemini API                    │ │
│  │   • Parse response                     │ │
│  │   • Return result                      │ │
│  └────────────┬───────────────────────────┘ │
└───────────────┼──────────────────────────────┘
                │
                ↓ Result
┌──────────────────────────────────────────────┐
│          Agent (continued)                   │
│  ┌────────────────────────────────────────┐ │
│  │ Update Metrics                         │ │
│  │   • Increment task count               │ │
│  │   • Update success rate                │ │
│  │   • Track execution time               │ │
│  │                                         │ │
│  │ Return TaskResult                      │ │
│  └────────────┬───────────────────────────┘ │
└───────────────┼──────────────────────────────┘
                │
                ↓
┌──────────────────────────────────────────────┐
│          Orchestrator                        │
│  ┌────────────────────────────────────────┐ │
│  │ Store TaskResult                       │ │
│  │ Update Task Status                     │ │
│  │ Decrement Agent Load                   │ │
│  └────────────┬───────────────────────────┘ │
└───────────────┼──────────────────────────────┘
                │
                ↓ WebSocket Event
┌──────────────────────────────────────────────┐
│          API Server                          │
│  ┌────────────────────────────────────────┐ │
│  │ Emit: task:completed                   │ │
│  │ Broadcast to subscribed clients        │ │
│  └────────────┬───────────────────────────┘ │
└───────────────┼──────────────────────────────┘
                │
                ↓
┌──────────────┐
│   Frontend   │
│   Updates    │
│ (Real-time)  │
└──────────────┘
```

## 2. Agent Selection Decision Tree

```
Task Received
    │
    ↓
Is there an available agent?
    │
    ├─ NO → Wait and retry
    │
    ↓ YES
Filter by required capabilities
    │
    ├─ No matches → Use any available agent
    │
    ↓ Has matches
Score each capable agent
    │
    ├─ Score = w₁×Spec + w₂×Hist + w₃×Avail + w₄×Perf + w₅×Load
    │
    ↓
Sort by score (descending)
    │
    ↓
Select top-scored agent
    │
    ↓
Assign task to agent
```

## 3. Model Provider Failover Flow

```
Agent requests generation
    │
    ↓
ModelRouter.generate(prompt)
    │
    ↓
Check preferred provider?
    │
    ├─ YES → Use preferred
    ├─ NO → Use default (Gemini)
    │
    ↓
Try primary provider
    │
    ├─ SUCCESS → Return result
    │
    ↓ FAILURE
Check if fallback available?
    │
    ├─ NO → Throw error
    │
    ↓ YES
Try next available provider
    │
    ├─ SUCCESS → Return result
    ├─ FAILURE → Try next
    │
    ↓
All providers failed
    │
    ↓
Throw comprehensive error
```

## 4. Real-time Update Flow

```
┌─────────────────────────────────────────────┐
│   Backend Events                             │
│                                              │
│   • Task created                             │
│   • Task status changed                      │
│   • Task completed                           │
│   • Agent status changed                     │
│                                              │
└───────────────┬──────────────────────────────┘
                │
                ↓ Emit via Socket.io
┌──────────────────────────────────────────────┐
│   WebSocket Server                           │
│   (Running on API Server)                    │
│                                              │
│   Rooms:                                     │
│   • "tasks" - Task updates                   │
│   • "agents" - Agent updates                 │
└───────────────┬──────────────────────────────┘
                │
                ↓ Broadcast to room
┌──────────────────────────────────────────────┐
│   Connected Clients                          │
│   (Frontend applications)                    │
│                                              │
│   Subscribe to:                              │
│   • socket.on('task:created')                │
│   • socket.on('task:updated')                │
│   • socket.on('task:completed')              │
│   • socket.on('agent:updated')               │
└───────────────┬──────────────────────────────┘
                │
                ↓ Update UI
┌──────────────────────────────────────────────┐
│   Frontend State Update                      │
│                                              │
│   • Update task list                         │
│   • Refresh agent visualization              │
│   • Update metrics dashboard                 │
│   • Show notifications                       │
└──────────────────────────────────────────────┘
```

## 5. Agent Lifecycle State Machine

```
    ┌─────────────┐
    │ INITIALIZED │ (Agent created)
    └──────┬──────┘
           │
           ↓ Registry.registerAgent()
    ┌──────────┐
    │   IDLE   │◄──────────────┐
    └──────┬───┘               │
           │                   │
           ↓ Task assigned     │
    ┌─────────────┐            │
    │  ASSIGNED   │            │
    └──────┬──────┘            │
           │                   │
           ↓ Start analysis    │
    ┌─────────────┐            │
    │  THINKING   │            │
    └──────┬──────┘            │
           │                   │
           ↓ Start execution   │
    ┌─────────────┐            │
    │  EXECUTING  │            │
    └──────┬──────┘            │
           │                   │
           ↓ Start validation  │
    ┌─────────────┐            │
    │ VALIDATING  │            │
    └──────┬──────┘            │
           │                   │
           ├─ Success ─────────┼─ Return to IDLE
           │                   │
           ↓ Failure           │
    ┌──────────┐               │
    │  ERROR   │───────────────┘
    └──────────┘
```

## 6. Multi-Agent Collaboration (Future)

```
Complex Task Received
    │
    ↓
Orchestrator decomposes into subtasks
    │
    ├─ Subtask 1: Requirements → PM Agent
    ├─ Subtask 2: Design → Designer Agent
    ├─ Subtask 3: Code → Developer Agent
    ├─ Subtask 4: Tests → QA Agent
    └─ Subtask 5: Deploy → DevOps Agent
    │
    ↓ (Parallel or Sequential)
All agents complete their tasks
    │
    ↓
Orchestrator aggregates results
    │
    ↓
Validation & Integration
    │
    ↓
Return complete solution
```

## 7. Performance Metrics Collection

```
Task Execution
    │
    ↓
Agent.processTask()
    │
    ├─ Start Time Recorded
    │
    ↓
Execute with Model
    │
    ↓
Task Completes
    │
    ├─ End Time Recorded
    ├─ Success/Failure Noted
    │
    ↓
Agent.updateMetrics()
    │
    ├─ Increment total tasks
    ├─ Update success count
    ├─ Calculate new average time
    ├─ Update success rate
    ├─ Track by task type
    │
    ↓
Metrics Available for:
    │
    ├─ Next Agent Selection
    ├─ Dashboard Display
    ├─ Performance Analysis
    └─ System Optimization
```

These diagrams illustrate the complete flow of the Agent Swamps system, from task submission through agent selection, execution, and real-time updates to the frontend.

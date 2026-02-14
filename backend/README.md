# Agent Swamps - Backend

End-to-end multi-agent orchestration system with open model integration.

## Features

- **Multi-Agent System**: Specialized agents for different tasks (Developer, QA, Product Manager, etc.)
- **Intelligent Orchestration**: Smart agent selection based on capabilities, performance, and workload
- **Open Model Integration**: Support for Google Gemini, OpenAI, and other AI providers
- **Real-time Updates**: WebSocket support for live system monitoring
- **REST API**: Complete API for task and agent management
- **Behavior-based Selection**: Agents are selected based on historical performance and specialization

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and add your API keys:

```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:

```
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
npm start
```

## Architecture

### Core Components

1. **Orchestrator**: Central coordinator managing agents and tasks
2. **Agent Registry**: Maintains pool of available agents
3. **Agent Selector**: Intelligently selects best agent for each task
4. **Task Queue**: Priority-based task management
5. **Model Router**: Manages multiple AI model providers with fallback

### Agent Types

- **Developer Agent**: Code generation, review, refactoring
- **QA Agent**: Test creation, quality assurance
- **Product Manager Agent**: Requirements analysis, planning
- **DevOps Agent**: Deployment, CI/CD (coming soon)
- **Designer Agent**: UI/UX design (coming soon)
- **Research Agent**: Information gathering (coming soon)

## API Usage

### Create a Task

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Create Hello World app",
    "description": "Create a simple Node.js Hello World application",
    "type": "CODE_GENERATION",
    "priority": "MEDIUM"
  }'
```

### Get Task Status

```bash
curl http://localhost:3000/api/tasks/{taskId}
```

### List All Agents

```bash
curl http://localhost:3000/api/agents
```

### Get System Statistics

```bash
curl http://localhost:3000/api/system/stats
```

## WebSocket Events

Connect to `ws://localhost:3000` and subscribe to events:

```javascript
const socket = io('http://localhost:3000');

// Subscribe to task updates
socket.emit('subscribe:tasks');
socket.on('task:created', (data) => console.log(data));
socket.on('task:updated', (data) => console.log(data));

// Subscribe to agent updates
socket.emit('subscribe:agents');
socket.on('agent:updated', (data) => console.log(data));
```

## Agent Selection Algorithm

Agents are scored based on:

- **Specialization Match (35%)**: How well agent's skills match the task
- **Historical Success (25%)**: Success rate on similar tasks
- **Availability (20%)**: Current workload vs capacity
- **Recent Performance (15%)**: Recent success rate
- **Load Balance (5%)**: Distribution across agents

## Development

### Project Structure

```
backend/
├── src/
│   ├── agents/           # Agent implementations
│   │   ├── Agent.ts             # Base agent class
│   │   ├── DeveloperAgent.ts
│   │   ├── QAAgent.ts
│   │   └── ProductManagerAgent.ts
│   ├── orchestration/    # Orchestration components
│   │   ├── Orchestrator.ts      # Main orchestrator
│   │   ├── AgentRegistry.ts
│   │   ├── AgentSelector.ts
│   │   └── TaskQueue.ts
│   ├── models/           # AI model integration
│   │   ├── ModelProvider.ts     # Provider interface
│   │   ├── GeminiProvider.ts
│   │   └── ModelRouter.ts
│   ├── api/              # API layer
│   │   └── APIServer.ts
│   ├── shared/           # Shared types
│   │   └── types.ts
│   └── index.ts          # Entry point
├── tests/                # Test files
├── package.json
└── tsconfig.json
```

### Adding New Agents

1. Extend the `Agent` base class
2. Implement required abstract methods
3. Register in `index.ts`

Example:

```typescript
import { Agent } from './agents/Agent.js';

class CustomAgent extends Agent {
  protected async analyzeTask(task: Task): Promise<TaskAnalysis> {
    // Implementation
  }

  protected async execute(analysis: TaskAnalysis, task: Task): Promise<any> {
    // Implementation
  }

  protected async validate(result: any): Promise<ValidationResult> {
    // Implementation
  }
}
```

### Adding Model Providers

1. Implement `ModelProvider` interface
2. Register in `ModelRouter`

```typescript
import { ModelProvider } from './models/ModelProvider.js';

class CustomProvider implements ModelProvider {
  // Implementation
}

// Register
modelRouter.registerProvider('custom', new CustomProvider(config));
```

## Testing

```bash
npm test
```

## License

MIT

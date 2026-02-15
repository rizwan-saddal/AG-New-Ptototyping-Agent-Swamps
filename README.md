# Agent Swamps - Architecture & Documentation

## 📋 Overview

Agent Swamps is a **zero-touch agentic software house** - an autonomous multi-agent system that orchestrates specialized AI agents to automate complete software development workflows. The current implementation uses a **Fluent UI 2 React frontend** and a **Microsoft .NET agent/workflow backend** based on Semantic Kernel.

## 🎯 Vision

Create a "living" software development environment where AI agents work together like a real software team:
- **Developer Agents** write production-ready code
- **QA Agents** generate and execute comprehensive tests
- **DevOps Agents** handle deployment and infrastructure
- **Product Manager Agents** analyze requirements and prioritize features
- **Architect Agents** design scalable system architectures

## 📚 Documentation Structure

This repository contains comprehensive architectural documentation:

### 1. [Framework Definition](./FRAMEWORK_DEFINITION.md)
Complete framework architecture, principles, and technology stack.
- **Core Principles**: Agent autonomy, collaborative intelligence, observability
- **Technology Stack**: React, Node.js, Ollama, PostgreSQL, Redis
- **Component Structure**: Frontend, Backend, Agent, and AI/ML layers
- **Communication Protocols**: Message formats and task structures
- **Security & Performance**: Best practices and optimization strategies

### 2. [Low-Level Architecture](./ARCHITECTURE.md)
Detailed system architecture with diagrams and specifications.
- **System Layers**: Complete layer-by-layer breakdown
- **Component Architecture**: Frontend, Backend, Agent, and Ollama integration
- **Data Flow Diagrams**: Task execution, agent communication, real-time updates
- **Database Schema**: Complete data model with relationships
- **API Specification**: REST endpoints and WebSocket protocols
- **Deployment Architecture**: Development and production environments
- **Performance Specs**: Response times, scalability targets, resource requirements

### 3. [Class Diagrams](./CLASS_DIAGRAMS.md)
Complete class structure for all system components.
- **Frontend Classes**: Components, contexts, and services
- **Backend Classes**: Core services, orchestrator, task manager
- **Agent Classes**: Base agent, specialized agents, and tools
- **Ollama Integration**: Client, model manager, prompt builder
- **Data Models**: Task, Agent, Message, Artifact structures
- **Interfaces & Enums**: Type definitions and contracts

### 4. [Function Calling & APIs](./FUNCTION_CALLING.md)
Comprehensive function and API documentation.
- **Frontend API Calls**: Task and agent management functions
- **Backend Endpoints**: Complete REST API specification
- **Inter-Agent Communication**: Message patterns and protocols
- **Ollama Integration**: AI/ML function calls
- **WebSocket Protocol**: Real-time communication
- **Internal Functions**: Orchestrator, task manager, state manager

### 5. [Ollama Integration Plan](./OLLAMA_INTEGRATION.md)
Complete guide for local LLM integration.
- **What is Ollama**: Overview and capabilities
- **Architecture Integration**: System diagrams and components
- **Installation & Setup**: Step-by-step guide
- **Model Selection**: Strategy by agent type and task
- **Implementation**: Client, prompt builder, response parser
- **Configuration**: Environment variables and agent configs
- **Performance Optimization**: Pooling, caching, preloading
- **Deployment**: Resource requirements and strategies

### 6. [Implementation Plan](./implementation_plan.md)
GUI implementation roadmap and phases.

### 7. [System Workflows](./WORKFLOWS.md)
Detailed workflow diagrams and process flows.
- Complete system workflow
- Agent collaboration patterns
- Real-time update mechanisms
- Ollama integration flow
- Task decomposition process
- Agent lifecycle management
- Message flow patterns
- Error handling strategies
- Deployment workflow
- Data persistence flow

### 8. [Documentation Navigation](./NAVIGATION.md)
Guide to navigating all documentation.
- Navigation flowchart
- Quick reference guide
- Use case scenarios
- Documentation matrix
- Search guide
- Diagram index

## 🏗️ System Architecture (High-Level)

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (UI)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Swamp Canvas │  │   Dashboard  │  │  Neural Link │      │
│  │ (Agent View) │  │   (Metrics)  │  │    (Chat)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕ WebSocket + REST API
┌─────────────────────────────────────────────────────────────┐
│                      Backend Services                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Orchestrator │  │ Task Manager │  │State Manager │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                   ┌──────────────┐                           │
│                   │ Message Bus  │                           │
│                   └──────────────┘                           │
└─────────────────────────────────────────────────────────────┘
                            ↕ Message Queue
┌─────────────────────────────────────────────────────────────┐
│                      Agent Layer                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │Developer │ │    QA    │ │  DevOps  │ │    PM    │       │
│  │  Agent   │ │  Agent   │ │  Agent   │ │  Agent   │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
                            ↕ API Calls
┌─────────────────────────────────────────────────────────────┐
│                   Ollama (Local LLM)                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │ Llama 3  │ │CodeLlama │ │ Mistral  │                    │
│  └──────────┘ └──────────┘ └──────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Workflow Example

### Creating a Feature
```
1. User: "Create a user authentication system"
   └─> Command Dashboard receives request

2. System decomposes task:
   ├─> Design authentication architecture (Architect Agent)
   ├─> Implement login/register endpoints (Developer Agent)
   ├─> Create UI components (Developer Agent)
   ├─> Generate tests (QA Agent)
   └─> Setup deployment (DevOps Agent)

3. Agents collaborate:
   Developer ──request──> QA: "Generate tests for this code"
   QA ──response──> Developer: "Here are the test cases"
   Developer ──request──> DevOps: "Deploy to staging"

4. Real-time updates:
   └─> UI shows agent status, progress, and results
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ (frontend)
- .NET SDK 8.0+ (agent backend)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/rizwan-saddal/Agency.git
cd Agency
```

2. **Install Ollama**
```bash
# macOS/Linux
curl -fsSL https://ollama.com/install.sh | sh

# Pull required models
ollama pull llama3
ollama pull codellama:13b
ollama pull nomic-embed-text
```

3. **Setup Frontend (Fluent UI 2)**
```bash
cd temp_app
npm install
npm run dev
```

4. **Setup Backend (.NET Agent Framework)**
```bash
cd backend-dotnet
dotnet run
```

### Configuration

Create `.env` file:
```env
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=llama3
OLLAMA_CODE_MODEL=codellama:13b

# Database (optional)
DATABASE_URL=postgresql://user:pass@localhost:5432/agentswamps

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

## 📊 Key Features

### ✅ Current (Planned)
- [x] Comprehensive architecture documentation
- [x] Low-level system design with diagrams
- [x] Class structure and relationships
- [x] Complete API specifications
- [x] Ollama integration plan
- [ ] React frontend with Swamp visualization
- [ ] Agent orchestration system
- [ ] Task management and decomposition
- [ ] Real-time WebSocket updates
- [ ] Local LLM integration with Ollama

### 🔮 Future
- Multi-project support
- Agent learning and improvement
- Custom agent training
- Integration marketplace
- Collaborative multi-user support
- Advanced analytics dashboard

## 🎨 UI Design

### Theme: Premium Dark Mode
- **Colors**: Deep Navy (#0a0e27), Neon Accent (#00ff88)
- **Style**: Glassmorphism with subtle animations
- **Vibe**: "Alive" and responsive with "wow" factor

### Components
1. **Swamp Canvas**: Interactive agent network visualization
2. **Agent Nodes**: Animated status indicators
3. **Command Dashboard**: System metrics and controls
4. **Neural Link**: Human-AI chat interface
5. **Task List**: Project and task management

## 🔐 Security

- JWT-based authentication
- Role-based access control (RBAC)
- Agent sandboxing in isolated environments
- Code review gates for critical operations
- Complete audit logging
- Encrypted data at rest and in transit

## 📈 Performance

### Targets
- API Response: < 100ms (95th percentile)
- UI Render: 60 FPS
- Ollama Inference: < 2s (small prompts)
- WebSocket Latency: < 50ms
- Concurrent Agents: 50-100 per instance

## 🛠️ Technology Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Vanilla CSS with CSS Variables
- HTML5 Canvas for visualization

### Backend
- Node.js / Python
- Express or FastAPI
- PostgreSQL (database)
- Redis (caching & message queue)

### AI/ML
- Ollama (local LLM server)
- LangChain or AutoGen (agent framework)
- ChromaDB or Qdrant (vector database)

## 📖 Documentation Map

```
├── README.md (this file)
├── FRAMEWORK_DEFINITION.md
│   ├── Overview & Principles
│   ├── Technology Stack
│   ├── Component Structure
│   └── Future Enhancements
│
├── ARCHITECTURE.md
│   ├── System Layers
│   ├── Component Architecture
│   ├── Data Flow Diagrams
│   ├── Database Schema
│   ├── API Specification
│   └── Deployment Architecture
│
├── CLASS_DIAGRAMS.md
│   ├── Frontend Classes
│   ├── Backend Classes
│   ├── Agent Classes
│   ├── Ollama Integration
│   └── Data Models
│
├── FUNCTION_CALLING.md
│   ├── Frontend API Calls
│   ├── Backend Endpoints
│   ├── Inter-Agent Communication
│   ├── Ollama Integration
│   └── WebSocket Protocol
│
├── OLLAMA_INTEGRATION.md
│   ├── Overview & Setup
│   ├── Architecture Integration
│   ├── Model Selection
│   ├── Implementation Guide
│   └── Deployment Strategy
│
├── WORKFLOWS.md
│   ├── Complete System Workflow
│   ├── Agent Collaboration
│   ├── Real-time Updates
│   ├── Ollama Integration Flow
│   ├── Task Decomposition
│   ├── Agent Lifecycle
│   ├── Message Patterns
│   └── Error Handling
│
└── NAVIGATION.md
    ├── Navigation Guide
    ├── Quick Reference
    ├── Use Case Scenarios
    └── Documentation Matrix
```

## 🤝 Contributing

This is currently a prototype/planning phase project. Contributions to the documentation and architecture are welcome!

## 📄 License

[To be determined]

## 🔗 Resources

- [Ollama Documentation](https://github.com/ollama/ollama)
- [React Documentation](https://react.dev)
- [LangChain](https://python.langchain.com)
- [AutoGen](https://microsoft.github.io/autogen/)

## 📞 Contact

For questions or suggestions, please open an issue on GitHub.

---

**Built with ❤️ for the future of autonomous software development**

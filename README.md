# Agent Swamps - AI Agent Management & Orchestration Platform

> A comprehensive AI agent management system with training, fine-tuning, workflow automation, and intelligent orchestration powered by open AI models.

## 🌟 Overview

Agent Swamps is a **complete agent management platform** that goes beyond simple orchestration. Create, train, fine-tune, and automate multi-agent workflows for software development, marketing, operations, and more. The system uses open models (like Google Gemini) with continuous learning capabilities and behavior-based agent selection.

### Key Features

- **🎓 Agent Training & Learning**: Continuous learning from task execution with reinforcement training support
- **🤖 Agent Creation**: Create specialized agents from templates or build custom agents
- **⚙️ Workflow Automation**: Predefined workflows for common organizational processes
- **🎯 Intelligent Selection**: Behavior-based routing using performance metrics and specialization matching
- **🧠 Open Model Integration**: Model-agnostic design supporting Google Gemini, OpenAI, Anthropic, and local models
- **🔄 Real-time Orchestration**: Dynamic task distribution and agent coordination
- **📊 Performance Analytics**: Detailed insights into agent strengths, improvements, and learning progress
- **🌐 Complete API**: REST and WebSocket APIs for all management and orchestration features

## 🆕 Agent Management System

### Training & Fine-Tuning
- **Continuous Learning**: All agents learn from every task they execute
- **Reinforcement Learning**: Custom reward functions for specialized training
- **Adaptive Learning Rates**: Automatically adjust based on performance
- **Learning Profiles**: Track strengths, improvements, and preferred task types

### Agent Creation
- **Template-Based**: Create agents from predefined templates
- **Custom Capabilities**: Define specialized skills and focus areas
- **Training Strategies**: Choose between supervised, reinforced, or continuous learning

### Workflow Automation
- **4 Predefined Workflows**: Software Development, Marketing Campaign, Website Launch, Product Launch
- **Custom Workflows**: Build multi-step automated processes
- **Dependency Management**: Handle complex workflows with step dependencies
- **Progress Tracking**: Monitor workflow execution in real-time

## 🏗️ Architecture

The system is built on a layered architecture:

```
┌─────────────────────────────────────────┐
│      Frontend (React + TypeScript)      │
│   Real-time Visualization & Management  │
└─────────────────────────────────────────┘
                  ↕
┌─────────────────────────────────────────┐
│         API Layer (REST + WS)           │
│  Tasks | Agents | Training | Workflows  │
└─────────────────────────────────────────┘
                  ↕
┌─────────────────────────────────────────┐
│      Management & Orchestration         │
│  - Agent Management System              │
│  - Workflow Management System           │
│  - Agent Selection & Routing            │
│  - Performance Tracking & Learning      │
└─────────────────────────────────────────┘
                  ↕
┌─────────────────────────────────────────┐
│         Agent Layer (5 Types)           │
│  Developer | QA | PM | SEO | Lead Gen   │
│  All with continuous learning           │
└─────────────────────────────────────────┘
                  ↕
┌─────────────────────────────────────────┐
│      Open Model Engine                   │
│  Gemini | OpenAI | Claude | Local LLMs  │
└─────────────────────────────────────────┘
```

## 📚 Documentation

- **[AGENT_MANAGEMENT_GUIDE.md](./AGENT_MANAGEMENT_GUIDE.md)**: Complete guide to agent training, creation, and workflows
- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: High-level system architecture and design principles
- **[CLASS_DIAGRAMS.md](./CLASS_DIAGRAMS.md)**: Detailed class diagrams with relationships
- **[LOW_LEVEL_DESIGN.md](./LOW_LEVEL_DESIGN.md)**: Implementation details, algorithms, and data structures
- **[FLOW_DIAGRAMS.md](./FLOW_DIAGRAMS.md)**: System flow visualizations
- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Production deployment guide
- **[backend/README.md](./backend/README.md)**: Backend API documentation and usage

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Google Gemini API key (or other supported AI provider)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/rizwan-saddal/AG-New-Ptototyping-Agent-Swamps.git
cd AG-New-Ptototyping-Agent-Swamps
```

2. **Setup Backend**

```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

3. **Setup Frontend** (optional, for UI)

```bash
cd ../temp_app
npm install
```

### Running the System

**Start Backend Server:**

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:3000`

**Start Frontend** (optional):

```bash
cd temp_app
npm run dev
```

The frontend will start on `http://localhost:5173`

## 💡 Usage Examples

### Create a New Agent

```bash
curl -X POST http://localhost:3000/api/agents/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "E-commerce SEO Specialist",
    "type": "SEO",
    "templateId": "seo-template",
    "customCapabilities": ["product-seo", "local-seo"],
    "customSpecializations": ["shopify", "woocommerce"],
    "trainingStrategy": "continuous"
  }'
```

### Execute a Workflow

```bash
curl -X POST http://localhost:3000/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "software-development",
    "inputs": {
      "description": "Build a real-time chat application with React and Node.js"
    }
  }'
```

### Train an Agent

```bash
curl -X POST http://localhost:3000/api/agents/{agentId}/train \
  -H "Content-Type: application/json" \
  -d '{
    "trainingData": [
      {
        "taskId": "task-1",
        "input": "Create a REST API",
        "output": "/* code here */",
        "success": true,
        "feedback": "Excellent implementation"
      }
    ]
  }'
```

### Get Agent Insights

```bash
curl http://localhost:3000/api/agents/{agentId}/insights
```

### Submit a Code Generation Task

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Create REST API",
    "description": "Create a RESTful API for a todo list with CRUD operations using Express and TypeScript",
    "type": "CODE_GENERATION",
    "priority": "HIGH",
    "requiredCapabilities": ["TypeScript", "Node.js", "Express"]
  }'
```

### Check Task Status

```bash
curl http://localhost:3000/api/tasks/{taskId}
```

### View All Agents

```bash
curl http://localhost:3000/api/agents
```

### Get System Statistics

```bash
curl http://localhost:3000/api/system/stats
```

## 🎯 Agent Selection Algorithm

The system uses a sophisticated multi-factor scoring algorithm to select the best agent for each task:

```
Agent Score = 0.35 × Specialization Match
            + 0.25 × Historical Success
            + 0.20 × Availability
            + 0.15 × Recent Performance
            + 0.05 × Load Balance
```

This ensures:
- **Expertise**: Tasks go to agents with relevant skills
- **Reliability**: Agents with proven track records are preferred
- **Efficiency**: Workload is distributed evenly
- **Quality**: Performance trends influence future assignments

## 🤖 Available Agents

## 🤖 Available Agents

### Currently Implemented

1. **Developer Agent** 🔧
   - Code generation and scaffolding
   - Code review and refactoring
   - Debugging assistance
   - Best practices recommendations
   - **Supports**: JavaScript, TypeScript, Python, Java, Go
   - **Frameworks**: React, Node.js, Express, FastAPI, Spring Boot

2. **QA Agent** ✅
   - Test case generation
   - Test plan creation
   - Quality assurance reviews
   - Bug reporting and analysis
   - **Supports**: Jest, Vitest, Pytest, JUnit, Mocha

3. **Product Manager Agent** 📋
   - Requirements analysis
   - Task prioritization (MoSCoW method)
   - Roadmap planning
   - Stakeholder management
   - Sprint planning

4. **SEO Agent** 🔍 *(NEW)*
   - Keyword research and strategy
   - On-page SEO optimization
   - Technical SEO audits
   - Content optimization
   - Meta tags and schema markup
   - Competitor analysis

5. **Lead Generation Agent** 📈 *(NEW)*
   - Campaign strategy and planning
   - Funnel design and optimization
   - Email marketing and nurture campaigns
   - Landing page optimization
   - Lead scoring and segmentation
   - Multi-channel campaigns

### Agent Capabilities

All agents support:
- ✅ Continuous learning from task execution
- ✅ Performance tracking and insights
- ✅ Custom specializations
- ✅ Template-based creation
- ✅ Reinforcement training

### Coming Soon

- DevOps Agent (CI/CD, deployment)
- Designer Agent (UI/UX)
- Marketing Agent (content creation)
- Research Agent (information gathering)

## 🔧 Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **WebSocket**: Socket.io
- **AI Models**: Google Gemini (primary), extensible to others

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: CSS (with premium dark theme)
- **State**: React Context + Hooks

### Future Integration
- **Database**: PostgreSQL for persistence
- **Cache**: Redis for performance
- **Vector DB**: Pinecone/Chroma for knowledge base
- **Monitoring**: Prometheus + Grafana

## 🏛️ Design Patterns

The system implements several key design patterns:

- **Abstract Factory**: Agent creation and registration
- **Strategy**: Pluggable model providers
- **Observer**: Event-driven agent communication
- **Command**: Task execution and queuing
- **Singleton**: Orchestrator and registry management
- **Adapter**: Unified interface for different AI models

## 📊 Monitoring & Metrics

The system tracks comprehensive metrics:

- **Agent Performance**: Success rate, average completion time, task distribution
- **Task Metrics**: Queue depth, processing time, failure rates
- **System Health**: Agent availability, load distribution, API response times
- **Model Usage**: Provider statistics, error rates, fallback frequency

## 🔐 Security

- API key management through environment variables
- Request validation and sanitization
- Rate limiting and quota management
- Sandboxed agent execution (planned)
- PII redaction in logs (planned)

## 🛣️ Roadmap

- [x] Core orchestration engine
- [x] Basic agents (Developer, QA, PM)
- [x] Google Gemini integration
- [x] REST API
- [x] WebSocket real-time updates
- [ ] Additional agents (DevOps, Designer, Research)
- [ ] Database persistence
- [ ] Vector database for knowledge management
- [ ] Enhanced frontend with live visualization
- [ ] Multi-model support (OpenAI, Claude, local models)
- [ ] Agent collaboration protocols
- [ ] Advanced monitoring and analytics
- [ ] Docker deployment
- [ ] Kubernetes orchestration

## 🤝 Contributing

Contributions are welcome! This is a prototype system designed to showcase end-to-end multi-agent orchestration.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Inspired by Google's Agentic Design Templates
- Built with cutting-edge AI model integration
- Designed for extensibility and real-world applications

---

**Built with ❤️ for autonomous software development**

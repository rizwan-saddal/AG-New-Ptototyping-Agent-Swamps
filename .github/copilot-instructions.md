# Copilot Instructions for Agent Swamps

## Project Overview

**Agent Swamps** is a zero-touch agentic software house system with a premium web-based GUI for visualizing and managing AI agent swarms. The platform orchestrates autonomous teams of specialized agents (Developer, QA, DevOps, Product, Marketing, etc.) working collaboratively on software projects.

### Core Concept
- **The Swamp**: Visual representation of the agent swarm with real-time status updates
- **Neural Link**: Communication hub for human-in-the-loop interactions
- **Command Dashboard**: High-level metrics and system health monitoring

## Technology Stack

### Frontend (Primary Stack)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Vanilla CSS with CSS Variables for theming
- **Layout**: CSS Flexbox and Grid
- **Icons**: Lucide-React or Heroicons
- **Visualization**: HTML5 Canvas or SVG for agent graphs
- **State Management**: React Context API and Hooks

### AI/ML Technologies (Architecture Awareness)

When working with or integrating AI/ML components, be aware of:

- **TensorFlow**: Deep learning framework for model training and inference
- **Keras**: High-level neural networks API (often used with TensorFlow)
- **Pandas**: Data manipulation and analysis library for Python
- **Ollama**: Local LLM runtime for running open-source language models
- **OpenClaw**: Autonomous agent framework (for agent orchestration)
- **Google ADT**: Android Developer Tools and associated architecture patterns

## Development Practices

### Code Style
- Use TypeScript strict mode
- Follow React functional components with hooks (no class components)
- Use ES6+ features (arrow functions, destructuring, async/await)
- Prefer composition over inheritance
- Keep components small and focused on single responsibilities

### Naming Conventions
- **Components**: PascalCase (e.g., `AgentNode`, `SwampCanvas`)
- **Files**: Match component names (e.g., `AgentNode.tsx`)
- **Hooks**: camelCase starting with "use" (e.g., `useAgentStatus`)
- **Services**: PascalCase with "Service" suffix (e.g., `AgentService`)
- **CSS Classes**: kebab-case (e.g., `agent-node`, `swamp-canvas`)

### Component Structure
```typescript
// Import external dependencies first
import { useState, useEffect } from 'react';

// Import local components and utilities
import { ComponentName } from './components/ComponentName';

// Import styles last
import './ComponentName.css';

// Type definitions before component
interface ComponentProps {
  // ...
}

// Component definition
export function ComponentName({ prop }: ComponentProps) {
  // Hooks
  // Event handlers
  // Render logic
  return (
    // JSX
  );
}
```

### State Management
- Use `useState` for local component state
- Use `useContext` for shared state across components
- Consider custom hooks for reusable stateful logic
- Keep state as close to where it's used as possible

### Styling Guidelines
- **Theme**: Premium Dark Mode with Glassmorphism effects
- **Design Aesthetics**: "Alive" feeling with subtle animations
- **Color Palette**: Deep Navy backgrounds, Neon accent colors
- **Effects**: Glass morphism, glowing borders, subtle shadows
- **Animations**: Floating effects, pulsing connections, localized transitions
- Use CSS Variables for theme colors and spacing
- Ensure responsive design for cross-platform compatibility

## Build and Development Commands

```bash
# Navigate to the app directory
cd temp_app

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Project Structure

```
temp_app/
├── src/
│   ├── components/     # React components
│   ├── assets/         # Static assets (images, icons)
│   ├── App.tsx         # Main application component
│   ├── main.tsx        # Application entry point
│   └── index.css       # Global styles and CSS variables
├── public/             # Public static files
└── package.json        # Dependencies and scripts
```

## Architecture Principles

### Agent System Architecture
- **Agent Types**: Developer, QA, DevOps, Product, Marketing, Design
- **Agent States**: Thinking, Coding, Idle, Error, Completed
- **Communication**: Inter-agent messaging, Human-in-the-Loop integration
- **Visualization**: Real-time status updates, activity indicators

### Scalability Considerations
- Design for multi-agent orchestration
- Support real-time updates and WebSocket connections (future)
- Prepare for integration with AI/ML backends
- Consider data flow for TensorFlow/Keras model inference
- Plan for Ollama integration for local LLM capabilities

### Future ML/AI Integration Points
When implementing AI/ML features:
- Use TensorFlow.js for browser-based ML inference
- Prepare data pipelines compatible with Pandas data structures
- Design APIs compatible with Ollama's REST interface
- Consider agent decision-making using Keras models
- Plan for model training workflows with proper data handling

## Testing Approach

- Write tests for critical business logic
- Test component rendering and user interactions
- Mock external services and APIs
- Ensure visual regression testing for UI components

## Security Considerations

- Sanitize all user inputs
- Validate data from external sources
- Use secure communication protocols for agent messaging
- Protect sensitive configuration and API keys
- Follow OWASP guidelines for web application security

## Performance Optimization

- Lazy load components where appropriate
- Optimize re-renders with React.memo and useMemo
- Use virtualization for large lists of agents
- Optimize Canvas/SVG rendering for smooth animations
- Code-split and bundle optimize for faster load times

## Accessibility

- Ensure keyboard navigation support
- Provide ARIA labels for interactive elements
- Maintain sufficient color contrast
- Support screen readers where applicable

## Documentation

- Document complex algorithms and business logic
- Add JSDoc comments for public APIs and complex functions
- Keep README.md updated with setup and usage instructions
- Document component props and types clearly

## Version Control

- Make small, focused commits
- Write clear, descriptive commit messages
- Keep pull requests focused on single features/fixes
- Review code changes before committing

## Key Priorities

1. **Premium User Experience**: Prioritize smooth animations and polished UI
2. **Performance**: Ensure responsive and efficient rendering
3. **Maintainability**: Write clean, well-documented code
4. **Extensibility**: Design for future AI/ML integration
5. **Architecture Awareness**: Understand the broader ecosystem (TensorFlow, Keras, Pandas, Ollama, OpenClaw, Google ADT)

## Context for AI/ML Integration

As an architecture-aware agent, understand that:
- **TensorFlow + Keras** will power agent decision-making and learning
- **Pandas** will handle data preprocessing for model training
- **Ollama** provides local LLM capabilities for agent intelligence
- **OpenClaw** orchestrates autonomous agent behaviors
- **Google ADT** patterns may influence mobile/cross-platform architecture

When making architectural decisions, consider how these technologies will integrate with the React frontend and prepare appropriate interfaces and data structures.

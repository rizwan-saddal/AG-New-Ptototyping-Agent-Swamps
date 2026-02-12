// Main entry point for the Agent Swamps backend

import dotenv from 'dotenv';
import { Orchestrator } from './orchestration/Orchestrator.js';
import { ModelRouter } from './models/ModelRouter.js';
import { GeminiProvider } from './models/GeminiProvider.js';
import { DeveloperAgent } from './agents/DeveloperAgent.js';
import { QAAgent } from './agents/QAAgent.js';
import { ProductManagerAgent } from './agents/ProductManagerAgent.js';
import { APIServer } from './api/APIServer.js';

// Load environment variables
dotenv.config();

async function main() {
  console.log('🌊 Starting Agent Swamps System...\n');

  // Initialize Model Router
  const modelRouter = new ModelRouter();

  // Register model providers
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey) {
    const geminiProvider = new GeminiProvider({ 
      apiKey: geminiApiKey,
      model: process.env.GEMINI_MODEL || 'gemini-1.5-pro'
    });
    modelRouter.registerProvider('gemini', geminiProvider);
    modelRouter.setDefaultProvider('gemini');
    console.log('✓ Gemini provider registered');
  } else {
    console.warn('⚠ GEMINI_API_KEY not found in environment variables');
    console.warn('  Add it to .env file to enable AI capabilities');
  }

  // Initialize Orchestrator
  const orchestrator = new Orchestrator();
  const registry = orchestrator.getRegistry();

  // Register agents
  console.log('\n📦 Registering agents...');
  
  const developerAgent = new DeveloperAgent(modelRouter, {
    languages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go'],
    frameworks: ['React', 'Node.js', 'Express', 'FastAPI', 'Spring Boot']
  });
  registry.registerAgent(developerAgent);
  console.log('  ✓ Developer Agent registered');

  const qaAgent = new QAAgent(modelRouter, {
    frameworks: ['Jest', 'Vitest', 'Pytest', 'JUnit', 'Mocha']
  });
  registry.registerAgent(qaAgent);
  console.log('  ✓ QA Agent registered');

  const pmAgent = new ProductManagerAgent(modelRouter);
  registry.registerAgent(pmAgent);
  console.log('  ✓ Product Manager Agent registered');

  // Additional agents can be registered here
  // const devopsAgent = new DevOpsAgent(modelRouter);
  // registry.registerAgent(devopsAgent);

  // Start API Server
  console.log('\n🌐 Starting API Server...');
  const port = parseInt(process.env.PORT || '3000', 10);
  const apiServer = new APIServer(orchestrator, port);
  apiServer.start();

  // Display system status
  console.log('\n📊 System Status:');
  const stats = orchestrator.getSystemStats();
  console.log(`   Total Agents: ${stats.agents.totalAgents}`);
  console.log(`   Available Agents: ${stats.agents.availableAgents}`);
  console.log(`   Agent Types:`, stats.agents.agentsByType);

  console.log('\n✨ Agent Swamps is ready!\n');
  console.log('Try submitting a task:');
  console.log('  POST http://localhost:' + port + '/api/tasks');
  console.log('  {');
  console.log('    "title": "Create a Hello World app",');
  console.log('    "description": "Create a simple Node.js Hello World application",');
  console.log('    "type": "CODE_GENERATION",');
  console.log('    "priority": "MEDIUM"');
  console.log('  }\n');

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down gracefully...');
    apiServer.stop();
    process.exit(0);
  });
}

// Run the application
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

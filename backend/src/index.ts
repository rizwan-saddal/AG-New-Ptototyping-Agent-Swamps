// Main entry point for the Agent Swamps backend

import dotenv from 'dotenv';
import { Orchestrator } from './orchestration/Orchestrator.js';
import { ModelRouter } from './models/ModelRouter.js';
import { GeminiProvider } from './models/GeminiProvider.js';
import { DeveloperAgent } from './agents/DeveloperAgent.js';
import { QAAgent } from './agents/QAAgent.js';
import { ProductManagerAgent } from './agents/ProductManagerAgent.js';
import { SEOAgent } from './agents/SEOAgent.js';
import { LeadGenerationAgent } from './agents/LeadGenerationAgent.js';
import { AIMLAgent } from './agents/AIMLAgent.js';
import { MentorAgent } from './agents/MentorAgent.js';
import { AgentManagementSystem } from './orchestration/AgentManagementSystem.js';
import { WorkflowManagementSystem } from './orchestration/WorkflowManagementSystem.js';
import { ConnectorRegistry } from './orchestration/ConnectorRegistry.js';
import { APIServer } from './api/APIServer.js';

// Load environment variables
dotenv.config();

async function main() {
  console.log('🌊 Starting Agent Swamps Management System...\n');

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

  // Initialize Agent Management System
  console.log('\n🎓 Initializing Agent Management System...');
  const agentManagement = new AgentManagementSystem(modelRouter);
  console.log('  ✓ Agent Management System ready');

  // Initialize Workflow Management System
  console.log('\n⚙️ Initializing Workflow Management System...');
  const workflowManagement = new WorkflowManagementSystem(orchestrator);
  console.log('  ✓ Workflow Management System ready');
  console.log(`  ✓ ${workflowManagement.listTemplates().length} predefined workflow templates loaded`);

  // Initialize Connector Registry
  console.log('\n🔌 Initializing Connector Registry (open standards)...');
  const connectorRegistry = new ConnectorRegistry();
  console.log(`  ✓ ${connectorRegistry.list().length} connectors available for canvas/automation`);

  // Register agents
  console.log('\n📦 Registering agents...');
  
  const developerAgent = new DeveloperAgent(modelRouter, {
    languages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go'],
    frameworks: ['React', 'Node.js', 'Express', 'FastAPI', 'Spring Boot']
  });
  registry.registerAgent(developerAgent);
  agentManagement.initializeLearningProfile(developerAgent.id, 'continuous');
  console.log('  ✓ Developer Agent registered');

  const qaAgent = new QAAgent(modelRouter, {
    frameworks: ['Jest', 'Vitest', 'Pytest', 'JUnit', 'Mocha']
  });
  registry.registerAgent(qaAgent);
  agentManagement.initializeLearningProfile(qaAgent.id, 'continuous');
  console.log('  ✓ QA Agent registered');

  const pmAgent = new ProductManagerAgent(modelRouter);
  registry.registerAgent(pmAgent);
  agentManagement.initializeLearningProfile(pmAgent.id, 'continuous');
  console.log('  ✓ Product Manager Agent registered');

  const seoAgent = new SEOAgent(modelRouter);
  registry.registerAgent(seoAgent);
  agentManagement.initializeLearningProfile(seoAgent.id, 'continuous');
  console.log('  ✓ SEO Agent registered');

  const leadGenAgent = new LeadGenerationAgent(modelRouter);
  registry.registerAgent(leadGenAgent);
  agentManagement.initializeLearningProfile(leadGenAgent.id, 'continuous');
  console.log('  ✓ Lead Generation Agent registered');

  const aiMlAgent = new AIMLAgent(modelRouter);
  registry.registerAgent(aiMlAgent);
  agentManagement.initializeLearningProfile(aiMlAgent.id, 'continuous');
  console.log('  ✓ AI/ML Expert Agent registered');

  const mentorAgent = new MentorAgent(modelRouter);
  registry.registerAgent(mentorAgent);
  agentManagement.initializeLearningProfile(mentorAgent.id, 'continuous');
  console.log('  ✓ Mentor Lead Agent registered');

  // Start API Server with management systems
  console.log('\n🌐 Starting API Server...');
  const port = parseInt(process.env.PORT || '3000', 10);
  const apiServer = new APIServer(orchestrator, port, agentManagement, workflowManagement, connectorRegistry);
  apiServer.start();

  // Display system status
  console.log('\n📊 System Status:');
  const stats = orchestrator.getSystemStats();
  console.log(`   Total Agents: ${stats.agents.totalAgents}`);
  console.log(`   Available Agents: ${stats.agents.availableAgents}`);
  console.log(`   Agent Types:`, stats.agents.agentsByType);

  console.log('\n📋 Available Features:');
  console.log('   ✓ Agent Training & Learning');
  console.log('   ✓ Workflow Automation');
  console.log('   ✓ Agent Creation from Templates');
  console.log('   ✓ Reinforcement Learning');
  console.log('   ✓ Behavior-Based Selection');

  console.log('\n✨ Agent Swamps Management System is ready!\n');
  console.log('Example API Calls:');
  console.log('\n1. Submit a task:');
  console.log('   POST http://localhost:' + port + '/api/tasks');
  console.log('   {');
  console.log('     "title": "Create a Hello World app",');
  console.log('     "description": "Create a simple Node.js Hello World application",');
  console.log('     "type": "CODE_GENERATION",');
  console.log('     "priority": "MEDIUM"');
  console.log('   }');
  
  console.log('\n2. Execute a workflow:');
  console.log('   POST http://localhost:' + port + '/api/workflows/execute');
  console.log('   {');
  console.log('     "templateId": "software-development",');
  console.log('     "inputs": { "description": "Build a todo app" }');
  console.log('   }');

  console.log('\n3. Create a new agent:');
  console.log('   POST http://localhost:' + port + '/api/agents/create');
  console.log('   {');
  console.log('     "name": "Custom SEO Agent",');
  console.log('     "type": "SEO",');
  console.log('     "templateId": "seo-template"');
  console.log('   }');

  console.log('\n4. List workflow templates:');
  console.log('   GET http://localhost:' + port + '/api/workflows/templates\n');

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

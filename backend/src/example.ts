// Example: Using the Agent Swamps System

import { Orchestrator } from './orchestration/Orchestrator.js';
import { ModelRouter } from './models/ModelRouter.js';
import { GeminiProvider } from './models/GeminiProvider.js';
import { DeveloperAgent } from './agents/DeveloperAgent.js';
import { QAAgent } from './agents/QAAgent.js';
import { ProductManagerAgent } from './agents/ProductManagerAgent.js';

/**
 * This example demonstrates how to use the Agent Swamps system
 * without running the full API server.
 */

async function runExample() {
  console.log('🌊 Agent Swamps Example\n');

  // Step 1: Initialize Model Router (mock provider for demo)
  const modelRouter = new ModelRouter();
  
  // For demo purposes, you would add a real provider here:
  // const geminiProvider = new GeminiProvider({ apiKey: 'your-key' });
  // modelRouter.registerProvider('gemini', geminiProvider);
  
  console.log('Note: This example requires a valid GEMINI_API_KEY in your .env file');
  console.log('      The system will use mock responses if no provider is configured.\n');

  // Step 2: Create Orchestrator
  const orchestrator = new Orchestrator();
  const registry = orchestrator.getRegistry();

  // Step 3: Register Agents
  console.log('📦 Registering agents...');
  
  const devAgent = new DeveloperAgent(modelRouter);
  registry.registerAgent(devAgent);
  console.log('  ✓ Developer Agent');

  const qaAgent = new QAAgent(modelRouter);
  registry.registerAgent(qaAgent);
  console.log('  ✓ QA Agent');

  const pmAgent = new ProductManagerAgent(modelRouter);
  registry.registerAgent(pmAgent);
  console.log('  ✓ Product Manager Agent\n');

  // Step 4: Check System Status
  console.log('📊 System Status:');
  const stats = orchestrator.getSystemStats();
  console.log('   Total Agents:', stats.agents.totalAgents);
  console.log('   Available:', stats.agents.availableAgents);
  console.log('   Types:', Object.keys(stats.agents.agentsByType).join(', '));
  console.log();

  // Step 5: Submit Tasks
  console.log('📝 Submitting tasks...\n');

  // Task 1: Code Generation
  const task1Id = await orchestrator.submitTask({
    title: 'Create Hello World API',
    description: 'Create a simple REST API endpoint that returns "Hello World"',
    type: 'CODE_GENERATION' as any,
    priority: 'HIGH' as any,
    requiredCapabilities: ['Node.js', 'Express']
  });
  console.log('   Task 1 submitted:', task1Id);

  // Task 2: Requirements Analysis
  const task2Id = await orchestrator.submitTask({
    title: 'Analyze User Authentication Requirements',
    description: 'Analyze requirements for implementing user authentication with JWT',
    type: 'REQUIREMENTS_ANALYSIS' as any,
    priority: 'MEDIUM' as any
  });
  console.log('   Task 2 submitted:', task2Id);

  // Task 3: Test Generation
  const task3Id = await orchestrator.submitTask({
    title: 'Create Unit Tests',
    description: 'Generate unit tests for a user registration function',
    type: 'TESTING' as any,
    priority: 'MEDIUM' as any
  });
  console.log('   Task 3 submitted:', task3Id);

  console.log('\n⏳ Processing tasks...\n');

  // Wait for tasks to complete (with timeout)
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Step 6: Check Results
  console.log('📋 Task Results:\n');

  const checkTask = (taskId: string, title: string) => {
    const task = orchestrator.getTaskStatus(taskId);
    const result = orchestrator.getTaskResult(taskId);
    
    console.log(`   ${title}`);
    console.log(`   Status: ${task?.status || 'UNKNOWN'}`);
    console.log(`   Assigned to: ${task?.assignedAgentId ? 'Agent ' + task.assignedAgentId.substring(0, 8) : 'Not assigned'}`);
    
    if (result) {
      console.log(`   Success: ${result.success}`);
      console.log(`   Execution Time: ${result.executionTime}ms`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }
    console.log();
  };

  checkTask(task1Id, 'Task 1: Hello World API');
  checkTask(task2Id, 'Task 2: Auth Requirements');
  checkTask(task3Id, 'Task 3: Unit Tests');

  // Step 7: Agent Metrics
  console.log('📊 Agent Performance:\n');
  
  for (const agent of registry.getAllAgents()) {
    console.log(`   ${agent.name}:`);
    console.log(`     Total Tasks: ${agent.metrics.totalTasks}`);
    console.log(`     Success Rate: ${(agent.metrics.successRate * 100).toFixed(1)}%`);
    console.log(`     Avg Time: ${agent.metrics.averageCompletionTime.toFixed(0)}ms`);
    console.log(`     Status: ${agent.status}`);
    console.log();
  }

  // Step 8: System Summary
  console.log('✨ Example Complete!\n');
  console.log('Key Takeaways:');
  console.log('  • Agents are automatically selected based on task requirements');
  console.log('  • Performance metrics are tracked for each agent');
  console.log('  • Tasks are processed asynchronously with priority queuing');
  console.log('  • The system is extensible - add more agents and model providers');
  console.log('\nTo run the full system with API server, use: npm run dev');
}

// Run the example
if (import.meta.url === `file://${process.argv[1]}`) {
  runExample().catch(console.error);
}

export { runExample };

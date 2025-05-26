/**
 * Example demonstrating how to use llm-functions agents
 */
import { AIChatService } from '../services/aichatService';
import { LLMFunctionsService } from '../services/llmFunctionsService';
import { createLogger } from '../utils/logger';

// Set up logger
const logger = createLogger('debug');

async function main() {
  try {
    // Initialize the services
    const functionsDir = process.env.LLM_FUNCTIONS_DIR || '../llm-functions';
    const llmFunctionsService = new LLMFunctionsService(functionsDir);
    
    const chatOptions = {
      model: process.env.AICHAT_MODEL || 'gpt-4-turbo',
      temperature: 0.7,
    };
    const aichatService = new AIChatService(chatOptions);
    
    // Check if aichat is installed
    const aichatInstalled = await aichatService.validateInstallation();
    if (!aichatInstalled) {
      console.error('aichat is not installed. Please install it with: npm install -g aichat');
      return;
    }
    
    // List available agents
    const agentsResult = await llmFunctionsService.listAgents();
    if (!agentsResult.success) {
      console.error(`Error listing agents: ${agentsResult.error}`);
      return;
    }
    
    console.log('Available agents:');
    for (const agent of agentsResult.data as string[]) {
      console.log(`- ${agent}`);
    }
    console.log();
    
    // Use an agent
    console.log('Using todo agent...');
    
    // First, let's add a todo
    const addResult = await llmFunctionsService.executeAgentFunction(
      'todo',
      'add_todo',
      { desc: 'Learn about llm-functions' }
    );
    
    if (addResult.error) {
      console.error(`Error executing agent function: ${addResult.error.message}`);
      return;
    }
    
    console.log(`Add todo result: ${addResult.result}`);
    
    // Then, let's list all todos
    const listResult = await llmFunctionsService.executeAgentFunction(
      'todo',
      'list_todos',
      {}
    );
    
    if (listResult.error) {
      console.error(`Error executing agent function: ${listResult.error.message}`);
      return;
    }
    
    console.log('Todo list:');
    console.log(listResult.result);
    
    // Use the agent via aichat
    console.log('\nUsing todo agent via aichat...');
    const chatResult = await aichatService.useAgent(
      'Show all my todos',
      'todo',
      functionsDir
    );
    
    if (chatResult.success) {
      console.log('Agent response:');
      console.log(chatResult.data);
    } else {
      console.error(`Error using agent: ${chatResult.error}`);
    }
  } catch (error) {
    console.error(`Error: ${error}`);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
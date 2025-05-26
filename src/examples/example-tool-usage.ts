/**
 * Example demonstrating how to use llm-functions tools directly
 */
import { LLMFunctionsService } from '../services/llmFunctionsService';
import { processWithJq } from '../utils/jqProcessor';
import { createLogger } from '../utils/logger';

// Set up logger
const logger = createLogger('debug');

async function main() {
  try {
    // Initialize the LLM Functions service with the functions directory
    const functionsDir = process.env.LLM_FUNCTIONS_DIR || '../llm-functions';
    const llmFunctionsService = new LLMFunctionsService(functionsDir);
    
    // Check if the functions are properly configured
    const checkResult = await llmFunctionsService.checkFunctions();
    if (!checkResult.success) {
      console.error(`Error checking functions: ${checkResult.error}`);
      return;
    }
    
    // List available tools
    const toolsResult = await llmFunctionsService.listTools();
    if (!toolsResult.success) {
      console.error(`Error listing tools: ${toolsResult.error}`);
      return;
    }
    
    console.log('Available tools:');
    for (const tool of toolsResult.data as string[]) {
      console.log(`- ${tool}`);
    }
    console.log();
    
    // Execute a tool
    console.log('Executing get_current_weather tool...');
    const weatherResult = await llmFunctionsService.executeTool(
      'get_current_weather',
      { location: 'San Francisco' }
    );
    
    if (weatherResult.error) {
      console.error(`Error executing tool: ${weatherResult.error.message}`);
      return;
    }
    
    console.log(`Tool executed in ${weatherResult.duration}ms`);
    console.log(`Result: ${weatherResult.result}`);
    
    // Process the result with jq
    const jqResult = await processWithJq({
      filter: '.',  // Identity filter, adjust as needed
      input: weatherResult.result,
    });
    
    if (jqResult.success) {
      console.log('Processed with jq:');
      console.log(jqResult.data);
    } else {
      console.error(`JQ processing error: ${jqResult.error}`);
    }
  } catch (error) {
    console.error(`Error: ${error}`);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
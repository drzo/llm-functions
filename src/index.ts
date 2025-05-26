#!/usr/bin/env node
import { Command } from 'commander';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';

import { loadConfig } from './config';
import { AIChatService } from './services/aichatService';
import { LLMFunctionsService } from './services/llmFunctionsService';
import { ArgcService } from './services/argcService';
import { validateJqInstallation } from './utils/jqProcessor';
import { processWithJq } from './utils/jqProcessor';
import { createLogger } from './utils/logger';
import { ChatOptions } from './types';

// Load environment variables
dotenv.config();

const DEFAULT_CONFIG_PATH = path.join(os.homedir(), '.aicli', 'config.json');

// Set up the command line interface
const program = new Command();

program
  .name('aicli')
  .description('AI-powered CLI tool integrating aichat, llm-functions, argc, and jq')
  .version('0.1.0');

// Configure logger
const logger = createLogger(process.env.LOG_LEVEL as any || 'info');

// Main chat command
program
  .command('chat')
  .description('Start a chat with AI')
  .option('-m, --model <model>', 'AI model to use')
  .option('-t, --temperature <temp>', 'Temperature for response generation')
  .option('-f, --functions-dir <dir>', 'Path to llm-functions directory')
  .option('-s, --system <prompt>', 'System prompt to use')
  .argument('[message]', 'Initial message to send')
  .action(async (message, options) => {
    const spinner = ora('Initializing AI chat...').start();
    
    try {
      // Load configuration
      const config = loadConfig(DEFAULT_CONFIG_PATH);
      
      // Set up chat options
      const chatOptions: ChatOptions = {
        model: options.model || config.aiChat.model,
        temperature: options.temperature ? parseFloat(options.temperature) : config.aiChat.temperature,
        maxTokens: config.aiChat.maxTokens,
        systemPrompt: options.system || undefined,
      };
      
      // Create services
      const aichatService = new AIChatService(chatOptions);
      const functionsDir = options.functionsDir || config.llmFunctions.directory;
      
      // Validate installations
      const aichatInstalled = await aichatService.validateInstallation();
      if (!aichatInstalled) {
        spinner.fail('aichat is not installed. Please install it with: npm install -g aichat');
        return;
      }
      
      spinner.succeed('AI chat initialized');
      
      // If a message was provided, send it
      if (message) {
        spinner.start('Sending message to AI...');
        
        const result = await aichatService.sendMessageWithFunctions(
          message, 
          functionsDir
        );
        
        if (result.success) {
          spinner.succeed('AI responded');
          console.log('\n' + result.data);
        } else {
          spinner.fail(`Error: ${result.error}`);
        }
      } else {
        console.log(chalk.green('Chat initialized. Type your message and press Enter. Use Ctrl+C to exit.'));
        // Here would be interactive chat loop if needed
      }
    } catch (error) {
      spinner.fail(`Error: ${error}`);
      logger.error(`Chat error: ${error}`);
    }
  });

// Execute a tool directly
program
  .command('tool')
  .description('Execute an llm-functions tool')
  .requiredOption('-n, --name <name>', 'Tool name to execute')
  .option('-f, --functions-dir <dir>', 'Path to llm-functions directory')
  .option('-p, --params <json>', 'Parameters for the tool in JSON format')
  .option('-j, --jq <filter>', 'JQ filter to apply to the result')
  .action(async (options) => {
    const spinner = ora(`Executing tool ${options.name}...`).start();
    
    try {
      // Load configuration
      const config = loadConfig(DEFAULT_CONFIG_PATH);
      
      const functionsDir = options.functionsDir || config.llmFunctions.directory;
      const llmFunctionsService = new LLMFunctionsService(functionsDir);
      
      // Parse parameters
      let params = {};
      if (options.params) {
        try {
          params = JSON.parse(options.params);
        } catch (error) {
          spinner.fail('Invalid JSON parameters');
          logger.error(`Invalid JSON parameters: ${error}`);
          return;
        }
      }
      
      // Execute the tool
      const result = await llmFunctionsService.executeTool(options.name, params);
      
      if (result.error) {
        spinner.fail(`Error executing tool: ${result.error.message}`);
        return;
      }
      
      spinner.succeed(`Tool executed in ${result.duration}ms`);
      
      // Apply JQ filter if provided
      if (options.jq && result.result) {
        try {
          let inputData: any;
          
          // Try to parse the result as JSON
          try {
            inputData = JSON.parse(result.result);
          } catch {
            // If parsing fails, use the raw string
            inputData = result.result;
          }
          
          const jqResult = await processWithJq({
            filter: options.jq,
            input: inputData,
          });
          
          if (jqResult.success) {
            console.log(jqResult.data);
          } else {
            console.error(`JQ processing error: ${jqResult.error}`);
          }
        } catch (error) {
          console.error(`Error applying JQ filter: ${error}`);
        }
      } else {
        console.log(result.result);
      }
    } catch (error) {
      spinner.fail(`Error: ${error}`);
      logger.error(`Tool execution error: ${error}`);
    }
  });

// Use an agent
program
  .command('agent')
  .description('Use an llm-functions agent')
  .requiredOption('-n, --name <name>', 'Agent name to use')
  .option('-f, --functions-dir <dir>', 'Path to llm-functions directory')
  .option('-m, --model <model>', 'AI model to use')
  .argument('<message>', 'Message to send to the agent')
  .action(async (message, options) => {
    const spinner = ora(`Using agent ${options.name}...`).start();
    
    try {
      // Load configuration
      const config = loadConfig(DEFAULT_CONFIG_PATH);
      
      // Set up chat options
      const chatOptions: ChatOptions = {
        model: options.model || config.aiChat.model,
        temperature: 0.7,
        maxTokens: config.aiChat.maxTokens,
      };
      
      const functionsDir = options.functionsDir || config.llmFunctions.directory;
      const aichatService = new AIChatService(chatOptions);
      
      // Use the agent
      const result = await aichatService.useAgent(message, options.name, functionsDir);
      
      if (result.success) {
        spinner.succeed(`Agent ${options.name} responded`);
        console.log('\n' + result.data);
      } else {
        spinner.fail(`Error: ${result.error}`);
      }
    } catch (error) {
      spinner.fail(`Error: ${error}`);
      logger.error(`Agent error: ${error}`);
    }
  });

// List available tools
program
  .command('list-tools')
  .description('List available llm-functions tools')
  .option('-f, --functions-dir <dir>', 'Path to llm-functions directory')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    const spinner = ora('Listing tools...').start();
    
    try {
      // Load configuration
      const config = loadConfig(DEFAULT_CONFIG_PATH);
      
      const functionsDir = options.functionsDir || config.llmFunctions.directory;
      const llmFunctionsService = new LLMFunctionsService(functionsDir);
      
      // Get the list of tools
      const result = await llmFunctionsService.listTools();
      
      if (!result.success) {
        spinner.fail(`Error listing tools: ${result.error}`);
        return;
      }
      
      spinner.succeed('Tools list fetched');
      
      if (options.json) {
        console.log(JSON.stringify(result.data, null, 2));
      } else {
        console.log(chalk.bold('\nAvailable tools:'));
        for (const tool of result.data as string[]) {
          console.log(`- ${tool}`);
        }
      }
    } catch (error) {
      spinner.fail(`Error: ${error}`);
      logger.error(`List tools error: ${error}`);
    }
  });

// List available agents
program
  .command('list-agents')
  .description('List available llm-functions agents')
  .option('-f, --functions-dir <dir>', 'Path to llm-functions directory')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    const spinner = ora('Listing agents...').start();
    
    try {
      // Load configuration
      const config = loadConfig(DEFAULT_CONFIG_PATH);
      
      const functionsDir = options.functionsDir || config.llmFunctions.directory;
      const llmFunctionsService = new LLMFunctionsService(functionsDir);
      
      // Get the list of agents
      const result = await llmFunctionsService.listAgents();
      
      if (!result.success) {
        spinner.fail(`Error listing agents: ${result.error}`);
        return;
      }
      
      spinner.succeed('Agents list fetched');
      
      if (options.json) {
        console.log(JSON.stringify(result.data, null, 2));
      } else {
        console.log(chalk.bold('\nAvailable agents:'));
        for (const agent of result.data as string[]) {
          console.log(`- ${agent}`);
        }
      }
    } catch (error) {
      spinner.fail(`Error: ${error}`);
      logger.error(`List agents error: ${error}`);
    }
  });

// Check and validate dependencies
program
  .command('check')
  .description('Check required dependencies and configuration')
  .option('-f, --functions-dir <dir>', 'Path to llm-functions directory')
  .action(async (options) => {
    console.log(chalk.bold('Checking dependencies and configuration...'));
    
    try {
      // Load configuration
      const config = loadConfig(DEFAULT_CONFIG_PATH);
      
      // Create services
      const aichatService = new AIChatService({
        model: config.aiChat.model,
      });
      const functionsDir = options.functionsDir || config.llmFunctions.directory;
      const llmFunctionsService = new LLMFunctionsService(functionsDir);
      const argcService = new ArgcService();
      
      // Check aichat
      const aichatInstalled = await aichatService.validateInstallation();
      console.log(`aichat: ${aichatInstalled ? chalk.green('✓ Installed') : chalk.red('✗ Not installed')}`);
      
      // Check argc
      const argcInstalled = await argcService.validateInstallation();
      console.log(`argc: ${argcInstalled ? chalk.green('✓ Installed') : chalk.red('✗ Not installed')}`);
      
      // Check jq
      const jqInstalled = await validateJqInstallation();
      console.log(`jq: ${jqInstalled ? chalk.green('✓ Installed') : chalk.red('✗ Not installed')}`);
      
      // Check functions directory
      const functionsExists = await fs.pathExists(functionsDir);
      console.log(`llm-functions directory: ${functionsExists ? chalk.green('✓ Found') : chalk.red('✗ Not found')}`);
      
      if (functionsExists) {
        // Check functions
        const checkResult = await llmFunctionsService.checkFunctions();
        if (checkResult.success) {
          console.log(chalk.green('✓ llm-functions check passed'));
        } else {
          console.log(chalk.red(`✗ llm-functions check failed: ${checkResult.error}`));
        }
      }
    } catch (error) {
      console.error(chalk.red(`Error during check: ${error}`));
      logger.error(`Check error: ${error}`);
    }
  });

// Process JSON with jq
program
  .command('jq')
  .description('Process JSON data with jq')
  .requiredOption('-f, --filter <filter>', 'JQ filter expression')
  .option('-i, --input <json>', 'JSON input data (string)')
  .option('-r, --raw-output', 'Output raw strings, not JSON texts')
  .option('-s, --slurp', 'Treat input as array of JSON objects')
  .action(async (options) => {
    try {
      // Validate jq installation
      const jqInstalled = await validateJqInstallation();
      if (!jqInstalled) {
        console.error(chalk.red('jq is not installed. Please install it first.'));
        return;
      }
      
      // Parse input
      let inputData: any;
      if (options.input) {
        try {
          inputData = JSON.parse(options.input);
        } catch (error) {
          console.error(chalk.red('Invalid JSON input'));
          return;
        }
      } else {
        // Read from stdin if no input is provided
        const stdinBuffer = fs.readFileSync(0, 'utf8');
        try {
          inputData = JSON.parse(stdinBuffer);
        } catch (error) {
          console.error(chalk.red('Invalid JSON input from stdin'));
          return;
        }
      }
      
      // Process with jq
      const result = await processWithJq({
        filter: options.filter,
        input: inputData,
        raw: options.rawOutput,
        slurp: options.slurp,
      });
      
      if (result.success) {
        if (typeof result.data === 'string') {
          console.log(result.data);
        } else {
          console.log(JSON.stringify(result.data, null, 2));
        }
      } else {
        console.error(chalk.red(`Error processing with jq: ${result.error}`));
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${error}`));
      logger.error(`jq error: ${error}`);
    }
  });

// Initialize config
program
  .command('init')
  .description('Initialize configuration')
  .option('-c, --config <path>', 'Path to configuration file', DEFAULT_CONFIG_PATH)
  .action(async (options) => {
    try {
      // Create default config directory
      const configDir = path.dirname(options.config);
      await fs.ensureDir(configDir);
      
      // Check if config file already exists
      if (await fs.pathExists(options.config)) {
        console.log(chalk.yellow(`Configuration already exists at ${options.config}`));
        return;
      }
      
      // Load the default config
      const config = loadConfig(options.config);
      
      // Prompt for llm-functions directory
      console.log(chalk.yellow('Please provide the path to your llm-functions directory:'));
      console.log(chalk.dim('(Press Enter to use the default: ' + config.llmFunctions.directory + ')'));
      
      // Here you would normally use a prompt library, but for simplicity:
      process.stdout.write('> ');
      
      // For this example, we'll just save the default config
      console.log('\nSaving default configuration...');
      
      // Save the configuration
      await fs.writeJson(options.config, config, { spaces: 2 });
      
      console.log(chalk.green(`Configuration initialized at ${options.config}`));
      console.log(chalk.yellow('You can edit this file manually or run this command again with different options.'));
    } catch (error) {
      console.error(chalk.red(`Error initializing configuration: ${error}`));
      logger.error(`Init error: ${error}`);
    }
  });

// Parse command line arguments
program.parse();

// If no arguments, show help
if (process.argv.length <= 2) {
  program.help();
}
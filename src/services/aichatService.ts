import { execa } from 'execa';
import * as fs from 'fs-extra';
import * as path from 'path';
import { ChatOptions, CommandResult } from '../types';
import logger from '../utils/logger';

/**
 * Service class for interacting with the aichat CLI
 */
export class AIChatService {
  private options: ChatOptions;
  
  /**
   * Create a new instance of the AIChatService
   * @param options Configuration options for the AI chat
   */
  constructor(options: ChatOptions) {
    this.options = {
      model: options.model || 'gpt-4-turbo',
      temperature: options.temperature || 0.7,
      maxTokens: options.maxTokens || 4000,
      systemPrompt: options.systemPrompt,
    };
  }
  
  /**
   * Send a message to the AI and get a response
   * @param message The message to send
   * @returns The AI's response
   */
  async sendMessage(message: string): Promise<CommandResult> {
    try {
      logger.debug(`Sending message to aichat: ${message}`);
      
      const args = [
        '--model', this.options.model,
        '--temperature', this.options.temperature?.toString() || '0.7',
      ];
      
      if (this.options.maxTokens) {
        args.push('--max-tokens', this.options.maxTokens.toString());
      }
      
      if (this.options.systemPrompt) {
        args.push('--system', this.options.systemPrompt);
      }
      
      // Add the message as the final argument
      args.push(message);
      
      const { stdout } = await execa('aichat', args);
      
      return {
        success: true,
        data: stdout.trim(),
      };
    } catch (error) {
      logger.error(`Error sending message to aichat: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
  
  /**
   * Check if aichat is installed and available
   * @returns True if aichat is available, false otherwise
   */
  async validateInstallation(): Promise<boolean> {
    try {
      await execa('aichat', ['--version']);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Use aichat with function calling (requires llm-functions)
   * @param message The message to send
   * @param functionsDir Path to the llm-functions directory
   * @returns The AI's response with function call results
   */
  async sendMessageWithFunctions(message: string, functionsDir: string): Promise<CommandResult> {
    try {
      if (!await fs.pathExists(functionsDir)) {
        return {
          success: false,
          error: new Error(`Functions directory not found: ${functionsDir}`),
        };
      }
      
      logger.debug(`Sending message with functions to aichat: ${message}`);
      
      const args = [
        '--model', this.options.model,
        '--temperature', this.options.temperature?.toString() || '0.7',
        '--role', '%functions%',
        '--functions-dir', functionsDir,
      ];
      
      if (this.options.maxTokens) {
        args.push('--max-tokens', this.options.maxTokens.toString());
      }
      
      if (this.options.systemPrompt) {
        args.push('--system', this.options.systemPrompt);
      }
      
      // Add the message as the final argument
      args.push(message);
      
      const { stdout } = await execa('aichat', args);
      
      return {
        success: true,
        data: stdout.trim(),
      };
    } catch (error) {
      logger.error(`Error sending message with functions to aichat: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
  
  /**
   * Use aichat with a specific agent
   * @param message The message to send
   * @param agentName The name of the agent to use
   * @param functionsDir Path to the llm-functions directory
   * @returns The agent's response
   */
  async useAgent(message: string, agentName: string, functionsDir: string): Promise<CommandResult> {
    try {
      if (!await fs.pathExists(functionsDir)) {
        return {
          success: false,
          error: new Error(`Functions directory not found: ${functionsDir}`),
        };
      }
      
      logger.debug(`Using agent ${agentName} with message: ${message}`);
      
      const args = [
        '--model', this.options.model,
        '--temperature', this.options.temperature?.toString() || '0.7',
        '--agent', agentName,
        '--functions-dir', functionsDir,
      ];
      
      if (this.options.maxTokens) {
        args.push('--max-tokens', this.options.maxTokens.toString());
      }
      
      // Add the message as the final argument
      args.push(message);
      
      const { stdout } = await execa('aichat', args);
      
      return {
        success: true,
        data: stdout.trim(),
      };
    } catch (error) {
      logger.error(`Error using agent ${agentName}: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
}

export default AIChatService;
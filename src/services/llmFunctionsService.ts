import { execa } from 'execa';
import * as fs from 'fs-extra';
import * as path from 'path';
import { FunctionDefinition, FunctionResult, CommandResult } from '../types';
import logger from '../utils/logger';

/**
 * Service class for interacting with llm-functions
 */
export class LLMFunctionsService {
  private functionsDir: string;
  
  /**
   * Create a new instance of the LLMFunctionsService
   * @param functionsDir Path to the llm-functions directory
   */
  constructor(functionsDir: string) {
    this.functionsDir = functionsDir;
  }
  
  /**
   * Get a list of available tools
   * @returns List of available tools
   */
  async listTools(): Promise<CommandResult> {
    try {
      const toolsPath = path.join(this.functionsDir, 'tools.txt');
      
      if (!await fs.pathExists(toolsPath)) {
        return {
          success: false,
          error: new Error(`Tools list not found: ${toolsPath}`),
        };
      }
      
      const toolsContent = await fs.readFile(toolsPath, 'utf8');
      const tools = toolsContent
        .split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => line.trim());
      
      return {
        success: true,
        data: tools,
      };
    } catch (error) {
      logger.error(`Error listing tools: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
  
  /**
   * Get a list of available agents
   * @returns List of available agents
   */
  async listAgents(): Promise<CommandResult> {
    try {
      const agentsPath = path.join(this.functionsDir, 'agents.txt');
      
      if (!await fs.pathExists(agentsPath)) {
        return {
          success: false,
          error: new Error(`Agents list not found: ${agentsPath}`),
        };
      }
      
      const agentsContent = await fs.readFile(agentsPath, 'utf8');
      const agents = agentsContent
        .split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => line.trim());
      
      return {
        success: true,
        data: agents,
      };
    } catch (error) {
      logger.error(`Error listing agents: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
  
  /**
   * Execute a tool function
   * @param toolName The name of the tool to execute
   * @param params Parameters for the tool
   * @returns The result of the tool execution
   */
  async executeTool(toolName: string, params: Record<string, any>): Promise<FunctionResult> {
    const startTime = Date.now();
    try {
      logger.debug(`Executing tool ${toolName} with params: ${JSON.stringify(params)}`);
      
      const binPath = path.join(this.functionsDir, 'bin', toolName);
      
      if (!await fs.pathExists(binPath) && !await fs.pathExists(`${binPath}.cmd`)) {
        throw new Error(`Tool binary not found: ${binPath}`);
      }
      
      // Execute the tool with parameters as JSON
      const { stdout } = await execa(binPath, [JSON.stringify(params)]);
      
      const duration = Date.now() - startTime;
      return {
        name: toolName,
        result: stdout,
        duration,
      };
    } catch (error) {
      logger.error(`Error executing tool ${toolName}: ${error}`);
      const duration = Date.now() - startTime;
      return {
        name: toolName,
        result: null,
        error: error instanceof Error ? error : new Error(String(error)),
        duration,
      };
    }
  }
  
  /**
   * Execute an agent function
   * @param agentName The name of the agent
   * @param functionName The function name to execute
   * @param params Parameters for the function
   * @returns The result of the agent function execution
   */
  async executeAgentFunction(
    agentName: string, 
    functionName: string, 
    params: Record<string, any>
  ): Promise<FunctionResult> {
    const startTime = Date.now();
    try {
      logger.debug(`Executing agent ${agentName} function ${functionName} with params: ${JSON.stringify(params)}`);
      
      const binPath = path.join(this.functionsDir, 'bin', agentName);
      
      if (!await fs.pathExists(binPath) && !await fs.pathExists(`${binPath}.cmd`)) {
        throw new Error(`Agent binary not found: ${binPath}`);
      }
      
      // Execute the agent function with parameters as JSON
      const { stdout } = await execa(binPath, [functionName, JSON.stringify(params)]);
      
      const duration = Date.now() - startTime;
      return {
        name: `${agentName}:${functionName}`,
        result: stdout,
        duration,
      };
    } catch (error) {
      logger.error(`Error executing agent ${agentName} function ${functionName}: ${error}`);
      const duration = Date.now() - startTime;
      return {
        name: `${agentName}:${functionName}`,
        result: null,
        error: error instanceof Error ? error : new Error(String(error)),
        duration,
      };
    }
  }
  
  /**
   * Build the llm-functions project
   * @returns Result of the build operation
   */
  async buildFunctions(): Promise<CommandResult> {
    try {
      logger.info('Building llm-functions project...');
      
      const { stdout } = await execa('argc', ['build'], {
        cwd: this.functionsDir,
      });
      
      return {
        success: true,
        data: stdout,
      };
    } catch (error) {
      logger.error(`Error building functions: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
  
  /**
   * Check if llm-functions is properly configured
   * @returns Result of the check operation
   */
  async checkFunctions(): Promise<CommandResult> {
    try {
      logger.info('Checking llm-functions configuration...');
      
      const { stdout } = await execa('argc', ['check'], {
        cwd: this.functionsDir,
      });
      
      return {
        success: true,
        data: stdout,
      };
    } catch (error) {
      logger.error(`Error checking functions: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
  
  /**
   * Get the function declarations from the functions.json file
   * @returns List of function declarations
   */
  async getFunctionDeclarations(): Promise<CommandResult> {
    try {
      const functionsJsonPath = path.join(this.functionsDir, 'functions.json');
      
      if (!await fs.pathExists(functionsJsonPath)) {
        return {
          success: false,
          error: new Error(`Functions JSON not found: ${functionsJsonPath}`),
        };
      }
      
      const functionsJson = await fs.readJson(functionsJsonPath);
      
      return {
        success: true,
        data: functionsJson as FunctionDefinition[],
      };
    } catch (error) {
      logger.error(`Error getting function declarations: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
}

export default LLMFunctionsService;
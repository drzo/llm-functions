import { execa } from 'execa';
import { CommandResult } from '../types';
import logger from '../utils/logger';

/**
 * Service class for interacting with argc
 */
export class ArgcService {
  /**
   * Check if argc is installed and available
   * @returns True if argc is available, false otherwise
   */
  async validateInstallation(): Promise<boolean> {
    try {
      await execa('argc', ['--argc-version']);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Generate arg parsing code for a CLI script
   * @param scriptPath Path to the script file
   * @returns Generated argc eval code
   */
  async generateArgcEval(scriptPath: string): Promise<CommandResult> {
    try {
      logger.debug(`Generating argc eval for script: ${scriptPath}`);
      
      const { stdout } = await execa('argc', ['--argc-eval', scriptPath]);
      
      return {
        success: true,
        data: stdout,
      };
    } catch (error) {
      logger.error(`Error generating argc eval: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
  
  /**
   * Execute a command with argc
   * @param cwd Working directory
   * @param args Command arguments
   * @returns Result of the command execution
   */
  async executeCommand(cwd: string, args: string[]): Promise<CommandResult> {
    try {
      logger.debug(`Executing argc command: ${args.join(' ')}`);
      
      const { stdout } = await execa('argc', args, { cwd });
      
      return {
        success: true,
        data: stdout,
      };
    } catch (error) {
      logger.error(`Error executing argc command: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
  
  /**
   * Get completion suggestions from argc
   * @param scriptPath Path to the script file
   * @param args Command arguments
   * @returns Completion suggestions
   */
  async getCompletions(scriptPath: string, args: string[]): Promise<CommandResult> {
    try {
      logger.debug(`Getting argc completions for script: ${scriptPath}`);
      
      const { stdout } = await execa('argc', ['--argc-compgen', 'complete', scriptPath, ...args]);
      
      return {
        success: true,
        data: stdout.trim().split('\n'),
      };
    } catch (error) {
      logger.error(`Error getting argc completions: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
}

export default ArgcService;
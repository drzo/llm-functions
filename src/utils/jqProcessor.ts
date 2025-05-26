import { execa } from 'execa';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import { JqOptions, CommandResult } from '../types';
import logger from './logger';

/**
 * Process JSON data using jq
 * @param options Options for jq processing
 * @returns Result of the jq processing
 */
export async function processWithJq(options: JqOptions): Promise<CommandResult> {
  const { filter, input, raw = false, slurp = false } = options;
  
  try {
    // Create a temporary file to store the input JSON
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aicli-jq-'));
    const inputFile = path.join(tempDir, 'input.json');
    
    // Write the input to the temporary file
    await fs.writeJson(inputFile, input, { spaces: 2 });
    
    // Build the jq command arguments
    const args: string[] = [];
    if (raw) args.push('-r');
    if (slurp) args.push('-s');
    args.push(filter);
    args.push(inputFile);
    
    // Execute the jq command
    const { stdout } = await execa('jq', args);
    
    // Clean up the temporary file
    await fs.remove(tempDir);
    
    // Parse the result if it's not raw output
    let result: any;
    if (!raw) {
      try {
        result = JSON.parse(stdout);
      } catch (parseError) {
        result = stdout;
      }
    } else {
      result = stdout;
    }
    
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    logger.error(`Error processing with jq: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Validate if jq is installed and available in the system
 * @returns True if jq is available, false otherwise
 */
export async function validateJqInstallation(): Promise<boolean> {
  try {
    await execa('jq', ['--version']);
    return true;
  } catch (error) {
    return false;
  }
}
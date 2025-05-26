import * as fs from 'fs-extra';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { AppConfig, LogLevel } from '../types';

// Load environment variables
dotenv.config();

// Default configuration
const defaultConfig: AppConfig = {
  aiChat: {
    model: process.env.AICHAT_MODEL || 'gpt-4-turbo',
    apiKey: process.env.OPENAI_API_KEY || '',
    temperature: 0.7,
    maxTokens: 4000,
  },
  llmFunctions: {
    directory: process.env.LLM_FUNCTIONS_DIR || path.join(__dirname, '..', '..', 'llm-functions'),
    tools: ['get_current_weather.sh', 'execute_command.sh'],
    agents: ['todo', 'coder'],
  },
  logging: {
    level: (process.env.LOG_LEVEL as LogLevel) || 'info',
  },
};

/**
 * Loads configuration from a file
 * @param configPath Path to the configuration file
 * @returns The loaded configuration merged with defaults
 */
export const loadConfig = (configPath: string): AppConfig => {
  try {
    if (fs.existsSync(configPath)) {
      const userConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return mergeConfigs(defaultConfig, userConfig);
    }
  } catch (error) {
    console.warn(`Error loading configuration file: ${error}`);
  }
  return defaultConfig;
};

/**
 * Saves configuration to a file
 * @param config Configuration object to save
 * @param configPath Path where to save the configuration
 */
export const saveConfig = (config: AppConfig, configPath: string): void => {
  try {
    fs.ensureDirSync(path.dirname(configPath));
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error saving configuration: ${error}`);
  }
};

/**
 * Merges two configuration objects
 * @param baseConfig The base configuration
 * @param overrideConfig The configuration to override with
 * @returns The merged configuration
 */
const mergeConfigs = <T extends Record<string, any>>(baseConfig: T, overrideConfig: Record<string, any>): T => {
  const result = { ...baseConfig };
  
  for (const key of Object.keys(overrideConfig)) {
    if (key in baseConfig) {
      if (
        typeof baseConfig[key] === 'object' && 
        baseConfig[key] !== null &&
        !Array.isArray(baseConfig[key]) &&
        typeof overrideConfig[key] === 'object' &&
        overrideConfig[key] !== null &&
        !Array.isArray(overrideConfig[key])
      ) {
        // Both values are objects, merge them recursively
        result[key] = mergeConfigs(baseConfig[key], overrideConfig[key]);
      } else {
        // Simple value, override it
        result[key] = overrideConfig[key];
      }
    }
  }
  
  return result;
};

export default defaultConfig;
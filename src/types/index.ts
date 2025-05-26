// Type definitions for the project

// Command Line Configuration
export interface CliConfig {
  verbose: boolean;
  configPath: string;
  functionsDir?: string;
  debug?: boolean;
}

// AI Chat Options
export interface ChatOptions {
  model: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

// Function Call Definition
export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

// Function Call Result
export interface FunctionResult {
  name: string;
  result: any;
  error?: Error;
  duration?: number;
}

// Log Levels
export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'verbose';

// Configuration
export interface AppConfig {
  aiChat: {
    model: string;
    apiKey: string;
    temperature: number;
    maxTokens: number;
  };
  llmFunctions: {
    directory: string;
    tools: string[];
    agents: string[];
  };
  logging: {
    level: LogLevel;
    file?: string;
  };
}

// JQ Processing Options
export interface JqOptions {
  filter: string;
  input: any;
  raw?: boolean;
  slurp?: boolean;
}

// Command Results
export interface CommandResult {
  success: boolean;
  data?: any;
  error?: Error | string;
}
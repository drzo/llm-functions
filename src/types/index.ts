export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface AiChatConfig {
  model: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
}

export interface LlmFunctionsConfig {
  directory: string;
  tools: string[];
  agents: string[];
}

export interface LoggingConfig {
  level: LogLevel;
  file?: string;
}

export interface AppConfig {
  aiChat: AiChatConfig;
  llmFunctions: LlmFunctionsConfig;
  logging: LoggingConfig;
  [key: string]: any;
}
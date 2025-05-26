import winston from 'winston';
import { LogLevel } from '../types';

/**
 * Creates a logger instance with the specified level
 * @param level The log level
 * @param logFile Optional path to a log file
 * @returns A winston logger instance
 */
export const createLogger = (level: LogLevel, logFile?: string) => {
  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ];

  if (logFile) {
    transports.push(
      new winston.transports.File({
        filename: logFile,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
      })
    );
  }

  return winston.createLogger({
    level,
    transports,
  });
};

// Export default logger with info level
export default createLogger('info');
import { IS_PRODUCTION, IS_TEST } from './constants';
import fs from 'fs';
import path from 'path';

/**
 * Log levels
 */
export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file paths
const errorLogPath = path.join(logsDir, 'error.log');
const combinedLogPath = path.join(logsDir, 'combined.log');

/**
 * Logger class for consistent logging throughout the application
 */
class Logger {
  private context: string;

  /**
   * Create a new logger instance
   * @param context The context for this logger (usually the class or file name)
   */
  constructor(context: string = 'App') {
    this.context = context;
  }

  /**
   * Format a log message with timestamp, level, and context
   * @param level The log level
   * @param message The message to log
   * @param meta Additional metadata to log
   * @returns Formatted log message
   */
  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    let formattedMessage = `[${timestamp}] [${level}] [${this.context}] ${message}`;

    if (meta) {
      formattedMessage += ` ${JSON.stringify(meta, null, 2)}`;
    }

    return formattedMessage;
  }

  /**
   * Write a message to a log file
   * @param filePath Path to the log file
   * @param message Message to write
   */
  private writeToFile(filePath: string, message: string): void {
    try {
      fs.appendFileSync(filePath, message + '\n');
    } catch (error) {
      console.error(`Failed to write to log file ${filePath}:`, error);
    }
  }

  /**
   * Log an error message
   * @param message The message to log
   * @param meta Additional metadata to log
   */
  error(message: string, meta?: any): void {
    // Always log errors
    const formattedMessage = this.formatMessage(LogLevel.ERROR, message, meta);

    // Don't log errors to console in test environment
    if (!IS_TEST) {
      console.error(formattedMessage);
    }

    // Write to error log file
    this.writeToFile(errorLogPath, formattedMessage);
    this.writeToFile(combinedLogPath, formattedMessage);
  }

  /**
   * Log a warning message
   * @param message The message to log
   * @param meta Additional metadata to log
   */
  warn(message: string, meta?: any): void {
    // Don't log warnings in test environment
    if (IS_TEST) return;

    const formattedMessage = this.formatMessage(LogLevel.WARN, message, meta);
    console.warn(formattedMessage);

    // Write to combined log file
    this.writeToFile(combinedLogPath, formattedMessage);
  }

  /**
   * Log an info message
   * @param message The message to log
   * @param meta Additional metadata to log
   */
  info(message: string, meta?: any): void {
    // Don't log info in test environment
    if (IS_TEST) return;

    const formattedMessage = this.formatMessage(LogLevel.INFO, message, meta);
    console.info(formattedMessage);

    // Write to combined log file
    this.writeToFile(combinedLogPath, formattedMessage);
  }

  /**
   * Log a debug message
   * @param message The message to log
   * @param meta Additional metadata to log
   */
  debug(message: string, meta?: any): void {
    // Only log debug in development environment
    if (IS_PRODUCTION || IS_TEST) return;

    const formattedMessage = this.formatMessage(LogLevel.DEBUG, message, meta);
    console.debug(formattedMessage);

    // Write to combined log file
    this.writeToFile(combinedLogPath, formattedMessage);
  }

  /**
   * Create a new logger with a child context
   * @param context The child context
   * @returns A new logger instance with the combined context
   */
  child(context: string): Logger {
    return new Logger(`${this.context}:${context}`);
  }
}

// Export a default logger instance
export const logger = new Logger();

// Export the Logger class for creating context-specific loggers
export default Logger;

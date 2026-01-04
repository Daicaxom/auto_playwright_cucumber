export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerConfig {
  level?: LogLevel;
  format?: 'json' | 'text';
  console?: boolean;
  outputDir?: string;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: unknown;
  context?: Record<string, unknown>;
}

/**
 * Logger utility for framework-wide logging
 * Provides structured logging with levels, metadata, and context
 */
export class Logger {
  private readonly config: Required<LoggerConfig>;
  private readonly context: Record<string, unknown>;
  private static readonly LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor(config: LoggerConfig, context?: Record<string, unknown>) {
    this.config = {
      level: config.level || 'info',
      format: config.format || 'text',
      console: config.console !== undefined ? config.console : true,
      outputDir: config.outputDir || 'logs',
    };
    this.context = context || {};
  }

  /**
   * Log debug message
   */
  public debug(message: string, metadata?: unknown): void {
    this.log('debug', message, metadata);
  }

  /**
   * Log info message
   */
  public info(message: string, metadata?: unknown): void {
    this.log('info', message, metadata);
  }

  /**
   * Log warning message
   */
  public warn(message: string, metadata?: unknown): void {
    this.log('warn', message, metadata);
  }

  /**
   * Log error message
   */
  public error(message: string, metadata?: unknown): void {
    this.log('error', message, metadata);
  }

  /**
   * Create a child logger with additional context
   */
  public child(childContext: Record<string, unknown>): Logger {
    return new Logger(this.config, {
      ...this.context,
      ...childContext,
    });
  }

  /**
   * Get current log level
   */
  public getLevel(): LogLevel {
    return this.config.level;
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, metadata?: unknown): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata,
      context: this.context,
    };

    if (this.config.console) {
      this.logToConsole(logEntry);
    }
  }

  /**
   * Check if message should be logged based on level
   */
  private shouldLog(level: LogLevel): boolean {
    return Logger.LOG_LEVELS[level] >= Logger.LOG_LEVELS[this.config.level];
  }

  /**
   * Log to console
   */
  private logToConsole(entry: LogEntry): void {
    const formattedMessage = this.formatMessage(entry);

    // eslint-disable-next-line no-console
    switch (entry.level) {
      case 'debug':
        // eslint-disable-next-line no-console
        console.debug(formattedMessage);
        break;
      case 'info':
        // eslint-disable-next-line no-console
        console.info(formattedMessage);
        break;
      case 'warn':
        // eslint-disable-next-line no-console
        console.warn(formattedMessage);
        break;
      case 'error':
        // eslint-disable-next-line no-console
        console.error(formattedMessage);
        break;
    }
  }

  /**
   * Format log message based on configured format
   */
  private formatMessage(entry: LogEntry): string {
    if (this.config.format === 'json') {
      return JSON.stringify(entry);
    }

    // Text format
    const parts: string[] = [`[${entry.timestamp}]`, `[${entry.level.toUpperCase()}]`];

    if (Object.keys(entry.context || {}).length > 0) {
      parts.push(`[${JSON.stringify(entry.context)}]`);
    }

    parts.push(entry.message);

    if (entry.metadata !== undefined) {
      if (entry.metadata instanceof Error) {
        parts.push(`\n${entry.metadata.stack || entry.metadata.message}`);
      } else {
        parts.push(JSON.stringify(entry.metadata, null, 2));
      }
    }

    return parts.join(' ');
  }
}

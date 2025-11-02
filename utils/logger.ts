// utils/logger.ts - Logging interface for dependency injection

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Logger interface for dependency injection
 * Makes code testable by allowing mock loggers
 */
export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

/**
 * Console logger implementation
 */
export class ConsoleLogger implements Logger {
  constructor(private minLevel: LogLevel = LogLevel.INFO) {}

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }
}

/**
 * Silent logger for tests
 */
export class SilentLogger implements Logger {
  debug(): void {}
  info(): void {}
  warn(): void {}
  error(): void {}
}

/**
 * Mock logger for tests that captures log messages
 */
export class MockLogger implements Logger {
  public logs: Array<{ level: LogLevel; message: string; args: any[] }> = [];

  debug(message: string, ...args: any[]): void {
    this.logs.push({ level: LogLevel.DEBUG, message, args });
  }

  info(message: string, ...args: any[]): void {
    this.logs.push({ level: LogLevel.INFO, message, args });
  }

  warn(message: string, ...args: any[]): void {
    this.logs.push({ level: LogLevel.WARN, message, args });
  }

  error(message: string, ...args: any[]): void {
    this.logs.push({ level: LogLevel.ERROR, message, args });
  }

  clear(): void {
    this.logs = [];
  }

  hasError(substring: string): boolean {
    return this.logs.some(
      log => log.level === LogLevel.ERROR && log.message.includes(substring)
    );
  }

  hasWarning(substring: string): boolean {
    return this.logs.some(
      log => log.level === LogLevel.WARN && log.message.includes(substring)
    );
  }
}

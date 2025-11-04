import winston from 'winston';
import { appConfig } from '../config/index';

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(logColors);

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define transports
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    format: logFormat,
  }),
];

// Add file transport if enabled
if (appConfig.logToFile) {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }) as winston.transport,
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }) as winston.transport
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: appConfig.logLevel,
  levels: logLevels,
  transports,
});

// Database operation logger
export class DatabaseLogger {
  private static formatOperation(operation: string, table: string, data?: any): string {
    const baseMessage = `DB ${operation.toUpperCase()} on ${table}`;
    if (data) {
      return `${baseMessage} - ${JSON.stringify(data)}`;
    }
    return baseMessage;
  }

  static logQuery(query: string, params?: any[], duration?: number): void {
    const message = `DB QUERY: ${query}`;
    const metadata = {
      params,
      duration: duration ? `${duration}ms` : undefined,
    };
    
    logger.debug(`${message} ${JSON.stringify(metadata)}`);
  }

  static logCreate(table: string, data: any, id?: string): void {
    const message = this.formatOperation('CREATE', table, { id, ...data });
    logger.info(message);
  }

  static logUpdate(table: string, id: string, data: any, affectedRows?: number): void {
    const message = this.formatOperation('UPDATE', table, { id, affectedRows, data });
    logger.info(message);
  }

  static logDelete(table: string, id: string, affectedRows?: number): void {
    const message = this.formatOperation('DELETE', table, { id, affectedRows });
    logger.info(message);
  }

  static logRead(table: string, filters?: any, count?: number): void {
    const message = this.formatOperation('READ', table, { filters, count });
    logger.debug(message);
  }

  static logConnection(event: 'connect' | 'disconnect' | 'error', details?: any): void {
    const message = `DB CONNECTION ${event.toUpperCase()}`;
    
    switch (event) {
      case 'connect':
        logger.info(`${message} - Successfully connected to database`);
        break;
      case 'disconnect':
        logger.info(`${message} - Disconnected from database`);
        break;
      case 'error':
        logger.error(`${message} - ${details?.message || 'Unknown error'}`);
        break;
    }
  }

  static logTransaction(action: 'begin' | 'commit' | 'rollback', id?: string): void {
    const message = `DB TRANSACTION ${action.toUpperCase()}`;
    logger.info(id ? `${message} - ${id}` : message);
  }

  static logMigration(action: 'start' | 'complete' | 'error', migration?: string, error?: any): void {
    const message = `DB MIGRATION ${action.toUpperCase()}`;
    
    switch (action) {
      case 'start':
        logger.info(`${message} - Starting migration: ${migration}`);
        break;
      case 'complete':
        logger.info(`${message} - Completed migration: ${migration}`);
        break;
      case 'error':
        logger.error(`${message} - Failed migration: ${migration} - ${error?.message || error}`);
        break;
    }
  }

  static logPerformance(operation: string, duration: number, table?: string): void {
    const threshold = 1000; // 1 second threshold
    const message = `DB PERFORMANCE - ${operation}${table ? ` on ${table}` : ''} took ${duration}ms`;
    
    if (duration > threshold) {
      logger.warn(`SLOW ${message}`);
    } else {
      logger.debug(message);
    }
  }

  static logError(operation: string, error: any, context?: any): void {
    const message = `DB ERROR - ${operation}: ${error?.message || error}`;
    logger.error(message, { context, stack: error?.stack });
  }

  static logHealthCheck(status: 'healthy' | 'unhealthy', details?: any): void {
    const message = `DB HEALTH CHECK - Status: ${status.toUpperCase()}`;
    
    if (status === 'healthy') {
      logger.info(message, details);
    } else {
      logger.error(message, details);
    }
  }

  static logPoolStats(stats: { total: number; idle: number; waiting: number }): void {
    const message = `DB POOL STATS - Total: ${stats.total}, Idle: ${stats.idle}, Waiting: ${stats.waiting}`;
    logger.debug(message);
  }

  static logBackup(action: 'start' | 'complete' | 'error', details?: any): void {
    const message = `DB BACKUP ${action.toUpperCase()}`;
    
    switch (action) {
      case 'start':
        logger.info(`${message} - Starting database backup`);
        break;
      case 'complete':
        logger.info(`${message} - Backup completed successfully`, details);
        break;
      case 'error':
        logger.error(`${message} - Backup failed`, details);
        break;
    }
  }
}

// Export the main logger for general use
export default logger;

// Helper function to create operation timers
export function createTimer() {
  const start = Date.now();
  return {
    end: () => Date.now() - start,
  };
}

// Middleware for logging HTTP requests
export function httpLoggerMiddleware() {
  return (req: any, res: any, next: any) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
      
      if (res.statusCode >= 400) {
        logger.error(`HTTP ERROR - ${message}`);
      } else {
        logger.http(message);
      }
    });
    
    next();
  };
}

// Function to log application startup
export function logStartup(port: number): void {
  logger.info(`🚀 Bruno's IMS Backend started on port ${port}`);
  logger.info(`📊 Log level: ${appConfig.logLevel}`);
  logger.info(`🌍 Environment: ${appConfig.nodeEnv}`);
  logger.info(`📁 Log to file: ${appConfig.logToFile ? 'enabled' : 'disabled'}`);
}

// Function to log application shutdown
export function logShutdown(): void {
  logger.info('🛑 Bruno\'s IMS Backend shutting down...');
}
import { HealthCheckService } from '../services/healthCheck';
import prisma from '../lib/db';

export class DatabaseMonitor {
  private healthCheck: HealthCheckService;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.healthCheck = new HealthCheckService(prisma);
  }

  startMonitoring(intervalMs: number = 30000) {
    this.checkInterval = setInterval(async () => {
      try {
        const health = await this.healthCheck.checkDatabaseHealth();
        if (health.status === 'unhealthy') {
          console.error('Database health check failed:', health);
          // Implement alert system here
          // This could send notifications, log to external systems, etc.
        } else {
          console.log('Database health check passed:', {
            status: health.status,
            responseTime: health.details.database.responseTime,
            timestamp: health.timestamp
          });
        }
      } catch (error) {
        console.error('Health check error:', error);
      }
    }, intervalMs);

    console.log(`Database monitoring started with ${intervalMs}ms interval`);
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('Database monitoring stopped');
    }
  }

  async performSingleCheck() {
    try {
      const health = await this.healthCheck.checkDatabaseHealth();
      console.log('Single health check result:', health);
      return health;
    } catch (error) {
      console.error('Single health check error:', error);
      throw error;
    }
  }
}
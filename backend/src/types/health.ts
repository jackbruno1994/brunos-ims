export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  timestamp: Date;
  details: {
    database: {
      status: 'up' | 'down';
      responseTime: number;
      connectionPool: {
        total: number;
        active: number;
        idle: number;
      };
    };
  };
}
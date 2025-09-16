import { PrismaClient } from '@prisma/client';

export class DatabaseService {
  private static instance: DatabaseService;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public getPrisma(): PrismaClient {
    return this.prisma;
  }

  public async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      console.log('✅ Database disconnected successfully');
    } catch (error) {
      console.error('❌ Database disconnection failed:', error);
      throw error;
    }
  }

  public async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    message: string;
    details?: any;
  }> {
    try {
      // Simple query to test database connectivity
      await this.prisma.$queryRaw`SELECT 1`;
      
      return {
        status: 'healthy',
        message: 'Database connection is healthy',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  public async getMetrics(): Promise<{
    connections: number;
    uptime: number;
    version: string;
  }> {
    try {
      const versionResult = await this.prisma.$queryRaw<Array<{ version: string }>>`SELECT version()`;
      const connectionsResult = await this.prisma.$queryRaw<Array<{ count: number }>>`
        SELECT count(*) as count FROM pg_stat_activity WHERE state = 'active'
      `;
      
      return {
        connections: Number(connectionsResult[0]?.count || 0),
        uptime: process.uptime(),
        version: versionResult[0]?.version || 'Unknown',
      };
    } catch (error) {
      throw new Error(`Failed to get database metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const db = DatabaseService.getInstance();
export const prisma = db.getPrisma();
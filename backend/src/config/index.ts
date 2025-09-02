// Database configuration will be added here
// Example: MongoDB, PostgreSQL, etc.

export const dbConfig = {
  // Database connection settings
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'brunos_ims',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/brunos_ims?schema=public',
};

export const appConfig = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

// Prisma Client singleton with fallback
class DatabaseService {
  private static instance: DatabaseService;
  private prisma: any = null;
  private isAvailable: boolean = false;

  private constructor() {
    try {
      // Try to import Prisma client
      const { PrismaClient } = require('@prisma/client');
      this.prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
        errorFormat: 'pretty',
      });
      this.isAvailable = true;
    } catch (error) {
      console.warn('⚠️ Prisma client not available, using fallback mode');
      this.isAvailable = false;
      // Create mock Prisma client
      this.prisma = this.createMockPrisma();
    }
  }

  private createMockPrisma() {
    const mockModel = {
      create: async (data: any) => ({ id: 'mock-id', ...data.data }),
      findUnique: async (_query: any) => null,
      findMany: async (_query: any) => [],
      update: async (query: any) => ({ id: query.where.id, ...query.data }),
      delete: async (query: any) => ({ id: query.where.id }),
      count: async (_query: any) => 0,
    };

    return {
      user: mockModel,
      item: mockModel,
      category: mockModel,
      location: mockModel,
      stockMovement: mockModel,
      order: mockModel,
      orderItem: mockModel,
      supplier: mockModel,
      auditLog: mockModel,
      $connect: async () => { console.log('Mock: Database connected'); },
      $disconnect: async () => { console.log('Mock: Database disconnected'); },
      $queryRaw: async () => [{ result: 1 }],
      $transaction: async (fn: any) => {
        if (typeof fn === 'function') {
          return await fn(this.prisma);
        }
        return fn;
      },
    };
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public getClient(): any {
    return this.prisma;
  }

  public isDbAvailable(): boolean {
    return this.isAvailable;
  }

  public async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      if (this.isAvailable) {
        console.log('✅ Database connected successfully');
      } else {
        console.log('✅ Mock database connected (Prisma not available)');
      }
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      if (this.isAvailable) {
        console.log('✅ Database disconnected successfully');
      } else {
        console.log('✅ Mock database disconnected');
      }
    } catch (error) {
      console.error('❌ Database disconnection failed:', error);
      throw error;
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return false;
    }
  }
}

export const db = DatabaseService.getInstance().getClient();
export const databaseService = DatabaseService.getInstance();

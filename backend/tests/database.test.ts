import { testPrismaConnection, testPostgresConnection, performHealthCheck, validateConnection } from '../src/utils/database';
import { validateData, createSupplierSchema, createUOMSchema, createItemSchema } from '../src/utils/validation';

// Mock the database connections for testing
jest.mock('../src/config/index', () => ({
  dbConfig: {
    host: 'localhost',
    port: 5432,
    database: 'test_db',
    username: 'test_user',
    password: 'test_pass',
    retries: { max: 3, delay: 1000 },
  },
  appConfig: {
    nodeEnv: 'test',
    logLevel: 'error',
  },
  pgPool: {
    connect: jest.fn(),
    totalCount: 5,
    idleCount: 3,
    waitingCount: 0,
  },
  prisma: {
    $connect: jest.fn(),
    $queryRaw: jest.fn(),
  },
}));

describe('Database Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('testPrismaConnection', () => {
    it('should return connected true when Prisma connection succeeds', async () => {
      const mockPrisma = require('../src/config/index').prisma;
      mockPrisma.$queryRaw.mockResolvedValue([{ test: 1 }]);

      const result = await testPrismaConnection();

      expect(result.connected).toBe(true);
      expect(result.latency).toBeGreaterThanOrEqual(0);
      expect(result.error).toBeUndefined();
    });

    it('should return connected false when Prisma connection fails', async () => {
      const mockPrisma = require('../src/config/index').prisma;
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Connection failed'));

      const result = await testPrismaConnection();

      expect(result.connected).toBe(false);
      expect(result.error).toBe('Connection failed');
      expect(result.latency).toBeUndefined();
    });
  });

  describe('testPostgresConnection', () => {
    it('should return connected true when PostgreSQL connection succeeds', async () => {
      const mockPgPool = require('../src/config/index').pgPool;
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [{ test: 1 }] }),
        release: jest.fn(),
      };
      mockPgPool.connect.mockResolvedValue(mockClient);

      const result = await testPostgresConnection();

      expect(result.connected).toBe(true);
      expect(result.latency).toBeGreaterThanOrEqual(0);
      expect(result.poolStats).toEqual({
        total: 5,
        idle: 3,
        waiting: 0,
      });
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should return connected false when PostgreSQL connection fails', async () => {
      const mockPgPool = require('../src/config/index').pgPool;
      mockPgPool.connect.mockRejectedValue(new Error('Pool connection failed'));

      const result = await testPostgresConnection();

      expect(result.connected).toBe(false);
      expect(result.error).toBe('Pool connection failed');
    });
  });

  describe('performHealthCheck', () => {
    it('should return healthy status when both connections succeed', async () => {
      const mockPrisma = require('../src/config/index').prisma;
      const mockPgPool = require('../src/config/index').pgPool;
      
      mockPrisma.$queryRaw.mockResolvedValue([{ test: 1 }]);
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [{ test: 1 }] }),
        release: jest.fn(),
      };
      mockPgPool.connect.mockResolvedValue(mockClient);

      const result = await performHealthCheck();

      expect(result.status).toBe('healthy');
      expect(result.details.prisma.connected).toBe(true);
      expect(result.details.postgres.connected).toBe(true);
      expect(result.timestamp).toBeDefined();
    });

    it('should return unhealthy status when any connection fails', async () => {
      const mockPrisma = require('../src/config/index').prisma;
      const mockPgPool = require('../src/config/index').pgPool;
      
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Prisma failed'));
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [{ test: 1 }] }),
        release: jest.fn(),
      };
      mockPgPool.connect.mockResolvedValue(mockClient);

      const result = await performHealthCheck();

      expect(result.status).toBe('unhealthy');
      expect(result.details.prisma.connected).toBe(false);
      expect(result.details.postgres.connected).toBe(true);
    });
  });

  describe('validateConnection', () => {
    it('should return true when health check is healthy', async () => {
      const mockPrisma = require('../src/config/index').prisma;
      const mockPgPool = require('../src/config/index').pgPool;
      
      mockPrisma.$queryRaw.mockResolvedValue([{ test: 1 }]);
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [{ test: 1 }] }),
        release: jest.fn(),
      };
      mockPgPool.connect.mockResolvedValue(mockClient);

      const result = await validateConnection();

      expect(result).toBe(true);
    });

    it('should return false when health check fails', async () => {
      const mockPrisma = require('../src/config/index').prisma;
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Connection failed'));

      const result = await validateConnection();

      expect(result).toBe(false);
    });
  });
});

describe('Data Validation', () => {
  describe('Supplier validation', () => {
    it('should validate correct supplier data', () => {
      const validSupplier = {
        name: 'Test Supplier',
        contactEmail: 'test@supplier.com',
        contactPhone: '+1234567890',
        address: '123 Test St',
        country: 'US',
        active: true,
      };

      const result = validateData(validSupplier, createSupplierSchema);

      expect(result.isValid).toBe(true);
      expect(result.value).toEqual(validSupplier);
      expect(result.errors).toBeUndefined();
    });

    it('should reject supplier with invalid email', () => {
      const invalidSupplier = {
        name: 'Test Supplier',
        contactEmail: 'invalid-email',
      };

      const result = validateData(invalidSupplier, createSupplierSchema);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('"contactEmail" must be a valid email');
    });

    it('should reject supplier without required name', () => {
      const invalidSupplier = {
        contactEmail: 'test@supplier.com',
      };

      const result = validateData(invalidSupplier, createSupplierSchema);

      expect(result.isValid).toBe(false);
      expect(result.errors?.some(error => error.includes('"name" is required'))).toBe(true);
    });
  });

  describe('UOM validation', () => {
    it('should validate correct UOM data', () => {
      const validUOM = {
        name: 'Kilogram',
        abbreviation: 'kg',
        type: 'weight',
        baseUnit: true,
      };

      const result = validateData(validUOM, createUOMSchema);

      expect(result.isValid).toBe(true);
      expect(result.value).toEqual(validUOM);
    });

    it('should reject UOM with invalid type', () => {
      const invalidUOM = {
        name: 'Test Unit',
        abbreviation: 'tu',
        type: 'invalid-type',
      };

      const result = validateData(invalidUOM, createUOMSchema);

      expect(result.isValid).toBe(false);
      expect(result.errors?.some(error => error.includes('"type" must be one of'))).toBe(true);
    });
  });

  describe('Item validation', () => {
    it('should validate correct item data', () => {
      const validItem = {
        name: 'Test Item',
        description: 'A test item',
        sku: 'TEST001',
        category: 'Test Category',
        uomId: 'test-uom-id',
        minStock: 10.5,
        maxStock: 100.0,
        costPerBase: 5.99,
        active: true,
      };

      const result = validateData(validItem, createItemSchema);

      expect(result.isValid).toBe(true);
      expect(result.value).toEqual(validItem);
    });

    it('should reject item with negative stock values', () => {
      const invalidItem = {
        name: 'Test Item',
        uomId: 'test-uom-id',
        minStock: -10,
      };

      const result = validateData(invalidItem, createItemSchema);

      expect(result.isValid).toBe(false);
      expect(result.errors?.some(error => error.includes('"minStock" must be greater than or equal to 0'))).toBe(true);
    });

    it('should reject item without required fields', () => {
      const invalidItem = {
        description: 'Missing required fields',
      };

      const result = validateData(invalidItem, createItemSchema);

      expect(result.isValid).toBe(false);
      expect(result.errors?.some(error => error.includes('"name" is required'))).toBe(true);
      expect(result.errors?.some(error => error.includes('"uomId" is required'))).toBe(true);
    });
  });
});
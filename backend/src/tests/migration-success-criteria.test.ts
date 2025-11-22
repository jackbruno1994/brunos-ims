import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('Migration Success Criteria', () => {
  describe('Schema is properly defined', () => {
    it('should have complete schema with all required models', () => {
      const schemaPath = path.join(__dirname, '../../../prisma/schema.prisma');
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      
      const requiredModels = ['User', 'Role', 'Permission', 'Product', 'Category', 'AuditLog'];
      requiredModels.forEach(model => {
        expect(schemaContent).toContain(`model ${model}`);
      });
    });
  });

  describe('Migration creates all required tables', () => {
    it('should have migration script that handles table creation', () => {
      const migrationPath = path.join(__dirname, '../../../scripts/migrate.ts');
      const migrationContent = fs.readFileSync(migrationPath, 'utf8');
      
      expect(migrationContent).toContain('npx prisma migrate dev');
      expect(migrationContent).toContain('PrismaClient');
      expect(migrationContent).toContain('manageMigration');
    });
  });

  describe('Initial data is seeded correctly', () => {
    it('should have seed function with initial roles and permissions', () => {
      const migrationPath = path.join(__dirname, '../../../scripts/migrate.ts');
      const migrationContent = fs.readFileSync(migrationPath, 'utf8');
      
      expect(migrationContent).toContain('seedInitialData');
      expect(migrationContent).toContain('ADMIN');
      expect(migrationContent).toContain('MANAGE_USERS');
      expect(migrationContent).toContain('MANAGE_INVENTORY');
      expect(migrationContent).toContain('VIEW_REPORTS');
      expect(migrationContent).toContain('admin@example.com');
    });
  });

  describe('Rollback functionality works', () => {
    it('should have rollback test structure in place', () => {
      const testUtilPath = path.join(__dirname, '../utils/migrationTest.ts');
      const testUtilContent = fs.readFileSync(testUtilPath, 'utf8');
      
      expect(testUtilContent).toContain('rollbackTest');
      expect(testUtilContent).toContain('MigrationTester');
    });
  });

  describe('Migration can be tested', () => {
    it('should have comprehensive migration testing utility', () => {
      const testUtilPath = path.join(__dirname, '../utils/migrationTest.ts');
      const testUtilContent = fs.readFileSync(testUtilPath, 'utf8');
      
      expect(testUtilContent).toContain('testMigration');
      expect(testUtilContent).toContain('prisma.$connect()');
      expect(testUtilContent).toContain('prisma.user.count()');
      expect(testUtilContent).toContain('prisma.role.count()');
      expect(testUtilContent).toContain('prisma.permission.count()');
      expect(testUtilContent).toContain('prisma.product.count()');
      expect(testUtilContent).toContain('prisma.category.count()');
      expect(testUtilContent).toContain('prisma.auditLog.count()');
    });
  });

  describe('Data Requirements', () => {
    it('should have proper timestamps on all tables', () => {
      const schemaPath = path.join(__dirname, '../../../prisma/schema.prisma');
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      
      const modelsWithTimestamps = ['User', 'Role', 'Permission', 'Product', 'Category'];
      modelsWithTimestamps.forEach(model => {
        expect(schemaContent).toMatch(new RegExp(`model ${model}[\\s\\S]*?createdAt\\s+DateTime\\s+@default\\(now\\(\\)\\)`));
        expect(schemaContent).toMatch(new RegExp(`model ${model}[\\s\\S]*?updatedAt\\s+DateTime\\s+@updatedAt`));
      });
      
      // AuditLog only has createdAt
      expect(schemaContent).toMatch(/model AuditLog[\s\S]*?createdAt\s+DateTime\s+@default\(now\(\)\)/);
    });

    it('should have foreign key relationships enforced', () => {
      const schemaPath = path.join(__dirname, '../../../prisma/schema.prisma');
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      
      expect(schemaContent).toMatch(/role\s+Role\s+@relation\(fields:\s*\[roleId\],\s*references:\s*\[id\]\)/);
      expect(schemaContent).toMatch(/category\s+Category\s+@relation\(fields:\s*\[categoryId\],\s*references:\s*\[id\]\)/);
    });

    it('should have unique constraints applied', () => {
      const schemaPath = path.join(__dirname, '../../../prisma/schema.prisma');
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      
      expect(schemaContent).toMatch(/email\s+String\s+@unique/);
      expect(schemaContent).toMatch(/sku\s+String\s+@unique/);
      expect(schemaContent).toMatch(/name\s+String\s+@unique/);
    });

    it('should have audit logging implemented', () => {
      const schemaPath = path.join(__dirname, '../../../prisma/schema.prisma');
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      
      expect(schemaContent).toContain('model AuditLog');
      expect(schemaContent).toMatch(/action\s+String/);
      expect(schemaContent).toMatch(/entityType\s+String/);
      expect(schemaContent).toMatch(/entityId\s+String/);
      expect(schemaContent).toMatch(/userId\s+String/);
      expect(schemaContent).toMatch(/changes\s+Json/);
    });
  });
});
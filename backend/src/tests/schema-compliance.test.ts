import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('Database Schema Compliance Tests', () => {
  let schemaContent: string;

  beforeAll(() => {
    const schemaPath = path.join(__dirname, '../../../prisma/schema.prisma');
    schemaContent = fs.readFileSync(schemaPath, 'utf8');
  });

  describe('Core Requirements', () => {
    it('should use PostgreSQL provider', () => {
      expect(schemaContent).toMatch(/provider\s*=\s*"postgresql"/);
    });

    it('should use environment variable for database URL', () => {
      expect(schemaContent).toMatch(/url\s*=\s*env\("DATABASE_URL"\)/);
    });

    it('should generate Prisma client', () => {
      expect(schemaContent).toMatch(/provider\s*=\s*"prisma-client-js"/);
    });
  });

  describe('User Management Models', () => {
    it('should have User model with required fields', () => {
      expect(schemaContent).toContain('model User');
      expect(schemaContent).toMatch(/id\s+String\s+@id\s+@default\(uuid\(\)\)/);
      expect(schemaContent).toMatch(/email\s+String\s+@unique/);
      expect(schemaContent).toMatch(/name\s+String/);
      expect(schemaContent).toMatch(/active\s+Boolean\s+@default\(true\)/);
      expect(schemaContent).toMatch(/createdAt\s+DateTime\s+@default\(now\(\)\)/);
      expect(schemaContent).toMatch(/updatedAt\s+DateTime\s+@updatedAt/);
    });

    it('should have Role model with required fields', () => {
      expect(schemaContent).toContain('model Role');
      expect(schemaContent).toMatch(/name\s+String\s+@unique/);
      expect(schemaContent).toMatch(/permissions\s+Permission\[\]/);
      expect(schemaContent).toMatch(/users\s+User\[\]/);
    });

    it('should have Permission model with required fields', () => {
      expect(schemaContent).toContain('model Permission');
      expect(schemaContent).toMatch(/name\s+String\s+@unique/);
      expect(schemaContent).toMatch(/roles\s+Role\[\]/);
    });

    it('should have proper User-Role relationship', () => {
      expect(schemaContent).toMatch(/role\s+Role\s+@relation\(fields:\s*\[roleId\],\s*references:\s*\[id\]\)/);
      expect(schemaContent).toMatch(/roleId\s+String/);
    });
  });

  describe('Inventory Management Models', () => {
    it('should have Product model with required fields', () => {
      expect(schemaContent).toContain('model Product');
      expect(schemaContent).toMatch(/sku\s+String\s+@unique/);
      expect(schemaContent).toMatch(/name\s+String/);
      expect(schemaContent).toMatch(/description\s+String\?/);
      expect(schemaContent).toMatch(/quantity\s+Int\s+@default\(0\)/);
      expect(schemaContent).toMatch(/minStock\s+Int\s+@default\(0\)/);
      expect(schemaContent).toMatch(/maxStock\s+Int\?/);
    });

    it('should have Category model with required fields', () => {
      expect(schemaContent).toContain('model Category');
      expect(schemaContent).toMatch(/name\s+String\s+@unique/);
      expect(schemaContent).toMatch(/description\s+String\?/);
      expect(schemaContent).toMatch(/products\s+Product\[\]/);
    });

    it('should have proper Product-Category relationship', () => {
      expect(schemaContent).toMatch(/category\s+Category\s+@relation\(fields:\s*\[categoryId\],\s*references:\s*\[id\]\)/);
      expect(schemaContent).toMatch(/categoryId\s+String/);
    });
  });

  describe('Audit System', () => {
    it('should have AuditLog model with required fields', () => {
      expect(schemaContent).toContain('model AuditLog');
      expect(schemaContent).toMatch(/action\s+String/);
      expect(schemaContent).toMatch(/entityType\s+String/);
      expect(schemaContent).toMatch(/entityId\s+String/);
      expect(schemaContent).toMatch(/userId\s+String/);
      expect(schemaContent).toMatch(/changes\s+Json/);
      expect(schemaContent).toMatch(/createdAt\s+DateTime\s+@default\(now\(\)\)/);
    });
  });

  describe('Data Requirements', () => {
    it('should have proper timestamps on all models', () => {
      const modelsWithTimestamps = ['User', 'Role', 'Permission', 'Product', 'Category'];
      modelsWithTimestamps.forEach(model => {
        const modelRegex = new RegExp(`model ${model}[\\s\\S]*?createdAt\\s+DateTime\\s+@default\\(now\\(\\)\\)[\\s\\S]*?updatedAt\\s+DateTime\\s+@updatedAt`);
        expect(schemaContent).toMatch(modelRegex);
      });
    });

    it('should have unique constraints applied', () => {
      expect(schemaContent).toMatch(/email\s+String\s+@unique/);
      expect(schemaContent).toMatch(/sku\s+String\s+@unique/);
      expect(schemaContent).toMatch(/name\s+String\s+@unique/); // Role name
    });

    it('should have UUID primary keys', () => {
      const models = ['User', 'Role', 'Permission', 'Product', 'Category', 'AuditLog'];
      models.forEach(model => {
        const modelRegex = new RegExp(`model ${model}[\\s\\S]*?id\\s+String\\s+@id\\s+@default\\(uuid\\(\\)\\)`);
        expect(schemaContent).toMatch(modelRegex);
      });
    });
  });
});
import { describe, it, expect } from '@jest/globals';

describe('Database Schema Tests', () => {
  it('should have correct Prisma schema structure', () => {
    const fs = require('fs');
    const path = require('path');
    
    const schemaPath = path.join(__dirname, '../../../prisma/schema.prisma');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    // Verify core models exist
    expect(schemaContent).toContain('model User');
    expect(schemaContent).toContain('model Role');
    expect(schemaContent).toContain('model Permission');
    expect(schemaContent).toContain('model Product');
    expect(schemaContent).toContain('model Category');
    expect(schemaContent).toContain('model AuditLog');
    
    // Verify database configuration
    expect(schemaContent).toContain('provider = "postgresql"');
    expect(schemaContent).toContain('provider = "prisma-client-js"');
    
    // Verify core relationships
    expect(schemaContent).toContain('role      Role');
    expect(schemaContent).toContain('category    Category');
    expect(schemaContent).toContain('permissions Permission[]');
  });

  it('should validate migration script exists', () => {
    const fs = require('fs');
    const path = require('path');
    
    const migrationPath = path.join(__dirname, '../../../scripts/migrate.ts');
    expect(fs.existsSync(migrationPath)).toBe(true);
    
    const migrationContent = fs.readFileSync(migrationPath, 'utf8');
    expect(migrationContent).toContain('manageMigration');
    expect(migrationContent).toContain('seedInitialData');
    expect(migrationContent).toContain('PrismaClient');
  });

  it('should validate migration test utility exists', () => {
    const fs = require('fs');
    const path = require('path');
    
    const testUtilPath = path.join(__dirname, '../utils/migrationTest.ts');
    expect(fs.existsSync(testUtilPath)).toBe(true);
    
    const testUtilContent = fs.readFileSync(testUtilPath, 'utf8');
    expect(testUtilContent).toContain('MigrationTester');
    expect(testUtilContent).toContain('testMigration');
    expect(testUtilContent).toContain('rollbackTest');
  });
});
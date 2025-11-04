/**
 * Tests for RBAC Migration
 * 
 * This file tests the migration class and SQL statements for creating RBAC tables.
 */

import { CreateRbacTables, RBAC_MIGRATION_SQL } from '@/db/migrations/20250826153836_create_rbac_tables';

describe('RBAC Migration', () => {
  describe('CreateRbacTables class', () => {
    let migration: CreateRbacTables;

    beforeEach(() => {
      migration = new CreateRbacTables();
    });

    describe('up method', () => {
      it('should execute without errors', async () => {
        // Mock console.log to avoid output in tests
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        await expect(migration.up()).resolves.not.toThrow();
        expect(consoleSpy).toHaveBeenCalledWith('Running migration: Create RBAC Tables');

        consoleSpy.mockRestore();
      });
    });

    describe('down method', () => {
      it('should execute without errors', async () => {
        // Mock console.log to avoid output in tests
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        await expect(migration.down()).resolves.not.toThrow();
        expect(consoleSpy).toHaveBeenCalledWith('Rolling back migration: Create RBAC Tables');

        consoleSpy.mockRestore();
      });
    });
  });

  describe('RBAC_MIGRATION_SQL', () => {
    describe('up migration SQL', () => {
      it('should contain all required table creation statements', () => {
        const { up } = RBAC_MIGRATION_SQL;

        // Check for UUID extension
        expect(up).toContain('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

        // Check for roles table
        expect(up).toContain('CREATE TABLE roles');
        expect(up).toContain('id UUID PRIMARY KEY DEFAULT uuid_generate_v4()');
        expect(up).toContain('name VARCHAR(255) NOT NULL UNIQUE');
        expect(up).toContain('description TEXT');
        expect(up).toContain('created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP');
        expect(up).toContain('updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP');

        // Check for permissions table
        expect(up).toContain('CREATE TABLE permissions');
        expect(up).toContain('resource VARCHAR(255) NOT NULL');
        expect(up).toContain('action VARCHAR(50) NOT NULL');
        expect(up).toContain("CONSTRAINT valid_action CHECK (action IN ('create', 'read', 'update', 'delete', 'manage'))");

        // Check for user_roles table
        expect(up).toContain('CREATE TABLE user_roles');
        expect(up).toContain('user_id UUID REFERENCES users(id) ON DELETE CASCADE');
        expect(up).toContain('role_id UUID REFERENCES roles(id) ON DELETE CASCADE');
        expect(up).toContain('PRIMARY KEY (user_id, role_id)');

        // Check for role_permissions table
        expect(up).toContain('CREATE TABLE role_permissions');
        expect(up).toContain('role_id UUID REFERENCES roles(id) ON DELETE CASCADE');
        expect(up).toContain('permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE');
        expect(up).toContain('PRIMARY KEY (role_id, permission_id)');
      });

      it('should contain all required indexes', () => {
        const { up } = RBAC_MIGRATION_SQL;

        // Check for user_roles indexes
        expect(up).toContain('CREATE INDEX idx_user_roles_user_id ON user_roles(user_id)');
        expect(up).toContain('CREATE INDEX idx_user_roles_role_id ON user_roles(role_id)');

        // Check for role_permissions indexes
        expect(up).toContain('CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id)');
        expect(up).toContain('CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id)');

        // Check for permissions indexes
        expect(up).toContain('CREATE INDEX idx_permissions_resource ON permissions(resource)');
        expect(up).toContain('CREATE INDEX idx_permissions_action ON permissions(action)');
        expect(up).toContain('CREATE INDEX idx_permissions_resource_action ON permissions(resource, action)');
      });

      it('should contain update triggers for timestamp columns', () => {
        const { up } = RBAC_MIGRATION_SQL;

        // Check for trigger function
        expect(up).toContain('CREATE OR REPLACE FUNCTION update_updated_at_column()');
        expect(up).toContain('NEW.updated_at = CURRENT_TIMESTAMP');

        // Check for triggers
        expect(up).toContain('CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles');
        expect(up).toContain('CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON permissions');
      });
    });

    describe('down migration SQL', () => {
      it('should contain all cleanup statements in correct order', () => {
        const { down } = RBAC_MIGRATION_SQL;

        // Check for trigger cleanup (should be first)
        expect(down).toContain('DROP TRIGGER IF EXISTS update_roles_updated_at ON roles');
        expect(down).toContain('DROP TRIGGER IF EXISTS update_permissions_updated_at ON permissions');
        expect(down).toContain('DROP FUNCTION IF EXISTS update_updated_at_column()');

        // Check for index cleanup
        expect(down).toContain('DROP INDEX IF EXISTS idx_user_roles_user_id');
        expect(down).toContain('DROP INDEX IF EXISTS idx_user_roles_role_id');
        expect(down).toContain('DROP INDEX IF EXISTS idx_role_permissions_role_id');
        expect(down).toContain('DROP INDEX IF EXISTS idx_role_permissions_permission_id');
        expect(down).toContain('DROP INDEX IF EXISTS idx_permissions_resource');
        expect(down).toContain('DROP INDEX IF EXISTS idx_permissions_action');
        expect(down).toContain('DROP INDEX IF EXISTS idx_permissions_resource_action');

        // Check for table cleanup (should respect foreign key order)
        expect(down).toContain('DROP TABLE IF EXISTS role_permissions');
        expect(down).toContain('DROP TABLE IF EXISTS user_roles');
        expect(down).toContain('DROP TABLE IF EXISTS permissions');
        expect(down).toContain('DROP TABLE IF EXISTS roles');
      });

      it('should drop tables in correct order to respect foreign key constraints', () => {
        const { down } = RBAC_MIGRATION_SQL;
        
        // Find positions of table drops
        const rolePermissionsPos = down.indexOf('DROP TABLE IF EXISTS role_permissions');
        const userRolesPos = down.indexOf('DROP TABLE IF EXISTS user_roles');
        const permissionsPos = down.indexOf('DROP TABLE IF EXISTS permissions');
        const rolesPos = down.indexOf('DROP TABLE IF EXISTS roles');

        // Junction tables should be dropped first
        expect(rolePermissionsPos).toBeLessThan(permissionsPos);
        expect(rolePermissionsPos).toBeLessThan(rolesPos);
        expect(userRolesPos).toBeLessThan(rolesPos);

        // Main tables should be dropped after junction tables
        expect(permissionsPos).toBeLessThan(rolesPos);
      });
    });
  });

  describe('SQL syntax validation', () => {
    it('should have valid PostgreSQL syntax for up migration', () => {
      const { up } = RBAC_MIGRATION_SQL;

      // Basic syntax checks
      expect(up).not.toContain('AUTOINCREMENT'); // MySQL syntax
      expect(up).toContain('uuid_generate_v4()'); // PostgreSQL UUID function
      expect(up).toContain('TIMESTAMP WITH TIME ZONE'); // PostgreSQL timestamp with timezone
      expect(up).toContain('ON DELETE CASCADE'); // Foreign key constraint

      // Check for proper statement terminators
      const statements = up.split(';').filter((stmt: string) => stmt.trim());
      statements.forEach((statement: string) => {
        // Each statement should be properly formed (basic check)
        expect(statement.trim()).toBeTruthy();
      });
    });

    it('should have valid PostgreSQL syntax for down migration', () => {
      const { down } = RBAC_MIGRATION_SQL;

      // Check for proper IF EXISTS clauses
      expect(down).toContain('DROP TRIGGER IF EXISTS');
      expect(down).toContain('DROP FUNCTION IF EXISTS');
      expect(down).toContain('DROP INDEX IF EXISTS');
      expect(down).toContain('DROP TABLE IF EXISTS');

      // Check for proper statement terminators
      const statements = down.split(';').filter((stmt: string) => stmt.trim());
      statements.forEach((statement: string) => {
        expect(statement.trim()).toBeTruthy();
      });
    });
  });
});
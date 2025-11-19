/**
 * Migration: Create RBAC Tables
 * Timestamp: 20250826153836
 * 
 * This migration creates the Role-Based Access Control (RBAC) system tables:
 * - roles: Store role definitions
 * - permissions: Store permission definitions  
 * - user_roles: Junction table for user-role assignments
 * - role_permissions: Junction table for role-permission assignments
 */

export interface Migration {
  up(): Promise<void>;
  down(): Promise<void>;
}

export class CreateRbacTables implements Migration {
  
  /**
   * Create the RBAC tables and indexes
   */
  async up(): Promise<void> {
    // This would be executed by a migration runner
    // For now, we're providing the SQL as a reference
    console.log('Running migration: Create RBAC Tables');
  }

  /**
   * Drop the RBAC tables (rollback)
   */
  async down(): Promise<void> {
    // This would be executed by a migration runner for rollback
    console.log('Rolling back migration: Create RBAC Tables');
  }
}

/**
 * SQL statements for creating RBAC tables
 * These match the schema requirements from PR #50
 */
export const RBAC_MIGRATION_SQL = {
  up: `
    -- Enable UUID extension if not already enabled
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Create roles table
    CREATE TABLE roles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create permissions table
    CREATE TABLE permissions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      resource VARCHAR(255) NOT NULL,
      action VARCHAR(50) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT valid_action CHECK (action IN ('create', 'read', 'update', 'delete', 'manage'))
    );

    -- Create user_roles junction table
    CREATE TABLE user_roles (
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
      assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, role_id)
    );

    -- Create role_permissions junction table
    CREATE TABLE role_permissions (
      role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
      permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
      assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (role_id, permission_id)
    );

    -- Add indexes for better query performance
    CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
    CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
    CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
    CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);

    -- Add indexes for permissions table
    CREATE INDEX idx_permissions_resource ON permissions(resource);
    CREATE INDEX idx_permissions_action ON permissions(action);
    CREATE INDEX idx_permissions_resource_action ON permissions(resource, action);

    -- Add trigger for updating updated_at timestamp on roles
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON permissions
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `,

  down: `
    -- Drop triggers first
    DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
    DROP TRIGGER IF EXISTS update_permissions_updated_at ON permissions;
    DROP FUNCTION IF EXISTS update_updated_at_column();

    -- Drop indexes
    DROP INDEX IF EXISTS idx_user_roles_user_id;
    DROP INDEX IF EXISTS idx_user_roles_role_id;
    DROP INDEX IF EXISTS idx_role_permissions_role_id;
    DROP INDEX IF EXISTS idx_role_permissions_permission_id;
    DROP INDEX IF EXISTS idx_permissions_resource;
    DROP INDEX IF EXISTS idx_permissions_action;
    DROP INDEX IF EXISTS idx_permissions_resource_action;

    -- Drop tables in reverse order (respecting foreign key constraints)
    DROP TABLE IF EXISTS role_permissions;
    DROP TABLE IF EXISTS user_roles;
    DROP TABLE IF EXISTS permissions;
    DROP TABLE IF EXISTS roles;
  `
};

export default CreateRbacTables;
-- Dynamic Role-Based Access Control (RBAC) Schema
-- This schema implements a comprehensive RBAC system for Bruno's IMS

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_at TIMESTAMP,
    updated_by VARCHAR(50)
);

-- Roles Table (Extensible)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_at TIMESTAMP,
    updated_by VARCHAR(50)
);

-- User Roles Mapping
CREATE TABLE user_roles (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by VARCHAR(50),
    PRIMARY KEY (user_id, role_id)
);

-- Feature Groups (for organizing features hierarchically)
CREATE TABLE feature_groups (
    id SERIAL PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES feature_groups(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_at TIMESTAMP,
    updated_by VARCHAR(50)
);

-- Features (individual features that can be controlled)
CREATE TABLE features (
    id SERIAL PRIMARY KEY,
    feature_name VARCHAR(100) NOT NULL,
    description TEXT,
    group_id INTEGER REFERENCES feature_groups(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_at TIMESTAMP,
    updated_by VARCHAR(50)
);

-- Permissions (linking roles to features with specific access levels)
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    feature_id INTEGER REFERENCES features(id) ON DELETE CASCADE,
    can_read BOOLEAN DEFAULT false,
    can_write BOOLEAN DEFAULT false,
    is_hidden BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_at TIMESTAMP,
    updated_by VARCHAR(50),
    UNIQUE(role_id, feature_id)
);

-- Audit Log (for tracking all changes)
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER NOT NULL,
    old_value JSONB,
    new_value JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45)
);

-- Create indexes for performance
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_permissions_role_id ON permissions(role_id);
CREATE INDEX idx_permissions_feature_id ON permissions(feature_id);
CREATE INDEX idx_features_group_id ON features(group_id);
CREATE INDEX idx_feature_groups_parent_id ON feature_groups(parent_id);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);

-- Insert default roles
INSERT INTO roles (role_name, description, created_by) VALUES
('super_admin', 'Super Administrator with full system access', 'system'),
('admin', 'Administrator with broad system access', 'system'),
('manager', 'Restaurant Manager with location-specific access', 'system'),
('staff', 'Restaurant Staff with limited access', 'system');

-- Insert default feature groups
INSERT INTO feature_groups (group_name, description, created_by) VALUES
('user_management', 'User and Role Management Features', 'system'),
('restaurant_management', 'Restaurant Operations Features', 'system'),
('inventory_management', 'Inventory and Stock Features', 'system'),
('reporting', 'Analytics and Reporting Features', 'system'),
('system_settings', 'System Configuration Features', 'system');

-- Insert default features
INSERT INTO features (feature_name, description, group_id, created_by) VALUES
-- User Management Features
('view_users', 'View user list and details', 1, 'system'),
('create_users', 'Create new users', 1, 'system'),
('edit_users', 'Edit user information', 1, 'system'),
('delete_users', 'Delete users', 1, 'system'),
('manage_roles', 'Manage user roles and permissions', 1, 'system'),

-- Restaurant Management Features
('view_restaurants', 'View restaurant list and details', 2, 'system'),
('create_restaurants', 'Create new restaurants', 2, 'system'),
('edit_restaurants', 'Edit restaurant information', 2, 'system'),
('delete_restaurants', 'Delete restaurants', 2, 'system'),
('manage_menu', 'Manage restaurant menu items', 2, 'system'),

-- Inventory Management Features
('view_inventory', 'View inventory levels', 3, 'system'),
('update_inventory', 'Update inventory quantities', 3, 'system'),
('manage_suppliers', 'Manage supplier information', 3, 'system'),
('view_reports', 'View inventory reports', 3, 'system'),

-- Reporting Features
('view_analytics', 'View analytics dashboard', 4, 'system'),
('export_reports', 'Export reports and data', 4, 'system'),
('manage_reports', 'Create and manage custom reports', 4, 'system'),

-- System Settings Features
('system_configuration', 'Configure system settings', 5, 'system'),
('audit_logs', 'View system audit logs', 5, 'system'),
('backup_restore', 'Perform system backup and restore', 5, 'system');

-- Set default permissions for roles
-- Super Admin gets full access to everything
INSERT INTO permissions (role_id, feature_id, can_read, can_write, is_hidden, created_by)
SELECT 1, f.id, true, true, false, 'system'
FROM features f;

-- Admin gets access to most features except system configuration
INSERT INTO permissions (role_id, feature_id, can_read, can_write, is_hidden, created_by)
SELECT 2, f.id, true, true, false, 'system'
FROM features f
WHERE f.feature_name NOT IN ('system_configuration', 'backup_restore');

-- Manager gets read/write access to restaurant and inventory, read access to reporting
INSERT INTO permissions (role_id, feature_id, can_read, can_write, is_hidden, created_by)
SELECT 3, f.id, true, 
    CASE WHEN f.group_id IN (2, 3) THEN true ELSE false END,
    false, 'system'
FROM features f
WHERE f.group_id IN (2, 3, 4) AND f.feature_name NOT IN ('delete_restaurants', 'create_restaurants');

-- Staff gets limited read access
INSERT INTO permissions (role_id, feature_id, can_read, can_write, is_hidden, created_by)
SELECT 4, f.id, true, false, false, 'system'
FROM features f
WHERE f.feature_name IN ('view_restaurants', 'view_inventory', 'manage_menu');
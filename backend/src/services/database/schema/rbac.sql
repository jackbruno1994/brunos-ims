-- Bruno's IMS - RBAC Database Schema
-- Role-Based Access Control tables with enterprise-grade security features

-- Enable UUID extension for PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles table: Define system roles (super_admin, admin, manager, staff, readonly)
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE CHECK (name IN ('super_admin', 'admin', 'manager', 'staff', 'readonly')),
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Permissions table: Define granular permissions with resource:action format
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE, -- Format: resource:action (e.g., "user:create", "restaurant:read")
    resource VARCHAR(50) NOT NULL CHECK (resource IN ('user', 'restaurant', 'menu', 'inventory', 'order', 'report', 'system', 'role', 'permission')),
    action VARCHAR(50) NOT NULL CHECK (action IN ('create', 'read', 'update', 'delete', 'manage', 'execute')),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(resource, action)
);

-- User roles table: Many-to-many relationship between users and roles
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- References users.id (to be created in user management)
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    restaurant_id UUID, -- Optional: restaurant-specific role assignment
    assigned_by UUID NOT NULL, -- References users.id of the user who assigned the role
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE, -- Optional: for temporary role assignments
    is_active BOOLEAN NOT NULL DEFAULT true,
    UNIQUE(user_id, role_id, restaurant_id)
);

-- Role permissions table: Many-to-many relationship between roles and permissions
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    granted_by UUID NOT NULL, -- References users.id of the user who granted the permission
    granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT true,
    UNIQUE(role_id, permission_id)
);

-- User sessions table: Track active user sessions for security
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- References users.id
    token VARCHAR(500) NOT NULL UNIQUE, -- JWT token or session identifier
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RBAC audit log table: Track all RBAC-related operations for compliance
CREATE TABLE IF NOT EXISTS rbac_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- References users.id
    action VARCHAR(100) NOT NULL, -- Action performed (e.g., 'role_assigned', 'permission_granted')
    resource VARCHAR(100) NOT NULL, -- Resource affected (e.g., 'user_role', 'role_permission')
    resource_id UUID, -- ID of the affected resource
    old_value JSONB, -- Previous state (for updates/deletions)
    new_value JSONB, -- New state (for creates/updates)
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_is_active ON roles(is_active);

CREATE INDEX IF NOT EXISTS idx_permissions_resource_action ON permissions(resource, action);
CREATE INDEX IF NOT EXISTS idx_permissions_is_active ON permissions(is_active);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_restaurant_id ON user_roles(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_is_active ON user_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_roles_expires_at ON user_roles(expires_at);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_is_active ON role_permissions(is_active);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);

CREATE INDEX IF NOT EXISTS idx_rbac_audit_logs_user_id ON rbac_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_rbac_audit_logs_timestamp ON rbac_audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_rbac_audit_logs_action ON rbac_audit_logs(action);

-- Functions to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_roles_updated_at 
    BEFORE UPDATE ON roles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permissions_updated_at 
    BEFORE UPDATE ON permissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default roles
INSERT INTO roles (name, display_name, description) VALUES
('super_admin', 'Super Administrator', 'Full system access with all permissions')
ON CONFLICT (name) DO NOTHING;

INSERT INTO roles (name, display_name, description) VALUES
('admin', 'Administrator', 'Administrative access with most permissions')
ON CONFLICT (name) DO NOTHING;

INSERT INTO roles (name, display_name, description) VALUES
('manager', 'Manager', 'Restaurant management permissions')
ON CONFLICT (name) DO NOTHING;

INSERT INTO roles (name, display_name, description) VALUES
('staff', 'Staff', 'Basic operational permissions')
ON CONFLICT (name) DO NOTHING;

INSERT INTO roles (name, display_name, description) VALUES
('readonly', 'Read Only', 'Read-only access to most resources')
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (name, resource, action, description) VALUES
-- User permissions
('user:create', 'user', 'create', 'Create new users'),
('user:read', 'user', 'read', 'View user information'),
('user:update', 'user', 'update', 'Update user information'),
('user:delete', 'user', 'delete', 'Delete users'),
('user:manage', 'user', 'manage', 'Full user management'),

-- Restaurant permissions
('restaurant:create', 'restaurant', 'create', 'Create new restaurants'),
('restaurant:read', 'restaurant', 'read', 'View restaurant information'),
('restaurant:update', 'restaurant', 'update', 'Update restaurant information'),
('restaurant:delete', 'restaurant', 'delete', 'Delete restaurants'),
('restaurant:manage', 'restaurant', 'manage', 'Full restaurant management'),

-- Menu permissions
('menu:create', 'menu', 'create', 'Create menu items'),
('menu:read', 'menu', 'read', 'View menu items'),
('menu:update', 'menu', 'update', 'Update menu items'),
('menu:delete', 'menu', 'delete', 'Delete menu items'),
('menu:manage', 'menu', 'manage', 'Full menu management'),

-- Inventory permissions
('inventory:create', 'inventory', 'create', 'Create inventory items'),
('inventory:read', 'inventory', 'read', 'View inventory information'),
('inventory:update', 'inventory', 'update', 'Update inventory'),
('inventory:delete', 'inventory', 'delete', 'Delete inventory items'),
('inventory:manage', 'inventory', 'manage', 'Full inventory management'),

-- Order permissions
('order:create', 'order', 'create', 'Create orders'),
('order:read', 'order', 'read', 'View orders'),
('order:update', 'order', 'update', 'Update orders'),
('order:delete', 'order', 'delete', 'Cancel/delete orders'),
('order:manage', 'order', 'manage', 'Full order management'),

-- Report permissions
('report:read', 'report', 'read', 'View reports'),
('report:execute', 'report', 'execute', 'Generate reports'),
('report:manage', 'report', 'manage', 'Full report management'),

-- System permissions
('system:read', 'system', 'read', 'View system information'),
('system:update', 'system', 'update', 'Update system settings'),
('system:manage', 'system', 'manage', 'Full system management'),

-- Role permissions
('role:create', 'role', 'create', 'Create roles'),
('role:read', 'role', 'read', 'View roles'),
('role:update', 'role', 'update', 'Update roles'),
('role:delete', 'role', 'delete', 'Delete roles'),
('role:manage', 'role', 'manage', 'Full role management'),

-- Permission permissions
('permission:create', 'permission', 'create', 'Create permissions'),
('permission:read', 'permission', 'read', 'View permissions'),
('permission:update', 'permission', 'update', 'Update permissions'),
('permission:delete', 'permission', 'delete', 'Delete permissions'),
('permission:manage', 'permission', 'manage', 'Full permission management')
ON CONFLICT (name) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE roles IS 'System roles for RBAC implementation';
COMMENT ON TABLE permissions IS 'Granular permissions with resource:action format';
COMMENT ON TABLE user_roles IS 'User-role assignments with optional restaurant scoping';
COMMENT ON TABLE role_permissions IS 'Role-permission mappings';
COMMENT ON TABLE user_sessions IS 'Active user sessions for security tracking';
COMMENT ON TABLE rbac_audit_logs IS 'Audit trail for all RBAC operations';
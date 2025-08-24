import { v4 as uuidv4 } from 'uuid';
import { Role, Permission, User, RoleAssignment, AuditLog } from '../types';

// In-memory storage for demonstration (in real app, this would be a database)
class DataStore {
  private roles: Map<string, Role> = new Map();
  private permissions: Map<string, Permission> = new Map();
  private users: Map<string, User> = new Map();
  private roleAssignments: Map<string, RoleAssignment> = new Map();
  private auditLogs: AuditLog[] = [];

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize default permissions
    const defaultPermissions: Permission[] = [
      {
        id: 'view_inventory',
        name: 'View Inventory',
        description: 'Can view inventory items',
        resource: 'inventory',
        action: 'read'
      },
      {
        id: 'manage_inventory',
        name: 'Manage Inventory',
        description: 'Can create, update, and delete inventory items',
        resource: 'inventory',
        action: 'write'
      },
      {
        id: 'view_staff',
        name: 'View Staff',
        description: 'Can view staff information',
        resource: 'staff',
        action: 'read'
      },
      {
        id: 'manage_staff',
        name: 'Manage Staff',
        description: 'Can create, update, and delete staff records',
        resource: 'staff',
        action: 'write'
      },
      {
        id: 'view_orders',
        name: 'View Orders',
        description: 'Can view orders',
        resource: 'orders',
        action: 'read'
      },
      {
        id: 'manage_orders',
        name: 'Manage Orders',
        description: 'Can create, update, and delete orders',
        resource: 'orders',
        action: 'write'
      },
      {
        id: 'view_reports',
        name: 'View Reports',
        description: 'Can view reports and analytics',
        resource: 'reports',
        action: 'read'
      },
      {
        id: 'view_roles',
        name: 'View Roles',
        description: 'Can view roles and permissions',
        resource: 'roles',
        action: 'read'
      },
      {
        id: 'manage_roles',
        name: 'Manage Roles',
        description: 'Can create, update, and delete roles',
        resource: 'roles',
        action: 'write'
      }
    ];

    defaultPermissions.forEach(permission => {
      this.permissions.set(permission.id, permission);
    });

    // Initialize a test user
    const testUser: User = {
      id: 'test_user_1',
      username: 'jackbruno1994',
      email: 'jack@example.com',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.set(testUser.id, testUser);

    // Create a default admin role for the test user
    const adminRole = this.createRole({
      name: 'Admin',
      description: 'Full system administrator',
      permissions: [
        'view_inventory', 'manage_inventory', 'view_staff', 'manage_staff', 
        'view_orders', 'manage_orders', 'view_reports', 'view_roles', 'manage_roles'
      ],
      createdBy: 'system'
    });

    // Assign admin role to test user
    this.assignRole({
      userId: testUser.id,
      roleId: adminRole.id,
      startDate: new Date(),
      assignedBy: 'system'
    });
  }

  // Method to reset data for testing
  reset() {
    this.roles.clear();
    this.users.clear();
    this.roleAssignments.clear();
    this.auditLogs = [];
    this.initializeDefaultData();
  }

  // Role operations
  createRole(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Role {
    const newRole: Role = {
      ...role,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.roles.set(newRole.id, newRole);
    return newRole;
  }

  getRoleById(id: string): Role | undefined {
    return this.roles.get(id);
  }

  getAllRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  updateRole(id: string, updates: Partial<Role>): Role | undefined {
    const role = this.roles.get(id);
    if (!role) return undefined;

    const updatedRole = {
      ...role,
      ...updates,
      updatedAt: new Date()
    };
    this.roles.set(id, updatedRole);
    return updatedRole;
  }

  deleteRole(id: string): boolean {
    return this.roles.delete(id);
  }

  // Permission operations
  getPermissionById(id: string): Permission | undefined {
    return this.permissions.get(id);
  }

  getAllPermissions(): Permission[] {
    return Array.from(this.permissions.values());
  }

  // User operations
  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Role assignment operations
  assignRole(assignment: Omit<RoleAssignment, 'createdAt' | 'updatedAt'>): RoleAssignment {
    const newAssignment: RoleAssignment = {
      ...assignment,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.roleAssignments.set(`${assignment.userId}_${assignment.roleId}`, newAssignment);
    
    // Update user record
    this.updateUser(assignment.userId, {
      roleId: assignment.roleId,
      roleStartDate: assignment.startDate,
      roleAssignedBy: assignment.assignedBy
    });

    return newAssignment;
  }

  getRoleAssignment(userId: string, roleId: string): RoleAssignment | undefined {
    return this.roleAssignments.get(`${userId}_${roleId}`);
  }

  getUserRoleAssignments(userId: string): RoleAssignment[] {
    return Array.from(this.roleAssignments.values())
      .filter(assignment => assignment.userId === userId);
  }

  // Audit log operations
  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const newLog: AuditLog = {
      ...log,
      id: uuidv4(),
      timestamp: new Date()
    };
    this.auditLogs.push(newLog);
    return newLog;
  }

  getAuditLogs(userId?: string): AuditLog[] {
    if (userId) {
      return this.auditLogs.filter(log => log.userId === userId);
    }
    return this.auditLogs;
  }
}

export const dataStore = new DataStore();
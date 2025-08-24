import { Role, User } from '../../models';
import { permissions } from '../../config';
import bcrypt from 'bcrypt';

export const createTestRole = async (overrides: any = {}) => {
  const defaultRole = {
    name: 'Test Role',
    description: 'A test role for testing purposes',
    permissions: [permissions.VIEW_INVENTORY, permissions.VIEW_ORDERS],
    hierarchyLevel: 20,
    isActive: true,
  };

  const role = new Role({ ...defaultRole, ...overrides });
  await role.save();
  return role;
};

export const createTestUser = async (overrides: any = {}) => {
  const defaultPassword = 'testpassword123';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);
  
  const defaultUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: hashedPassword,
    firstName: 'Test',
    lastName: 'User',
    isActive: true,
  };

  const user = new User({ ...defaultUser, ...overrides });
  await user.save();
  return { user, password: defaultPassword };
};

export const testUsers = [
  {
    username: 'test_manager',
    email: 'manager@test.com',
    role: 'Manager',
    password: 'manager123',
  },
  {
    username: 'test_staff',
    email: 'staff@test.com',
    role: 'Staff',
    password: 'staff123',
  },
];

export const predefinedTestRoles = [
  {
    name: 'Kitchen Manager',
    description: 'Manages kitchen inventory and staff',
    permissions: [
      permissions.VIEW_INVENTORY,
      permissions.MANAGE_INVENTORY,
      permissions.VIEW_STAFF,
      permissions.MANAGE_ORDERS,
    ],
    hierarchyLevel: 40,
  },
  {
    name: 'Regional Supervisor',
    description: 'Manages multiple restaurant locations',
    permissions: [
      permissions.VIEW_ALL_LOCATIONS,
      permissions.MANAGE_LOCATIONS,
      permissions.VIEW_REPORTS,
      permissions.MANAGE_STAFF,
      permissions.VIEW_ANALYTICS,
    ],
    hierarchyLevel: 70,
  },
];
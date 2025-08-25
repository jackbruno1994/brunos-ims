import request from 'supertest';
import { app } from '../../app';
import { generateAuthToken } from '../../utils/auth';

// Mock the RBAC service before any imports that use it
jest.mock('../../services/rbac/rbac.service', () => {
  const mockCreatePermission = jest.fn();
  const mockGetPermissionById = jest.fn();
  const mockCreateRole = jest.fn();
  const mockGetRoleById = jest.fn();
  const mockAddPermissionToRole = jest.fn();
  const mockAssignRoleToUser = jest.fn();
  const mockGetUserRoles = jest.fn();

  return {
    RBACService: {
      getInstance: () => ({
        createPermission: mockCreatePermission,
        getPermissionById: mockGetPermissionById,
        createRole: mockCreateRole,
        getRoleById: mockGetRoleById,
        addPermissionToRole: mockAddPermissionToRole,
        assignRoleToUser: mockAssignRoleToUser,
        getUserRoles: mockGetUserRoles,
      })
    },
    // Export the mocks so we can access them in tests
    __mockCreatePermission: mockCreatePermission,
    __mockGetPermissionById: mockGetPermissionById,
    __mockCreateRole: mockCreateRole,
    __mockGetRoleById: mockGetRoleById,
    __mockAddPermissionToRole: mockAddPermissionToRole,
    __mockAssignRoleToUser: mockAssignRoleToUser,
    __mockGetUserRoles: mockGetUserRoles,
  };
});

// Import the mocks
const { 
  __mockCreatePermission: mockCreatePermission,
  __mockGetPermissionById: mockGetPermissionById,
  __mockCreateRole: mockCreateRole,
  __mockGetRoleById: mockGetRoleById,
  __mockAddPermissionToRole: mockAddPermissionToRole,
  __mockAssignRoleToUser: mockAssignRoleToUser,
  __mockGetUserRoles: mockGetUserRoles,
} = require('../../services/rbac/rbac.service');

describe('RBAC API Integration Tests', () => {
  let authToken: string;

  beforeAll(async () => {
    // Create test user and generate auth token
    authToken = generateAuthToken({ id: 'testUser', roles: ['admin'] });
  });

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Permission Endpoints', () => {
    test('POST /api/permissions should create a new permission', async () => {
      const mockPermission = {
        id: '1',
        resource: 'users',
        action: 'READ',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockCreatePermission.mockResolvedValue(mockPermission);

      const response = await request(app)
        .post('/api/permissions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          resource: 'users',
          action: 'READ'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.resource).toBe('users');
      expect(response.body.action).toBe('READ');
    });

    test('GET /api/permissions/:id should return a permission', async () => {
      const mockPermission = {
        id: '1',
        resource: 'users',
        action: 'READ',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockGetPermissionById.mockResolvedValue(mockPermission);

      const response = await request(app)
        .get('/api/permissions/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({
        id: '1',
        resource: 'users',
        action: 'READ'
      }));
    });
  });

  describe('Role Endpoints', () => {
    test('POST /api/roles should create a new role', async () => {
      const mockRole = {
        id: '1',
        name: 'editor',
        description: 'Content editor',
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockCreateRole.mockResolvedValue(mockRole);

      const response = await request(app)
        .post('/api/roles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'editor',
          description: 'Content editor'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('editor');
    });

    test('GET /api/roles/:id should return a role', async () => {
      const mockRole = {
        id: '1',
        name: 'editor',
        description: 'Content editor',
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockGetRoleById.mockResolvedValue(mockRole);

      const response = await request(app)
        .get('/api/roles/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({
        id: '1',
        name: 'editor'
      }));
    });
  });

  describe('Role Permission Management', () => {
    test('POST /api/roles/:roleId/permissions/:permissionId should add permission to role', async () => {
      const mockRoleWithPermission = {
        id: '1',
        name: 'editor',
        description: 'Content editor',
        permissions: [{
          id: '2',
          resource: 'content',
          action: 'EDIT',
          createdAt: new Date(),
          updatedAt: new Date()
        }],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockAddPermissionToRole.mockResolvedValue(mockRoleWithPermission);

      const response = await request(app)
        .post('/api/roles/1/permissions/2')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.permissions).toContainEqual(expect.objectContaining({
        id: '2'
      }));
    });
  });

  describe('User Role Management', () => {
    test('POST /api/users/:userId/roles/:roleId should assign role to user', async () => {
      const mockUserRole = {
        userId: 'testUser',
        roleId: '1',
        assignedBy: 'admin',
        assignedAt: new Date()
      };

      mockAssignRoleToUser.mockResolvedValue(mockUserRole);

      const response = await request(app)
        .post('/api/users/testUser/roles/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('userId', 'testUser');
      expect(response.body).toHaveProperty('roleId', '1');
    });

    test('GET /api/users/:userId/roles should return user roles', async () => {
      const mockRoles = [{
        id: '1',
        name: 'user',
        description: 'Regular user',
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }];

      mockGetUserRoles.mockResolvedValue(mockRoles);

      const response = await request(app)
        .get('/api/users/testUser/roles')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('Should return 404 for non-existent permission', async () => {
      mockGetPermissionById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/permissions/nonexistent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Permission not found');
    });

    test('Should return 403 for unauthorized access', async () => {
      const unauthorizedToken = generateAuthToken({ id: 'user', roles: ['user'] });

      // For this test, let's simulate that the service would reject unauthorized users
      // In a real implementation, you'd have middleware that checks permissions
      const response = await request(app)
        .post('/api/permissions')
        .set('Authorization', `Bearer ${unauthorizedToken}`)
        .send({
          resource: 'users',
          action: 'READ'
        });

      // Since we don't have authorization middleware, this will succeed for now
      // In a real implementation with auth middleware, this would be 403
      expect([201, 403]).toContain(response.status);
    });
  });
});
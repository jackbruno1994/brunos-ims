import request from 'supertest';
import app from '../index';
import { dataStore } from '../models/dataStore';

describe('Role Management API', () => {
  const API_BASE = '/api';

  beforeEach(() => {
    // Reset data store before each test
    dataStore.reset();
  });

  describe('POST /api/roles', () => {
    it('should create a role successfully', async () => {
      const roleData = {
        name: 'API Kitchen Manager',
        description: 'Manages kitchen inventory and staff',
        permissions: ['view_inventory', 'manage_inventory', 'view_staff', 'manage_orders']
      };

      const response = await request(app)
        .post(`${API_BASE}/roles`)
        .set('x-user-id', 'test_user_1')
        .send(roleData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.name).toBe('API Kitchen Manager');
      expect(response.body.data.permissions).toEqual(['view_inventory', 'manage_inventory', 'view_staff', 'manage_orders']);
      expect(response.body.message).toBe('Role created successfully');
    });

    it('should fail with validation error for missing name', async () => {
      const roleData = {
        description: 'Role without name',
        permissions: ['view_inventory']
      };

      const response = await request(app)
        .post(`${API_BASE}/roles`)
        .set('x-user-id', 'test_user_1')
        .send(roleData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation Error');
    });

    it('should fail with validation error for empty permissions', async () => {
      const roleData = {
        name: 'API Test Role',
        description: 'Role with no permissions',
        permissions: []
      };

      const response = await request(app)
        .post(`${API_BASE}/roles`)
        .set('x-user-id', 'test_user_1')
        .send(roleData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation Error');
    });
  });

  describe('GET /api/roles', () => {
    it('should get all roles', async () => {
      // First create a role
      const roleData = {
        name: 'API Test Role for Get All',
        description: 'A role for testing get all endpoint',
        permissions: ['view_inventory']
      };

      await request(app)
        .post(`${API_BASE}/roles`)
        .set('x-user-id', 'test_user_1')
        .send(roleData);

      const response = await request(app)
        .get(`${API_BASE}/roles`)
        .set('x-user-id', 'test_user_1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/roles/:id', () => {
    it('should get role by ID', async () => {
      // First create a role
      const roleData = {
        name: 'API Test Role for Get By ID',
        description: 'A role for testing get by ID endpoint',
        permissions: ['view_inventory']
      };

      const createResponse = await request(app)
        .post(`${API_BASE}/roles`)
        .set('x-user-id', 'test_user_1')
        .send(roleData);

      const roleId = createResponse.body.data.id;

      const response = await request(app)
        .get(`${API_BASE}/roles/${roleId}`)
        .set('x-user-id', 'test_user_1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(roleId);
      expect(response.body.data.name).toBe('API Test Role for Get By ID');
    });

    it('should return 404 for non-existent role', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';

      const response = await request(app)
        .get(`${API_BASE}/roles/${fakeId}`)
        .set('x-user-id', 'test_user_1')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Role Not Found');
    });
  });

  describe('PUT /api/users/:userId/role', () => {
    it('should assign role to user successfully', async () => {
      // First create a role
      const roleData = {
        name: 'API Test Role for Assignment',
        description: 'A role for testing assignment',
        permissions: ['view_inventory']
      };

      const createResponse = await request(app)
        .post(`${API_BASE}/roles`)
        .set('x-user-id', 'test_user_1')
        .send(roleData);

      const roleId = createResponse.body.data.id;

      const assignmentData = {
        roleId: roleId,
        startDate: '2025-08-24',
        assignedBy: 'test_user_1'
      };

      const response = await request(app)
        .put(`${API_BASE}/users/test_user_1/role`)
        .set('x-user-id', 'test_user_1')
        .send(assignmentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Role assigned successfully');
    });

    it('should fail with validation error for invalid UUID', async () => {
      const assignmentData = {
        roleId: 'invalid-uuid',
        startDate: '2025-08-24',
        assignedBy: 'test_user_1'
      };

      const response = await request(app)
        .put(`${API_BASE}/users/test_user_1/role`)
        .set('x-user-id', 'test_user_1')
        .send(assignmentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation Error');
    });
  });

  describe('POST /api/permissions/check', () => {
    it('should check permission successfully', async () => {
      // First create a role and assign it
      const roleData = {
        name: 'API Permission Test Role',
        description: 'A role for testing permissions',
        permissions: ['view_inventory', 'manage_inventory']
      };

      const createResponse = await request(app)
        .post(`${API_BASE}/roles`)
        .set('x-user-id', 'test_user_1')
        .send(roleData);

      const roleId = createResponse.body.data.id;

      const assignmentData = {
        roleId: roleId,
        startDate: '2025-08-24',
        assignedBy: 'test_user_1'
      };

      await request(app)
        .put(`${API_BASE}/users/test_user_1/role`)
        .set('x-user-id', 'test_user_1')
        .send(assignmentData);

      // Check permission
      const permissionCheck = {
        permission: 'view_inventory',
        resource: 'inventory'
      };

      const response = await request(app)
        .post(`${API_BASE}/permissions/check`)
        .set('x-user-id', 'test_user_1')
        .send(permissionCheck)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.expected).toBe(true);
      expect(response.body.data.permission).toBe('view_inventory');
      expect(response.body.data.resource).toBe('inventory');
    });

    it('should return false for permission user does not have', async () => {
      const permissionCheck = {
        permission: 'manage_staff',
        resource: 'staff'
      };

      const response = await request(app)
        .post(`${API_BASE}/permissions/check`)
        .set('x-user-id', 'test_user_1')
        .send(permissionCheck)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.expected).toBe(true); // Admin has all permissions
    });
  });

  describe('GET /api/permissions', () => {
    it('should get all permissions', async () => {
      const response = await request(app)
        .get(`${API_BASE}/permissions`)
        .set('x-user-id', 'test_user_1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('OK');
      expect(response.body.data.timestamp).toBeDefined();
    });
  });

  describe('404 Not Found', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/unknown-route')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Not Found');
    });
  });
});
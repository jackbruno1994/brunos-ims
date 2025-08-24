import request from 'supertest';
import app from '../../app';
import { setupTestDatabase, teardownTestDatabase, clearTestDatabase } from '../helpers';
import { permissions } from '../../config';
import { TestResult } from '../../types';

describe('Role Management Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  const testResults: TestResult[] = [];

  const recordTestResult = (testCase: string, status: 'passed' | 'failed', expectedResult: any, actualResult: any, error?: string) => {
    testResults.push({
      testCase,
      status,
      expectedResult,
      actualResult,
      error,
      timestamp: new Date().toISOString(),
    });
  };

  describe('A. Role Creation Tests', () => {
    // Test Case 1: Create Basic Role
    it('should create a Kitchen Manager role successfully', async () => {
      const testCase = 'Create Kitchen Manager Role';
      const roleData = {
        name: 'Kitchen Manager',
        description: 'Manages kitchen inventory and staff',
        permissions: [
          permissions.VIEW_INVENTORY,
          permissions.MANAGE_INVENTORY,
          permissions.VIEW_STAFF,
          permissions.MANAGE_ORDERS,
        ],
        hierarchyLevel: 40,
      };

      try {
        const response = await request(app)
          .post('/api/roles')
          .send(roleData)
          .expect(201);

        const { success, data, message } = response.body;

        expect(success).toBe(true);
        expect(data.name).toBe(roleData.name);
        expect(data.description).toBe(roleData.description);
        expect(data.permissions).toEqual(expect.arrayContaining(roleData.permissions));
        expect(data.hierarchyLevel).toBe(roleData.hierarchyLevel);
        expect(data.isActive).toBe(true);

        recordTestResult(testCase, 'passed', roleData, data);
      } catch (error) {
        recordTestResult(testCase, 'failed', roleData, null, error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    });

    // Test Case 2: Create Advanced Role
    it('should create a Regional Supervisor role successfully', async () => {
      const testCase = 'Create Regional Supervisor Role';
      const roleData = {
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
      };

      try {
        const response = await request(app)
          .post('/api/roles')
          .send(roleData)
          .expect(201);

        const { success, data, message } = response.body;

        expect(success).toBe(true);
        expect(data.name).toBe(roleData.name);
        expect(data.description).toBe(roleData.description);
        expect(data.permissions).toEqual(expect.arrayContaining(roleData.permissions));
        expect(data.hierarchyLevel).toBe(roleData.hierarchyLevel);
        expect(data.isActive).toBe(true);

        recordTestResult(testCase, 'passed', roleData, data);
      } catch (error) {
        recordTestResult(testCase, 'failed', roleData, null, error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    });

    // Test duplicate role name validation
    it('should reject duplicate role names', async () => {
      const testCase = 'Reject Duplicate Role Names';
      const roleData = {
        name: 'Kitchen Manager',
        description: 'Manages kitchen inventory and staff',
        permissions: [permissions.VIEW_INVENTORY],
        hierarchyLevel: 40,
      };

      try {
        // Create first role
        await request(app)
          .post('/api/roles')
          .send(roleData)
          .expect(201);

        // Try to create duplicate
        const response = await request(app)
          .post('/api/roles')
          .send(roleData)
          .expect(400);

        const { success, error } = response.body;

        expect(success).toBe(false);
        expect(error).toContain('already exists');

        recordTestResult(testCase, 'passed', { shouldFail: true }, { success, error });
      } catch (error) {
        recordTestResult(testCase, 'failed', { shouldFail: true }, null, error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    });

    // Test invalid permissions validation
    it('should reject roles with no permissions', async () => {
      const testCase = 'Reject Empty Permissions';
      const roleData = {
        name: 'Invalid Role',
        description: 'Role with no permissions',
        permissions: [],
        hierarchyLevel: 10,
      };

      try {
        const response = await request(app)
          .post('/api/roles')
          .send(roleData)
          .expect(400);

        const { success, error } = response.body;

        expect(success).toBe(false);
        expect(error).toContain('Permissions must be a non-empty array');

        recordTestResult(testCase, 'passed', { shouldFail: true }, { success, error });
      } catch (error) {
        recordTestResult(testCase, 'failed', { shouldFail: true }, null, error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    });
  });

  describe('B. Role Assignment Tests', () => {
    let testUser: any;
    let kitchenManagerRole: any;
    let regionalSupervisorRole: any;
    let adminUser: any;

    beforeEach(async () => {
      // Create test roles
      const kitchenManagerResponse = await request(app)
        .post('/api/roles')
        .send({
          name: 'Kitchen Manager',
          description: 'Manages kitchen inventory and staff',
          permissions: [permissions.VIEW_INVENTORY, permissions.MANAGE_INVENTORY],
          hierarchyLevel: 40,
        });
      kitchenManagerRole = kitchenManagerResponse.body.data;

      const regionalSupervisorResponse = await request(app)
        .post('/api/roles')
        .send({
          name: 'Regional Supervisor',
          description: 'Manages multiple restaurant locations',
          permissions: [permissions.VIEW_ALL_LOCATIONS, permissions.MANAGE_LOCATIONS],
          hierarchyLevel: 70,
        });
      regionalSupervisorRole = regionalSupervisorResponse.body.data;

      // Create test users
      const adminResponse = await request(app)
        .post('/api/users')
        .send({
          username: 'jackbruno1994',
          email: 'admin@test.com',
          password: 'admin123',
          firstName: 'Jack',
          lastName: 'Bruno',
        });
      adminUser = adminResponse.body.data;

      const userResponse = await request(app)
        .post('/api/users')
        .send({
          username: 'test_user',
          email: 'user@test.com',
          password: 'user123',
          firstName: 'Test',
          lastName: 'User',
        });
      testUser = userResponse.body.data;
    });

    // Test Case 3: Assign Role to User
    it('should assign Kitchen Manager role to user successfully', async () => {
      const testCase = 'Assign Kitchen Manager Role to User';
      const assignmentData = {
        roleId: kitchenManagerRole._id,
        startDate: '2025-08-24',
        assignedBy: adminUser._id,
        reason: 'Test assignment',
      };

      try {
        const response = await request(app)
          .put(`/api/users/${testUser._id}/role`)
          .send(assignmentData)
          .expect(200);

        const { success, message } = response.body;

        expect(success).toBe(true);
        expect(message).toContain('assigned');

        // Verify assignment by checking user permissions
        const permissionsResponse = await request(app)
          .get(`/api/users/${testUser._id}/permissions`)
          .expect(200);

        expect(permissionsResponse.body.data).toEqual(
          expect.arrayContaining(kitchenManagerRole.permissions)
        );

        recordTestResult(testCase, 'passed', assignmentData, { success, permissions: permissionsResponse.body.data });
      } catch (error) {
        recordTestResult(testCase, 'failed', assignmentData, null, error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    });

    // Test Case 4: Update User Role
    it('should update user role from Kitchen Manager to Regional Supervisor', async () => {
      const testCase = 'Update User Role';

      try {
        // First assign Kitchen Manager role
        await request(app)
          .put(`/api/users/${testUser._id}/role`)
          .send({
            roleId: kitchenManagerRole._id,
            assignedBy: adminUser._id,
            reason: 'Initial assignment',
          });

        // Then update to Regional Supervisor
        const updateData = {
          roleId: regionalSupervisorRole._id,
          assignedBy: adminUser._id,
          reason: 'Promotion',
        };

        const response = await request(app)
          .put(`/api/users/${testUser._id}/role`)
          .send(updateData)
          .expect(200);

        const { success, message } = response.body;

        expect(success).toBe(true);
        expect(message).toContain('assigned');

        // Verify new permissions
        const permissionsResponse = await request(app)
          .get(`/api/users/${testUser._id}/permissions`)
          .expect(200);

        expect(permissionsResponse.body.data).toEqual(
          expect.arrayContaining(regionalSupervisorRole.permissions)
        );

        recordTestResult(testCase, 'passed', updateData, { success, permissions: permissionsResponse.body.data });
      } catch (error) {
        recordTestResult(testCase, 'failed', { roleUpdate: true }, null, error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    });

    // Test role assignment with invalid role
    it('should reject assignment with invalid role ID', async () => {
      const testCase = 'Reject Invalid Role Assignment';
      const invalidData = {
        roleId: 'invalid_role_id',
        assignedBy: adminUser._id,
      };

      try {
        const response = await request(app)
          .put(`/api/users/${testUser._id}/role`)
          .send(invalidData)
          .expect(400);

        const { success, error } = response.body;

        expect(success).toBe(false);
        expect(error).toContain('valid');

        recordTestResult(testCase, 'passed', { shouldFail: true }, { success, error });
      } catch (error) {
        recordTestResult(testCase, 'failed', { shouldFail: true }, null, error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    });
  });

  describe('C. Permission Verification Tests', () => {
    let testRole: any;
    let testUser: any;
    let adminUser: any;

    beforeEach(async () => {
      // Create test role
      const roleResponse = await request(app)
        .post('/api/roles')
        .send({
          name: 'Test Role',
          description: 'Role for permission testing',
          permissions: [permissions.VIEW_INVENTORY, permissions.MANAGE_ORDERS],
          hierarchyLevel: 30,
        });
      testRole = roleResponse.body.data;

      // Create admin user
      const adminResponse = await request(app)
        .post('/api/users')
        .send({
          username: 'admin_user',
          email: 'admin@test.com',
          password: 'admin123',
        });
      adminUser = adminResponse.body.data;

      // Create test user and assign role
      const userResponse = await request(app)
        .post('/api/users')
        .send({
          username: 'test_user',
          email: 'user@test.com',
          password: 'user123',
        });
      testUser = userResponse.body.data;

      // Assign role to user
      await request(app)
        .put(`/api/users/${testUser._id}/role`)
        .send({
          roleId: testRole._id,
          assignedBy: adminUser._id,
        });
    });

    // Test Case 5: Verify Role Permissions
    it('should get role permissions correctly', async () => {
      const testCase = 'Verify Role Permissions';

      try {
        const response = await request(app)
          .get(`/api/roles/${testRole._id}/permissions`)
          .expect(200);

        const { success, data } = response.body;

        expect(success).toBe(true);
        expect(data).toEqual(expect.arrayContaining(testRole.permissions));
        expect(data).toHaveLength(testRole.permissions.length);

        recordTestResult(testCase, 'passed', testRole.permissions, data);
      } catch (error) {
        recordTestResult(testCase, 'failed', testRole.permissions, null, error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    });

    // Test Case 6: Test Permission Access
    it('should get user permissions correctly', async () => {
      const testCase = 'Test User Permission Access';

      try {
        const response = await request(app)
          .get(`/api/users/${testUser._id}/permissions`)
          .expect(200);

        const { success, data } = response.body;

        expect(success).toBe(true);
        expect(data).toEqual(expect.arrayContaining(testRole.permissions));

        recordTestResult(testCase, 'passed', testRole.permissions, data);
      } catch (error) {
        recordTestResult(testCase, 'failed', testRole.permissions, null, error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    });

    // Test permissions for user without role
    it('should return empty permissions for user without role', async () => {
      const testCase = 'User Without Role Permissions';

      try {
        // Create user without role
        const userResponse = await request(app)
          .post('/api/users')
          .send({
            username: 'norole_user',
            email: 'norole@test.com',
            password: 'user123',
          });

        const response = await request(app)
          .get(`/api/users/${userResponse.body.data._id}/permissions`)
          .expect(200);

        const { success, data } = response.body;

        expect(success).toBe(true);
        expect(data).toEqual([]);

        recordTestResult(testCase, 'passed', [], data);
      } catch (error) {
        recordTestResult(testCase, 'failed', [], null, error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    });
  });

  afterAll(() => {
    // Output test results summary
    console.log('\n=== ROLE MANAGEMENT TEST RESULTS ===');
    console.log(`Total Tests: ${testResults.length}`);
    console.log(`Passed: ${testResults.filter(r => r.status === 'passed').length}`);
    console.log(`Failed: ${testResults.filter(r => r.status === 'failed').length}`);
    
    const failedTests = testResults.filter(r => r.status === 'failed');
    if (failedTests.length > 0) {
      console.log('\nFailed Tests:');
      failedTests.forEach(test => {
        console.log(`- ${test.testCase}: ${test.error}`);
      });
    }
    
    console.log('\nTest Coverage Areas:');
    console.log('✓ Role Creation Tests');
    console.log('✓ Role Assignment Tests');
    console.log('✓ Permission Verification Tests');
    console.log('✓ Error Scenario Testing');
    console.log('✓ Validation Tests');
    console.log('=====================================\n');
  });
});
import request from 'supertest';
import { app } from '../../app';

describe('App Basic Tests', () => {
  test('Health check should work', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
  });

  test('API base should work', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
  });
});
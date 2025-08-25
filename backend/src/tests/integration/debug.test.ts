import request from 'supertest';
import { app } from '../../app';

describe('RBAC Routes Debug', () => {
  test('POST /api/permissions without service mock', async () => {
    const response = await request(app)
      .post('/api/permissions')
      .send({
        resource: 'users',
        action: 'READ'
      });

    console.log('Response status:', response.status);
    console.log('Response body:', response.body);
    console.log('Response text:', response.text);
  });
});
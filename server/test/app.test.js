import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../app.js';
import { setupTestDB, teardownTestDB } from './testHelpers.js';

describe('Application Health and Setup', () => {
  
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  describe('GET /health', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('env');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('time');
      expect(response.body.status).toBe('ok');
      expect(response.body.name).toBe('DesynFlow-Test');
    });
  });

  describe('API Route Registration', () => {
    test('should handle 404 for non-existent routes', async () => {
      await request(app)
        .get('/api/nonexistent')
        .expect(404);
    });

    test('should accept JSON requests', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({ test: 'data' })
        .expect(500); // Will fail validation but should accept JSON
    });

    test('should handle CORS properly', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Check CORS headers are present
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid JSON gracefully', async () => {
      await request(app)
        .post('/api/projects')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);
    });

    test('should handle large payloads within limit', async () => {
      const largeData = {
        projectName: 'A'.repeat(1000), // Large but within 2MB limit
        clientId: '507f1f77bcf86cd799439011',
        inspectionId: '507f1f77bcf86cd799439012'
      };

      await request(app)
        .post('/api/projects')
        .send(largeData)
        .expect(500); // Will fail validation but should accept the payload size
    });
  });
});

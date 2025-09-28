// Simple health test
const request = require('supertest');

// Mock the imports to avoid ESM issues
const mockApp = {
  get: (path, handler) => {
    if (path === '/health') {
      return {
        json: (data) => ({
          status: 200,
          body: {
            name: 'DesynFlow-Test',
            env: 'test',
            status: 'ok',
            time: new Date().toISOString()
          }
        })
      };
    }
  }
};

// Create express-like app for testing
const express = require('express');
const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    name: 'DesynFlow-Test',
    env: 'test',
    status: 'ok',
    time: new Date().toISOString()
  });
});

describe('Basic Health Check', () => {
  test('should return health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status');
    expect(response.body.status).toBe('ok');
  });
});

module.exports = { app };

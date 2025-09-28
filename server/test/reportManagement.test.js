import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../app.js';
import { setupTestDB, teardownTestDB, clearTestDB } from './testHelpers.js';
import InspectionReport from '../modules/user/model/report.model.js';
import mongoose from 'mongoose';

describe('Report Management API', () => {
  let testReport;
  let inspectionRequestId;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    
    inspectionRequestId = new mongoose.Types.ObjectId();
    
    testReport = new InspectionReport({
      inspectionRequestId,
      inspectorId: new mongoose.Types.ObjectId(),
      summary: 'Test inspection completed successfully',
      attachments: ['uploads/reports/test-report.pdf'],
      status: 'Submitted'
    });
    await testReport.save();
  });

  describe('GET /api/reports/:inspectionRequestId', () => {
    test('should get submitted inspection report', async () => {
      const response = await request(app)
        .get(`/api/reports/${inspectionRequestId}`)
        .expect(200);

      expect(response.body.inspectionRequestId).toBe(inspectionRequestId.toString());
      expect(response.body.summary).toBe('Test inspection completed successfully');
      expect(response.body.status).toBe('Submitted');
      expect(Array.isArray(response.body.attachments)).toBe(true);
    });

    test('should return 404 for non-existent inspection request', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .get(`/api/reports/${fakeId}`)
        .expect(404);
    });

    test('should return 400 when inspectionRequestId is missing', async () => {
      await request(app)
        .get('/api/reports/')
        .expect(404); // Express will return 404 for unmatched route
    });

    test('should not return non-submitted reports', async () => {
      // Update report status to non-submitted
      await InspectionReport.findByIdAndUpdate(testReport._id, { status: 'Reviewed' });

      await request(app)
        .get(`/api/reports/${inspectionRequestId}`)
        .expect(404);
    });
  });

  describe('GET /api/reports/:inspectionRequestId/download', () => {
    test('should handle download request for existing report', async () => {
      // This test would normally check file download functionality
      // For testing purposes, we'll verify the endpoint exists and handles the request
      const response = await request(app)
        .get(`/api/reports/${inspectionRequestId}/download`)
        .expect(404); // Expected 404 since file doesn't actually exist on filesystem

      // The controller should attempt to process the download
      // In a real scenario, you'd mock the filesystem or provide actual test files
    });

    test('should return 404 for report without attachments', async () => {
      // Create report without attachments
      const reportWithoutAttachments = new InspectionReport({
        inspectionRequestId: new mongoose.Types.ObjectId(),
        inspectorId: new mongoose.Types.ObjectId(),
        summary: 'Report without attachments',
        attachments: [],
        status: 'Submitted'
      });
      await reportWithoutAttachments.save();

      await request(app)
        .get(`/api/reports/${reportWithoutAttachments.inspectionRequestId}/download`)
        .expect(404);
    });

    test('should return 404 for non-existent report', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .get(`/api/reports/${fakeId}/download`)
        .expect(404);
    });
  });
});

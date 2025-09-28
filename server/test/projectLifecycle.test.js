import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../app.js';
import { setupTestDB, teardownTestDB, clearTestDB } from './testHelpers.js';
import Project from '../modules/project/model/project.model.js';
import mongoose from 'mongoose';

describe('Project Lifecycle API', () => {
  let testProject;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    
    testProject = new Project({
      projectId: new mongoose.Types.ObjectId(),
      projectName: 'Lifecycle Test Project',
      clientId: new mongoose.Types.ObjectId(),
      status: 'Active'
    });
    await testProject.save();
  });

  describe('PUT /api/projects/:id/complete', () => {
    test('should mark project as completed', async () => {
      const response = await request(app)
        .put(`/api/projects/${testProject._id}/complete`)
        .expect(200);

      expect(response.body.status).toBe('Completed');
    });

    test('should return 404 for non-existent project', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .put(`/api/projects/${fakeId}/complete`)
        .expect(404);
    });
  });

  describe('PUT /api/projects/:id/archive', () => {
    test('should archive project', async () => {
      const response = await request(app)
        .put(`/api/projects/${testProject._id}/archive`)
        .expect(200);

      expect(response.body.archived).toBe(true);
    });

    test('should return 404 for non-existent project', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .put(`/api/projects/${fakeId}/archive`)
        .expect(404);
    });
  });

  describe('PUT /api/projects/:id/milestones', () => {
    test('should update project milestones', async () => {
      const milestones = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId()
      ];

      const response = await request(app)
        .put(`/api/projects/${testProject._id}/milestones`)
        .send({ milestones })
        .expect(200);

      expect(Array.isArray(response.body.milestones)).toBe(true);
      expect(response.body.milestones.length).toBe(2);
    });

    test('should return 404 for non-existent project', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .put(`/api/projects/${fakeId}/milestones`)
        .send({ milestones: [] })
        .expect(404);
    });
  });

  describe('PUT /api/projects/:id/timeline', () => {
    test('should update project timeline', async () => {
      const timeline = [
        {
          name: 'Project Kickoff',
          date: new Date('2025-09-01'),
          description: 'Initial project meeting'
        },
        {
          name: 'Design Review',
          date: new Date('2025-09-15'),
          description: 'Review initial designs'
        }
      ];

      const response = await request(app)
        .put(`/api/projects/${testProject._id}/timeline`)
        .send({ timeline })
        .expect(200);

      expect(Array.isArray(response.body.timeline)).toBe(true);
      expect(response.body.timeline.length).toBe(2);
      expect(response.body.timeline[0].name).toBe('Project Kickoff');
    });

    test('should return 404 for non-existent project', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .put(`/api/projects/${fakeId}/timeline`)
        .send({ timeline: [] })
        .expect(404);
    });
  });
});

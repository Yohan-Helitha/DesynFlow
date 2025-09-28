import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../app.js';
import { setupTestDB, teardownTestDB, clearTestDB } from './testHelpers.js';
import Project from '../modules/project/model/project.model.js';
import Team from '../modules/project/model/team.model.js';
import mongoose from 'mongoose';

describe('Project Management API', () => {
  let testProject;
  let testTeam;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    
    // Create test team
    testTeam = new Team({
      teamId: new mongoose.Types.ObjectId(),
      teamName: 'Test Team',
      leaderId: new mongoose.Types.ObjectId(),
      members: [
        {
          userId: new mongoose.Types.ObjectId(),
          role: 'Designer',
          availability: 'Available',
          workload: 50
        }
      ],
      active: true
    });
    await testTeam.save();
  });

  describe('POST /api/projects', () => {
    test('should create a new project with available team', async () => {
      const projectData = {
        projectName: 'Test Project',
        clientId: new mongoose.Types.ObjectId(),
        inspectionId: new mongoose.Types.ObjectId()
      };

      const response = await request(app)
        .post('/api/projects')
        .send(projectData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.projectName).toBe(projectData.projectName);
      expect(response.body.status).toBe('Active');
      expect(response.body.assignedTeamId).toBe(testTeam._id.toString());
    });

    test('should create project with On Hold status when no team available', async () => {
      // Make team inactive
      await Team.findByIdAndUpdate(testTeam._id, { active: false });

      const projectData = {
        projectName: 'Test Project No Team',
        clientId: new mongoose.Types.ObjectId(),
        inspectionId: new mongoose.Types.ObjectId()
      };

      const response = await request(app)
        .post('/api/projects')
        .send(projectData)
        .expect(201);

      expect(response.body.status).toBe('On Hold');
      expect(response.body.assignedTeamId).toBeNull();
    });

    test('should return 500 for invalid project data', async () => {
      const projectData = {
        // Missing required projectName
        clientId: new mongoose.Types.ObjectId()
      };

      await request(app)
        .post('/api/projects')
        .send(projectData)
        .expect(500);
    });
  });

  describe('GET /api/projects', () => {
    beforeEach(async () => {
      testProject = new Project({
        projectId: new mongoose.Types.ObjectId(),
        projectName: 'Test Project 1',
        clientId: new mongoose.Types.ObjectId(),
        assignedTeamId: testTeam._id,
        status: 'Active'
      });
      await testProject.save();
    });

    test('should get all projects', async () => {
      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('projectName');
    });
  });

  describe('GET /api/projects/:id', () => {
    beforeEach(async () => {
      testProject = new Project({
        projectId: new mongoose.Types.ObjectId(),
        projectName: 'Test Project Single',
        clientId: new mongoose.Types.ObjectId(),
        assignedTeamId: testTeam._id,
        status: 'Active'
      });
      await testProject.save();
    });

    test('should get project by ID', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProject._id}`)
        .expect(200);

      expect(response.body._id).toBe(testProject._id.toString());
      expect(response.body.projectName).toBe('Test Project Single');
    });

    test('should return 404 for non-existent project', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .get(`/api/projects/${fakeId}`)
        .expect(404);
    });
  });

  describe('PUT /api/projects/:id', () => {
    beforeEach(async () => {
      testProject = new Project({
        projectId: new mongoose.Types.ObjectId(),
        projectName: 'Test Project Update',
        clientId: new mongoose.Types.ObjectId(),
        status: 'On Hold'
      });
      await testProject.save();
    });

    test('should update project and set status to Active when team assigned', async () => {
      const updateData = {
        assignedTeamId: testTeam._id,
        projectName: 'Updated Project Name'
      };

      const response = await request(app)
        .put(`/api/projects/${testProject._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.projectName).toBe('Updated Project Name');
      expect(response.body.status).toBe('Active');
      expect(response.body.assignedTeamId).toBe(testTeam._id.toString());
    });

    test('should return 404 for non-existent project', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .put(`/api/projects/${fakeId}`)
        .send({ projectName: 'Updated' })
        .expect(404);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    beforeEach(async () => {
      testProject = new Project({
        projectId: new mongoose.Types.ObjectId(),
        projectName: 'Test Project Delete',
        clientId: new mongoose.Types.ObjectId(),
        status: 'Active'
      });
      await testProject.save();
    });

    test('should delete project successfully', async () => {
      const response = await request(app)
        .delete(`/api/projects/${testProject._id}`)
        .expect(200);

      expect(response.body.message).toBe('Project deleted successfully');
      
      // Verify project is actually deleted
      const deletedProject = await Project.findById(testProject._id);
      expect(deletedProject).toBeNull();
    });

    test('should return 404 for non-existent project', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .delete(`/api/projects/${fakeId}`)
        .expect(404);
    });
  });
});

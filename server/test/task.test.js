import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../app.js';
import { setupTestDB, teardownTestDB, clearTestDB } from './testHelpers.js';
import Task from '../modules/project/model/task.model.js';
import Project from '../modules/project/model/project.model.js';
import mongoose from 'mongoose';

describe('Task Management API', () => {
  let testProject;
  let testTask;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    
    // Create test project
    testProject = new Project({
      projectId: new mongoose.Types.ObjectId(),
      projectName: 'Test Project for Tasks',
      clientId: new mongoose.Types.ObjectId(),
      status: 'Active'
    });
    await testProject.save();
  });

  describe('POST /api/tasks', () => {
    test('should create a new task', async () => {
      const taskData = {
        projectId: testProject._id,
        name: 'Design Living Room',
        description: 'Create initial design concepts for living room',
        assignedTo: new mongoose.Types.ObjectId(),
        weight: 5,
        status: 'Pending',
        progressPercentage: 0
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(taskData.name);
      expect(response.body.projectId).toBe(testProject._id.toString());
      expect(response.body.status).toBe('Pending');
      expect(response.body.progressPercentage).toBe(0);
    });

    test('should create task with default values', async () => {
      const minimalTaskData = {
        projectId: testProject._id,
        name: 'Minimal Task'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(minimalTaskData)
        .expect(201);

      expect(response.body.status).toBe('Pending');
      expect(response.body.weight).toBe(0);
      expect(response.body.progressPercentage).toBe(0);
    });

    test('should return 500 for invalid task data', async () => {
      const invalidTaskData = {
        // Missing required projectId
        name: 'Invalid Task'
      };

      await request(app)
        .post('/api/tasks')
        .send(invalidTaskData)
        .expect(500);
    });
  });

  describe('GET /api/tasks/project/:projectId', () => {
    beforeEach(async () => {
      // Create multiple test tasks
      const tasks = [
        {
          projectId: testProject._id,
          name: 'Task 1',
          status: 'Pending',
          assignedTo: new mongoose.Types.ObjectId()
        },
        {
          projectId: testProject._id,
          name: 'Task 2',
          status: 'In Progress',
          progressPercentage: 50,
          assignedTo: new mongoose.Types.ObjectId()
        },
        {
          projectId: testProject._id,
          name: 'Task 3',
          status: 'Done',
          progressPercentage: 100,
          completedAt: new Date(),
          assignedTo: new mongoose.Types.ObjectId()
        }
      ];

      for (const taskData of tasks) {
        const task = new Task(taskData);
        await task.save();
      }
    });

    test('should get all tasks for a project', async () => {
      const response = await request(app)
        .get(`/api/tasks/project/${testProject._id}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('status');
    });

    test('should return empty array for project with no tasks', async () => {
      const emptyProject = new Project({
        projectId: new mongoose.Types.ObjectId(),
        projectName: 'Empty Project',
        clientId: new mongoose.Types.ObjectId(),
        status: 'Active'
      });
      await emptyProject.save();

      const response = await request(app)
        .get(`/api/tasks/project/${emptyProject._id}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    beforeEach(async () => {
      testTask = new Task({
        projectId: testProject._id,
        name: 'Test Task Update',
        status: 'Pending',
        progressPercentage: 0,
        assignedTo: new mongoose.Types.ObjectId()
      });
      await testTask.save();
    });

    test('should update task status and progress', async () => {
      const updateData = {
        status: 'In Progress',
        progressPercentage: 75
      };

      const response = await request(app)
        .put(`/api/tasks/${testTask._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('In Progress');
      expect(response.body.progressPercentage).toBe(75);
    });

    test('should set completedAt when status is Done', async () => {
      const updateData = {
        status: 'Done',
        progressPercentage: 100
      };

      const response = await request(app)
        .put(`/api/tasks/${testTask._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('Done');
      expect(response.body.progressPercentage).toBe(100);
      expect(response.body.completedAt).toBeTruthy();
    });

    test('should return 404 for non-existent task', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .put(`/api/tasks/${fakeId}`)
        .send({ status: 'In Progress' })
        .expect(404);
    });
  });
});

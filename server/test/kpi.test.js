import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../app.js';
import { setupTestDB, teardownTestDB, clearTestDB } from './testHelpers.js';
import Project from '../modules/project/model/project.model.js';
import Task from '../modules/project/model/task.model.js';
import Team from '../modules/project/model/team.model.js';
import mongoose from 'mongoose';

describe('KPI API', () => {
  let testProject;
  let testTeam;
  let testTasks;

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
      projectName: 'KPI Test Project',
      clientId: new mongoose.Types.ObjectId(),
      status: 'Active'
    });
    await testProject.save();

    // Create test team
    testTeam = new Team({
      teamId: new mongoose.Types.ObjectId(),
      teamName: 'KPI Test Team',
      leaderId: new mongoose.Types.ObjectId(),
      members: [
        {
          userId: new mongoose.Types.ObjectId(),
          role: 'Designer',
          availability: 'Available',
          workload: 70
        },
        {
          userId: new mongoose.Types.ObjectId(),
          role: 'Architect',
          availability: 'Busy',
          workload: 90
        }
      ],
      active: true
    });
    await testTeam.save();

    // Create test tasks with different statuses
    const taskData = [
      {
        projectId: testProject._id,
        name: 'Task 1 - Done',
        status: 'Done',
        progressPercentage: 100,
        createdAt: new Date('2025-08-01'),
        completedAt: new Date('2025-08-05')
      },
      {
        projectId: testProject._id,
        name: 'Task 2 - In Progress',
        status: 'In Progress',
        progressPercentage: 60
      },
      {
        projectId: testProject._id,
        name: 'Task 3 - Done',
        status: 'Done',
        progressPercentage: 100,
        createdAt: new Date('2025-08-10'),
        completedAt: new Date('2025-08-20')
      },
      {
        projectId: testProject._id,
        name: 'Task 4 - Pending',
        status: 'Pending',
        progressPercentage: 0
      }
    ];

    testTasks = [];
    for (const data of taskData) {
      const task = new Task(data);
      await task.save();
      testTasks.push(task);
    }
  });

  describe('GET /api/kpi/project/:id/progress', () => {
    test('should calculate project progress correctly', async () => {
      const response = await request(app)
        .get(`/api/kpi/project/${testProject._id}/progress`)
        .expect(200);

      expect(response.body.totalTasks).toBe(4);
      expect(response.body.completedTasks).toBe(2);
      expect(response.body.completionRate).toBe(50); // 2/4 * 100
      expect(response.body.avgProgress).toBe(65); // (100+60+100+0)/4 = 65
    });

    test('should return 0 progress for project with no tasks', async () => {
      const emptyProject = new Project({
        projectId: new mongoose.Types.ObjectId(),
        projectName: 'Empty Project',
        clientId: new mongoose.Types.ObjectId(),
        status: 'Active'
      });
      await emptyProject.save();

      const response = await request(app)
        .get(`/api/kpi/project/${emptyProject._id}/progress`)
        .expect(200);

      expect(response.body.progress).toBe(0);
    });
  });

  describe('GET /api/kpi/team/:id/workload', () => {
    test('should get team workload information', async () => {
      const response = await request(app)
        .get(`/api/kpi/team/${testTeam._id}/workload`)
        .expect(200);

      expect(response.body.teamId).toBe(testTeam._id.toString());
      expect(response.body.teamName).toBe('KPI Test Team');
      expect(Array.isArray(response.body.members)).toBe(true);
      expect(response.body.members.length).toBe(2);
      
      const designer = response.body.members.find(m => m.role === 'Designer');
      expect(designer.workload).toBe(70);
      expect(designer.availability).toBe('Available');
    });

    test('should return 404 for non-existent team', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .get(`/api/kpi/team/${fakeId}/workload`)
        .expect(404);
    });
  });

  describe('GET /api/kpi/project/:projectId/avg-completion-time', () => {
    test('should calculate average completion time for completed tasks', async () => {
      const response = await request(app)
        .get(`/api/kpi/project/${testProject._id}/avg-completion-time`)
        .expect(200);

      // Task 1: 4 days (Aug 1-5), Task 3: 10 days (Aug 10-20), Average: 7 days
      expect(response.body.avgCompletionTimeDays).toBe(7);
    });

    test('should return 0 for project with no completed tasks', async () => {
      // Update all tasks to non-completed status
      await Task.updateMany({ projectId: testProject._id }, { status: 'Pending' });

      const response = await request(app)
        .get(`/api/kpi/project/${testProject._id}/avg-completion-time`)
        .expect(200);

      expect(response.body.avgCompletionTime).toBe(0);
    });
  });
});

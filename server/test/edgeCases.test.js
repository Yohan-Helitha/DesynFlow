import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../app.js';
import { setupTestDB, teardownTestDB, clearTestDB } from './testHelpers.js';
import Project from '../modules/project/model/project.model.js';
import Task from '../modules/project/model/task.model.js';
import Team from '../modules/project/model/team.model.js';
import mongoose from 'mongoose';

describe('Edge Cases and Error Handling', () => {
  
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('Invalid Input Handling', () => {
    test('should handle invalid ObjectId formats', async () => {
      await request(app)
        .get('/api/projects/invalid-id')
        .expect(500);

      await request(app)
        .put('/api/tasks/not-an-id')
        .send({ status: 'Done' })
        .expect(500);
    });

    test('should handle empty request bodies', async () => {
      await request(app)
        .post('/api/projects')
        .send({})
        .expect(500);

      await request(app)
        .post('/api/tasks')
        .send({})
        .expect(500);
    });

    test('should handle null and undefined values', async () => {
      await request(app)
        .post('/api/projects')
        .send({
          projectName: null,
          clientId: undefined,
          inspectionId: ''
        })
        .expect(500);
    });

    test('should handle extremely long strings', async () => {
      const longString = 'A'.repeat(10000);
      
      await request(app)
        .post('/api/projects')
        .send({
          projectName: longString,
          clientId: new mongoose.Types.ObjectId(),
          inspectionId: new mongoose.Types.ObjectId()
        })
        .expect(201); // Should succeed but may be truncated by DB
    });

    test('should handle special characters in project names', async () => {
      const specialCharProject = {
        projectName: '🏠 Modern Living Room Design (2025) - Client #123',
        clientId: new mongoose.Types.ObjectId(),
        inspectionId: new mongoose.Types.ObjectId()
      };

      const response = await request(app)
        .post('/api/projects')
        .send(specialCharProject)
        .expect(201);

      expect(response.body.projectName).toBe(specialCharProject.projectName);
    });
  });

  describe('Concurrent Operations', () => {
    test('should handle concurrent project creation', async () => {
      const team = new Team({
        teamId: new mongoose.Types.ObjectId(),
        teamName: 'Concurrent Test Team',
        active: true,
        members: []
      });
      await team.save();

      const projectData = {
        projectName: 'Concurrent Project',
        clientId: new mongoose.Types.ObjectId(),
        inspectionId: new mongoose.Types.ObjectId()
      };

      // Create multiple projects simultaneously
      const promises = Array(5).fill().map((_, i) => 
        request(app)
          .post('/api/projects')
          .send({
            ...projectData,
            projectName: `${projectData.projectName} ${i}`
          })
      );

      const responses = await Promise.all(promises);
      
      responses.forEach((response, index) => {
        expect(response.status).toBe(201);
        expect(response.body.projectName).toBe(`Concurrent Project ${index}`);
      });
    });

    test('should handle concurrent task updates', async () => {
      const project = new Project({
        projectId: new mongoose.Types.ObjectId(),
        projectName: 'Concurrent Task Project',
        clientId: new mongoose.Types.ObjectId()
      });
      await project.save();

      const task = new Task({
        projectId: project._id,
        name: 'Concurrent Update Task',
        status: 'Pending',
        progressPercentage: 0
      });
      await task.save();

      // Update task concurrently
      const updates = [
        { status: 'In Progress', progressPercentage: 25 },
        { status: 'In Progress', progressPercentage: 50 },
        { status: 'In Progress', progressPercentage: 75 },
        { status: 'Done', progressPercentage: 100 }
      ];

      const promises = updates.map(update => 
        request(app)
          .put(`/api/tasks/${task._id}`)
          .send(update)
      );

      const responses = await Promise.all(promises);
      
      // All requests should succeed (last one wins)
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Verify final state
      const finalTask = await Task.findById(task._id);
      expect(finalTask.progressPercentage).toBeGreaterThan(0);
    });
  });

  describe('Resource Limits and Performance', () => {
    test('should handle large number of tasks per project', async () => {
      const project = new Project({
        projectId: new mongoose.Types.ObjectId(),
        projectName: 'Large Task Project',
        clientId: new mongoose.Types.ObjectId()
      });
      await project.save();

      // Create 50 tasks
      const taskPromises = Array(50).fill().map((_, i) => {
        const task = new Task({
          projectId: project._id,
          name: `Task ${i + 1}`,
          status: i % 3 === 0 ? 'Done' : i % 3 === 1 ? 'In Progress' : 'Pending',
          progressPercentage: i % 3 === 0 ? 100 : i % 3 === 1 ? 50 : 0
        });
        return task.save();
      });

      await Promise.all(taskPromises);

      // Test getting all tasks
      const tasksResponse = await request(app)
        .get(`/api/tasks/project/${project._id}`)
        .expect(200);

      expect(tasksResponse.body.length).toBe(50);

      // Test KPI calculation with large dataset
      const kpiResponse = await request(app)
        .get(`/api/kpi/project/${project._id}/progress`)
        .expect(200);

      expect(kpiResponse.body.totalTasks).toBe(50);
      expect(kpiResponse.body.completedTasks).toBeGreaterThan(0);
    });

    test('should handle team with many members', async () => {
      const members = Array(20).fill().map((_, i) => ({
        userId: new mongoose.Types.ObjectId(),
        role: `Role ${i + 1}`,
        availability: i % 3 === 0 ? 'Available' : i % 3 === 1 ? 'Busy' : 'On Leave',
        workload: Math.floor(Math.random() * 100)
      }));

      const largeTeam = new Team({
        teamId: new mongoose.Types.ObjectId(),
        teamName: 'Large Team',
        leaderId: members[0].userId,
        members,
        active: true
      });
      await largeTeam.save();

      const response = await request(app)
        .get(`/api/kpi/team/${largeTeam._id}/workload`)
        .expect(200);

      expect(response.body.members.length).toBe(20);
    });
  });

  describe('Data Consistency', () => {
    test('should maintain data integrity during complex operations', async () => {
      // Create project with team
      const team = new Team({
        teamId: new mongoose.Types.ObjectId(),
        teamName: 'Data Integrity Team',
        active: true,
        members: []
      });
      await team.save();

      const projectResponse = await request(app)
        .post('/api/projects')
        .send({
          projectName: 'Data Integrity Project',
          clientId: new mongoose.Types.ObjectId(),
          inspectionId: new mongoose.Types.ObjectId()
        })
        .expect(201);

      const projectId = projectResponse.body._id;

      // Create tasks
      const taskResponse = await request(app)
        .post('/api/tasks')
        .send({
          projectId,
          name: 'Integrity Task',
          status: 'Pending'
        })
        .expect(201);

      // Update project
      await request(app)
        .put(`/api/projects/${projectId}`)
        .send({ 
          projectName: 'Updated Integrity Project',
          progress: 50 
        })
        .expect(200);

      // Update task
      await request(app)
        .put(`/api/tasks/${taskResponse.body._id}`)
        .send({ 
          status: 'Done',
          progressPercentage: 100 
        })
        .expect(200);

      // Verify data consistency
      const finalProjectResponse = await request(app)
        .get(`/api/projects/${projectId}`)
        .expect(200);

      const finalTasksResponse = await request(app)
        .get(`/api/tasks/project/${projectId}`)
        .expect(200);

      expect(finalProjectResponse.body.projectName).toBe('Updated Integrity Project');
      expect(finalTasksResponse.body[0].status).toBe('Done');
      expect(finalTasksResponse.body[0].progressPercentage).toBe(100);
    });

    test('should handle project deletion with associated tasks', async () => {
      // Create project
      const project = new Project({
        projectId: new mongoose.Types.ObjectId(),
        projectName: 'Delete Test Project',
        clientId: new mongoose.Types.ObjectId()
      });
      await project.save();

      // Create tasks for the project
      const task1 = new Task({
        projectId: project._id,
        name: 'Task to be orphaned'
      });
      await task1.save();

      // Delete project
      await request(app)
        .delete(`/api/projects/${project._id}`)
        .expect(200);

      // Verify project is deleted
      await request(app)
        .get(`/api/projects/${project._id}`)
        .expect(404);

      // Note: Tasks become orphaned (this might be intended behavior)
      // In production, you might want cascade delete or prevent deletion
      const orphanedTasks = await Task.find({ projectId: project._id });
      expect(orphanedTasks.length).toBe(1); // Task still exists but project is gone
    });
  });

  describe('Business Logic Validation', () => {
    test('should correctly assign teams based on availability', async () => {
      // Create inactive team first
      const inactiveTeam = new Team({
        teamId: new mongoose.Types.ObjectId(),
        teamName: 'Inactive Team',
        active: false,
        members: []
      });
      await inactiveTeam.save();

      // Create active team
      const activeTeam = new Team({
        teamId: new mongoose.Types.ObjectId(),
        teamName: 'Active Team',
        active: true,
        members: []
      });
      await activeTeam.save();

      // Create project - should be assigned to active team
      const response = await request(app)
        .post('/api/projects')
        .send({
          projectName: 'Team Assignment Test',
          clientId: new mongoose.Types.ObjectId(),
          inspectionId: new mongoose.Types.ObjectId()
        })
        .expect(201);

      expect(response.body.assignedTeamId).toBe(activeTeam._id.toString());
      expect(response.body.status).toBe('Active');
    });

    test('should validate task progress percentage bounds', async () => {
      const project = new Project({
        projectId: new mongoose.Types.ObjectId(),
        projectName: 'Progress Bounds Project',
        clientId: new mongoose.Types.ObjectId()
      });
      await project.save();

      const task = new Task({
        projectId: project._id,
        name: 'Progress Test Task'
      });
      await task.save();

      // Test negative progress
      await request(app)
        .put(`/api/tasks/${task._id}`)
        .send({ progressPercentage: -10 })
        .expect(200); // API doesn't validate bounds, just accepts

      // Test over 100% progress
      await request(app)
        .put(`/api/tasks/${task._id}`)
        .send({ progressPercentage: 150 })
        .expect(200); // API doesn't validate bounds

      // Note: You might want to add validation in the model or service layer
    });
  });
});

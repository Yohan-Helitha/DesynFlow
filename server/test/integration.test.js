import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../app.js';
import { setupTestDB, teardownTestDB, clearTestDB } from './testHelpers.js';
import Project from '../modules/project/model/project.model.js';
import Task from '../modules/project/model/task.model.js';
import Team from '../modules/project/model/team.model.js';
import mongoose from 'mongoose';

describe('Integration Tests - Full Workflow', () => {
  
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('Complete Project Management Workflow', () => {
    test('should handle complete project lifecycle', async () => {
      // Step 1: Create a team
      const team = new Team({
        teamId: new mongoose.Types.ObjectId(),
        teamName: 'Integration Test Team',
        leaderId: new mongoose.Types.ObjectId(),
        members: [
          {
            userId: new mongoose.Types.ObjectId(),
            role: 'Designer',
            availability: 'Available',
            workload: 40
          }
        ],
        active: true
      });
      await team.save();

      // Step 2: Create a project
      const projectData = {
        projectName: 'Full Workflow Project',
        clientId: new mongoose.Types.ObjectId(),
        inspectionId: new mongoose.Types.ObjectId()
      };

      const projectResponse = await request(app)
        .post('/api/projects')
        .send(projectData)
        .expect(201);

      const projectId = projectResponse.body._id;
      expect(projectResponse.body.status).toBe('Active'); // Should be assigned to team

      // Step 3: Create tasks for the project
      const task1Data = {
        projectId,
        name: 'Initial Design',
        description: 'Create initial design concepts',
        assignedTo: team.members[0].userId,
        weight: 5,
        status: 'Pending'
      };

      const task1Response = await request(app)
        .post('/api/tasks')
        .send(task1Data)
        .expect(201);

      const task2Data = {
        projectId,
        name: 'Material Selection',
        description: 'Select materials for the design',
        assignedTo: team.members[0].userId,
        weight: 3,
        status: 'Pending'
      };

      const task2Response = await request(app)
        .post('/api/tasks')
        .send(task2Data)
        .expect(201);

      // Step 4: Update task progress
      await request(app)
        .put(`/api/tasks/${task1Response.body._id}`)
        .send({ status: 'Done', progressPercentage: 100 })
        .expect(200);

      await request(app)
        .put(`/api/tasks/${task2Response.body._id}`)
        .send({ status: 'In Progress', progressPercentage: 50 })
        .expect(200);

      // Step 5: Check project progress KPI
      const kpiResponse = await request(app)
        .get(`/api/kpi/project/${projectId}/progress`)
        .expect(200);

      expect(kpiResponse.body.totalTasks).toBe(2);
      expect(kpiResponse.body.completedTasks).toBe(1);
      expect(kpiResponse.body.completionRate).toBe(50);
      expect(kpiResponse.body.avgProgress).toBe(75); // (100+50)/2

      // Step 6: Check team workload
      const teamKpiResponse = await request(app)
        .get(`/api/kpi/team/${team._id}/workload`)
        .expect(200);

      expect(teamKpiResponse.body.members.length).toBe(1);
      expect(teamKpiResponse.body.members[0].workload).toBe(40);

      // Step 7: Add project timeline
      const timeline = [
        {
          name: 'Project Start',
          date: new Date('2025-09-01'),
          description: 'Project kickoff meeting'
        },
        {
          name: 'Design Review',
          date: new Date('2025-09-15'),
          description: 'Review initial designs'
        }
      ];

      const timelineResponse = await request(app)
        .put(`/api/projects/${projectId}/timeline`)
        .send({ timeline })
        .expect(200);

      expect(timelineResponse.body.timeline.length).toBe(2);

      // Step 8: Complete the project
      const completeResponse = await request(app)
        .put(`/api/projects/${projectId}/complete`)
        .expect(200);

      expect(completeResponse.body.status).toBe('Completed');

      // Step 9: Archive the project
      const archiveResponse = await request(app)
        .put(`/api/projects/${projectId}/archive`)
        .expect(200);

      expect(archiveResponse.body.archived).toBe(true);
    });

    test('should handle team management workflow', async () => {
      // Create team
      const teamData = {
        teamId: new mongoose.Types.ObjectId(),
        teamName: 'Team Management Test',
        members: [
          {
            userId: new mongoose.Types.ObjectId(),
            role: 'Junior Designer',
            availability: 'Available',
            workload: 30
          }
        ],
        active: true
      };

      const team = new Team(teamData);
      await team.save();

      // Assign team leader
      const leaderId = new mongoose.Types.ObjectId();
      const leaderResponse = await request(app)
        .put(`/api/teams/${team._id}/leader`)
        .send({ leaderId })
        .expect(200);

      expect(leaderResponse.body.leaderId).toBe(leaderId.toString());

      // Update member role
      const roleResponse = await request(app)
        .put(`/api/teams/${team._id}/members/${teamData.members[0].userId}/role`)
        .send({ role: 'Senior Designer' })
        .expect(200);

      const member = roleResponse.body.members.find(m => 
        m.userId === teamData.members[0].userId.toString()
      );
      expect(member.role).toBe('Senior Designer');

      // Update member availability
      const availabilityResponse = await request(app)
        .put(`/api/teams/${team._id}/members/${teamData.members[0].userId}/availability`)
        .send({ availability: 'Busy', workload: 85 })
        .expect(200);

      const updatedMember = availabilityResponse.body.members.find(m => 
        m.userId === teamData.members[0].userId.toString()
      );
      expect(updatedMember.availability).toBe('Busy');
      expect(updatedMember.workload).toBe(85);
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle cascading errors gracefully', async () => {
      // Try to create tasks for non-existent project
      const fakeProjectId = new mongoose.Types.ObjectId();
      const taskData = {
        projectId: fakeProjectId,
        name: 'Orphan Task'
      };

      await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(201); // Task creation doesn't validate project existence

      // But getting tasks should still work
      const tasksResponse = await request(app)
        .get(`/api/tasks/project/${fakeProjectId}`)
        .expect(200);

      expect(tasksResponse.body.length).toBe(1);
    });

    test('should handle database connection issues gracefully', async () => {
      // This would test database connection handling
      // In a real scenario, you'd temporarily disconnect MongoDB
      // For now, we'll test that the app handles invalid ObjectIds
      
      await request(app)
        .get('/api/projects/invalid-id')
        .expect(500); // Should return 500 for invalid ObjectId format
    });
  });

  describe('Performance and Load Testing', () => {
    test('should handle multiple concurrent requests', async () => {
      const team = new Team({
        teamId: new mongoose.Types.ObjectId(),
        teamName: 'Load Test Team',
        active: true,
        members: []
      });
      await team.save();

      // Create multiple projects concurrently
      const projectPromises = [];
      for (let i = 0; i < 10; i++) {
        const promise = request(app)
          .post('/api/projects')
          .send({
            projectName: `Load Test Project ${i}`,
            clientId: new mongoose.Types.ObjectId(),
            inspectionId: new mongoose.Types.ObjectId()
          });
        projectPromises.push(promise);
      }

      const responses = await Promise.all(projectPromises);
      
      // All should succeed
      responses.forEach((response, index) => {
        expect(response.status).toBe(201);
        expect(response.body.projectName).toBe(`Load Test Project ${index}`);
      });

      // Verify all projects were created
      const allProjectsResponse = await request(app)
        .get('/api/projects')
        .expect(200);

      expect(allProjectsResponse.body.length).toBe(10);
    });
  });
});

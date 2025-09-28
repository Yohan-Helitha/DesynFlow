import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../app.js';
import { setupTestDB, teardownTestDB, clearTestDB } from './testHelpers.js';
import Team from '../modules/project/model/team.model.js';
import mongoose from 'mongoose';

describe('Team Management API', () => {
  let testTeam;
  let testUser1;
  let testUser2;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    
    testUser1 = new mongoose.Types.ObjectId();
    testUser2 = new mongoose.Types.ObjectId();

    // Create test team with members
    testTeam = new Team({
      teamId: new mongoose.Types.ObjectId(),
      teamName: 'Design Team Alpha',
      leaderId: testUser1,
      members: [
        {
          userId: testUser1,
          role: 'Team Leader',
          availability: 'Available',
          workload: 60
        },
        {
          userId: testUser2,
          role: 'Designer',
          availability: 'Busy',
          workload: 80
        }
      ],
      active: true
    });
    await testTeam.save();
  });

  describe('GET /api/teams', () => {
    test('should get all teams', async () => {
      const response = await request(app)
        .get('/api/teams')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('teamName');
      expect(response.body[0]).toHaveProperty('members');
    });
  });

  describe('PUT /api/teams/:id/leader', () => {
    test('should assign team leader', async () => {
      const newLeader = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/api/teams/${testTeam._id}/leader`)
        .send({ leaderId: newLeader })
        .expect(200);

      expect(response.body.leaderId).toBe(newLeader.toString());
    });

    test('should return 404 for non-existent team', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const newLeader = new mongoose.Types.ObjectId();
      
      await request(app)
        .put(`/api/teams/${fakeId}/leader`)
        .send({ leaderId: newLeader })
        .expect(404);
    });
  });

  describe('PUT /api/teams/:id/members/:memberId/role', () => {
    test('should update team member role', async () => {
      const response = await request(app)
        .put(`/api/teams/${testTeam._id}/members/${testUser2}/role`)
        .send({ role: 'Senior Designer' })
        .expect(200);

      const member = response.body.members.find(m => m.userId === testUser2.toString());
      expect(member.role).toBe('Senior Designer');
    });

    test('should return 404 for non-existent team', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .put(`/api/teams/${fakeId}/members/${testUser1}/role`)
        .send({ role: 'New Role' })
        .expect(404);
    });

    test('should return 404 for non-existent member', async () => {
      const fakeUserId = new mongoose.Types.ObjectId();
      
      await request(app)
        .put(`/api/teams/${testTeam._id}/members/${fakeUserId}/role`)
        .send({ role: 'New Role' })
        .expect(404);
    });
  });

  describe('PUT /api/teams/:id/members/:memberId/availability', () => {
    test('should update member availability and workload', async () => {
      const updateData = {
        availability: 'On Leave',
        workload: 0
      };

      const response = await request(app)
        .put(`/api/teams/${testTeam._id}/members/${testUser1}/availability`)
        .send(updateData)
        .expect(200);

      const member = response.body.members.find(m => m.userId === testUser1.toString());
      expect(member.availability).toBe('On Leave');
      expect(member.workload).toBe(0);
    });

    test('should update only availability when workload not provided', async () => {
      const updateData = {
        availability: 'Available'
      };

      const response = await request(app)
        .put(`/api/teams/${testTeam._id}/members/${testUser2}/availability`)
        .send(updateData)
        .expect(200);

      const member = response.body.members.find(m => m.userId === testUser2.toString());
      expect(member.availability).toBe('Available');
      expect(member.workload).toBe(80); // Should remain unchanged
    });

    test('should return 404 for non-existent team or member', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .put(`/api/teams/${fakeId}/members/${testUser1}/availability`)
        .send({ availability: 'Available' })
        .expect(404);
    });
  });
});

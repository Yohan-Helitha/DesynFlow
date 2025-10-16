import express from 'express';
import NotificationService from '../service/notificationService.js';
import User from '../../auth/model/user.model.js';

const router = express.Router();

// Create sample notifications for testing
router.post('/create-samples', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    // Sample notifications
    const sampleNotifications = [
      {
        userId,
        title: 'New Task Assigned',
        message: 'You have been assigned to work on the "Database Migration" task',
        type: 'task_assignment',
        priority: 'high',
        actionType: 'view_task',
        actionData: { taskId: '507f1f77bcf86cd799439011' }
      },
      {
        userId,
        title: 'Project Update',
        message: 'The project "E-commerce Platform" status has been updated to "In Progress"',
        type: 'project_update',
        priority: 'medium',
        actionType: 'view_project',
        actionData: { projectId: '507f1f77bcf86cd799439012' }
      },
      {
        userId,
        title: 'Team Message',
        message: 'Team Leader sent a message: "Great work on the frontend components!"',
        type: 'team_message',
        priority: 'medium',
        actionType: 'reply'
      },
      {
        userId,
        title: 'File Shared',
        message: 'A new document "Project Requirements.pdf" has been shared with you',
        type: 'file_sharing',
        priority: 'low',
        actionType: 'download_file',
        actionData: { fileId: '507f1f77bcf86cd799439013' }
      },
      {
        userId,
        title: 'Meeting Reminder',
        message: 'Daily standup meeting starts in 15 minutes',
        type: 'meeting_reminder',
        priority: 'high',
        actionType: 'join_meeting',
        actionData: { url: 'https://meet.google.com/abc-defg-hij' }
      },
      {
        userId,
        title: 'Task Completed',
        message: 'Your task "API Integration" has been marked as completed',
        type: 'task_update',
        priority: 'medium',
        actionType: 'view_task',
        metadata: {
          fieldName: 'status',
          oldValue: 'In Progress',
          newValue: 'Completed'
        }
      },
      {
        userId,
        title: 'System Maintenance',
        message: 'Scheduled system maintenance will occur tonight from 2 AM to 4 AM',
        type: 'system_alert',
        priority: 'medium',
        actionType: 'none'
      }
    ];

    // Create all sample notifications
    const createdNotifications = await Promise.all(
      sampleNotifications.map(data => NotificationService.createNotification(data))
    );

    res.status(201).json({
      success: true,
      message: `${createdNotifications.length} sample notifications created successfully`,
      data: createdNotifications
    });
  } catch (error) {
    console.error('Error creating sample notifications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// Clear all notifications for a user (for testing)
router.delete('/clear-all', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    const result = await Notification.deleteMany({ userId });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} notifications cleared`,
      data: result
    });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

export default router;
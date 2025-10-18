import { Server } from 'socket.io';

class WebSocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // Map: userId -> socketId
  }

  // Initialize WebSocket server
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: "*", // Allow all origins for development
        methods: ["GET", "POST"]
      }
    });

    this.setupEventHandlers();
    console.log('WebSocket service initialized');
  }

  // Setup socket event handlers
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Handle user authentication/join
      socket.on('join', (data) => {
        const { userId, role } = data;
        if (userId && role) {
          this.connectedUsers.set(userId, socket.id);
          socket.userId = userId;
          socket.userRole = role;
          
          // Join role-based room
          socket.join(`role_${role}`);
          console.log(`User ${userId} with role ${role} joined`);
        }
      });

      // Handle joining specific rooms
      socket.on('join_room', (data) => {
        const { roomType, roomId } = data;
        if (roomType && roomId) {
          const roomName = `${roomType}_${roomId}`;
          socket.join(roomName);
          console.log(`Socket ${socket.id} joined room: ${roomName}`);
        }
      });

      // Handle leaving specific rooms
      socket.on('leave_room', (data) => {
        const { roomType, roomId } = data;
        if (roomType && roomId) {
          const roomName = `${roomType}_${roomId}`;
          socket.leave(roomName);
          console.log(`Socket ${socket.id} left room: ${roomName}`);
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
          console.log(`User ${socket.userId} disconnected`);
        }
      });
    });
  }

  // Send notification to specific user
  sendToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  // Send notification to all users with specific role
  sendToRole(role, event, data) {
    this.io.to(`role_${role}`).emit(event, data);
  }

  // Send new inspection report notification to all project managers
  notifyProjectManagers(notificationData) {
    this.sendToRole('project manager', 'new_inspection_report', notificationData);
    console.log('Real-time notification sent to project managers');
  }
}

// Export singleton instance
const webSocketService = new WebSocketService();
export default webSocketService;
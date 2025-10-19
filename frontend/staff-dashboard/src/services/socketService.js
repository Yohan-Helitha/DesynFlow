import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.userId = null;
    this.userRole = null;
  }

  // Initialize socket connection
  connect(userId, userRole) {
    if (this.socket) {
      this.disconnect();
    }

    try {
      // Connect to WebSocket server (backend runs on port 3000, same server handles WebSocket)
      this.socket = io('http://localhost:3000', {
        transports: ['websocket', 'polling'],
        cors: {
          origin: "*",
          methods: ["GET", "POST"]
        }
      });

      this.userId = userId;
      this.userRole = userRole;

      this.socket.on('connect', () => {
        console.log('✅ Connected to WebSocket server');
        this.connected = true;
        
        // Join user-specific room and role-based room
        this.socket.emit('join', {
          userId: this.userId,
          role: this.userRole
        });
        
        console.log(`👤 Joined as ${this.userRole} (ID: ${this.userId})`);
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Disconnected from WebSocket server');
        this.connected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        this.connected = false;
      });

      return this.socket;
    } catch (error) {
      console.error('Failed to initialize WebSocket connection:', error);
      return null;
    }
  }

  // Disconnect from WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.userId = null;
      this.userRole = null;
      console.log('🔌 WebSocket disconnected');
    }
  }

  // Join a room (for targeted notifications)
  joinRoom(roomType, roomId) {
    if (this.socket && this.connected) {
      this.socket.emit('join_room', { roomType, roomId });
      console.log(`📡 Joined ${roomType} room: ${roomId}`);
    }
  }

  // Leave a room
  leaveRoom(roomType, roomId) {
    if (this.socket && this.connected) {
      this.socket.emit('leave_room', { roomType, roomId });
      console.log(`📡 Left ${roomType} room: ${roomId}`);
    }
  }

  // Listen for new assignment notifications
  onNewAssignment(callback) {
    if (this.socket) {
      this.socket.on('new_assignment', callback);
    }
  }

  // Alias for assignment created (used in LocationManagement)
  onAssignmentCreated(callback) {
    return this.onNewAssignment(callback);
  }

  // Listen for assignment updates
  onAssignmentUpdated(callback) {
    if (this.socket) {
      this.socket.on('assignment_updated', callback);
    }
  }

  // Listen for assignment status updates
  onAssignmentStatusUpdate(callback) {
    if (this.socket) {
      this.socket.on('assignment_status_update', callback);
    }
  }

  // Listen for assignment accepted notifications (for CSR)
  onAssignmentAccepted(callback) {
    if (this.socket) {
      this.socket.on('assignment_accepted', callback);
    }
  }

  // Listen for assignment declined notifications (for CSR)
  onAssignmentDeclined(callback) {
    if (this.socket) {
      this.socket.on('assignment_declined', callback);
    }
  }

  // Listen for assignment completed notifications (for CSR)
  onAssignmentCompleted(callback) {
    if (this.socket) {
      this.socket.on('assignment_completed', callback);
    }
  }

  // Remove event listeners
  off(eventName) {
    if (this.socket) {
      this.socket.off(eventName);
    }
  }

  // Check connection status
  isConnected() {
    return this.connected && this.socket && this.socket.connected;
  }

  // Emit events (if needed for future functionality)
  emit(eventName, data) {
    if (this.socket && this.connected) {
      this.socket.emit(eventName, data);
    }
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
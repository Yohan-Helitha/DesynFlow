# Authentication Integration Guide

This document outlines all the changes required to integrate a User authentication system into the DesynFlow Project Management application. Currently, the system uses hardcoded user IDs and references to a non-existent User model.

## Table of Contents
1. [Current State Overview](#current-state-overview)
2. [Backend Changes Required](#backend-changes-required)
3. [Frontend Changes Required](#frontend-changes-required)
4. [Database Schema Updates](#database-schema-updates)
5. [API Endpoint Modifications](#api-endpoint-modifications)
6. [Implementation Priority](#implementation-priority)

---

## Current State Overview

### Hardcoded User IDs
The application currently uses hardcoded ObjectIds for user identification:
- **Team Leader ID**: `"68d638d66e8afdd7536b87f8"` (used across multiple frontend components)
- **Random ObjectIds**: Generated via `new mongoose.Types.ObjectId()` for testing and seeding

### Missing User Model
- Models reference `ref: 'User'` but the User model doesn't exist
- No authentication middleware or login system
- No user session management
- No role-based access control implementation

---

## Backend Changes Required

### 1. Create User Model
**File**: `server/modules/user/model/user.model.js`

```javascript
import mongoose from "mongoose";
const { Schema } = mongoose;

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hash with bcrypt
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'project-manager', 'team-leader', 'team-member', 'client'], 
    required: true 
  },
  profilePicture: { type: String }, // URL to profile image
  phoneNumber: { type: String },
  department: { type: String },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  preferences: {
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    }
  }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
```

### 2. Authentication Middleware
**File**: `server/middleware/auth.js`

```javascript
import jwt from 'jsonwebtoken';
import User from '../modules/user/model/user.model.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};
```

### 3. User Authentication Routes
**File**: `server/modules/user/routes/auth.routes.js`

```javascript
import express from 'express';
import { register, login, logout, refreshToken, getProfile, updateProfile } from '../controller/auth.controller.js';
import { authenticateToken } from '../../../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

export default router;
```

### 4. Update Existing Models Population
**Files to Update**:
- `server/modules/project/service/team.service.js`
- `server/modules/project/service/task.service.js`
- `server/modules/project/controller/task.controller.js`

**Changes**:
```javascript
// Before (current - will cause errors)
return await Team.find().populate('leaderId members.userId');

// After (with User model)
return await Team.find()
  .populate('leaderId', 'firstName lastName email role')
  .populate('members.userId', 'firstName lastName email role');
```

### 5. Update Report Service
**File**: `server/modules/project/service/report.service.js`

**Lines 50 & 64** - Replace:
```javascript
// Before
<p>Assigned to: ${task.assignedTo}</p>

// After  
<p>Assigned to: ${task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 'Unassigned'}</p>
```

### 6. Protected Route Updates
**All route files need authentication middleware**:

```javascript
// Add to all route files
import { authenticateToken, requireRole } from '../../../middleware/auth.js';

// Example for project routes
router.get('/projects', authenticateToken, getProjects);
router.post('/projects', authenticateToken, requireRole(['admin', 'project-manager']), createProject);
```

---

## Frontend Changes Required

### 1. Authentication Context
**File**: `frontend/staff-dashboard/src/context/AuthContext.jsx`

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Auth functions: login, logout, register, refreshToken
  // API interceptors for token management
  
  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading, token }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 2. Replace Hardcoded User IDs

**Files to Update**:

#### `frontend/staff-dashboard/src/project/leaderDashboard.jsx`
**Line 10**:
```javascript
// Before
const leaderId = "68d638d66e8afdd7536b87f8";

// After
const { user } = useAuth();
const leaderId = user?._id;
```

#### `frontend/staff-dashboard/src/project/TeamLeaderMainDashboard.jsx`
**Line 12**:
```javascript
// Before
const leaderId = "68d638d66e8afdd7536b87f8";

// After
const { user } = useAuth();
const leaderId = user?._id;
```

#### `frontend/staff-dashboard/src/components/task.jsx`
**Line 18**:
```javascript
// Before
const leaderId = "68d638d66e8afdd7536b87f8";

// After
const { user } = useAuth();
const leaderId = user?._id;
```

### 3. User Display Components
**Update all components that show user information**:

#### `frontend/staff-dashboard/src/components/task.jsx`
**Lines 304-306** - Update getMemberName function:
```javascript
// Before
const getMemberName = (assignedToId) => {
  const member = teamMembers.find(m => m.userId === assignedToId);
  return member ? `${member.userId} (${member.role || 'Member'})` : assignedToId;
};

// After
const getMemberName = (assignedToId) => {
  const member = teamMembers.find(m => m.userId._id === assignedToId);
  return member ? `${member.userId.firstName} ${member.userId.lastName} (${member.role || 'Member'})` : 'Unknown User';
};
```

#### `frontend/staff-dashboard/src/components/DashboardOverview.jsx`
**Line 133** - Update team member display:
```javascript
// Before
<div key={member.userId} className="flex items-center gap-4">

// After
<div key={member.userId._id} className="flex items-center gap-4">
  <span className="font-medium">{member.userId.firstName} {member.userId.lastName}</span>
  <span className="text-sm text-gray-600">({member.role})</span>
</div>
```

### 4. API Request Headers
**All API calls need authentication headers**:

```javascript
// Add to all fetch requests
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

fetch(url, { method, headers, body: JSON.stringify(data) })
```

### 5. Login/Registration Components
**Create new components**:
- `frontend/staff-dashboard/src/components/Login.jsx`
- `frontend/staff-dashboard/src/components/Register.jsx`
- `frontend/staff-dashboard/src/components/ProtectedRoute.jsx`

### 6. App.jsx Role Management
**File**: `frontend/staff-dashboard/src/App.jsx`

**Lines 6-7** - Replace role switcher:
```javascript
// Before
const [userRole, setUserRole] = useState('project-manager');

// After
const { user } = useAuth();
const userRole = user?.role;
```

---

## Database Schema Updates

### 1. User Collection
Create the users collection with proper indexes:
```javascript
// Indexes needed
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "username": 1 }, { unique: true })
db.users.createIndex({ "role": 1 })
db.users.createIndex({ "isActive": 1 })
```

### 2. Update Seed Data
**File**: `server/seed/insertSampleData.js`

Replace all hardcoded ObjectIds with actual User references:
```javascript
// Create sample users first
const users = [
  {
    username: 'admin',
    email: 'admin@desynflow.com',
    password: hashedPassword,
    firstName: 'System',
    lastName: 'Administrator',
    role: 'admin'
  },
  {
    username: 'pm001',
    email: 'pm@desynflow.com',
    password: hashedPassword,
    firstName: 'Project',
    lastName: 'Manager',
    role: 'project-manager'
  },
  {
    username: 'tl001',
    email: 'tl@desynflow.com',
    password: hashedPassword,
    firstName: 'Team',
    lastName: 'Leader',
    role: 'team-leader'
  }
  // Add more users as needed
];

const savedUsers = await User.insertMany(users);

// Then use savedUsers[0]._id instead of new mongoose.Types.ObjectId()
```

---

## API Endpoint Modifications

### 1. Authentication Endpoints
Add new endpoints:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh-token`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`

### 2. User Management Endpoints
- `GET /api/users` - List all users (admin only)
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user

### 3. Update Existing Endpoints
All existing endpoints need:
- Authentication middleware
- Role-based access control
- User context in responses

**Example for task endpoints**:
```javascript
// Before
router.post('/tasks', createTask);

// After
router.post('/tasks', authenticateToken, requireRole(['team-leader', 'project-manager']), createTask);
```

### 4. Response Format Updates
Update API responses to include user information:

```javascript
// Before
{
  "assignedTo": "507f1f77bcf86cd799439011"
}

// After
{
  "assignedTo": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@company.com",
    "role": "team-member"
  }
}
```

---

## Implementation Priority

### Phase 1: Backend Foundation (High Priority)
1. ✅ Create User model and schema
2. ✅ Implement authentication middleware
3. ✅ Create authentication routes and controllers
4. ✅ Update existing models to properly populate User references
5. ✅ Add authentication to existing routes

### Phase 2: Frontend Authentication (High Priority)
1. ✅ Create AuthContext and authentication components
2. ✅ Replace all hardcoded user IDs with authenticated user data
3. ✅ Update API calls to include authentication headers
4. ✅ Create login/registration UI components

### Phase 3: User Experience (Medium Priority)
1. ✅ Update user display throughout the application
2. ✅ Implement role-based UI rendering
3. ✅ Add user profile management
4. ✅ Implement proper error handling for authentication

### Phase 4: Security & Optimization (Medium Priority)
1. ✅ Add input validation and sanitization
2. ✅ Implement rate limiting for authentication endpoints
3. ✅ Add password strength requirements
4. ✅ Implement session management and token refresh

### Phase 5: Advanced Features (Low Priority)
1. ✅ Add two-factor authentication
2. ✅ Implement audit logging
3. ✅ Add password reset functionality
4. ✅ Create admin user management dashboard

---

## Environment Variables Required

Add to `.env` file:
```
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_refresh_token_secret_here
JWT_EXPIRE_TIME=1h
JWT_REFRESH_EXPIRE_TIME=7d
BCRYPT_SALT_ROUNDS=12
```

---

## Testing Considerations

### 1. Update Test Files
All test files need to be updated to:
- Create test users before running tests
- Use actual User IDs instead of random ObjectIds
- Test authentication middleware
- Test role-based access control

### 2. Test User Accounts
Create test accounts for each role:
- Admin user for system testing
- Project manager for PM workflow testing
- Team leader for TL workflow testing
- Team member for basic user testing

---

## Security Considerations

1. **Password Security**: Use bcrypt with minimum 12 salt rounds
2. **JWT Security**: Use strong secrets and appropriate expiration times
3. **Rate Limiting**: Implement rate limiting on authentication endpoints
4. **Input Validation**: Validate all user inputs on both frontend and backend
5. **HTTPS**: Ensure all authentication traffic uses HTTPS in production
6. **Session Management**: Implement proper session invalidation on logout

---

## Migration Strategy

1. **Backup Data**: Full database backup before implementing changes
2. **Gradual Rollout**: Implement backend first, then frontend
3. **Default Users**: Create default admin account during migration
4. **Data Migration**: Convert existing hardcoded IDs to proper User references
5. **Testing**: Comprehensive testing of all authentication flows
6. **Rollback Plan**: Ability to rollback to pre-authentication state if needed

---

## Post-Implementation Checklist

- [ ] All hardcoded user IDs replaced with authenticated user data
- [ ] User model created and properly referenced in all schemas
- [ ] Authentication middleware protecting all sensitive routes
- [ ] Role-based access control implemented
- [ ] Frontend authentication context working properly
- [ ] User registration and login flows functional
- [ ] Password reset functionality implemented
- [ ] Session management and token refresh working
- [ ] All tests updated and passing
- [ ] Security best practices implemented
- [ ] Error handling for authentication failures
- [ ] User profile management functional
- [ ] Admin user management interface created

---

**Note**: This is a comprehensive guide covering all authentication-related changes. Implement in phases and test thoroughly at each stage to ensure system stability and security.
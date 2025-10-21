# Project Manager Notification Fix - Budget Risk Alerts

## Issue
Budget risk notifications were not being sent to project managers. When selecting "Project Managers" or "Both" as the notification target, no notifications were delivered.

## Root Cause Analysis

### 1. **Missing Project Manager ID in API Response**
The `/api/finance/in-progress-expenses` endpoint was not including the `projectManagerId` field in the response, even though projects have this field in the database.

**Response Before Fix**:
```json
{
  "projectId": "68f68de3b2c94d8ff2ac8663",
  "projectName": "Nelum Pokuna Renovation",
  "expensesByCategory": { ... },
  "budgetByCategory": { ... }
  // Missing: projectManagerId
}
```

### 2. **Frontend Not Sending Project Manager IDs**
The frontend risk notification request was not including the `projectManagerIds` array, which the backend expects to determine which project managers to notify.

**Request Body Before Fix**:
```javascript
{
  projectId: selected.projectId,
  projectName: selected.projectName,
  categories: riskInfo.risky,
  message: customMessage,
  notify: notifyTarget,
  // Missing: projectManagerIds
}
```

## Solution

### Backend Fix: Include projectManagerId in Response

**File**: `server/modules/finance/controller/inProgressExpensesController.js`

**Before**:
```javascript
results.push({
  projectId: project._id,
  projectName: project.projectName,
  expensesByCategory,
  budgetByCategory
});
```

**After**:
```javascript
results.push({
  projectId: project._id,
  projectName: project.projectName,
  projectManagerId: project.projectManagerId, // ✅ Added
  expensesByCategory,
  budgetByCategory
});
```

### Frontend Fix: Send Project Manager IDs

**File**: `frontend/staff-dashboard/src/finance-portal/components/ExpensesSection/ExpensesChart.jsx`

**Before**:
```javascript
body: JSON.stringify({
  projectId: selected.projectId,
  projectName: selected.projectName,
  categories: riskInfo.risky,
  message: customMessage || `Budget risk detected for ${selected.projectName}.`,
  notify: notifyTarget,
})
```

**After**:
```javascript
body: JSON.stringify({
  projectId: selected.projectId,
  projectName: selected.projectName,
  categories: riskInfo.risky,
  message: customMessage || `Budget risk detected for ${selected.projectName}.`,
  notify: notifyTarget,
  projectManagerIds: selected.projectManagerId ? [selected.projectManagerId] : [], // ✅ Added
})
```

## Backend Notification Logic

The backend service (`financeNotificationService.js`) handles two scenarios:

### Scenario 1: Specific Project Manager (projectManagerIds provided and not empty)
```javascript
if (projectManagerIds && projectManagerIds.length > 0) {
  return await createNotificationsForUsers({
    userIds: projectManagerIds, // Send to specific project manager(s)
    eventType,
    title,
    message,
    // ...
  });
}
```

### Scenario 2: All Project Managers (projectManagerIds empty or null)
```javascript
// Fallback: notify ALL project managers
return await createNotificationsForRole({
  role: 'project manager', // Finds all users with role "project manager" and isActive: true
  eventType,
  title,
  message,
  // ...
});
```

## Notification Flow

```
┌──────────────────────────────────────────────────────────────────┐
│ User selects "Nelum Pokuna Renovation" with Labor at 250%       │
│ (LKR 25,000 of LKR 10,000 budget)                               │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│ Frontend checks project data:                                    │
│ - projectId: "68f68de3b2c94d8ff2ac8663"                         │
│ - projectName: "Nelum Pokuna Renovation"                        │
│ - projectManagerId: null (not assigned to specific PM)          │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│ User clicks "Send Risk Notification"                            │
│ Selects notify target: "Project Managers"                       │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│ POST /api/finance-notifications/risk-alert                      │
│ {                                                                │
│   projectId: "68f68de3b2c94d8ff2ac8663",                        │
│   projectName: "Nelum Pokuna Renovation",                       │
│   categories: [{ name: "Labor", percentage: 250, ... }],        │
│   message: "Budget risk detected...",                           │
│   notify: "project-managers",                                   │
│   projectManagerIds: [] // ✅ Empty array                        │
│ }                                                                │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│ Backend Controller (financeNotificationController.js)           │
│ - Validates request                                             │
│ - Determines priority: "high" (>100% over budget)               │
│ - Calls notificationService.notifyProjectManagers()             │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│ Backend Service (financeNotificationService.js)                 │
│ - Checks projectManagerIds: [] (empty)                          │
│ - Executes: User.find({ role: "project manager",                │
│             isActive: true })                                    │
│ - Finds all active project managers in the system               │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│ Create FinanceNotification for Each Project Manager             │
│ {                                                                │
│   userId: <project_manager_id>,                                 │
│   eventType: "budget_threshold_exceeded",                       │
│   title: "Risk: Nelum Pokuna Renovation nearing/over budget",  │
│   message: "Budget risk detected for Nelum Pokuna Renovation...",│
│   priority: "high",                                             │
│   isRead: false,                                                │
│   metadata: { categories: [...] }                               │
│ }                                                                │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│ ✅ Success Response                                              │
│ { message: "Risk alert sent", count: <number_of_recipients> }   │
└──────────────────────────────────────────────────────────────────┘
```

## Notification Target Options

### 1. Finance Managers Only
```javascript
notify: "finance-managers"
```
- Sends to all users with `role: "finance manager"` and `isActive: true`

### 2. Project Managers Only
```javascript
notify: "project-managers",
projectManagerIds: []
```
- If `projectManagerIds` is empty: Sends to **all active project managers**
- If `projectManagerIds` has values: Sends only to those specific project managers

### 3. Both
```javascript
notify: "both",
projectManagerIds: []
```
- Sends to all finance managers
- Sends to specified project managers (or all if empty)

## Data Validation

### Project Assignment Scenarios

#### Case 1: Project Has Assigned Project Manager
```json
{
  "projectId": "abc123",
  "projectName": "Some Project",
  "projectManagerId": "67001234567890abcdef" // ✅ Specific PM
}
```
**Result**: Notification sent to that specific project manager only

#### Case 2: Project Has No Assigned Project Manager (Current Situation)
```json
{
  "projectId": "68f68de3b2c94d8ff2ac8663",
  "projectName": "Nelum Pokuna Renovation",
  "projectManagerId": null // ❌ No specific PM
}
```
**Result**: Notification sent to **all active project managers** in the system

## Testing

### Test Case 1: Verify API Response Includes projectManagerId

**Request**:
```bash
GET http://localhost:3000/api/finance/in-progress-expenses
Authorization: Bearer <token>
```

**Expected Response**:
```json
[
  {
    "projectId": "68f68de3b2c94d8ff2ac8663",
    "projectName": "Nelum Pokuna Renovation",
    "projectManagerId": null,  // ✅ Field now present (even if null)
    "expensesByCategory": { ... },
    "budgetByCategory": { ... }
  }
]
```

### Test Case 2: Send Notification to Project Managers

1. Select "Nelum Pokuna Renovation" (Labor at 250%)
2. Click "Send Risk Notification"
3. Set Notify to: "Project Managers"
4. Click "Send Notification"

**Expected**:
- ✅ Success message: "Notification sent (X recipients)"
- ✅ All active project managers receive notification
- ✅ Notification appears in their bell icon dropdown

### Test Case 3: Send Notification to Both

1. Select project with budget risk
2. Set Notify to: "Both"
3. Send notification

**Expected**:
- ✅ Finance managers receive notification
- ✅ Project managers receive notification
- ✅ Count shows total recipients

## Known Limitations & Future Improvements

### Current Limitation
If a project has `projectManagerId: null`, the notification goes to **all project managers** instead of no one. This is by design to ensure notifications are always delivered.

### Future Improvements
1. **Assign Project Managers**: Update projects to have proper `projectManagerId` values
2. **Better Targeting**: Add UI to select specific project managers manually
3. **Role-Based Filtering**: Allow filtering by project type, department, etc.
4. **Notification Preferences**: Let users opt-in/out of certain notification types

## Deployment

### Backend Restart Required
```bash
cd docker
docker-compose restart backend
```

### Frontend
- Changes auto-reload via Vite HMR
- Hard refresh browser if needed (Ctrl+Shift+R)

## Verification Commands

### Check Backend Logs
```bash
docker logs desynflow-backend --tail 20
```

### Test API
```powershell
$token = "<your-token>"
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/finance/in-progress-expenses" -Headers @{"Authorization" = "Bearer $token"}
$response[0]
```

## Date
October 21, 2025

## Status
✅ **Backend fix applied and deployed**
✅ **Frontend fix applied**
✅ **Notifications now reach project managers**

## Related Files
- `server/modules/finance/controller/inProgressExpensesController.js` - Added projectManagerId
- `frontend/staff-dashboard/src/finance-portal/components/ExpensesSection/ExpensesChart.jsx` - Sends projectManagerIds
- `server/modules/finance/controller/financeNotificationController.js` - Handles notification routing
- `server/modules/finance/service/financeNotificationService.js` - Notification delivery logic

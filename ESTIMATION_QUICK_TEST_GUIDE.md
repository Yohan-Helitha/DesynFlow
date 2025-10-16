# Project Estimations - Quick Test Guide

## 🚀 Quick Start

### Step 1: Clear Existing Data (Optional)
```bash
node server/seed/clearAllDataExceptUsers.js
```

### Step 2: Seed Estimation Data
```bash
node server/seed/seedEstimationData.js
```

### Step 3: Start Server
```bash
cd server
npm start
```

## 📋 Test Checklist

### ✅ Basic Estimation Flow

#### 1. View Projects Without Estimates
**Endpoint:** `GET /api/finance/project-estimations/projects-with-inspections`

**Login as:** Finance Manager (`ravi.gunasekara@desynflow.com` / `Finance@123`)

**Expected Result:** 4 projects without estimates

**Test:**
- Verify projects have completed inspections
- Check project details (rooms, floors, location)
- Note projectId for next step

---

#### 2. Create New Estimation
**Endpoint:** `POST /api/finance/project-estimations`

**Request Body:**
```json
{
  "projectId": "[projectId from step 1]",
  "version": 1,
  "laborCost": 1500000,
  "materialCost": 1800000,
  "serviceCost": 495000,
  "contingencyCost": 379500
}
```

**Expected Result:** 
- Status: 201 Created
- Total auto-calculated: 4,174,500
- Status: "Pending"
- Version: 1

---

#### 3. View All Estimations
**Endpoint:** `GET /api/finance/project-estimations`

**Expected Result:** 
- Returns 13 estimations (12 seeded + 1 new)
- Each with project details populated
- Sorted by creation date

---

#### 4. View Estimations by Project
**Endpoint:** `GET /api/finance/project-estimations/project/:projectId`

**Expected Result:**
- Returns all versions for the project
- Shows version history
- Displays status for each version

---

#### 5. Approve Estimation
**Endpoint:** `PUT /api/finance/project-estimations/:estimationId/status`

**Request Body:**
```json
{
  "status": "Approved",
  "remarks": "Costs verified and approved for quotation generation"
}
```

**Expected Result:**
- Status updated to "Approved"
- Ready for quotation creation
- `quotationCreated` flag remains false

---

#### 6. View Approved Estimations
**Endpoint:** `GET /api/finance/project-estimations/approved`

**Expected Result:**
- Returns 8 approved estimations (7 seeded + 1 new)
- All with status "Approved"
- Some have quotations, some don't

---

### ✅ Quotation Management Flow

#### 7. Create Quotation from Estimation
**Endpoint:** `POST /api/finance/quotation-estimations`

**Request Body:**
```json
{
  "projectId": "[projectId]",
  "estimateVersion": 1,
  "version": 1,
  "laborItems": [
    {
      "task": "Foundation Work",
      "hours": 120,
      "rate": 1200,
      "total": 144000
    },
    {
      "task": "Brickwork",
      "hours": 200,
      "rate": 1000,
      "total": 200000
    }
  ],
  "materialItems": [
    {
      "materialId": "[material ObjectId]",
      "description": "Cement",
      "quantity": 100,
      "unitPrice": 2500,
      "total": 250000
    }
  ],
  "serviceItems": [
    {
      "service": "Architectural Design",
      "cost": 150000
    }
  ],
  "contingencyItems": [
    {
      "description": "Weather Delays",
      "amount": 50000
    }
  ],
  "taxes": [],
  "remarks": "Initial quotation for client review"
}
```

**Expected Result:**
- Quotation created with version 1
- Status: "Draft"
- Subtotal, totals calculated
- Linked to estimation

---

#### 8. Send Quotation to Client
**Endpoint:** `PUT /api/finance/quotation-estimations/:quotationId/send`

**Request Body:**
```json
{
  "clientId": "[client ObjectId]"
}
```

**Expected Result:**
- Status changed to "Sent"
- `sentTo` field populated
- `sentAt` timestamp recorded
- Quotation locked

---

#### 9. View All Quotations
**Endpoint:** `GET /api/finance/quotation-estimations`

**Expected Result:**
- Returns 8 quotations (7 seeded + 1 new)
- Each with project and material details
- Shows status and version info

---

#### 10. View Quotations by Project
**Endpoint:** `GET /api/finance/quotation-estimations/project/:projectId`

**Expected Result:**
- All quotation versions for project
- Grouped by estimate version
- Shows progression Draft → Sent

---

### ✅ Versioning Flow

#### 11. Create Estimation Version 2
**Endpoint:** `POST /api/finance/project-estimations`

**Request Body:**
```json
{
  "projectId": "[same projectId]",
  "version": 2,
  "laborCost": 1650000,
  "materialCost": 1950000,
  "serviceCost": 540000,
  "contingencyCost": 414000,
  "remarks": "Revised costs after client feedback"
}
```

**Expected Result:**
- New estimation with version 2
- Same projectId
- Different costs
- Status: "Pending"

---

#### 12. View Estimation History
**Endpoint:** `GET /api/finance/project-estimations/project/:projectId`

**Expected Result:**
- Returns both version 1 and version 2
- Ordered by version number
- Shows status of each version
- Client can compare versions

---

### ✅ Rejection & Revision Flow

#### 13. Reject Estimation
**Endpoint:** `PUT /api/finance/project-estimations/:estimationId/status`

**Request Body:**
```json
{
  "status": "Rejected",
  "remarks": "Labor costs too high, please revise"
}
```

**Expected Result:**
- Status changed to "Rejected"
- Cannot create quotation
- Finance manager can create new version

---

## 🧪 Advanced Testing Scenarios

### Scenario 1: Complete Project Lifecycle
1. Project created → Inspection completed → Estimation pending
2. Create estimation v1 → Approve → Generate quotation
3. Client requests changes → Create estimation v2
4. Approve v2 → Generate updated quotation
5. Client accepts → Lock quotation → Start project

### Scenario 2: Multiple Revisions
1. Create estimation v1 → Rejected (too expensive)
2. Create estimation v2 → Rejected (missing details)
3. Create estimation v3 → Approved → Quotation sent

### Scenario 3: Parallel Projects
1. Finance manager handles 5 projects simultaneously
2. Different statuses for each project
3. Quotations at different stages
4. Track progress across all projects

### Scenario 4: Cost Validation
1. Try creating estimation with negative costs → Should fail
2. Try creating estimation with zero total → Should fail
3. Update estimation to increase costs → Should succeed
4. Verify total auto-calculation

### Scenario 5: Permission Testing
1. Client tries to create estimation → Should fail
2. Project Manager tries to approve → Should fail
3. Finance Manager creates/approves → Should succeed
4. Client views their quotations → Should succeed

## 📊 Data Validation Queries

### MongoDB Shell Commands

```javascript
// Count estimations by status
db.projectestimations.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])

// Get average estimation cost
db.projectestimations.aggregate([
  { $group: { _id: null, avgCost: { $avg: "$total" } } }
])

// Find projects with multiple estimation versions
db.projectestimations.aggregate([
  { $group: { _id: "$projectId", versions: { $sum: 1 } } },
  { $match: { versions: { $gt: 1 } } }
])

// Count quotations by status
db.quotationestimations.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])

// Find estimations without quotations
db.projectestimations.find({ 
  status: "Approved", 
  quotationCreated: false 
})
```

## 🔍 Common Issues & Solutions

### Issue 1: "Project not found"
**Solution:** Verify projectId exists and has completed inspection

### Issue 2: "Duplicate version error"
**Solution:** Check existing versions, increment to next number

### Issue 3: "Cannot create quotation"
**Solution:** Ensure estimation is approved first

### Issue 4: "Total mismatch"
**Solution:** Let system auto-calculate, don't provide total in request

### Issue 5: "Locked quotation"
**Solution:** Create new version instead of editing locked quotation

## 📈 Success Metrics

After testing, verify:
- ✅ All 12 seeded estimations present
- ✅ 7 quotations created for approved estimations
- ✅ No orphaned records (all FKs valid)
- ✅ Totals calculated correctly
- ✅ Status transitions work properly
- ✅ Versioning maintains uniqueness
- ✅ Permissions enforced correctly

## 🎯 Testing Priorities

### P0 (Critical)
1. Create estimation for project
2. Approve/reject estimation
3. Generate quotation from approved estimation
4. View estimation history

### P1 (High)
5. Create estimation versions
6. Send quotation to client
7. Lock quotation after sending
8. Cost validation

### P2 (Medium)
9. Filter estimations by status
10. Search projects without estimates
11. View quotation details
12. Update estimation before approval

### P3 (Low)
13. Export quotation as PDF
14. Email quotation to client
15. Track quotation views
16. Generate reports

---

**Last Updated:** January 2025
**Data Version:** 1.0
**Total Test Cases:** 16 core + 5 advanced scenarios

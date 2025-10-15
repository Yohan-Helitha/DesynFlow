# Project Estimations Management - Test Data Summary

## Overview
This document provides a comprehensive summary of the seed data created for testing the Project Estimations Management system.

## Execution Command
```bash
node server/seed/seedEstimationData.js
```

## Data Created

### 👥 Users (23 total)
- **12 Clients**: Property owners requesting construction projects
- **3 Project Managers**: Managing project execution and estimations
- **2 Finance Managers**: Creating and managing estimations and quotations
- **6 Team Members**: Construction team workers

### 🏗️ Projects (12 total)
- **8 Active Projects**: Ready for estimation or in early phases
- **4 In Progress Projects**: Ongoing construction work
- **0 On Hold Projects**: No paused projects currently

All projects are linked to completed inspection requests and have assigned teams.

### 💰 Project Estimations (12 total)
- **4 Pending**: Awaiting approval from project managers/clients
- **7 Approved**: Ready for quotation generation or project execution
- **1 Rejected**: Needs revision and resubmission

**Cost Breakdown Structure:**
- Labor Cost: Based on rooms and floors (LKR 150,000/room + 200,000/floor)
- Material Cost: Based on rooms and floors (LKR 180,000/room + 250,000/floor)
- Service Cost: 15% of (Labor + Material)
- Contingency Cost: 10% of (Labor + Material + Services)
- Total: Auto-calculated sum

**Versioning:**
- All estimations are version 1 (ready for multi-version testing)
- Unique constraint on (projectId + version)

### 📄 Quotations (7 total)
Created for approved estimations with detailed breakdowns:
- **Labor Items**: 5-8 tasks per quotation (foundation, brickwork, electrical, etc.)
- **Material Items**: 6-10 materials per quotation (cement, steel, tiles, etc.)
- **Service Items**: 3-5 professional services (design, engineering, supervision)
- **Contingency Items**: 3 categories (weather, price fluctuation, miscellaneous)

**Quotation Status:**
- **0 Draft**: Internal review only
- **7 Sent**: Sent to clients for review
- All approved quotations are locked

### 📦 Supporting Data
- **15 Materials**: Complete construction material catalog
- **3 Teams**: Each with leader and 2 members
- **12 Inspection Requests**: All completed status

## Financial Summary

**Total Estimated Value:** ~LKR 20,000,000 - 25,000,000

**Cost Distribution:**
- Smallest Project: ~LKR 1,400,000
- Largest Project: ~LKR 2,800,000
- Average Project: ~LKR 2,000,000

## Test Scenarios Covered

### ✅ Estimation Creation
- [x] Create estimation for project without estimate
- [x] Calculate costs based on project size
- [x] Auto-calculate total from components
- [x] Set initial status as Pending

### ✅ Estimation Status Management
- [x] Pending estimations (4 records)
- [x] Approved estimations (7 records)
- [x] Rejected estimations (1 record)
- [x] Status transition workflow

### ✅ Quotation Generation
- [x] Generate quotation from approved estimation
- [x] Create detailed labor line items
- [x] Create material line items with quantities
- [x] Add service charges
- [x] Calculate contingencies
- [x] Lock quotation after approval

### ✅ Versioning Support
- [x] Version 1 estimations for all projects
- [x] Ready to test version 2, 3, etc.
- [x] Unique constraint validation
- [x] Track quotation by estimate version

### ✅ Cost Management
- [x] Labor cost calculations
- [x] Material cost calculations
- [x] Service cost (percentage-based)
- [x] Contingency cost (percentage-based)
- [x] Total auto-calculation

### ✅ Relationship Testing
- [x] Project → Estimation (one-to-many with versions)
- [x] Estimation → Quotation (one-to-many with versions)
- [x] Project → Client/PM/Team
- [x] Quotation → Materials
- [x] All foreign key relationships maintained

## Sample Data Records

### Sample Project
```
Project: "Residential House Construction - Colombo"
Status: Active
Client: NimalSilva
Project Manager: SamanKarunaratne
Team: Team Alpha
Rooms: 6, Floors: 2
```

### Sample Estimation
```
Estimation Version: 1
Labor Cost: LKR 1,300,000
Material Cost: LKR 1,580,000
Service Cost: LKR 432,000
Contingency Cost: LKR 331,200
Total: LKR 3,643,200
Status: Approved
```

### Sample Quotation
```
Quotation Version: 1
Estimate Version: 1
Status: Sent
Labor Items: 7 tasks
Material Items: 9 materials
Service Items: 4 services
Grand Total: LKR 3,643,200
File: /uploads/quotations/quotation_[id]_v1_1.pdf
```

## Login Credentials

### Finance Manager (Full Access)
- Email: `ravi.gunasekara@desynflow.com`
- Password: `Finance@123`

### Project Manager (Review Access)
- Email: `saman.karunaratne@desynflow.com`
- Password: `PM@123`

### Client (View Access)
- Email: `nimal.silva@gmail.com`
- Password: `Client@123`

## Database Collections Populated
1. `users` - 23 records
2. `projects` - 12 records
3. `inspectionrequests` - 12 records
4. `projectestimations` - 12 records
5. `quotationestimations` - 7 records
6. `materials` - 15 records
7. `teams` - 3 records

## Key Features for Testing

### 1. Projects Without Estimates (4 projects)
Test creating first estimation for these projects:
- Projects 1-4 have `estimateCreated: false`
- Can test `getProjectsWithInspections()` endpoint

### 2. Pending Estimations (4 projects)
Test approval/rejection workflow:
- Can approve to generate quotations
- Can reject to request revision
- Can update costs and re-submit

### 3. Approved Estimations (7 projects)
Test quotation generation:
- Can create detailed quotations
- Can add labor/material line items
- Can calculate taxes and contingencies
- Can send to clients

### 4. Versioning Workflow
Test creating new versions:
- Update estimation costs
- Create version 2 with changes
- Track estimation history
- Link quotations to specific versions

### 5. Cost Calculations
Test auto-calculation:
- Update labor cost → verify total updates
- Update material cost → verify total updates
- Add service/contingency → verify percentages
- Validation rules for minimum costs

## Next Steps for Testing

1. **Run the seed script**: `node server/seed/seedEstimationData.js`
2. **Verify data in database**: Check MongoDB collections
3. **Test API endpoints**: Use Postman/Thunder Client
4. **Test UI flows**: Login and navigate estimation pages
5. **Test versioning**: Create v2, v3 estimations
6. **Test quotations**: Generate PDFs and send to clients

## Notes
- All estimations use Sri Lankan Rupees (LKR)
- Realistic construction industry data
- Proper foreign key relationships
- Ready for comprehensive workflow testing
- Covers all estimation statuses
- Supports multi-version testing

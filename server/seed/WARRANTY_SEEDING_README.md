# Warranty System Seeding Guide

## Overview
This guide explains the warranty system data structure and how to seed comprehensive warranty data for testing.

## Warranty System Architecture

### Models

#### 1. Warranty Model (`warrenty.js`)
```javascript
{
  projectId: ObjectId,      // Reference to Project
  clientId: ObjectId,       // Reference to User (role: 'client')
  itemId: ObjectId,         // Reference to Material
  warrantyStart: Date,      // Warranty start date
  warrantyEnd: Date,        // Warranty end date
  status: String,           // 'Active', 'Expired', 'Claimed', 'Replaced'
  timestamps: true          // createdAt, updatedAt
}
```

#### 2. Warranty Claim Model (`warrenty_claim.js`)
```javascript
{
  warrantyId: ObjectId,             // Reference to Warranty
  clientId: ObjectId,               // Reference to User (client)
  issueDescription: String,         // Description of the issue
  proofUrl: String,                 // URL to proof document/image
  status: String,                   // 'Submitted', 'UnderReview', 'Approved', 'Rejected', 'Replaced'
  financeReviewerId: ObjectId,      // Reference to User (finance team)
  warehouseAction: {
    shippedReplacement: Boolean,    // Whether replacement was shipped
    shippedAt: Date                 // Date when shipped
  },
  timestamps: true                  // createdAt, updatedAt
}
```

### Relationships

```
Project ──┐
          ├─→ Warranty ──→ WarrantyClaim
Client  ──┤               ↑
          │               │
Material ─┘               │
                          │
Finance User ─────────────┘
```

## Prerequisites

Before running the warranty seed script, ensure you have:

1. **Projects** - Run: `node seed/seedProjectModels.js`
2. **Users (Clients & Finance)** - Run: `node seed/seedUsers.js`
3. **Materials** - Run: `node seed/seedSupplierModels.js`

## Running the Seed Script

### Option 1: Run Warranty Seed Only
```bash
cd server
node seed/seedComprehensiveWarranty.js
```

### Option 2: Run All Seeds (Comprehensive)
```bash
cd server
node seed/seedComprehensiveData.js
```

## What the Seed Script Creates

### Warranties
- **2-5 warranties per project**
- **Realistic date ranges**: Started 3-24 months ago
- **Duration**: Based on material warranty periods (12-120 months)
- **Status distribution**:
  - ~70% Active
  - ~25% Expired
  - ~3% Claimed
  - ~2% Replaced

### Warranty Claims
- **20-40% of claimable warranties** get claims
- **Claimable warranties**: Active + Recently Expired (within 90 days)
- **Status distribution**:
  - 15% Submitted (new claims)
  - 15% UnderReview (being processed)
  - 30% Approved (accepted but not yet replaced)
  - 20% Rejected (denied claims)
  - 20% Replaced (completed with shipment)

### Realistic Data
- **Issue descriptions**: 20+ realistic construction/material defect descriptions
- **Proof documents**: 70% of claims include proof URLs
- **Finance reviewers**: Claims assign finance team members as reviewers
- **Warehouse actions**: Replaced claims include shipment dates
- **Timestamps**: Claims created between warranty start and present

## Data Verification

After seeding, verify the data:

```bash
node seed/checkWarrantyData.js
```

This will show:
- Total counts for warranties and claims
- Status breakdowns
- Sample warranties with populated fields
- Sample claims with relationships

## Frontend Integration

The frontend warranty section (`frontend/staff-dashboard/src/finance-portal/components/WarrantySection/`) includes:

### Pages
- **ActiveWarranties.jsx** - Lists warranties with status 'Active'
- **ExpiredWarranties.jsx** - Lists warranties with status 'Expired'
- **AllWarranties.jsx** - Lists all warranties regardless of status
- **WarrantyRequest.jsx** - Lists pending warranty claims (Submitted, UnderReview)
- **WarrantyRequestHistory.jsx** - Lists processed claims (Approved, Rejected, Replaced)

### Modals
- **AddWarrantyModal.jsx** - Create new warranty
- **ViewWarrantyModal.jsx** - View warranty details
- **ViewWarrantyClaimModal.jsx** - View claim details
- **WarrantyClaimActionModal.jsx** - Review and action claims

## API Endpoints

### Warranties
```
POST   /api/warranties                    - Create warranty
GET    /api/warranties                    - Get warranties (with filters)
GET    /api/warranties/all                - Get all warranties with details
GET    /api/warranties/:id                - Get warranty by ID
PUT    /api/warranties/:id                - Update warranty
DELETE /api/warranties/:id                - Delete warranty
GET    /api/warranties/:id/status         - Get warranty status
GET    /api/projects/:id/warranties       - Get project warranties
GET    /api/clients/:id/warranties        - Get client warranties
GET    /api/items/:id/warranty-details    - Get item warranty info
```

### Warranty Claims
```
POST   /api/warranty-claims               - Create claim
GET    /api/warranty-claims               - Get claims (with filters)
GET    /api/warranty-claims/:id           - Get claim by ID
PUT    /api/warranty-claims/:id           - Update claim
DELETE /api/warranty-claims/:id           - Delete claim
PUT    /api/warranty-claims/:id/approve   - Approve claim
PUT    /api/warranty-claims/:id/reject    - Reject claim
PUT    /api/warranty-claims/:id/ship      - Mark replacement shipped
```

## Testing Workflow

1. **Seed the database**:
   ```bash
   node seed/seedComprehensiveWarranty.js
   ```

2. **Start the backend**:
   ```bash
   npm run dev
   ```

3. **Start the frontend**:
   ```bash
   cd ../frontend/staff-dashboard
   npm run dev
   ```

4. **Test scenarios**:
   - View active warranties and check days remaining
   - View expired warranties
   - Create a new warranty through the modal
   - Submit a warranty claim
   - Review claims as finance user
   - Approve/reject claims
   - Mark replacements as shipped

## Business Logic

### Warranty Status Calculation
The service automatically calculates warranty status:
- **Active**: Current date is between warrantyStart and warrantyEnd
- **Expired**: Current date is after warrantyEnd
- **Claimed**: Client has submitted a claim (status persists)
- **Replaced**: Claim was approved and replacement shipped (status persists)

### Days Remaining/Expired
- **daysRemaining**: For active warranties, days until expiration
- **daysExpired**: For expired warranties, days since expiration

### Warranty Eligibility
A warranty is claimable if:
- Status is 'Active', OR
- Status is 'Expired' but less than 90 days ago (grace period)

### Claim Review Workflow
1. Client submits claim → Status: **Submitted**
2. Finance team reviews → Status: **UnderReview**
3. Finance approves/rejects:
   - Approve → Status: **Approved** (awaiting warehouse)
   - Reject → Status: **Rejected** (end of process)
4. Warehouse ships replacement → Status: **Replaced** (complete)

## Material Warranty Periods

Common warranty periods for construction materials:
- **Paint**: 12-24 months
- **Tiles**: 24-36 months  
- **Electrical fixtures**: 12-24 months
- **Plumbing fixtures**: 24 months
- **Doors/Windows**: 36-60 months
- **Structural materials**: 5-10 years

The seed script automatically assigns appropriate warranty periods if not present.

## Troubleshooting

### No warranties created
**Issue**: "No materials with warranty periods found"  
**Solution**: The script will automatically assign warranty periods to materials

### Connection timeout
**Issue**: MongoDB connection error  
**Solution**: 
1. Check if MongoDB is running (Docker: `docker-compose up -d`)
2. Verify MONGO_URI in `.env` file
3. Check network connectivity

### Missing prerequisites
**Issue**: "No projects/clients/materials found"  
**Solution**: Run prerequisite seed scripts first:
```bash
node seed/seedUsers.js
node seed/seedSupplierModels.js
node seed/seedProjectModels.js
```

## Data Cleanup

To reset warranty data:
```javascript
// In MongoDB shell or Compass
db.warranties.deleteMany({});
db.warrantyclaims.deleteMany({});
```

Or use the seed script (it clears data before seeding):
```bash
node seed/seedComprehensiveWarranty.js
```

## Additional Notes

- The seed script creates realistic time-based data relative to the current date
- Warranty durations are parsed from material warranty periods
- Claims are distributed across different statuses for realistic testing
- Finance reviewers are assigned from available finance users
- Warehouse actions are only populated for 'Replaced' status claims

## Support

For issues or questions about the warranty system:
1. Check this README
2. Review the model schemas in `server/modules/finance/model/`
3. Check the service logic in `server/modules/finance/service/warrantyService.js`
4. Inspect the frontend components in `frontend/staff-dashboard/src/finance-portal/components/WarrantySection/`

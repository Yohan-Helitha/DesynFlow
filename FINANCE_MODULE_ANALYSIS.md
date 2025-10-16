# Finance Module Analysis & Testing Guide

## 📊 Overview
This document provides a comprehensive analysis of the DesynFlow Finance Module, including backend APIs, frontend components, data models, and testing procedures.

---

## 🗂️ Backend Structure

### Models (9 Total)

#### 1. **Expense** (`expenses.js`)
- **Purpose**: Track project-related expenses
- **Key Fields**:
  - `projectId`: Reference to Project
  - `category`: Labor, Procurement, Transport, Misc
  - `amount`: Expense amount
  - `description`: Expense details
  - `createdBy`: User who created the expense
  - `proof`: Receipt/proof URL
- **Relations**: Project, User

#### 2. **Payment** (`payment.js`)
- **Purpose**: Manage client payments
- **Key Fields**:
  - `projectId`: Reference to Project
  - `clientId`: Reference to User (client)
  - `amount`: Payment amount
  - `method`: Bank, Online, Cash
  - `type`: InspectionCost, ProjectPayment, Advance
  - `status`: Pending, Approved, Rejected
  - `receiptUrl`: Payment receipt
  - `verifiedBy`: Finance manager who verified
- **Relations**: Project, User

#### 3. **ProjectEstimation** (`project_estimation.js`)
- **Purpose**: Store project cost estimations (versioned)
- **Key Fields**:
  - `projectId`: Reference to Project
  - `version`: Estimation version number
  - `laborCost`, `materialCost`, `serviceCost`, `contingencyCost`
  - `total`: Auto-calculated total
  - `status`: Pending, Approved, Rejected
  - `quotationCreated`: Boolean flag
  - `lastQuotationId`: Reference to latest quotation
- **Relations**: Project, User, QuotationEstimation
- **Indexes**: Unique on (projectId, version)

#### 4. **InspectionEstimate** (`inspection_estimation.js`)
- **Purpose**: Estimate inspection costs
- **Key Fields**:
  - `inspectionRequestId`: Unique reference to InspectionRequest
  - `distanceKm`: Distance to site
  - `estimatedCost`: Calculated inspection cost
  - `createdBy`: Finance manager
- **Relations**: InspectionRequest, User

#### 5. **QuotationEstimation** (`quotation_estimation.js`)
- **Purpose**: Detailed quotations sent to clients (versioned)
- **Key Fields**:
  - `projectId`: Reference to Project
  - `estimateVersion`: Version of base estimation
  - `version`: Quotation version number
  - `status`: Draft, Sent, Revised, Confirmed, Locked
  - `locked`: Boolean
  - `laborItems[]`: Array of labor line items
  - `materialItems[]`: Array of material line items
  - `serviceItems[]`: Array of service items
  - `contingencyItems[]`: Array of contingency items
  - `taxes[]`: Tax calculations
  - `subtotal`, `totalContingency`, `totalTax`, `grandTotal`
  - `fileUrl`: Generated PDF URL
  - `sentTo`, `sentAt`: Client and timestamp
- **Relations**: Project, User, Material
- **Indexes**: Unique on (projectId, estimateVersion, version)

#### 6. **Warranty** (`warrenty.js`)
- **Purpose**: Track warranties for materials/items
- **Key Fields**:
  - `projectId`: Reference to Project
  - `clientId`: Reference to User (client)
  - `itemId`: Reference to Material
  - `warrantyStart`, `warrantyEnd`: Warranty period
  - `status`: Active, Expired, Claimed, Replaced
- **Relations**: Project, User, Material

#### 7. **WarrantyClaim** (`warrenty_claim.js`)
- **Purpose**: Handle warranty claim requests
- **Key Fields**:
  - `warrantyId`: Reference to Warranty
  - `clientId`: Reference to User (client)
  - `issueDescription`: Problem description
  - `status`: Submitted, UnderReview, Approved, Rejected, Replaced
  - `financeReviewerId`: Finance manager reviewing
  - `warehouseAction`: { shippedReplacement, shippedAt }
- **Relations**: Warranty, User

#### 8. **Notification** (`notification.js`)
- **Purpose**: User notifications
- **Key Fields**:
  - `userId`: Reference to User
  - `message`: Notification text
  - `type`: Notification category
  - `read`: Boolean read status
- **Relations**: User

#### 9. **PurchaseOrder** (from Supplier module)
- **Purpose**: Purchase orders requiring finance approval
- **Key Fields**:
  - `requestOrigin`: ReorderAlert, Manual, ProjectMR
  - `projectId`: Reference to Project
  - `supplierId`: Reference to Supplier
  - `requestedBy`: User who requested
  - `status`: Draft, PendingFinanceApproval, Approved, Rejected, etc.
  - `items[]`: Array of { materialId, materialName, qty, unitPrice }
  - `totalAmount`: Total PO amount
  - `financeApproval`: { approverId, status, note, approvedAt }
- **Relations**: Project, Supplier, User, Material

---

## 🛣️ API Routes

### Base Path: `/api`

#### 1. **Expenses** (`/api/expenses`)
- `GET /` - Get all expenses
- `POST /` - Create new expense
- `GET /:id` - Get expense by ID
- `PUT /:id` - Update expense
- `DELETE /:id` - Delete expense
- `GET /project/:projectId` - Get expenses by project

#### 2. **Payments** (`/api/payments`)
- `GET /` - Get all payments
- `POST /` - Create new payment
- `GET /:id` - Get payment by ID
- `PATCH /:id/status` - Update payment status (approve/reject)
- `GET /pending` - Get pending payments
- `GET /approved` - Get approved payments
- `GET /project/:projectId` - Get payments by project

#### 3. **Inspection Estimation** (`/api/inspection-estimation`)
- `GET /` - Get all inspection estimates
- `POST /` - Create inspection estimate
- `GET /:id` - Get by ID
- `PUT /:id` - Update estimate
- `DELETE /:id` - Delete estimate
- `GET /inspection/:inspectionRequestId` - Get by inspection request

#### 4. **Project Estimation** (`/api/project-estimation`)
- `GET /` - Get all project estimations
- `POST /` - Create or update estimate (new version)
- `GET /approved` - Get only approved estimates
- `PATCH /:estimateId/status` - Update estimate status
- `GET /project/:projectId` - Get all estimates for a project (version history)
- `GET /latest/:projectId` - Get latest estimate for a project
- `GET /projects-with-inspections` - Get projects pending estimations

#### 5. **Quotations** (`/api/quotations`)
- `GET /` - Get all quotations
- `POST /` - Create quotation
- `GET /:id` - Get quotation by ID
- `PUT /:id` - Update quotation
- `DELETE /:id` - Delete quotation
- `PATCH /:id/status` - Update quotation status
- `GET /project/:projectId` - Get quotations by project
- `POST /:id/send` - Send quotation to client
- `GET /:id/pdf` - Generate/download PDF
- `POST /:id/lock` - Lock quotation

#### 6. **Purchase Orders** (`/api/purchase-orders`)
- `GET /` - Get all purchase orders
- `POST /` - Create purchase order
- `GET /:id` - Get PO by ID
- `PUT /:id` - Update PO
- `DELETE /:id` - Delete PO
- `PATCH /:id/approve` - Finance approve PO
- `PATCH /:id/reject` - Finance reject PO
- `GET /pending-approval` - Get POs pending finance approval

#### 7. **Warranties** (`/api/warranties`)
- `GET /` - Get all warranties
- `POST /` - Create warranty
- `GET /:id` - Get warranty by ID
- `PUT /:id` - Update warranty
- `DELETE /:id` - Delete warranty
- `GET /project/:projectId` - Get warranties by project
- `GET /client/:clientId` - Get warranties by client
- `GET /active` - Get active warranties

#### 8. **Warranty Claims** (`/api/claims`)
- `GET /` - Get all claims
- `POST /` - Create claim
- `GET /:id` - Get claim by ID
- `PUT /:id` - Update claim
- `PATCH /:id/status` - Update claim status
- `GET /warranty/:warrantyId` - Get claims by warranty
- `GET /pending` - Get pending claims

#### 9. **Notifications** (`/api/notifications`)
- `GET /user/:userId` - Get user notifications
- `POST /` - Create notification
- `PATCH /:id/read` - Mark as read
- `DELETE /:id` - Delete notification

#### 10. **Finance Summary** (`/api/finance-summary`)
- `GET /` - Get finance dashboard summary (KPIs, charts)
- `GET /project/:projectId` - Get project-specific summary

---

## 🎨 Frontend Structure

### Location: `frontend/staff-dashboard/src/finance-portal`

### Main Components

#### 1. **FinanceDashboard.jsx**
- Root finance portal component
- Integrates all sections

#### 2. **Dashboard.jsx**
- Summary cards (total revenue, expenses, pending payments, etc.)
- Income chart
- Quick stats

#### 3. **EstimationsSection/**
- `EstimationsSection.jsx` - Main container
- `PendingEstimation.jsx` - Projects requiring estimates
- `EstimationsHistory.jsx` - Past estimations
- `EstimationDetailsModal.jsx` - View/edit estimation
- `EstimateToEstimateModal.jsx` - Copy/create new version
- `ViewEstimationModal.jsx` - Read-only view

#### 4. **QuotationsSection/**
- `QuotationsSection.jsx` - Main container
- `PendingQuotations.jsx` - Quotations to create
- `QuotationsHistory.jsx` - Past quotations
- `CreateQuotationModal.jsx` - Create new quotation
- `UpdateQuotationModal.jsx` - Edit quotation
- `ViewQuotationModal.jsx` - View quotation details

#### 5. **PaymentsSection/**
- `PaymentsSection.jsx` - Main container
- `PendingPayments.jsx` - Payments to approve
- `CompletedPayments.jsx` - Approved/rejected payments
- `PaymentDetailsModal.jsx` - View payment details
- `ViewPaymentModal.jsx` - Read-only payment view

#### 6. **PurchaseOrdersSection/**
- `PurchaseOrdersSection.jsx` - Main container
- `PendingPurchaseOrders.jsx` - POs requiring finance approval
- `PurchaseOrdersHistory.jsx` - Past POs
- `PurchaseOrderDetailsModal.jsx` - View/approve/reject PO

#### 7. **ExpensesSection/**
- View and manage project expenses
- Filter by project, category, date

#### 8. **InspectionSection/**
- Manage inspection estimates
- Calculate costs based on distance

#### 9. **WarrantySection/**
- View warranties and claims
- Approve/reject warranty claims
- Track replacement status

---

## 🧪 Testing with Dummy Data

### Seeder File: `server/seed/seedFinanceComprehensive.js`

### What It Creates

| Data Type | Count | Description |
|-----------|-------|-------------|
| Inspection Estimates | 10 | Cost estimates for inspections |
| Project Estimations | 15 | Versioned project cost estimates |
| Quotations | 13 | Detailed quotations (multiple versions) |
| Payments | 19 | Client payments (Pending/Approved/Rejected) |
| Expenses | 46 | Project expenses across 4 categories |
| Purchase Orders | 16 | POs with various statuses |
| Warranties | 7 | Active/expired warranties |
| Warranty Claims | 4 | Claims in various states |
| Notifications | 6 | Finance manager notifications |

### How to Run

#### Option 1: Via Docker (Recommended)
```bash
cd C:\Users\ALoNe\Documents\GitHub\DesynFlow\docker
docker exec desynflow-backend node seed/seedFinanceComprehensive.js
```

#### Option 2: Locally
```bash
cd C:\Users\ALoNe\Documents\GitHub\DesynFlow\server
node seed/seedFinanceComprehensive.js
```

### Prerequisites
- Users must exist (run `seedUsers.js` first)
- Projects must exist (run `seedComprehensiveData.js` or `seedProjectModels.js` first)
- Materials must exist (from supplier module)
- Suppliers must exist (from supplier module)

---

## ✅ Testing Checklist

### Backend API Testing

#### Estimations
- [ ] GET `/api/project-estimation/projects-with-inspections` - Projects pending estimates
- [ ] POST `/api/project-estimation` - Create new estimation
- [ ] GET `/api/project-estimation/project/:projectId` - View version history
- [ ] PATCH `/api/project-estimation/:id/status` - Approve/reject estimation

#### Quotations
- [ ] POST `/api/quotations` - Create quotation from estimation
- [ ] PUT `/api/quotations/:id` - Update quotation details
- [ ] PATCH `/api/quotations/:id/status` - Change status
- [ ] POST `/api/quotations/:id/send` - Send to client
- [ ] GET `/api/quotations/:id/pdf` - Generate PDF

#### Payments
- [ ] GET `/api/payments/pending` - View pending payments
- [ ] PATCH `/api/payments/:id/status` - Approve/reject payment
- [ ] GET `/api/payments/project/:projectId` - Filter by project

#### Purchase Orders
- [ ] GET `/api/purchase-orders/pending-approval` - POs requiring approval
- [ ] PATCH `/api/purchase-orders/:id/approve` - Approve PO (validate totalAmount > 0)
- [ ] PATCH `/api/purchase-orders/:id/reject` - Reject PO

#### Expenses
- [ ] POST `/api/expenses` - Create expense
- [ ] GET `/api/expenses/project/:projectId` - Filter by project
- [ ] PUT `/api/expenses/:id` - Update expense

#### Warranties & Claims
- [ ] GET `/api/warranties/active` - Active warranties
- [ ] POST `/api/claims` - Create claim
- [ ] PATCH `/api/claims/:id/status` - Update claim status

#### Notifications
- [ ] GET `/api/notifications/user/:userId` - User notifications
- [ ] PATCH `/api/notifications/:id/read` - Mark as read

### Frontend Feature Testing

#### Dashboard
- [ ] Summary cards display correct counts
- [ ] Income chart renders with data
- [ ] Quick stats match backend data

#### Estimations Section
- [ ] Pending estimations table loads
- [ ] Create new estimation modal works
- [ ] Version history displays correctly
- [ ] Status update (approve/reject) works

#### Quotations Section
- [ ] Pending quotations table loads
- [ ] Create quotation from estimation works
- [ ] Update quotation modal works
- [ ] Send quotation triggers email/notification
- [ ] PDF generation works
- [ ] Lock quotation prevents further edits

#### Payments Section
- [ ] Pending payments table loads
- [ ] Payment details modal shows all info
- [ ] Approve/reject buttons work
- [ ] Status filter works (Pending/Approved/Rejected)

#### Purchase Orders Section
- [ ] Pending POs table loads
- [ ] PO details modal shows supplier, items, totals
- [ ] Approve button disabled when totalAmount = 0 ✅
- [ ] Approve/reject updates status correctly

#### Expenses Section
- [ ] Expenses table loads
- [ ] Filter by project works
- [ ] Filter by category works
- [ ] Create expense modal works

#### Warranty Section
- [ ] Warranties table loads
- [ ] Claims table loads
- [ ] Filter by status works
- [ ] Approve/reject claim works
- [ ] Replacement tracking updates

---

## 🔑 Key Features & Validations

### Purchase Order Approval Validation
- ✅ **Implemented**: Approve button disabled when `totalAmount <= 0`
- **Location**: `PurchaseOrderDetailsModal.jsx`
- **Logic**: `canApprove()` helper checks:
  - Valid PO ID exists
  - Total amount > 0
  - Not currently processing

### Estimation Versioning
- Each project can have multiple estimation versions
- Latest version marked by highest version number
- Old versions remain in history for audit trail

### Quotation Versioning
- Quotations tied to specific estimation version
- Multiple quotation versions per estimation (Draft → Revised → Sent → Confirmed → Locked)
- Once locked, quotation cannot be edited

### Payment Status Workflow
```
Pending → [Finance Review] → Approved/Rejected
```

### Purchase Order Status Workflow
```
Draft → PendingFinanceApproval → Approved → SentToSupplier → InProgress → Delivered → Closed
                                ↘ Rejected
```

### Warranty Claim Workflow
```
Submitted → UnderReview → Approved → Replaced
                        ↘ Rejected
```

---

## 📈 Data Relationships

```
Project ←─── ProjectEstimation (1:many, versioned)
            └──── QuotationEstimation (1:many, versioned)
            
Project ←─── Payment (1:many)
Project ←─── Expense (1:many)
Project ←─── PurchaseOrder (1:many)
Project ←─── Warranty (1:many)

Warranty ←─── WarrantyClaim (1:many)

User ←─── Notification (1:many)

InspectionRequest ←─── InspectionEstimate (1:1)
```

---

## 🚀 Quick Start Guide

### 1. Seed Data
```bash
# Step 1: Seed users (if not already done)
docker exec desynflow-backend node seed/seedUsers.js

# Step 2: Seed projects (if not already done)
docker exec desynflow-backend node seed/seedComprehensiveData.js

# Step 3: Seed finance data
docker exec desynflow-backend node seed/seedFinanceComprehensive.js
```

### 2. Access Frontend
```
http://localhost:5173/finance
```

### 3. Test Backend APIs
Use Postman/Thunder Client or curl:
```bash
# Get pending estimations
curl http://localhost:4000/api/project-estimation/projects-with-inspections

# Get pending payments
curl http://localhost:4000/api/payments/pending

# Get pending purchase orders
curl http://localhost:4000/api/purchase-orders/pending-approval
```

---

## 📝 Notes

### Performance Considerations
- Indexes on frequently queried fields (projectId, status, userId)
- Pagination recommended for large datasets
- Consider caching for dashboard summary

### Security
- All routes should require authentication (add auth middleware)
- Finance operations should be restricted to finance manager role
- Validate user permissions before approve/reject operations

### Future Enhancements
- Email notifications when quotations sent
- PDF generation for receipts/invoices
- Expense report generation
- Budget tracking per project
- Financial analytics dashboard
- Export data to Excel/CSV
- Audit logs for all financial operations

---

## 🐛 Troubleshooting

### Issue: Seeder fails with "No users/projects found"
**Solution**: Run prerequisite seeders first (seedUsers.js, seedComprehensiveData.js)

### Issue: Purchase order approve button doesn't disable
**Solution**: Ensure `canApprove()` helper is called correctly in component

### Issue: Quotation PDF generation fails
**Solution**: Check if PDF service is configured and file paths are correct

### Issue: Estimations not showing in frontend
**Solution**: Verify API endpoint returns data, check CORS settings, inspect network tab

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review API route definitions
3. Inspect browser console for frontend errors
4. Check server logs for backend errors
5. Verify database connections

---

**Last Updated**: October 14, 2025  
**Created By**: GitHub Copilot  
**Version**: 1.0.0

# Purchase Orders Testing Guide

## 📋 Overview
Comprehensive test data for Purchase Orders section with all related models (Users, Projects, Materials, Suppliers).

## 🚀 Quick Start

### Run the Seed Script
```powershell
cd server
node seed/seedPurchaseOrderData.js
```

---

## 📊 Created Data Summary

### Users (11 total):
- **5 Clients** - Project owners
- **2 Finance Managers** - Approve/reject purchase orders
- **2 Procurement Officers** - Create and manage purchase orders
- **2 Project Managers** - Linked to projects

### Projects (5):
- Luxury Villa - Mount Lavinia (LKR 15M)
- Modern Office Complex - Colombo 03 (LKR 45M)
- Residential Apartment - Kandy (LKR 8.5M)
- Beach Resort - Bentota (LKR 35M)
- Shopping Mall - Negombo (LKR 62M)

### Materials (15):
- **Construction**: Cement, Sand, Gravel, Steel Rebar, Bricks
- **Finishing**: Floor Tiles, Paint, Doors, Windows
- **Electrical**: Cables, LED Lights, Power Sockets
- **Plumbing**: PVC Pipes, Taps, Toilet Bowls

### Suppliers (8):
- Lanka Cement Suppliers
- Steel World Lanka
- Island Bricks & Tiles
- Premium Paints Lanka
- Teak Wood Suppliers
- Modern Aluminum Works
- Electro Supplies Lanka
- Plumbing Solutions

### Purchase Orders (12):
- **2 Draft** - Can be edited/submitted
- **3 Pending Finance Approval** - Awaiting finance review
- **2 Approved** - Ready to send to supplier
- **1 Rejected** - Rejected by finance
- **1 Sent to Supplier** - Sent but not confirmed
- **1 In Progress** - Supplier confirmed, processing
- **1 Delivered** - Materials delivered
- **1 Closed** - Completed and closed

---

## 🧪 Test Cases

### Test Case 1: View Draft Purchase Orders ✏️
**Steps**:
1. Login as Procurement Officer: `po1@desynflow.com` / `password123`
2. Navigate to Purchase Orders section
3. Filter by Status: "Draft"

**Expected Result**:
- See 2 draft orders
- Can edit order details
- Can submit for approval
- Total amounts calculated correctly

**Sample Data**:
- **PO #1**: Luxury Villa - Cement, Sand, Gravel (LKR 319,500)
- **PO #2**: Office Complex - Steel Rebar (LKR 112,500)

---

### Test Case 2: Submit for Finance Approval 📤
**Steps**:
1. Login as Procurement Officer
2. Open a draft purchase order
3. Click "Submit for Approval"
4. Verify status changes

**Expected Result**:
- Status changes from "Draft" to "Pending Finance Approval"
- Order appears in finance approval queue
- Cannot edit after submission

---

### Test Case 3: Finance Approval Workflow ✅❌
**Steps**:
1. Login as Finance Manager: `fm1@desynflow.com` / `password123`
2. Navigate to Pending Approvals
3. View order details

**For Approval**:
- Review order details
- Add approval note
- Click "Approve"
- Verify status changes to "Approved"

**For Rejection**:
- Review order details
- Add rejection reason
- Click "Reject"
- Verify status changes to "Rejected"

**Test Data - Pending Approval (3 orders)**:
1. **Luxury Villa** - Bricks & Tiles (LKR 345,000)
2. **Residential Apartment** - Paint (LKR 425,000)
3. **Beach Resort** - Wooden Doors (LKR 900,000)

---

### Test Case 4: View Approved Orders ✅
**Steps**:
1. Login as Procurement Officer
2. Filter by Status: "Approved"
3. View approved orders

**Expected Result**:
- See 2 approved orders
- Can send to supplier
- Shows approval details (approver, date, note)

**Sample Data**:
- **Office Complex** - Window Frames (LKR 375,000)
- **Shopping Mall** - Electrical Items (LKR 345,000)

---

### Test Case 5: View Rejected Orders ❌
**Steps**:
1. Login as Procurement Officer
2. Filter by Status: "Rejected"
3. Review rejection reasons

**Expected Result**:
- See 1 rejected order
- Shows rejection reason
- Can create new order if needed

**Sample Data**:
- **Residential Apartment** - Plumbing Items (LKR 265,000)
- Rejection Reason: "Exceeds project budget allocation"

---

### Test Case 6: Send to Supplier 📧
**Steps**:
1. Login as Procurement Officer
2. Select approved order
3. Click "Send to Supplier"
4. Verify status changes

**Expected Result**:
- Status changes to "Sent to Supplier"
- Email notification sent (if configured)
- Order visible in supplier tracking

---

### Test Case 7: Track Order Progress 🔄
**Steps**:
1. View orders with different statuses
2. Check status progression

**Status Flow**:
```
Draft → Pending Finance Approval → Approved → Sent to Supplier → 
In Progress → Delivered → Closed
```

**Sample Data**:
- **Sent to Supplier**: Luxury Villa - Cement & Sand (LKR 460,000)
- **In Progress**: Beach Resort - Plumbing Items (LKR 382,500)
- **Delivered**: Shopping Mall - Bricks (LKR 450,000)
- **Closed**: Office Complex - Steel Rebar (LKR 225,000)

---

### Test Case 8: Multiple Materials per Order 📦
**Steps**:
1. View purchase orders
2. Check orders with multiple line items

**Expected Result**:
- Multiple materials listed per order
- Individual quantities and prices shown
- Total amount calculated correctly

**Sample Data**:
- **PO with 3 items**: Cement + Sand + Gravel
- **PO with 3 items**: Cables + LED Lights + Sockets

---

### Test Case 9: Filter by Request Origin 🔍
**Steps**:
1. View all purchase orders
2. Check request origins

**Categories**:
- **Manual** (6 orders): Created manually by procurement
- **Reorder Alert** (2 orders): Triggered by low stock
- **Project MR** (4 orders): From project material requests

---

### Test Case 10: Financial Summary 💰
**Steps**:
1. View purchase orders dashboard
2. Check financial metrics

**Expected Results**:
- Total PO Value: LKR 4,589,500
- Pending Approval Value: LKR 1,670,000
- Approved Value calculation
- Per-project spending breakdown

---

## 🔍 Detailed Test Scenarios

### Scenario 1: Complete Purchase Order Lifecycle

1. **Create Draft** (Procurement Officer)
   - Select project and supplier
   - Add materials and quantities
   - Calculate total amount
   - Save as draft

2. **Submit for Approval** (Procurement Officer)
   - Review order details
   - Submit to finance

3. **Finance Review** (Finance Manager)
   - Review order and budget
   - Approve or reject with notes

4. **Send to Supplier** (Procurement Officer)
   - For approved orders
   - Generate PO document

5. **Track Delivery** (Procurement Officer)
   - Update status as supplier confirms
   - Mark as delivered when received

6. **Close Order** (Procurement Officer)
   - Verify delivery and quality
   - Close the order

---

### Scenario 2: Budget Validation

**Test**: Submit high-value order
- Create PO exceeding budget threshold
- Finance manager reviews
- Should reject with appropriate note

**Sample**: Beach Resort - Wooden Doors (LKR 900,000)
- High value order pending approval
- Finance should verify against project budget

---

### Scenario 3: Multi-Material Orders

**Test**: Order with various material types
- Mix of construction, electrical, plumbing
- Different units and prices
- Verify total calculation

**Sample**: Shopping Mall Electrical Order
- Cables: 500m × LKR 85 = LKR 42,500
- LED Lights: 100pc × LKR 2,500 = LKR 250,000
- Sockets: 150pc × LKR 350 = LKR 52,500
- **Total**: LKR 345,000

---

## 📝 Testing Checklist

### Procurement Officer Tests:
- [ ] View all purchase orders
- [ ] Create new draft order
- [ ] Edit draft order
- [ ] Submit order for approval
- [ ] View approved orders
- [ ] Send order to supplier
- [ ] Track order status
- [ ] Update order progress
- [ ] Mark order as delivered
- [ ] Close completed orders

### Finance Manager Tests:
- [ ] View pending approvals
- [ ] Review order details
- [ ] Check project budget alignment
- [ ] Approve order with notes
- [ ] Reject order with reason
- [ ] View approval history
- [ ] Generate approval reports

### General Tests:
- [ ] Filter by status
- [ ] Filter by project
- [ ] Filter by supplier
- [ ] Filter by request origin
- [ ] Search functionality
- [ ] Sort by date/amount
- [ ] Pagination works
- [ ] Export purchase orders
- [ ] Print PO documents

---

## 🔐 Login Credentials

### Finance Managers:
- `fm1@desynflow.com` / `password123`
- `fm2@desynflow.com` / `password123`

### Procurement Officers:
- `po1@desynflow.com` / `password123`
- `po2@desynflow.com` / `password123`

### Project Managers:
- `pm1@desynflow.com` / `password123`
- `pm2@desynflow.com` / `password123`

### Clients:
- `john.anderson@email.com` / `password123`
- `sarah.williams@email.com` / `password123`

---

## 💡 Key Features to Test

1. **Order Creation & Management**
   - Create, edit, delete draft orders
   - Add/remove materials
   - Calculate totals automatically

2. **Approval Workflow**
   - Submit for approval
   - Finance approve/reject
   - Approval notes and timestamps

3. **Status Tracking**
   - 8 different statuses
   - Status progression
   - Cannot skip statuses

4. **Financial Controls**
   - Budget validation
   - Approval thresholds
   - Financial reporting

5. **Supplier Integration**
   - Send to supplier
   - Track supplier response
   - Delivery confirmation

6. **Reporting**
   - PO by status
   - PO by project
   - Financial summaries
   - Supplier performance

---

## 🐛 Edge Cases to Test

1. **Empty Orders**: Try submitting order with no items
2. **Zero Quantity**: Add item with qty = 0
3. **Negative Price**: Try entering negative unit price
4. **Duplicate Materials**: Add same material twice
5. **Missing Supplier**: Order without supplier selection
6. **Budget Exceeded**: Order value > project budget
7. **Concurrent Edits**: Two users editing same order
8. **Status Rollback**: Try moving status backwards

---

## 📊 Expected Results Summary

| Status | Count | Total Value | Action Available |
|--------|-------|-------------|------------------|
| Draft | 2 | LKR 432,000 | Edit, Submit |
| Pending Approval | 3 | LKR 1,670,000 | Approve, Reject |
| Approved | 2 | LKR 720,000 | Send to Supplier |
| Rejected | 1 | LKR 265,000 | Review, Recreate |
| Sent to Supplier | 1 | LKR 460,000 | Track |
| In Progress | 1 | LKR 382,500 | Update Status |
| Delivered | 1 | LKR 450,000 | Verify, Close |
| Closed | 1 | LKR 225,000 | View Only |

---

## ✅ Success Criteria

All tests pass when:
- ✅ All 12 purchase orders created successfully
- ✅ Status workflow enforced correctly
- ✅ Finance approval/rejection working
- ✅ Total amounts calculated accurately
- ✅ Orders linked to correct projects/suppliers
- ✅ All CRUD operations functional
- ✅ Filtering and sorting working
- ✅ Approval notes saved correctly
- ✅ Status transitions valid
- ✅ Financial summaries accurate

---

**Created**: October 15, 2025  
**Total Test Data**: 11 users, 5 projects, 15 materials, 8 suppliers, 12 purchase orders  
**Total PO Value**: LKR 4,589,500

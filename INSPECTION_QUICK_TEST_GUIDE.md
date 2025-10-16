# Quick Test Guide - Inspection Management

## 🚀 Quick Start

### 1. Seed the Data
```bash
cd server
node seed/seedInspectionData.js
```

## 👤 Test Accounts

### Client Login
```
Email: nimal.silva@yahoo.com
Password: Password@123
```

### Finance Manager Login
```
Email: saman.karunaratne@hotmail.com
Password: Admin@123
```

## 📋 Test Data Summary

| Data Type | Count | Details |
|-----------|-------|---------|
| **Clients** | 15 | Can submit inspection requests |
| **Finance Managers** | 3 | Handle estimations & payments |
| **Inspection Requests** | 12 | Various statuses & property types |
| **Estimations** | 7 | LKR 14,300 - 25,900 |
| **Payments** | 7 | 4 Pending, 3 Approved |

## 🧪 Test Scenarios

### Scenario 1: View Pending Requests (Finance Manager)
- **Status**: 4 pending requests
- **Action**: Finance manager views all pending inspection requests
- **Expected**: List of 4 requests awaiting estimation

### Scenario 2: Create Estimation (Finance Manager)
- **Status**: Pending request available
- **Action**: Create estimation for property in Panadura
- **Input**: Distance (km), Estimated Cost (LKR)
- **Expected**: Status changes to "assigned", estimation saved

### Scenario 3: Submit Payment (Client)
- **Status**: Assigned/In-progress with estimation
- **Action**: Client uploads payment receipt
- **Expected**: Payment record created with status "Pending"

### Scenario 4: Verify Payment (Finance Manager)
- **Status**: 4 payments pending verification
- **Action**: Approve or reject payment
- **Expected**: Payment status updated, notification sent

### Scenario 5: View Completed Inspections
- **Status**: 3 completed inspections
- **Action**: View inspection history
- **Expected**: Display completed requests with payments

### Scenario 6: Different Property Types
- **Residential**: Houses with 1-3 floors
- **Commercial**: Office buildings
- **Apartments**: Condo units
- **Action**: Test each property type
- **Expected**: Correct cost calculation for each type

## 💰 Cost Calculation Formula

```javascript
Base Cost: LKR 5,000
Distance Cost: Distance × LKR 50/km
Property Cost: Number of Rooms × LKR 1,500
Floor Cost: Number of Floors × LKR 2,000

Total = Base + Distance + Property + Floor
```

**Example:**
- Property: 5 rooms, 2 floors, 20 km away
- Calculation: 5,000 + (20×50) + (5×1,500) + (2×2,000)
- Total: LKR 17,500

## 🗺️ Sample Properties

| Location | Type | Rooms | Floors | Distance | Cost |
|----------|------|-------|--------|----------|------|
| Kalutara | Residential | 4 | 1 | 5 km | LKR 18,250 |
| Colombo | Commercial | 6 | 1 | 24 km | LKR 17,700 |
| Kurunegala | Residential | 5 | 2 | 81 km | LKR 20,550 |

## 🔄 Workflow States

```
┌─────────────┐
│   Pending   │ ← Initial request
└──────┬──────┘
       │ Finance manager creates estimation
       ↓
┌─────────────┐
│  Assigned   │ ← Estimation created
└──────┬──────┘
       │ Inspector starts work
       ↓
┌─────────────┐
│ In-Progress │ ← Inspection ongoing
└──────┬──────┘
       │ Payment verified & work done
       ↓
┌─────────────┐
│  Completed  │ ← Finished
└─────────────┘
```

## 📊 Data Distribution

### By Status
- Pending: 4 (33%)
- Assigned: 2 (17%)
- In-Progress: 2 (17%)
- Completed: 3 (25%)
- Cancelled: 1 (8%)

### By Property Type
- Residential: ~40%
- Commercial: ~30%
- Apartment: ~30%

### By Payment Status
- Pending: 4 (57%)
- Approved: 3 (43%)
- Rejected: 0 (0%)

## 🔍 API Testing Examples

### 1. Get Pending Requests
```http
GET /api/inspection-estimation/pending
Authorization: Bearer <finance-manager-token>
```

### 2. Create Estimation
```http
POST /api/inspection-estimation/:inspectionRequestId/estimate
Authorization: Bearer <finance-manager-token>
Content-Type: application/json

{
  "distance": 25,
  "estimatedCost": 18500
}
```

### 3. Verify Payment
```http
POST /api/inspection-estimation/:inspectionRequestId/verify-payment
Authorization: Bearer <finance-manager-token>
Content-Type: application/json

{
  "paymentAmount": 18500
}
```

## ✅ Checklist for Complete Testing

- [ ] Login as client and finance manager
- [ ] View all pending inspection requests
- [ ] Create estimation for at least 2 requests
- [ ] Submit payment receipts
- [ ] Approve 2 payments
- [ ] Reject 1 payment (test rejection flow)
- [ ] View completed inspections
- [ ] Test different property types
- [ ] Verify cost calculations
- [ ] Check data relationships (User → Request → Estimation → Payment)

## 🐛 Common Issues & Solutions

### Issue: Can't find pending requests
**Solution**: Make sure you're logged in as a finance manager

### Issue: Estimation creation fails
**Solution**: Check if request status is "pending" and no estimation exists yet

### Issue: Payment amount mismatch
**Solution**: Verify the payment amount matches the estimation

### Issue: No data showing
**Solution**: Run the seed file: `node seed/seedInspectionData.js`

## 🔄 Reset & Re-seed

### Clear All Data (Keep Users)
```bash
node seed/clearAllDataExceptUsers.js
```

### Re-seed Inspection Data
```bash
node seed/seedInspectionData.js
```

## 📝 Notes

- All amounts in **LKR (Sri Lankan Rupees)**
- Realistic Sri Lankan names, locations, and phone numbers
- Distance range: 5-91 km
- Cost range: LKR 14,300 - 25,900
- Multiple property types and sizes for comprehensive testing

---

**Happy Testing! 🎉**

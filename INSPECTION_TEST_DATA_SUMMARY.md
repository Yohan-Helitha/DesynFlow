# Inspection Management Test Data Summary

## 📊 Overview
Successfully created realistic dummy data for testing the Inspection Management system with proper relationships between all models.

## ✅ Data Created

### 👥 Users (18 Total)
- **15 Clients** - Regular users who submit inspection requests
- **3 Finance Managers** - Staff who handle estimations and payment verification

### 📝 Inspection Requests (12 Total)
Realistic property inspection requests across Sri Lanka with various statuses:

| Status | Count | Description |
|--------|-------|-------------|
| **Pending** | 4 | New requests awaiting estimation |
| **Assigned** | 2 | Requests assigned to inspectors with estimation created |
| **In Progress** | 2 | Active inspections underway |
| **Completed** | 3 | Finished inspections with approved payments |
| **Cancelled** | 1 | Cancelled request |

#### Property Types Distribution:
- **Residential**: Houses with 1-3 floors, 3-8 rooms
- **Commercial**: Office buildings, shops
- **Apartments**: Multi-story apartment units

#### Locations:
Colombo, Kandy, Galle, Negombo, Jaffna, Kurunegala, Kalutara, Trincomalee, Moratuwa, Batticaloa, Panadura

### 💰 Inspection Estimations (7 Total)
Cost estimates calculated based on:
- **Base Cost**: LKR 5,000
- **Distance**: LKR 50 per km
- **Property Size**: LKR 1,500 per room
- **Floors**: LKR 2,000 per floor

**Sample Estimations:**
- Kalutara property: LKR 18,250 (5 km, residential)
- Colombo property: LKR 17,700 (24 km, commercial)
- Kurunegala property: LKR 25,900 (58 km, residential)

### 💳 Payments (7 Total)
Payment records for inspection costs:

| Status | Count | Description |
|--------|-------|-------------|
| **Pending** | 4 | Awaiting verification |
| **Approved** | 3 | Verified and approved |
| **Rejected** | 0 | Rejected (none yet) |

**Payment Methods**: Bank Transfer, Online Payment, Cash

## 🔐 Sample Login Credentials

### Client Account
- **Email**: nimal.silva@yahoo.com
- **Password**: Password@123
- **Role**: client

### Finance Manager Account
- **Email**: saman.karunaratne@hotmail.com
- **Password**: Admin@123
- **Role**: finance manager

## 🧪 Test Scenarios Covered

### 1. View Pending Inspection Requests
- 4 requests with status "pending"
- Ready for finance managers to create estimations

### 2. Generate Estimation
- Test on pending requests
- Calculate costs based on distance and property details

### 3. Payment Submission
- 4 payments in "Pending" status
- Clients can upload payment receipts

### 4. Payment Verification
- Finance managers can approve/reject payments
- 3 already approved for reference

### 5. View Inspection History
- 3 completed inspections with full workflow
- 2 in-progress inspections
- 1 cancelled inspection

### 6. Different Property Types
- Residential: Family homes
- Commercial: Business properties
- Apartments: Condo units

### 7. Distance-Based Pricing
- Range: 5 km - 91 km
- Tests pricing calculation logic

### 8. Multiple Rooms/Floors
- 3-8 rooms per property
- 1-3 floors per property

## 📁 Data Relationships

```
User (Client)
    ↓ creates
InspectionRequest
    ↓ generates (by Finance Manager)
InspectionEstimation
    ↓ triggers
Payment (InspectionCost)
    ↓ verified by
User (Finance Manager)
```

## 🔄 Workflow States

1. **Client submits request** → Status: `pending`
2. **Finance manager creates estimation** → Status: `assigned`
3. **Inspector starts work** → Status: `in-progress`
4. **Payment verified & inspection done** → Status: `completed`

## 🌍 Realistic Sri Lankan Context

### Names
- Nimal Silva, Kumari Fernando, Ajith Perera, etc.

### Phone Numbers
- Format: 071/077/076/075-XXXXXXX

### Locations
- Major cities: Colombo, Kandy, Galle
- Secondary cities: Kurunegala, Batticaloa, Jaffna
- Coastal areas: Negombo, Mount Lavinia, Trincomalee

### Streets
- Galle Road, Duplication Road, Reid Avenue
- Station Road, Main Street, Temple Road

### Currency
- All amounts in **LKR (Sri Lankan Rupees)**
- Realistic pricing: LKR 14,300 - 25,900 per inspection

## 🚀 Usage Instructions

### Run the Seed File
```bash
cd server
node seed/seedInspectionData.js
```

### Clear Data (Keep Users)
```bash
node seed/clearAllDataExceptUsers.js
```

### Re-seed After Clearing
```bash
node seed/seedInspectionData.js
```

## 📊 API Endpoints to Test

1. **GET** `/api/inspection-estimation/pending` - View pending requests
2. **POST** `/api/inspection-estimation/:id/estimate` - Generate estimation
3. **POST** `/api/inspection-estimation/:id/verify-payment` - Verify payment
4. **GET** `/api/inspection-estimation/payment-pending` - View payment pending
5. **GET** `/api/inspection-estimation/payment-history` - View completed

## 💡 Tips for Testing

1. **Login as Finance Manager** to create estimations
2. **Login as Client** to view their requests
3. **Test different property types** (residential, commercial, apartment)
4. **Test payment approval/rejection** workflow
5. **Check calculation accuracy** based on distance and rooms
6. **Verify data relationships** between models

## 🎯 Success Metrics

✅ 12 inspection requests with diverse statuses
✅ 7 estimations with realistic pricing
✅ 7 payments in different states
✅ 18 users (15 clients + 3 managers)
✅ Proper foreign key relationships
✅ Realistic Sri Lankan context
✅ Complete workflow coverage

---

**Last Updated**: October 15, 2025
**Status**: ✅ Ready for Testing

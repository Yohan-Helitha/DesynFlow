# Seed Files Status & Usage Guide

## ✅ Fixed & Working Seed Files

### 1. Payment Seed File
**File**: `server/seed/seedPaymentData.js`  
**Status**: ✅ Fixed and working  
**Database**: MongoDB Atlas (connected correctly)

**Run Command**:
```bash
cd server
node seed/seedPaymentData.js
```

**What it creates**:
- 14 Users (12 clients + 2 finance managers)
- 12 Projects
- 20 Payments (11 pending, 6 approved, 3 rejected)
  - 4 pending WITH receipts (verifiable)
  - 5 pending WITHOUT receipts (NOT verifiable)

**Use Case**: Test Payment verification workflow, especially the feature where "Verify Payment" button is disabled when no receipt is uploaded.

---

### 2. Purchase Order Seed File
**File**: `server/seed/seedPurchaseOrderData.js`  
**Status**: ✅ Fixed and working  
**Database**: MongoDB Atlas (connected correctly)

**Run Command**:
```bash
cd server
node seed/seedPurchaseOrderData.js
```

**What it creates**:
- 11 Users (5 clients + 2 finance managers + 2 procurement officers + 2 project managers)
- 5 Projects
- 15 Materials
- 8 Suppliers
- 12 Purchase Orders (covering all statuses: Draft, Pending Approval, Approved, Rejected, Sent to Supplier, In Progress, Delivered, Closed)

**Use Case**: Test complete Purchase Order workflow from creation to delivery.

---

### 3. Estimation Seed File
**File**: `server/seed/seedEstimationData.js`  
**Status**: ✅ Already working (uses connectDB)  
**Database**: Uses config/db.js connection

**Run Command**:
```bash
cd server
node seed/seedEstimationData.js
```

**What it creates**:
- 23 Users (12 clients + 3 PMs + 2 finance managers + 6 team members)
- 12 Projects
- 12 Inspection Requests
- 12 Project Estimations (with versions)
- 7 Quotation Estimations
- 15 Materials
- 3 Teams

**Use Case**: Test Estimation and Quotation management features.

---

## 🔧 What Was Fixed?

### Problem:
The seed files were using `process.env.MONGODB_URI` but your `.env` file uses `MONGO_URI`, causing them to connect to local MongoDB instead of Atlas.

### Solution:
Updated the MongoDB URI line in both seed files:

**Before**:
```javascript
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/desynflow';
```

**After**:
```javascript
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/desynflow';
```

This checks for `MONGO_URI` first (your actual env variable), then falls back to `MONGODB_URI`, and finally to local if neither exists.

---

## 📊 Current Database State (MongoDB Atlas)

After running both fixed seed files, your Atlas database now contains:

### Collections with Data:
✅ **users** (26 users total from both seeds)
✅ **projects** (17 projects total)
✅ **payments** (20 payments)
✅ **purchaseorders** (12 purchase orders)
✅ **materials** (30 materials - 15 from each seed)
✅ **suppliers** (8 suppliers)

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
- (and 10 more - check the seed output)

---

## 📝 Testing Guides

Detailed testing guides are available:

1. **PAYMENT_TEST_GUIDE.md** - Payment section testing
2. **PAYMENT_TEST_DATA_SUMMARY.md** - Quick payment test reference
3. **PURCHASE_ORDER_TEST_GUIDE.md** - Purchase order testing

---

## 🚀 Quick Start for Testing

### Test Payment Section:
```bash
# 1. Run seed
cd server
node seed/seedPaymentData.js

# 2. Login as finance manager
# Email: fm1@desynflow.com
# Password: password123

# 3. Navigate to: Finance Portal → Payments → Pending Payments
# 4. Test: Click "Action" on payments without receipts
# 5. Verify: "Verify Payment" button is disabled
```

### Test Purchase Order Section:
```bash
# 1. Run seed
cd server
node seed/seedPurchaseOrderData.js

# 2. Login as procurement officer
# Email: po1@desynflow.com
# Password: password123

# 3. Navigate to: Purchase Orders
# 4. Test: View different order statuses
# 5. Login as finance manager to approve/reject orders
```

---

## ⚠️ Important Notes

1. **Data Cleanup**: Both seed files DELETE existing data from their respective collections before inserting new data.

2. **User Overlap**: Running both seeds will create users with similar roles. The last seed run will determine which users exist.

3. **MongoDB Connection**: Ensure your `.env` file has the correct `MONGO_URI` value pointing to your Atlas cluster.

4. **Environment Variables**: The seed files now check for both `MONGO_URI` and `MONGODB_URI` for compatibility.

---

## 🐛 Troubleshooting

### Issue: "No data in database after running seed"
**Solution**: Check that your `.env` has `MONGO_URI` set correctly. The seed files now support both `MONGO_URI` and `MONGODB_URI`.

### Issue: "Connection timeout"
**Solution**: Verify your MongoDB Atlas cluster is accessible and the connection string is correct.

### Issue: "Old data still showing"
**Solution**: The seed files clear data before inserting. If you see old data, you may be looking at a different database.

---

## ✅ Verification Checklist

After running seed files, verify in MongoDB Atlas:

- [ ] Users collection has 26+ documents
- [ ] Projects collection has 17+ documents
- [ ] Payments collection has 20 documents
- [ ] PurchaseOrders collection has 12 documents
- [ ] Materials collection has 30 documents
- [ ] Suppliers collection has 8 documents

---

**Last Updated**: October 15, 2025  
**Fixed Files**: seedPaymentData.js, seedPurchaseOrderData.js  
**Status**: All seed files working correctly with MongoDB Atlas

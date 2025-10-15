# Payment Section Testing Guide

## 📋 Overview
This guide provides comprehensive instructions for testing the Payment Management functionality in the Finance Portal.

## 🚀 Quick Start

### 1. Run the Seed Script
```powershell
cd server
node seed/seedPaymentData.js
```

### 2. Login Credentials
- **Finance Manager**: `fm1@desynflow.com` / `password123`
- **Client**: `john.anderson@email.com` / `password123`

---

## 📊 Seed Data Summary

### Created Data:
- **12 Clients** - Various client accounts
- **2 Finance Managers** - For payment verification
- **12 Projects** - Different construction projects
- **25 Payments** - Comprehensive payment scenarios

### Payment Breakdown:
- **Pending Payments**: 12 total
  - 4 with receipts (✅ Should be verifiable)
  - 8 without receipts (⚠️ Should NOT be verifiable)
- **Approved Payments**: 10
- **Rejected Payments**: 3

### Payment Types:
- **Inspection Cost** - Initial inspection fees
- **Project Payment** - Main project payments
- **Advance** - Advance payments

### Payment Methods:
- **Bank Transfer**
- **Online Payment**
- **Cash**

---

## 🧪 Test Cases

### Test Case 1: Verify Button Disabled Without Receipt ⚠️
**Purpose**: Ensure payment verification requires receipt upload

**Steps**:
1. Navigate to Finance Portal → Payments Section → Pending Payments
2. Find payments WITHOUT receipts (look for "No Receipt" in Receipt column)
3. Click "Action" button for a payment without receipt
4. **Expected Result**: 
   - "Verify Payment" button should be **disabled** (grayed out)
   - Hovering shows tooltip: "Cannot verify payment without receipt upload"
   - "Reject Payment" button remains enabled

**Test Payments**:
- Shopping Mall - Negombo (Client: david_miller) - LKR 850,000
- Hotel Renovation - Galle (Client: jennifer_wilson) - LKR 125,000
- Condominium - Dehiwala (Client: robert_moore) - LKR 450,000
- Restaurant & Bar - Colombo 07 (Client: lisa_taylor) - LKR 1,200,000
- School Building - Matara (Client: william_anderson) - LKR 680,000

---

### Test Case 2: Verify Button Enabled With Receipt ✅
**Purpose**: Allow verification when receipt is uploaded

**Steps**:
1. Navigate to Finance Portal → Payments Section → Pending Payments
2. Find payments WITH receipts (shows "View Receipt" link)
3. Click "Action" button for a payment with receipt
4. **Expected Result**: 
   - "Verify Payment" button should be **enabled** (green)
   - Can click to verify payment
   - Receipt preview shown in modal

**Test Payments**:
- Luxury Villa - Mount Lavinia (Client: john_anderson) - LKR 250,000
- Modern Office Complex - Colombo 03 (Client: sarah_williams) - LKR 1,500,000
- Residential Apartment - Kandy (Client: michael_brown) - LKR 75,000
- Beach Resort - Bentota (Client: emily_davis) - LKR 2,800,000

---

### Test Case 3: Payment Verification Flow ✅
**Purpose**: Test complete payment verification process

**Steps**:
1. Open a pending payment WITH receipt
2. Review payment details and receipt
3. Add optional comment
4. Click "Verify Payment"
5. **Expected Result**:
   - Payment status changes to "Approved"
   - Payment moves from Pending to Payment History
   - Verified date and comment recorded

---

### Test Case 4: Payment Rejection Flow ❌
**Purpose**: Test payment rejection functionality

**Steps**:
1. Open a pending payment (with or without receipt)
2. Add rejection comment (e.g., "Incorrect amount")
3. Click "Reject Payment"
4. **Expected Result**:
   - Payment status changes to "Rejected"
   - Payment moves to Payment History
   - Rejection comment saved

---

### Test Case 5: Receipt Viewing 📄
**Purpose**: Verify receipt preview and download

**Steps**:
1. Open payment modal with receipt
2. Check receipt preview section
3. Click "View Receipt" button
4. **Expected Result**:
   - PDF preview shown in iframe (for PDF receipts)
   - Image preview shown (for image receipts)
   - Download link opens receipt in new tab

---

### Test Case 6: Payment History 📊
**Purpose**: View all payment statuses

**Steps**:
1. Navigate to Payment History tab
2. Filter by status (Pending/Approved/Rejected)
3. **Expected Result**:
   - All payments displayed
   - Can filter by status, method, type
   - Approved payments show verified date
   - Rejected payments show rejection reason

---

### Test Case 7: Search and Filter 🔍
**Purpose**: Test search functionality

**Steps**:
1. Use search bar in Pending Payments
2. Search by:
   - Payment ID
   - Project name
   - Client name
   - Amount
3. **Expected Result**:
   - Results filter dynamically
   - Pagination updates accordingly

---

### Test Case 8: Sorting 🔄
**Purpose**: Test table sorting

**Steps**:
1. Click column headers (Amount, Date, etc.)
2. **Expected Result**:
   - Table sorts ascending/descending
   - Sort indicator shown

---

### Test Case 9: Pagination 📄
**Purpose**: Test pagination with multiple payments

**Steps**:
1. Navigate through pages (10 items per page)
2. **Expected Result**:
   - Correct number of items per page
   - Page numbers update
   - Total count displayed

---

## 🎯 Key Validation Points

### ✅ Must Pass:
1. **NO verification without receipt** - This is critical for audit compliance
2. Verify button disabled state visible (grayed out)
3. Tooltip explains why button is disabled
4. Reject button always enabled (can reject without receipt)
5. Receipt preview works for PDF and images
6. Status changes reflect immediately
7. Comments saved with approvals/rejections

### ⚠️ Edge Cases:
1. Payment with null receiptUrl
2. Payment with empty string receiptUrl
3. Multiple payments for same project
4. Large payment amounts (formatting)
5. Very long comments (500 char limit)

---

## 📊 Sample Test Data

### Payments WITH Receipts (4):
| Project | Client | Amount | Type | Method |
|---------|--------|--------|------|--------|
| Luxury Villa - Mount Lavinia | john_anderson | 250,000 | Advance | Bank |
| Modern Office Complex - Colombo 03 | sarah_williams | 1,500,000 | ProjectPayment | Online |
| Residential Apartment - Kandy | michael_brown | 75,000 | InspectionCost | Bank |
| Beach Resort - Bentota | emily_davis | 2,800,000 | ProjectPayment | Bank |

### Payments WITHOUT Receipts (8):
| Project | Client | Amount | Type | Method |
|---------|--------|--------|------|--------|
| Shopping Mall - Negombo | david_miller | 850,000 | Advance | Online |
| Hotel Renovation - Galle | jennifer_wilson | 125,000 | InspectionCost | Cash |
| Condominium - Dehiwala | robert_moore | 450,000 | Advance | Bank |
| Restaurant & Bar - Colombo 07 | lisa_taylor | 1,200,000 | ProjectPayment | Online |
| School Building - Matara | william_anderson | 680,000 | Advance | Bank |
| Condominium - Dehiwala | robert_moore | 95,000 | InspectionCost | Online |
| Restaurant & Bar - Colombo 07 | lisa_taylor | 320,000 | Advance | Cash |

---

## 🐛 Known Issues to Check

1. **Button State**: Verify button should be visually disabled (gray, not clickable)
2. **Tooltip**: Hover message should appear on disabled button
3. **Receipt Preview**: Both PDF and image receipts should display correctly
4. **Status Update**: After verify/reject, modal should close and list refresh
5. **Comment Length**: Should not exceed 500 characters

---

## 📝 Testing Checklist

- [ ] Seed data created successfully (25 payments)
- [ ] Can login as Finance Manager
- [ ] Pending Payments page loads
- [ ] Payments without receipts show "No Receipt"
- [ ] Payments with receipts show "View Receipt" link
- [ ] Action button opens modal
- [ ] Verify button DISABLED for payments without receipts
- [ ] Verify button ENABLED for payments with receipts
- [ ] Tooltip shows on disabled button hover
- [ ] Receipt preview displays correctly
- [ ] Can verify payment with receipt
- [ ] Can reject any payment
- [ ] Comments save correctly
- [ ] Payment moves to history after verify/reject
- [ ] Search functionality works
- [ ] Sorting works on all columns
- [ ] Pagination works correctly

---

## 🔧 Troubleshooting

### Problem: Verify button not disabled
**Solution**: Check if `payment.receiptUrl` is null/undefined in ViewPaymentModal

### Problem: No payments showing
**Solution**: 
1. Check if seed script ran successfully
2. Verify MongoDB connection
3. Check API endpoint `/api/payments/pending`

### Problem: Receipt preview not loading
**Solution**:
1. Check receipt URL format
2. Verify file exists in uploads folder
3. Check `buildUploadsUrl` utility function

---

## 📞 Support

If you encounter any issues:
1. Check browser console for errors
2. Check server logs
3. Verify seed data was created
4. Check MongoDB documents directly

---

## 🎉 Success Criteria

All tests pass when:
- ✅ Payments without receipts cannot be verified
- ✅ Payments with receipts can be verified
- ✅ UI clearly indicates disabled state
- ✅ All CRUD operations work
- ✅ Data displays correctly
- ✅ Audit trail maintained (comments, dates, verifiedBy)

---

**Last Updated**: October 15, 2025
**Version**: 1.0

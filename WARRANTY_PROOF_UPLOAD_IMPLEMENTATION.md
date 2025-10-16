# Warranty Proof Upload - Implementation Summary

## Overview
Added file upload capability for warranty claims to allow clients/staff to submit proof documents (images/PDFs) when filing warranty claims.

## Backend Changes

### 1. Created Upload Middleware
**File:** `server/modules/finance/middleware/warrantyProofUpload.js`
- Uses multer for file handling
- Accepts: JPEG, JPG, PNG, PDF files
- Max file size: 10MB
- Storage location: `uploads/warranty-proofs/`
- Filename format: `warranty-proof-{timestamp}-{random}.{ext}`

### 2. Updated Claim Controller
**File:** `server/modules/finance/controller/claimController.js`
- Modified `createClaim` to extract uploaded file
- Automatically sets `proofUrl` from uploaded file path
- Format: `/uploads/warranty-proofs/{filename}`

### 3. Updated Claim Routes
**File:** `server/modules/finance/routes/claimRoutes.js`
- Added multer middleware to POST /api/claims route
- Route now accepts multipart/form-data with field name: `proofFile`

### 4. Created Upload Directory
**Directory:** `server/uploads/warranty-proofs/`
- Created directory structure for warranty proof storage

## Frontend Changes

### 1. Warranty Requests Table
**File:** `frontend/staff-dashboard/src/finance-portal/components/WarrantySection/WarrantyRequest.jsx`
- Added "Proof" column between "Issue" and "Status"
- Shows "View" link if proof exists
- Shows "No proof" in gray if no proof uploaded
- Links open in new tab

### 2. Warranty Requests History Table
**File:** `frontend/staff-dashboard/src/finance-portal/components/WarrantySection/WarrantyRequestHistory.jsx`
- Added "Proof" column between "Issue" and "Status"
- Same display logic as Warranty Requests table
- Consistent styling and behavior

### 3. Warranty Claim Action Modal
**File:** `frontend/staff-dashboard/src/finance-portal/components/WarrantySection/WarrantyClaimActionModal.jsx`
- Already had proof display section (no changes needed)
- Shows "Attached Proof" section at bottom
- "Open Proof" button to view document in new tab
- Displays proof URL

## Database Schema

### Warranty Claim Model (Already Existed)
**File:** `server/modules/finance/model/warrenty_claim.js`
```javascript
{
  warrantyId: ObjectId,
  clientId: ObjectId,
  issueDescription: String,
  proofUrl: String,  // ← Used for file upload path
  status: String,
  financeReviewerId: ObjectId,
  warehouseAction: {
    shippedReplacement: Boolean,
    shippedAt: Date
  },
  timestamps: true
}
```

## API Endpoints

### Create Warranty Claim (Updated)
```
POST /api/claims
Content-Type: multipart/form-data

Fields:
- warrantyId: ObjectId (required)
- clientId: ObjectId (required)
- description: String (required)
- proofFile: File (optional) - JPEG/JPG/PNG/PDF up to 10MB

Response:
{
  "_id": "...",
  "warrantyId": "...",
  "clientId": "...",
  "issueDescription": "...",
  "proofUrl": "/uploads/warranty-proofs/warranty-proof-1234567890-123456789.pdf",
  "status": "Submitted",
  "createdAt": "2025-10-15T...",
  "updatedAt": "2025-10-15T..."
}
```

## Usage Examples

### Backend - Submitting Claim with Proof (cURL)
```bash
curl -X POST http://localhost:3000/api/claims \
  -F "warrantyId=68ef8b3ce57fe26d92d09f4f" \
  -F "clientId=68ef8b3ce57fe26d92d09f01" \
  -F "description=Paint peeling from walls" \
  -F "proofFile=@/path/to/photo.jpg"
```

### Frontend - Form Submission (React)
```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const formData = new FormData();
  formData.append('warrantyId', warrantyId);
  formData.append('clientId', clientId);
  formData.append('description', description);
  if (proofFile) {
    formData.append('proofFile', proofFile); // File from input
  }
  
  const response = await fetch('/api/claims', {
    method: 'POST',
    body: formData // Don't set Content-Type header
  });
  
  const claim = await response.json();
};
```

### HTML Form Example
```html
<form action="/api/claims" method="POST" enctype="multipart/form-data">
  <input type="text" name="warrantyId" required />
  <input type="text" name="clientId" required />
  <textarea name="description" required></textarea>
  <input type="file" name="proofFile" accept=".jpg,.jpeg,.png,.pdf" />
  <button type="submit">Submit Claim</button>
</form>
```

## Table Display

### Before:
| Client Name | Issue | Status | Created | Actions |
|-------------|-------|--------|---------|---------|
| John Smith | Paint peeling | Submitted | 10/15/2025 | Action |

### After:
| Client Name | Issue | Proof | Status | Created | Actions |
|-------------|-------|-------|--------|---------|---------|
| John Smith | Paint peeling | [View](#) | Submitted | 10/15/2025 | Action |
| Jane Doe | Crack in tile | No proof | UnderReview | 10/14/2025 | Action |

## File Storage Structure

```
server/
├── uploads/
│   └── warranty-proofs/
│       ├── warranty-proof-1729010400000-123456789.jpg
│       ├── warranty-proof-1729010500000-987654321.pdf
│       └── warranty-proof-1729010600000-555555555.png
```

## Security Considerations

1. **File Type Validation**: Only JPEG, JPG, PNG, PDF files accepted
2. **File Size Limit**: 10MB maximum to prevent abuse
3. **Filename Sanitization**: Uses timestamp + random number to prevent conflicts
4. **MIME Type Checking**: Validates both file extension and MIME type
5. **Separate Directory**: Warranty proofs stored in isolated directory

## Next Steps (Optional Enhancements)

### 1. Create Warranty Claim Submission Form (Client Portal)
- Form with file upload field
- Real-time file validation
- Preview uploaded file before submission

### 2. Add Image Preview in Modal
- Display image thumbnails directly in modal
- PDF preview using iframe or viewer

### 3. Multiple File Upload
- Allow multiple proof files per claim
- Change `proofUrl` to `proofUrls: [String]` array
- Update upload middleware to handle multiple files

### 4. File Deletion
- When claim is rejected/closed, option to delete proof files
- Cleanup script for orphaned files

### 5. Cloud Storage Integration
- AWS S3, Cloudinary, or similar
- Better scalability and CDN delivery

## Testing

### Test File Upload
```bash
# Navigate to server directory
cd server

# Test with sample file
curl -X POST http://localhost:3000/api/claims \
  -F "warrantyId=VALID_WARRANTY_ID" \
  -F "clientId=VALID_CLIENT_ID" \
  -F "description=Test claim with proof" \
  -F "proofFile=@test-image.jpg"
```

### Verify Upload
```bash
# Check if file was created
ls -la uploads/warranty-proofs/

# Check database for proofUrl
# Using MongoDB Compass or CLI to verify claim document has proofUrl field
```

## Troubleshooting

### File Not Uploading
- Check if `uploads/warranty-proofs/` directory exists
- Verify file size is under 10MB
- Confirm file type is JPEG/JPG/PNG/PDF
- Check Content-Type header is `multipart/form-data`

### Proof Link Not Working
- Verify server is serving static files from `uploads/` directory
- Check if path starts with `/uploads/` or needs base URL
- Confirm file exists in the uploads directory

### Permission Errors
- Ensure write permissions on `uploads/warranty-proofs/` directory
- On Linux/Mac: `chmod 755 uploads/warranty-proofs`

## Implementation Checklist

✅ Created warranty proof upload middleware  
✅ Updated claim controller to handle file uploads  
✅ Updated claim routes with multer middleware  
✅ Created uploads/warranty-proofs directory  
✅ Added Proof column to Warranty Requests table  
✅ Added Proof column to Warranty Requests History table  
✅ Verified Warranty Claim Action Modal displays proof  
✅ Updated documentation  

## Files Modified

### Backend
1. `server/modules/finance/middleware/warrantyProofUpload.js` (NEW)
2. `server/modules/finance/controller/claimController.js` (MODIFIED)
3. `server/modules/finance/routes/claimRoutes.js` (MODIFIED)
4. `server/uploads/warranty-proofs/` (DIRECTORY CREATED)

### Frontend
1. `frontend/staff-dashboard/src/finance-portal/components/WarrantySection/WarrantyRequest.jsx` (MODIFIED)
2. `frontend/staff-dashboard/src/finance-portal/components/WarrantySection/WarrantyRequestHistory.jsx` (MODIFIED)

### Documentation
1. `WARRANTY_PROOF_UPLOAD_IMPLEMENTATION.md` (THIS FILE)

# API Documentation - Project Manager Endpoints

## 📡 Overview
This document outlines all API endpoints created for the Project Manager Dashboard integration, including both Inspection Reports and Budget Approval systems.

## 🔐 Authentication
All endpoints require JWT authentication with Project Manager role privileges.

**Headers Required:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## 📊 Inspection Report Endpoints

### Get Submitted Inspection Reports
Retrieve all inspection reports submitted through the inspector portal.

**Endpoint:** `GET /api/project/submitted-inspection-reports`

**Description:** Fetches all inspection reports that have been submitted by inspectors for project manager review.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "report_id",
      "projectId": "project_id", 
      "inspectorId": "inspector_id",
      "reportType": "quality_inspection",
      "status": "submitted",
      "findings": "Inspection findings...",
      "recommendations": "Recommendations...",
      "submittedAt": "2025-10-18T08:30:00Z",
      "inspector": {
        "_id": "inspector_id",
        "name": "Inspector Name",
        "email": "inspector@email.com"
      }
    }
  ]
}
```

**Error Responses:**
```json
// 401 Unauthorized
{
  "success": false,
  "message": "Authentication required"
}

// 403 Forbidden  
{
  "success": false,
  "message": "Project Manager access required"
}

// 500 Internal Server Error
{
  "success": false,
  "message": "Failed to fetch inspection reports",
  "error": "Error details"
}
```

## 💰 Budget Management Endpoints

### Get All Estimations for PM Review
Retrieve all budget estimations that require project manager approval.

**Endpoint:** `GET /api/project/estimations`

**Description:** Fetches all budget estimations with project details, sorted by newest first.

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `approved`, `rejected`)
- `projectId` (optional): Filter by specific project

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "estimation_id",
      "projectId": {
        "_id": "project_id",
        "projectName": "Project Alpha",
        "status": "active"
      },
      "version": 1,
      "materialCost": 10000,
      "laborCost": 15000,
      "serviceCost": 5000,
      "contingencyCost": 2000,
      "total": 32000,
      "status": "pending",
      "createdAt": "2025-10-18T08:00:00Z",
      "createdBy": {
        "_id": "user_id",
        "name": "Finance User",
        "email": "finance@email.com"
      },
      "approvedBy": null,
      "rejectedBy": null,
      "approvedAt": null,
      "rejectedAt": null,
      "remarks": null
    }
  ]
}
```

### Get Specific Estimation Details
Retrieve detailed information about a specific estimation.

**Endpoint:** `GET /api/project/estimation/:id`

**Parameters:**
- `id`: Estimation ID

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "estimation_id",
    "projectId": {
      "_id": "project_id",
      "projectName": "Project Alpha",
      "description": "Project description",
      "status": "active"
    },
    "version": 1,
    "materialCost": 10000,
    "laborCost": 15000,
    "serviceCost": 5000,
    "contingencyCost": 2000,
    "total": 32000,
    "status": "pending",
    "createdAt": "2025-10-18T08:00:00Z",
    "updatedAt": "2025-10-18T08:00:00Z"
  }
}
```

### Approve Estimation
Approve a pending budget estimation.

**Endpoint:** `PUT /api/project/estimation/:id/approve`

**Parameters:**
- `id`: Estimation ID

**Request Body:** (Optional)
```json
{
  "remarks": "Approved with minor adjustments"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Estimation approved successfully",
  "data": {
    "_id": "estimation_id",
    "status": "approved",
    "approvedBy": "pm_user_id",
    "approvedAt": "2025-10-18T09:00:00Z",
    "remarks": "Approved with minor adjustments"
  }
}
```

### Reject Estimation
Reject a pending budget estimation with mandatory remarks.

**Endpoint:** `PUT /api/project/estimation/:id/reject`

**Parameters:**
- `id`: Estimation ID

**Request Body:** (Required)
```json
{
  "remarks": "Budget exceeds project allocation. Please revise material costs."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Estimation rejected successfully",
  "data": {
    "_id": "estimation_id",
    "status": "rejected",
    "rejectedBy": "pm_user_id", 
    "rejectedAt": "2025-10-18T09:00:00Z",
    "remarks": "Budget exceeds project allocation. Please revise material costs."
  }
}
```

**Error Response:**
```json
// 400 Bad Request - Missing remarks
{
  "success": false,
  "message": "Remarks are required for rejection"
}

// 404 Not Found
{
  "success": false,
  "message": "Estimation not found"
}

// 400 Bad Request - Invalid status
{
  "success": false,
  "message": "Only pending estimations can be rejected"
}
```

## 🔄 Common Error Responses

### Authentication Errors
```json
// 401 Unauthorized
{
  "success": false,
  "message": "Authentication token required"
}

// 403 Forbidden
{
  "success": false, 
  "message": "Insufficient permissions - Project Manager role required"
}
```

### Validation Errors
```json
// 400 Bad Request
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "remarks",
      "message": "Remarks field is required for rejection"
    }
  ]
}
```

### Server Errors
```json
// 500 Internal Server Error
{
  "success": false,
  "message": "Internal server error",
  "error": "Database connection failed"
}
```

## 📊 Status Codes Reference

| Status Code | Description |
|-------------|-------------|
| 200 | Success - Request completed successfully |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 422 | Unprocessable Entity - Validation failed |
| 500 | Internal Server Error - Server error |

## 🔧 Rate Limiting
- **Limit**: 100 requests per minute per user
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

## 📋 Request Examples

### Using cURL

**Get all estimations:**
```bash
curl -X GET "http://localhost:3000/api/project/estimations" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json"
```

**Approve estimation:**
```bash
curl -X PUT "http://localhost:3000/api/project/estimation/estimation_id/approve" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"remarks": "Approved"}'
```

**Reject estimation:**
```bash
curl -X PUT "http://localhost:3000/api/project/estimation/estimation_id/reject" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"remarks": "Budget too high, please revise"}'
```

### Using JavaScript Fetch

**Get estimations:**
```javascript
const response = await fetch('/api/project/estimations', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
```

**Approve estimation:**
```javascript
const response = await fetch(`/api/project/estimation/${estimationId}/approve`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

**Reject estimation:**
```javascript
const response = await fetch(`/api/project/estimation/${estimationId}/reject`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    remarks: 'Please revise the material costs'
  })
});
```

## 🧪 Testing Endpoints

### Postman Collection
A Postman collection is available with all endpoints pre-configured:
- Authentication setup
- Environment variables
- Test cases for success/error scenarios

### Test Data
Sample test data is available in the seed files:
- `server/seed/insertSampleData.js` - Creates sample estimations
- Test user accounts with appropriate roles

## 📝 Changelog

### Version 1.0 (2025-10-18)
- Initial implementation of inspection report endpoints
- Budget management endpoints created
- Authentication and authorization implemented
- Error handling standardized
- Documentation completed

---
**Base URL**: `http://localhost:3000` (Development)  
**API Version**: v1  
**Last Updated**: October 18, 2025
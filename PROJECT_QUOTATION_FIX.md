# Project Quotation Display Fix

## Issue
In the Client Portal's Payment Section, projects with quotations were incorrectly showing the message:
> "Quotation not available yet. Payments will be enabled once the quotation is issued."

This occurred even when quotations existed for the projects.

## Root Cause
The frontend was attempting to access `project.quotation.grandTotal` directly from the project object returned by `/api/projects`. However, quotations are stored in a **separate collection** (`Quotation`) and linked to projects via `projectId`. The `/api/projects` endpoint does not populate or include quotation data.

## Solution
Updated `frontend/client-portal/src/client-login/components/payments/PaymentSection.jsx` to:

1. **Fetch quotations separately** from `/api/quotations` endpoint
2. **Store quotations in state** alongside projects
3. **Create a helper function** `getProjectQuotation(projectId)` that:
   - Filters quotations by matching `projectId`
   - Returns only quotations with status 'Sent', 'Confirmed', or 'Locked'
   - Returns the latest version (highest version number)
4. **Use the helper** when calculating payment amounts instead of accessing `project.quotation`

## Changes Made

### 1. Added quotations state
```javascript
const [quotations, setQuotations] = useState([]); // fetched quotations
```

### 2. Created getProjectQuotation helper
```javascript
const getProjectQuotation = (projectId) => {
  const pid = String(getId(projectId));
  // Find the latest 'Sent' or 'Confirmed' quotation for this project
  const projectQuotations = quotations
    .filter(q => String(getId(q.projectId)) === pid)
    .filter(q => q.status === 'Sent' || q.status === 'Confirmed' || q.status === 'Locked')
    .sort((a, b) => (b.version || 0) - (a.version || 0)); // Latest version first
  return projectQuotations.length > 0 ? projectQuotations[0] : null;
};
```

### 3. Added fetchQuotations function
```javascript
const fetchQuotations = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/quotations', { 
      headers: { Authorization: `Bearer ${token}` } 
    });
    setQuotations(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    if (err?.response?.status === 404) {
      console.warn('Quotations endpoint not found (404)');
      setQuotations([]);
      return;
    }
    console.error('Failed to fetch quotations', err?.response?.status, err?.message);
  }
};
```

### 4. Called fetchQuotations on component mount
```javascript
useEffect(() => {
  (async () => {
    await fetchMe();
  })();
  fetchProjects();
  fetchQuotations(); // Added
  fetchMyPayments();
}, []);
```

### 5. Updated project payment rendering
Changed from:
```javascript
const quoteTotal = project.quotation?.grandTotal || project.grandTotal || project.total || 0;
```

To:
```javascript
const quotation = getProjectQuotation(pid);
const quoteTotal = quotation?.grandTotal || 0;
```

### 6. Refreshed quotations after payment upload
Added `fetchQuotations()` call in `handleUploaded` function to ensure quotation data stays in sync.

### 7. Fixed payment type capitalization
The backend requires payment type to be capitalized ('Advance' or 'Final'), but the frontend was sending lowercase ('advance' or 'final'). Added capitalization before sending to backend:
```javascript
const typeCapitalized = ptype.charAt(0).toUpperCase() + ptype.slice(1);
```

### 8. Updated handleUploaded to use getProjectQuotation
Changed the `handleUploaded` function to also use the `getProjectQuotation` helper instead of accessing `project.quotation.grandTotal` directly.

### 9. Enhanced error logging
Added better error logging and user feedback when payment creation fails.

## API Endpoints Used

### `/api/quotations` (GET)
- Returns all quotations the user has access to
- Supports query filters: `status`, `projectId`, `estimateVersion`, `from`, `to`
- Returns quotation objects with fields:
  - `projectId` - Reference to project
  - `grandTotal` - Total quotation amount
  - `status` - 'Draft', 'Sent', 'Revised', 'Confirmed', 'Locked'
  - `version` - Version number
  - And other quotation details

## Testing Checklist

- [x] No syntax errors in PaymentSection.jsx
- [ ] Client portal loads without errors
- [ ] Projects with quotations show correct amounts
- [ ] Projects without quotations show "Quotation not available yet" message
- [ ] Advance payment calculation works correctly
- [ ] Final payment calculation works correctly
- [ ] Payment upload functionality still works
- [ ] Multiple quotation versions handled correctly (latest version used)

## Benefits

1. **Accurate data** - Uses actual quotation data from the database
2. **Version support** - Automatically uses the latest sent/confirmed quotation
3. **Status filtering** - Only considers quotations that are sent/confirmed/locked (not drafts)
4. **Maintainable** - Clear separation of concerns with helper functions
5. **Resilient** - Handles missing quotations gracefully

## Date
October 21, 2025

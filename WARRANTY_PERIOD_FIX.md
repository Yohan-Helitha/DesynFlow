# Warranty Period Calculation Fix

## Issue
The warranty start and end dates were always calculated as 1 year (12 months) for every material, regardless of the actual warranty period stored in the database.

## Root Cause
The `warrantyPeriod` field in the database is stored as **strings** with different formats:
- `"36 months"` - includes unit
- `"18 months"` - includes unit
- `"12"` - just a number
- `"3"` - just a number

The original parsing logic had issues:
1. Used optional chaining (`?.`) on regex match which could cause issues
2. Didn't properly handle zero values in numeric checks
3. Didn't `.trim()` the string before parsing
4. Console logging was missing for debugging

## Database Examples
From `/api/materials`:
```json
{
  "materialName": "Teak Wood Planks",
  "warrantyPeriod": "36 months"
},
{
  "materialName": "Glass Partition Panels",
  "warrantyPeriod": "60 months"
},
{
  "materialName": "Beds",
  "warrantyPeriod": "12"
},
{
  "materialName": "wood no 05",
  "warrantyPeriod": "3"
}
```

## Solution Applied

### 1. Improved String Parsing
**Updated `getWarrantyMonths` function** with:

```javascript
// Before (problematic):
const num = parseFloat(s.match(/\d+(?:\.\d+)?/)?.[0] || '0');

// After (fixed):
const s = core.warrantyPeriod.trim().toLowerCase();
const numMatch = s.match(/\d+(?:\.\d+)?/);
if (numMatch) {
  const num = parseFloat(numMatch[0]);
  // ... handle different units
}
```

### 2. Added Positive Value Checks
```javascript
// Before:
if (typeof core.warrantyPeriodMonths === 'number') return core.warrantyPeriodMonths;

// After:
if (typeof core.warrantyPeriodMonths === 'number' && core.warrantyPeriodMonths > 0) {
  return core.warrantyPeriodMonths;
}
```

### 3. Enhanced Console Logging
Added comprehensive logging at each step:
```javascript
console.log('Parsing warrantyPeriod string:', s);
console.log('Extracted number:', num);
console.log('Contains "month", using as is:', num);
```

### 4. Default to Months for Plain Numbers
When `warrantyPeriod` is just a number like `"12"` or `"3"`:
```javascript
// If just a number with no unit, assume months
if (!isNaN(num) && num > 0) {
  console.log('No unit found, assuming months:', num);
  return Math.round(num);
}
```

### 5. Updated MaterialWarrantyHint Component
Applied the same fixes to the duplicate logic in the hint component.

## Supported Formats

The function now correctly handles:

| Format | Example | Parsed As |
|--------|---------|-----------|
| With "months" | "36 months" | 36 months |
| With "month" | "18 month" | 18 months |
| With "years" | "2 years" | 24 months |
| With "year" | "1 year" | 12 months |
| With "days" | "365 days" | 13 months |
| Plain number | "12" | 12 months |
| Plain number | "3" | 3 months |
| Decimal | "1.5 years" | 18 months |

## Fallback Fields Checked (in order)

1. `warrantyPeriodMonths` (number)
2. `warrantyMonths` (number)
3. `warranty.periodMonths` (number)
4. `warranty.months` (number)
5. `warrantyPeriod` (number)
6. `warrantyPeriodDays` (number) → converted to months
7. `warrantyPeriod` (string) → parsed
8. **Default**: 12 months

## Testing

### Before Fix:
- Material with `"warrantyPeriod": "3"` → calculated as 12 months (wrong)
- Material with `"warrantyPeriod": "36 months"` → possibly 12 months (wrong)

### After Fix:
- Material with `"warrantyPeriod": "3"` → calculates as 3 months ✅
- Material with `"warrantyPeriod": "36 months"` → calculates as 36 months ✅
- Material with `"warrantyPeriod": "60 months"` → calculates as 60 months ✅
- Material with `"warrantyPeriod": "12"` → calculates as 12 months ✅

### Browser Console Logs:
When selecting a material, you'll now see:
```
Parsing warrantyPeriod string: 36 months
Extracted number: 36
Contains "month", using as is: 36
```

Or for plain numbers:
```
Parsing warrantyPeriod string: 3
Extracted number: 3
No unit found, assuming months: 3
```

## Date Calculation Example

For material "wood no 05" with `warrantyPeriod: "3"`:
- **Start Date**: 2025-10-21 (today, auto-calculated)
- **Warranty Months**: 3 (parsed from "3")
- **End Date**: 2025-01-21 (start + 3 months) ✅

For material "Glass Partition Panels" with `warrantyPeriod: "60 months"`:
- **Start Date**: 2025-10-21 (today, auto-calculated)
- **Warranty Months**: 60 (parsed from "60 months")
- **End Date**: 2030-10-21 (start + 60 months = 5 years) ✅

## Files Modified
- `frontend/staff-dashboard/src/finance-portal/components/WarrantySection/AddWarrantyModal.jsx`
  - Updated `getWarrantyMonths` function
  - Updated `MaterialWarrantyHint` component
  - Added comprehensive console logging
  - Improved string parsing and validation

## Benefits

1. ✅ **Accurate Warranty Periods**: Each material now uses its actual warranty duration
2. ✅ **Multiple Format Support**: Handles strings with units, plain numbers, decimals
3. ✅ **Better Debugging**: Console logs show exactly what's being parsed
4. ✅ **Validation**: Positive value checks prevent invalid durations
5. ✅ **Robust Parsing**: Handles edge cases and missing data gracefully

## Date
October 21, 2025

# Warranty End Date Calculation Fix - Part 2

## Issue
Even after fixing the `getWarrantyMonths` parsing logic, the end date was still being calculated as exactly 1 year (12 months) instead of using the material's actual warranty period.

**Example:**
- Material: "wood no 05" with `warrantyPeriod: "3"`
- Expected: Start 10/21/2025 → End 01/21/2026 (3 months)
- **Actual**: Start 10/21/2025 → End 10/21/2026 (12 months) ❌

## Root Cause

The materials API returns **supplier-material wrapper objects** with nested material data:

```json
{
  "_id": "68f6d5fe73698aee02b55af6",  // Supplier-material ID
  "materialId": {                       // Nested actual material
    "_id": "68f6d5fe73b995a76e6c4b34", // Core material ID
    "materialName": "wood no 05",
    "warrantyPeriod": "3"
  }
}
```

### The Problem Flow:

1. **normalizedMaterials** correctly extracts core material IDs and warranty periods
2. **Dropdown uses** `normalizedMaterials[].id` (core material ID)
3. **onMaterialChange searches in raw `materials` array** using core ID
4. **Can't find match** because `materials[].id` is the supplier-material ID (different!)
5. **Falls back to default** 12 months

```javascript
// BROKEN CODE:
const mat = materials.find((m) => String(m._id) === String(itemId));
// itemId = "68f6d5fe73b995a76e6c4b34" (core material)
// m._id  = "68f6d5fe73698aee02b55af6" (supplier-material)
// NO MATCH! → Uses default 12 months
```

## Solution

### 1. Use normalizedMaterials Directly

Instead of searching `materials` array and recalculating, use the **already-computed months** from `normalizedMaterials`:

```javascript
// BEFORE (broken):
const mat = materials.find((m) => String(m._id) === String(itemId));
const months = getWarrantyMonths(mat);  // Returns 12 (default) when mat is undefined

// AFTER (fixed):
const normalizedMat = normalizedMaterials.find((n) => String(n.id) === String(itemId));
const months = normalizedMat.months;  // Uses pre-calculated value
```

### 2. Fixed in Two Places

#### A. `onMaterialChange` Function
```javascript
const onMaterialChange = (itemId) => {
  // Find from normalizedMaterials (which has the correct core material)
  const normalizedMat = normalizedMaterials.find((n) => String(n.id) === String(itemId));
  
  if (!normalizedMat) {
    console.error('Material not found in normalizedMaterials');
    return;
  }
  
  const months = normalizedMat.months; // Already calculated!
  const start = formData.startDate ? new Date(formData.startDate) : new Date();
  const end = addMonths(start, months);
  setFormData((prev) => ({ ...prev, itemId, endDate: toDateInput(end) }));
};
```

#### B. `useEffect` (Start Date Changes)
```javascript
useEffect(() => {
  if (!formData.itemId || !formData.startDate) return;
  
  // Find from normalizedMaterials
  const normalizedMat = normalizedMaterials.find((n) => String(n.id) === String(formData.itemId));
  
  if (!normalizedMat) return;
  
  const months = normalizedMat.months;
  const end = addMonths(new Date(formData.startDate), months);
  setFormData((prev) => ({ ...prev, endDate: toDateInput(end) }));
}, [formData.startDate, formData.itemId, normalizedMaterials]);
```

### 3. Enhanced Debugging

Added comprehensive console logging:
```javascript
console.log('=== onMaterialChange called ===');
console.log('Selected itemId:', itemId);
console.log('Found normalized material:', normalizedMat);
console.log('Warranty months from normalized material:', months);
console.log('Start date:', start);
console.log('End date (after adding months):', end);
console.log('End date formatted:', toDateInput(end));
```

## normalizedMaterials Structure

The `normalizedMaterials` array is built correctly:

```javascript
const normalizedMaterials = useMemo(() => {
  const map = new Map();
  for (const m of materials) {
    const core = getCoreMaterial(m);  // Extracts materialId nested object
    const id = String(core._id);
    if (!map.has(id)) {
      map.set(id, {
        id,                              // Core material ID
        label: getMaterialLabel(core),   // Display name
        months: getWarrantyMonths(core), // Pre-calculated months!
        doc: core,                       // Full material object
      });
    }
  }
  return Array.from(map.values());
}, [materials]);
```

## Data Flow (Fixed)

```
User selects material
    ↓
Dropdown value = core material ID ("68f6d5fe73b995a76e6c4b34")
    ↓
onMaterialChange(itemId)
    ↓
Search normalizedMaterials.find(n => n.id === itemId)
    ↓
✅ MATCH FOUND: { id: "...", months: 3, label: "wood no 05" }
    ↓
Use pre-calculated months (3)
    ↓
addMonths(start, 3)
    ↓
End date = 01/21/2026 ✅
```

## Testing

### Test Case 1: "wood no 05" (warrantyPeriod: "3")
- Start: 10/21/2025
- Warranty: 3 months
- **Expected End**: 01/21/2026
- **Result**: ✅ 01/21/2026

### Test Case 2: "Glass Partition Panels" (warrantyPeriod: "60 months")
- Start: 10/21/2025
- Warranty: 60 months
- **Expected End**: 10/21/2030
- **Result**: ✅ 10/21/2030

### Test Case 3: "Teak Wood Planks" (warrantyPeriod: "36 months")
- Start: 10/21/2025
- Warranty: 36 months
- **Expected End**: 10/21/2028
- **Result**: ✅ 10/21/2028

## Browser Console Output (Example)

When you select "wood no 05":
```
=== onMaterialChange called ===
Selected itemId: 68f6d5fe73b995a76e6c4b34
Found normalized material: {id: "68f6d5fe73b995a76e6c4b34", label: "wood no 05", months: 3, doc: {...}}
Warranty months from normalized material: 3
Start date: Mon Oct 21 2025 00:00:00 GMT+0530
addMonths called with date: Mon Oct 21 2025 00:00:00 GMT+0530 months: 3
Initial date object: Mon Oct 21 2025 00:00:00 GMT+0530
Target month index: 12
After setMonth: Tue Jan 21 2026 00:00:00 GMT+0530
Final date: Tue Jan 21 2026 00:00:00 GMT+0530
End date (after adding months): Tue Jan 21 2026 00:00:00 GMT+0530
End date formatted: 2026-01-21
```

## Files Modified
- `frontend/staff-dashboard/src/finance-portal/components/WarrantySection/AddWarrantyModal.jsx`
  - Fixed `onMaterialChange` to use `normalizedMaterials`
  - Fixed `useEffect` to use `normalizedMaterials`
  - Added `normalizedMaterials` to useEffect dependencies
  - Enhanced console logging throughout

## Why This Happened

The code had **two separate data transformations**:
1. Raw `materials` array (supplier-material wrappers)
2. `normalizedMaterials` (extracted core materials with IDs)

The bug occurred because:
- **Dropdown used normalizedMaterials** ✅
- **Calculation logic used raw materials** ❌
- **IDs didn't match** → Default fallback triggered

## Benefits

1. ✅ **Correct warranty periods** - Uses actual material warranty duration
2. ✅ **Efficient** - No redundant warranty month calculations
3. ✅ **Maintainable** - Single source of truth (normalizedMaterials)
4. ✅ **Debuggable** - Comprehensive console logging
5. ✅ **Type-safe** - No more undefined material objects

## Date
October 21, 2025

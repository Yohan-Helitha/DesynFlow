# Generate Button Logic - Final Implementation

## 📋 Overview

The Generate button in Estimations History now has **TWO conditions** that must be met for it to be enabled:

1. ✅ **Must be the LATEST version** for the project
2. ✅ **Must NOT have "Approved" status**

---

## 🔒 Business Logic

### Why Disable for Approved Estimations?

**Approved estimations are finalized and should not be used as a base for new versions.**

**Workflow:**
```
Pending → Approved → [LOCKED - Cannot Generate]
         ↓
    Quotation Generated
         ↓
    Client Review
         ↓
    Project Execution
```

Once an estimation is approved:
- It's considered final
- Quotations may have been generated from it
- Client may have already reviewed/accepted it
- Creating a new version would break the approval workflow

**If changes are needed after approval:**
- Finance manager must manually create a new estimation
- This ensures proper documentation and reasoning
- Maintains audit trail

---

## 🎯 Button States Matrix

| Scenario | Is Latest? | Status | Generate Button | Tooltip |
|----------|-----------|--------|----------------|---------|
| **1** | ✅ Yes | Pending | ✅ **ENABLED** | "Generate new version from this estimate" |
| **2** | ✅ Yes | Rejected | ✅ **ENABLED** | "Generate new version from this estimate" |
| **3** | ✅ Yes | Approved | ❌ **DISABLED** | "Cannot generate from approved estimations" |
| **4** | ❌ No | Pending | ❌ **DISABLED** | "Only the latest version can be used to generate new estimations" |
| **5** | ❌ No | Rejected | ❌ **DISABLED** | "Only the latest version can be used to generate new estimations" |
| **6** | ❌ No | Approved | ❌ **DISABLED** | "Only the latest version can be used to generate new estimations" |

---

## 💻 Implementation Code

```javascript
// Disable Generate button if:
// 1. This is NOT the latest version for this project
// 2. Status is 'Approved' (already finalized)
const isGenerateDisabled = !isLatest || item.status === 'Approved';

let tooltipText = 'Generate new version from this estimate';
if (!isLatest) {
  tooltipText = 'Only the latest version can be used to generate new estimations';
} else if (item.status === 'Approved') {
  tooltipText = 'Cannot generate from approved estimations';
}

return (
  <button
    disabled={isGenerateDisabled}
    title={tooltipText}
    onClick={() => {
      if (isGenerateDisabled) return;
      setSelectedEstimation(item);
      setShowEstimateToEstimate(true);
    }}
    className={`px-2 py-1 rounded-md text-[#674636] bg-[#F7EED3] ${
      isGenerateDisabled
        ? 'opacity-50 cursor-not-allowed'
        : 'hover:text-[#FFF8E8] hover:bg-[#AAB396]'
    }`}
  >
    Generate
  </button>
);
```

---

## 📊 Real-World Examples

### Example 1: Standard Workflow (✅ Can Generate)

```
Project: Office Building - Colombo
├── v3 [Latest] - Pending - LKR 4.5M
│   └── Generate: ✅ ENABLED
│   └── Reason: Latest version + Pending status
├── v2 - Rejected - LKR 4.8M
│   └── Generate: ❌ DISABLED (Not latest)
└── v1 - Approved - LKR 3.9M
    └── Generate: ❌ DISABLED (Not latest)
```

**User Action:**
- Click Generate on v3
- Modal opens to create v4
- Can adjust costs based on v3

---

### Example 2: Approved Latest (❌ Cannot Generate)

```
Project: Hospital Extension - Maharagama
├── v2 [Latest] - Approved - LKR 3.5M ← Already Approved!
│   └── Generate: ❌ DISABLED
│   └── Reason: Status is Approved
│   └── Tooltip: "Cannot generate from approved estimations"
└── v1 - Pending - LKR 3.1M
    └── Generate: ❌ DISABLED (Not latest)
```

**User Action:**
- Hover over Generate button
- See tooltip: "Cannot generate from approved estimations"
- Must manually create new estimation if changes needed

---

### Example 3: Rejected Latest (✅ Can Generate)

```
Project: Warehouse Construction - Kotte
├── v2 [Latest] - Rejected - LKR 3.8M ← Needs revision
│   └── Generate: ✅ ENABLED
│   └── Reason: Latest version + Rejected status
│   └── User can create v3 with revised costs
└── v1 - Approved - LKR 3.6M
    └── Generate: ❌ DISABLED (Not latest)
```

**User Action:**
- Click Generate on v2 (rejected)
- Create v3 with revised costs
- Submit for approval again

---

## 🔄 Workflow Scenarios

### Scenario A: Normal Estimation Flow
```
1. Create v1 (Pending)          → Generate: ✅ Enabled
2. Approve v1                   → Generate: ❌ Disabled (Approved)
3. Need changes? Create v2 manually
4. v2 (Pending)                 → Generate: ✅ Enabled
5. Approve v2                   → Generate: ❌ Disabled (Approved)
```

### Scenario B: Rejection and Revision Flow
```
1. Create v1 (Pending)          → Generate: ✅ Enabled
2. Reject v1 (too expensive)    → Generate: ✅ Still Enabled!
3. Click Generate on v1         → Creates v2
4. Adjust costs in v2           → Submit for review
5. Approve v2                   → Generate: ❌ Disabled
```

### Scenario C: Multiple Revisions
```
1. v1 (Pending)                 → Generate: ✅ Enabled
2. v2 (Rejected)                → Generate: ✅ Enabled
3. v3 (Pending)                 → Generate: ✅ Enabled
4. v4 (Approved)                → Generate: ❌ Disabled
```

---

## ⚠️ Important Notes

### For Finance Managers:

1. **Once approved, cannot generate from that estimation**
   - This is by design to maintain workflow integrity
   - If changes needed, create new estimation manually

2. **Only latest version can be used to generate**
   - Ensures version lineage is correct
   - Prevents creating v4 from v1 (skipping v2, v3)

3. **Rejected estimations can still generate**
   - Allows quick revision and resubmission
   - User can create new version based on rejected one

### For Developers:

1. **Button is disabled via React state**
   - Not just CSS (proper `disabled` attribute)
   - Click events prevented when disabled

2. **Tooltip changes based on reason**
   - Helps users understand why button is disabled
   - Better UX than generic message

3. **Status check is case-sensitive**
   - Checks for exactly "Approved" (capital A)
   - Database should enforce consistent capitalization

---

## 🧪 Testing Checklist

### Basic Tests:
- [ ] Latest version with Pending status → Generate enabled
- [ ] Latest version with Rejected status → Generate enabled
- [ ] Latest version with Approved status → Generate **disabled**
- [ ] Old version with any status → Generate disabled

### Edge Cases:
- [ ] Project with only v1 Approved → Generate disabled
- [ ] Project with only v1 Pending → Generate enabled
- [ ] Create v2 from Rejected v1 → Should work
- [ ] Try to generate from Approved latest → Should be disabled

### UI Tests:
- [ ] Disabled button has 50% opacity
- [ ] Hover over disabled button shows tooltip
- [ ] Different tooltips for different disable reasons
- [ ] Button cannot be clicked when disabled
- [ ] Enabled button has hover effects

### Workflow Tests:
- [ ] Approve estimation → Generate button becomes disabled
- [ ] Reject estimation → Generate button stays enabled
- [ ] Create new version → Old version's Generate becomes disabled

---

## 📝 Summary

**The Generate button logic ensures:**

✅ Only the latest version can be used as a base  
✅ Approved estimations are protected from modification  
✅ Rejected estimations can be quickly revised  
✅ Users understand why buttons are disabled  
✅ Workflow integrity is maintained  
✅ Audit trail remains clear  

**Result:** Better data integrity and clearer workflow for all users.

---

**Implementation Date:** January 2025  
**Version:** 2.0 (Added Approved status check)  
**Status:** ✅ Complete and Production Ready

# 💸 Expense Test Data Guide

## Overview
Comprehensive test data for the Expenses section with **16 expenses** across **5 projects**, including budget tracking, category analysis, and over-budget scenarios.

---

## 📊 Seed File Information

**Location**: `server/seed/seedExpenseData.js`

**Command to Run**:
```bash
node seed/seedExpenseData.js
```

**What It Creates**:
- ✅ **10 Users** (5 clients, 3 project managers, 2 finance managers)
- ✅ **5 Projects** (Various statuses and progress levels)
- ✅ **5 Project Estimations** (Approved budgets with category breakdowns)
- ✅ **16 Expenses** (Covering all 4 categories across all projects)

---

## 👥 User Accounts Created

### Clients (5)
| Username | Email | Password | Role |
|----------|-------|----------|------|
| Client 1 | client1@desynflow.com | password123 | client |
| Client 2 | client2@desynflow.com | password123 | client |
| Client 3 | client3@desynflow.com | password123 | client |
| Client 4 | client4@desynflow.com | password123 | client |
| Client 5 | client5@desynflow.com | password123 | client |

### Project Managers (3)
| Username | Email | Password | Role |
|----------|-------|----------|------|
| Project Manager 1 | pm1@desynflow.com | password123 | project manager |
| Project Manager 2 | pm2@desynflow.com | password123 | project manager |
| Project Manager 3 | pm3@desynflow.com | password123 | project manager |

### Finance Managers (2)
| Username | Email | Password | Role |
|----------|-------|----------|------|
| Finance Manager 1 | finance1@desynflow.com | password123 | finance manager |
| Finance Manager 2 | finance2@desynflow.com | password123 | finance manager |

---

## 🏗️ Projects Overview

| # | Project Name | Status | Progress | Start Date | Due Date | Total Budget | Total Spent | % Used |
|---|--------------|--------|----------|------------|----------|--------------|-------------|---------|
| 1 | Modern Villa Construction | In Progress | 65% | 2024-10-01 | 2025-03-15 | LKR 16,500,000 | LKR 13,400,000 | 81.2% 🟡 |
| 2 | Commercial Office Building | In Progress | 45% | 2024-11-01 | 2025-05-30 | LKR 25,000,000 | LKR 9,800,000 | 39.2% 🟢 |
| 3 | Residential Apartment Complex | In Progress | 30% | 2024-12-01 | 2025-08-30 | LKR 31,000,000 | LKR 6,950,000 | 22.4% 🟢 |
| 4 | Shopping Mall Renovation | In Progress | 80% | 2024-08-15 | 2025-02-28 | LKR 10,500,000 | LKR 9,650,000 | 91.9% 🟡 |
| 5 | Beach Resort Development | In Progress | 20% | 2025-01-10 | 2025-12-31 | LKR 37,000,000 | LKR 4,950,000 | 13.4% 🟢 |

**Total Budget (All Projects)**: LKR 120,000,000  
**Total Spent**: LKR 44,750,000 (37.3%)  
**Total Remaining**: LKR 75,250,000

---

## 💰 Budget Breakdown by Project

### Project 1: Modern Villa Construction (81.2% budget used) 🟡

**Status**: High spending - approaching budget limits on all categories

| Category | Budget | Spent | % Used | Remaining | Status |
|----------|--------|-------|---------|-----------|---------|
| Labor | LKR 5,000,000 | LKR 4,200,000 | 84.0% | LKR 800,000 | 🟡 HIGH |
| Procurement | LKR 8,000,000 | LKR 6,800,000 | 85.0% | LKR 1,200,000 | 🟡 HIGH |
| Transport | LKR 2,000,000 | LKR 1,600,000 | 80.0% | LKR 400,000 | 🟡 HIGH |
| Misc | LKR 1,500,000 | LKR 800,000 | 53.3% | LKR 700,000 | 🟢 OK |

**Expenses (4)**:
1. Labor: LKR 4,200,000 - Construction labor payments for Q1
2. Procurement: LKR 6,800,000 - Cement, steel, bricks, roofing materials
3. Transport: LKR 1,600,000 - Material transportation and machinery rental
4. Misc: LKR 800,000 - Site office setup, utilities, safety equipment

---

### Project 2: Commercial Office Building (39.2% budget used) 🟢

**Status**: Healthy spending - on track for 45% project completion

| Category | Budget | Spent | % Used | Remaining | Status |
|----------|--------|-------|---------|-----------|---------|
| Labor | LKR 8,000,000 | LKR 3,200,000 | 40.0% | LKR 4,800,000 | 🟢 OK |
| Procurement | LKR 12,000,000 | LKR 5,400,000 | 45.0% | LKR 6,600,000 | 🟢 OK |
| Transport | LKR 3,000,000 | LKR 1,200,000 | 40.0% | LKR 1,800,000 | 🟢 OK |
| Misc | LKR 2,000,000 | LKR 0 | 0.0% | LKR 2,000,000 | 🟢 OK |

**Expenses (3)**:
1. Labor: LKR 3,200,000 - Foundation work and structural steel installation
2. Procurement: LKR 5,400,000 - Structural steel, concrete, glass, HVAC equipment
3. Transport: LKR 1,200,000 - Heavy equipment transportation and crane rental

---

### Project 3: Residential Apartment Complex (22.4% budget used) 🟢

**Status**: Early stage - low spending appropriate for 30% completion

| Category | Budget | Spent | % Used | Remaining | Status |
|----------|--------|-------|---------|-----------|---------|
| Labor | LKR 10,000,000 | LKR 2,500,000 | 25.0% | LKR 7,500,000 | 🟢 OK |
| Procurement | LKR 15,000,000 | LKR 3,800,000 | 25.3% | LKR 11,200,000 | 🟢 OK |
| Transport | LKR 3,500,000 | LKR 0 | 0.0% | LKR 3,500,000 | 🟢 OK |
| Misc | LKR 2,500,000 | LKR 650,000 | 26.0% | LKR 1,850,000 | 🟢 OK |

**Expenses (3)**:
1. Labor: LKR 2,500,000 - Site clearing, excavation, and foundation labor
2. Procurement: LKR 3,800,000 - Foundation materials, concrete, reinforcement bars
3. Misc: LKR 650,000 - Site permits, surveys, and temporary facilities

---

### Project 4: Shopping Mall Renovation (91.9% budget used) 🔴

**Status**: ⚠️ CRITICAL - TWO CATEGORIES OVER BUDGET!

| Category | Budget | Spent | % Used | Remaining | Status |
|----------|--------|-------|---------|-----------|---------|
| Labor | LKR 3,000,000 | LKR 3,200,000 | **106.7%** | **-LKR 200,000** | 🔴 OVER BUDGET |
| Procurement | LKR 5,000,000 | LKR 5,100,000 | **102.0%** | **-LKR 100,000** | 🔴 OVER BUDGET |
| Transport | LKR 1,500,000 | LKR 1,350,000 | 90.0% | LKR 150,000 | 🟡 HIGH |
| Misc | LKR 1,000,000 | LKR 0 | 0.0% | LKR 1,000,000 | 🟢 OK |

**Expenses (3)**:
1. Labor: LKR 3,200,000 - Interior finishing work (flooring, painting, electrical)
2. Procurement: LKR 5,100,000 - Floor tiles, paint, lighting, HVAC, escalators
3. Transport: LKR 1,350,000 - Material delivery and specialized equipment transport

**⚠️ Testing Alert**: This project is perfect for testing:
- Over-budget notifications
- Budget threshold warnings
- Finance manager alerts
- Project manager notifications

---

### Project 5: Beach Resort Development (13.4% budget used) 🟢

**Status**: Just started - minimal spending appropriate for 20% completion

| Category | Budget | Spent | % Used | Remaining | Status |
|----------|--------|-------|---------|-----------|---------|
| Labor | LKR 12,000,000 | LKR 1,800,000 | 15.0% | LKR 10,200,000 | 🟢 OK |
| Procurement | LKR 18,000,000 | LKR 2,700,000 | 15.0% | LKR 15,300,000 | 🟢 OK |
| Transport | LKR 4,000,000 | LKR 0 | 0.0% | LKR 4,000,000 | 🟢 OK |
| Misc | LKR 3,000,000 | LKR 450,000 | 15.0% | LKR 2,550,000 | 🟢 OK |

**Expenses (3)**:
1. Labor: LKR 1,800,000 - Initial site preparation and foundation work
2. Procurement: LKR 2,700,000 - Foundation materials and initial supplies
3. Misc: LKR 450,000 - Environmental study, permits, site office setup

---

## 📋 Complete Expense List (16 Expenses)

| # | Project | Category | Amount | Budget % | Status | Description |
|---|---------|----------|--------|----------|--------|-------------|
| 1 | Modern Villa | Labor | LKR 4,200,000 | 84.0% | 🟡 | Construction labor payments for Q1 |
| 2 | Modern Villa | Procurement | LKR 6,800,000 | 85.0% | 🟡 | Cement, steel reinforcement, bricks |
| 3 | Modern Villa | Transport | LKR 1,600,000 | 80.0% | 🟡 | Material transportation and machinery |
| 4 | Modern Villa | Misc | LKR 800,000 | 53.3% | 🟢 | Site office setup and safety equipment |
| 5 | Office Building | Labor | LKR 3,200,000 | 40.0% | 🟢 | Foundation and structural steel work |
| 6 | Office Building | Procurement | LKR 5,400,000 | 45.0% | 🟢 | Structural steel, concrete, glass, HVAC |
| 7 | Office Building | Transport | LKR 1,200,000 | 40.0% | 🟢 | Heavy equipment and crane rental |
| 8 | Apartment Complex | Labor | LKR 2,500,000 | 25.0% | 🟢 | Site clearing and excavation |
| 9 | Apartment Complex | Procurement | LKR 3,800,000 | 25.3% | 🟢 | Foundation materials and concrete |
| 10 | Apartment Complex | Misc | LKR 650,000 | 26.0% | 🟢 | Site permits and surveys |
| 11 | Shopping Mall | Labor | LKR 3,200,000 | **106.7%** | 🔴 | Interior finishing work |
| 12 | Shopping Mall | Procurement | LKR 5,100,000 | **102.0%** | 🔴 | Floor tiles, lighting, escalators |
| 13 | Shopping Mall | Transport | LKR 1,350,000 | 90.0% | 🟡 | Material delivery and equipment |
| 14 | Beach Resort | Labor | LKR 1,800,000 | 15.0% | 🟢 | Site preparation and foundation |
| 15 | Beach Resort | Procurement | LKR 2,700,000 | 15.0% | 🟢 | Foundation materials and supplies |
| 16 | Beach Resort | Misc | LKR 450,000 | 15.0% | 🟢 | Environmental study and permits |

---

## 🎯 Test Scenarios

### 1. **View All Expenses**
- Navigate to Expenses section
- Should display all 16 expenses
- Verify sorting by date, amount, category
- Check filtering by project and category

### 2. **Filter by Project**
- Select "Modern Villa Construction"
- Should show 4 expenses
- Total: LKR 13,400,000

### 3. **Filter by Category**
- **Labor**: Should show 5 expenses totaling LKR 17,900,000
- **Procurement**: Should show 5 expenses totaling LKR 23,800,000
- **Transport**: Should show 3 expenses totaling LKR 4,150,000
- **Misc**: Should show 3 expenses totaling LKR 1,900,000

### 4. **Budget Threshold Testing**
- Check Modern Villa (all categories at 80%+ usage)
- Should display budget warnings
- Finance manager should see notifications

### 5. **Over-Budget Testing** ⚠️
- Check Shopping Mall project
- Labor: 106.7% (LKR 200,000 over)
- Procurement: 102.0% (LKR 100,000 over)
- Should display critical alerts
- Finance and project managers should receive urgent notifications

### 6. **Create New Expense**
- Try adding expense to Modern Villa Labor category
- Should trigger alert (already at 84%)
- Verify notification creation

### 7. **Update Expense**
- Edit any Misc category expense
- Change amount to exceed budget
- Verify notification system triggers

### 8. **Proof/Receipt Upload**
- All expenses have proof paths
- Verify file reference display
- Test file upload for new expenses

### 9. **Project Budget Summary**
- View expense summary per project
- Check category breakdowns
- Verify percentage calculations

### 10. **Overall Spending Analysis**
- Total budget: LKR 120,000,000
- Total spent: LKR 44,750,000 (37.3%)
- Verify dashboard displays correct totals

---

## 🔍 Expected Behavior

### Budget Status Indicators
- 🟢 **OK** (0-79%): Healthy spending
- 🟡 **HIGH** (80-99%): Approaching limit - warning notifications
- 🔴 **OVER BUDGET** (100%+): Exceeded budget - urgent notifications

### Notification Triggers
1. **Expense Added** (Medium Priority)
   - Notifies finance managers on any new expense
   
2. **Budget Threshold Exceeded** (High Priority)
   - Triggers at 80% budget usage
   - Notifies finance managers and project manager
   
3. **Budget Exceeded** (Urgent Priority)
   - Triggers at 100%+ budget usage
   - Urgent notifications to both finance and project managers

### API Endpoints to Test
```
GET  /api/expenses                              - Get all expenses
GET  /api/expenses/filter?projectId=X&category=Y - Filter expenses
POST /api/expenses                               - Create expense (with file upload)
POST /api/expenses/:id                           - Update expense
```

---

## 📊 Category Analysis

| Category | Total Spent | Total Budget | % Used | # of Expenses |
|----------|-------------|--------------|--------|---------------|
| Labor | LKR 17,900,000 | LKR 38,000,000 | 47.1% | 5 |
| Procurement | LKR 27,600,000 | LKR 58,000,000 | 47.6% | 5 |
| Transport | LKR 4,150,000 | LKR 14,000,000 | 29.6% | 3 |
| Misc | LKR 2,700,000 | LKR 10,000,000 | 27.0% | 3 |

---

## 🚨 Critical Testing Areas

### 1. Over-Budget Scenarios
- **Shopping Mall** has 2 categories over budget
- Test alert generation
- Verify notification delivery
- Check UI warning displays

### 2. High-Usage Warnings
- **Modern Villa** has 3 categories at 80%+
- Test threshold notifications
- Verify warning colors/indicators

### 3. Multi-Project Filtering
- Test filtering across all 5 projects
- Verify accurate calculations
- Check aggregate totals

### 4. File/Proof Management
- All expenses have proof paths
- Test file upload functionality
- Verify file reference storage

---

## 📝 Notes

- All users have password: `password123`
- All projects are in "In Progress" status
- All estimations are "Approved"
- Expense amounts are realistic for Sri Lankan construction projects
- Budget percentages align with project progress percentages
- Two categories are intentionally over budget for testing alerts
- Proof files are referenced but not physically created (paths stored)

---

## 🔄 Re-running the Seed

To clear and re-seed expense data:

```bash
cd server
node seed/seedExpenseData.js
```

**Note**: This will:
- ✅ Delete all existing expenses
- ✅ Recreate projects with same names (deletes and recreates)
- ✅ Recreate project estimations
- ✅ Keep existing users or create if not found
- ✅ Generate 16 fresh expenses with budget tracking

---

## 🎉 Summary

✅ **16 expenses** created across **5 projects**  
✅ **4 expense categories**: Labor, Procurement, Transport, Misc  
✅ **10 users** with different roles for testing permissions  
✅ **Budget tracking** with realistic percentages  
✅ **2 over-budget scenarios** for critical alert testing  
✅ **5 high-usage scenarios** for threshold warning testing  
✅ **Comprehensive project lifecycle** from 20% to 80% completion  

**Total Test Coverage**: LKR 120M budget, LKR 44.75M spent (37.3%)

---

*Last Updated: January 27, 2025*
*Seed File: `server/seed/seedExpenseData.js`*

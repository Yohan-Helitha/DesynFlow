# 💸 Expense Test Data - Quick Reference

## Run Command
```bash
cd server
node seed/seedExpenseData.js
```

## What You Get
- ✅ **16 Expenses** across 5 projects with full budget tracking
- ✅ **5 Projects** at different completion stages (20% to 80%)
- ✅ **10 Users** (5 clients, 3 PMs, 2 finance managers)
- ✅ **Budget Scenarios**: Normal, High Usage, and Over Budget

---

## 🚨 Key Testing Features

### Over-Budget Project (Shopping Mall)
- Labor: **106.7%** (LKR 200K over) 🔴
- Procurement: **102.0%** (LKR 100K over) 🔴
- Perfect for testing urgent notifications!

### High-Usage Project (Modern Villa)
- Labor: **84.0%** 🟡
- Procurement: **85.0%** 🟡
- Transport: **80.0%** 🟡
- Perfect for testing threshold warnings!

---

## 📊 Quick Stats

| Metric | Value |
|--------|-------|
| Total Budget | LKR 120,000,000 |
| Total Spent | LKR 44,750,000 (37.3%) |
| Total Expenses | 16 |
| Projects | 5 |
| Categories | Labor, Procurement, Transport, Misc |

---

## 🎯 Test Checklist

- [ ] View all 16 expenses in the list
- [ ] Filter by project (Modern Villa = 4 expenses)
- [ ] Filter by category (Labor = 5 expenses)
- [ ] Sort by amount, date, category
- [ ] Create new expense with file upload
- [ ] Update existing expense
- [ ] Check budget warnings on Modern Villa
- [ ] Check over-budget alerts on Shopping Mall
- [ ] Verify notification creation
- [ ] Test project budget summaries

---

## 👤 Login Credentials

All users have password: `password123`

**Finance Manager**: finance1@desynflow.com  
**Project Manager**: pm1@desynflow.com  
**Client**: client1@desynflow.com

---

## 📈 Budget Status by Project

| Project | Budget | Spent | % | Status |
|---------|--------|-------|---|--------|
| Modern Villa | 16.5M | 13.4M | 81% | 🟡 HIGH |
| Office Building | 25M | 9.8M | 39% | 🟢 OK |
| Apartment Complex | 31M | 6.95M | 22% | 🟢 OK |
| Shopping Mall | 10.5M | 9.65M | 92% | 🔴 OVER |
| Beach Resort | 37M | 4.95M | 13% | 🟢 OK |

---

## 🔍 Category Breakdown

**Labor** (5 expenses): LKR 17.9M  
**Procurement** (5 expenses): LKR 27.6M  
**Transport** (3 expenses): LKR 4.15M  
**Misc** (3 expenses): LKR 2.7M

---

## 💡 Pro Tips

1. **Shopping Mall** has intentional over-budget scenarios for testing critical alerts
2. **Modern Villa** is at threshold (80%+) for warning notifications
3. All expenses have proof file paths (though files aren't physically created)
4. Projects are matched with realistic progress percentages
5. Budget usage aligns with project completion stages

---

*Full Documentation: EXPENSE_TEST_GUIDE.md*

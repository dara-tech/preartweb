# 🚀 Quick Fix for CQI Populate Error

## The Problem
```
PROCEDURE preart_sites_registry.PopulateAllCQIIndicators does not exist
```

## ⚡ Quick Solution (2 minutes)

### Option 1: Use MySQL Workbench or phpMyAdmin

1. Open MySQL Workbench or phpMyAdmin
2. Select database `preart_sites_registry`
3. Open the SQL file: `/Users/cheolsovandara/Documents/D/Developments/2026/artweb/artweb/backend/create-basic-cqi-procedure.sql`
4. Click "Execute" or "Run"
5. Done! ✅

### Option 2: Command Line

```bash
# Navigate to backend folder
cd /Users/cheolsovandara/Documents/D/Developments/2026/artweb/artweb/backend

# Run the SQL file (enter your MySQL password when prompted)
mysql -u root -p preart_sites_registry < create-basic-cqi-procedure.sql
```

### Option 3: Copy-Paste SQL

1. Open MySQL client or Workbench
2. Copy the entire content from `create-basic-cqi-procedure.sql`
3. Paste into SQL editor
4. Execute

---

## ✅ Verify It Worked

Run this query:

```sql
SHOW PROCEDURE STATUS WHERE Name = 'PopulateAllCQIIndicators';
```

You should see:
```
Name: PopulateAllCQIIndicators
Type: PROCEDURE
```

---

## 🎉 Test It

```sql
CALL PopulateAllCQIIndicators('2025-01-01', '2025-12-31', NULL, 4, 3, 1, 2);
```

Should return:
```
procedures_executed: 2
procedures_failed: 0
status: Population completed
```

---

## 🖥️ Then Use the Dashboard

1. Go back to **CQI Dashboard**
2. Click **"Populate Data"**
3. Confirm the dialog
4. ✅ It should work now!

---

## 📊 What This Creates

This creates **3 stored procedures**:

1. **PopulateAllCQIIndicators** - Main procedure
   - Clears old data
   - Calls indicator procedures
   - Returns statistics

2. **PopulateIndicator1** - Mortality rate
   - Calculates deaths
   - Inserts into cqi_indicator table

3. **PopulateIndicator2** - Lost to follow-up
   - Calculates LTFU
   - Inserts into cqi_indicator table

---

## 🐛 Troubleshooting

### "Access denied"
- Check your MySQL password
- Make sure you have CREATE PROCEDURE permission

### "Table doesn't exist"
- Run this first:
  ```bash
  cd backend
  node setup-cqi-procedures.js
  ```
  This creates the cqi_indicator table

### "Unknown database"
- Make sure `preart_sites_registry` database exists
- Check your `.env` file DB_NAME

---

## ✨ After This Fix

The CQI Dashboard "Populate Data" button will:
- ✅ Show confirmation dialog
- ✅ Execute the procedure
- ✅ Display progress
- ✅ Show success with statistics
- ✅ Auto-refresh dashboard

---

**Quick Commands:**

```bash
# 1. Go to backend
cd /Users/cheolsovandara/Documents/D/Developments/2026/artweb/artweb/backend

# 2. Run SQL (enter password when asked)
mysql -u root -p preart_sites_registry < create-basic-cqi-procedure.sql

# 3. Done! Go to CQI Dashboard and click "Populate Data"
```

That's it! 🎉


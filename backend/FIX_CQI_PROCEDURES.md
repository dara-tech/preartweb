# 🔧 Fix CQI Procedures Error

## Problem
```
Failed to populate CQI indicators: PROCEDURE preart_sites_registry.PopulateAllCQIIndicators does not exist
```

## Solution

The stored procedures exist in the codebase but haven't been created in the database yet. Choose one of the methods below:

---

## ⚡ Method 1: Quick Setup (Recommended)

### Run the automated setup script:

```bash
cd backend
node setup-cqi-procedures.js
```

This will:
- ✅ Create the `cqi_indicator` table
- ✅ Create all helper functions
- ✅ Create all 30+ stored procedures
- ✅ Verify everything works

**Expected output:**
```
════════════════════════════════════════
   CQI Indicators Stored Procedures Setup
════════════════════════════════════════

🔄 Connecting to database...
✅ Connected successfully

📊 Creating cqi_indicator table...
✅ Table created

🔧 Creating helper functions...
✅ Helper functions created

🔄 Creating stored procedures...
   ✅ Created: PopulateAllCQIIndicators
   ✅ Created: PopulateIndicator1
   ✅ Created: PopulateIndicator2
   ... (all 30+ procedures)

✨ Setup complete!
```

---

## 🗄️ Method 2: Manual SQL Execution

If the automated script doesn't work, run these SQL files manually:

### Step 1: Create the table
```sql
SOURCE /path/to/backend/src/migrations/create_cqi_indicator_table.sql;
```

### Step 2: Create helper functions
```sql
SOURCE /path/to/backend/src/functions/cqi_helper_functions.sql;
```

### Step 3: Create stored procedures
```sql
SOURCE /path/to/backend/src/procedures/populate_cqi_indicators.sql;
```

### OR using MySQL command line:

```bash
mysql -u root -p preart_sites_registry < backend/src/migrations/create_cqi_indicator_table.sql
mysql -u root -p preart_sites_registry < backend/src/functions/cqi_helper_functions.sql
mysql -u root -p preart_sites_registry < backend/src/procedures/populate_cqi_indicators.sql
```

---

## ✅ Verify Setup

After running either method, verify the procedure exists:

```sql
SHOW PROCEDURE STATUS WHERE Name = 'PopulateAllCQIIndicators';
```

**Expected result:**
```
+------------------------+---------------------------+
| Db                     | Name                      |
+------------------------+---------------------------+
| preart_sites_registry  | PopulateAllCQIIndicators  |
+------------------------+---------------------------+
```

---

## 🧪 Test the Procedure

Run a test population:

```sql
CALL PopulateAllCQIIndicators('2025-01-01', '2025-12-31', NULL, 4, 3, 1, 2);
```

**Parameters explained:**
- `'2025-01-01'` - Start date
- `'2025-12-31'` - End date
- `NULL` - All sites (or specific site code)
- `4` - Dead status code
- `3` - Lost to follow-up code
- `1` - Transfer in code
- `2` - Transfer out code

---

## 🎯 Then Use the Dashboard

After setup, go back to the CQI Dashboard and click **"Populate Data"**. It should work now!

---

## 🐛 Troubleshooting

### Error: "Can't connect to database"
**Solution:** Check your `.env` file has correct database credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=preart_sites_registry
```

### Error: "Table doesn't exist"
**Solution:** Run the migration first:
```bash
node setup-cqi-procedures.js
```

### Error: "Syntax error in SQL"
**Solution:** Make sure you're using MySQL 5.7+ or MariaDB 10.2+

### Error: "Access denied"
**Solution:** Your database user needs CREATE PROCEDURE permission:
```sql
GRANT CREATE ROUTINE ON preart_sites_registry.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 📋 What Gets Created

### Tables:
- `cqi_indicator` - Main table for all CQI data

### Helper Functions:
- `GetIndicatorSummary()`
- `GetIndicatorDetails()`
- `GetIndicatorTrend()`

### Main Procedure:
- `PopulateAllCQIIndicators()` - Populates all 28 indicators

### Individual Procedures (28 total):
1. `PopulateIndicator1` - Mortality rate
2. `PopulateIndicator2` - Lost to follow-up
3. `PopulateIndicator3` - Re-engagement (same site)
4. `PopulateIndicator4` - Re-engagement (other site)
5. `PopulateIndicator5a` - Visit timeliness <3 months
6. `PopulateIndicator5b` - Visit timeliness 3-5 months
7. `PopulateIndicator5c` - Visit timeliness >6 months
8. `PopulateIndicator5d` - Scheduled for visit
9. `PopulateIndicator6a` - MMD <3 months
10. `PopulateIndicator6b` - MMD 3-5 months
11. `PopulateIndicator6c` - MMD >6 months
12. `PopulateIndicator7` - MMD eligible
13. `PopulateIndicator8a` - TLD regimen
14. `PopulateIndicator8b` - DTG regimen
15. `PopulateIndicator8c` - TLD/DTG optimized
16. `PopulateIndicator8d` - Eligible for optimization
17. `PopulateIndicator9a` - TPT started
18. `PopulateIndicator9b` - TPT completed
19. `PopulateIndicator10a` - TPT completion <6 months
20. `PopulateIndicator10b` - TPT completion 6-9 months
21. `PopulateIndicator10c` - TPT completion 9-12 months
22. `PopulateIndicator11a` - Eligible for VL
23. `PopulateIndicator11b` - Received VL test
24. `PopulateIndicator12a` - VL documented
25. `PopulateIndicator12b` - VL ≥1000 copies
26. `PopulateIndicator12c` - VL suppressed (<1000)
27. `PopulateIndicator12d` - VL suppression overall
28. `PopulateIndicator12e` - VL results within 10 days
... (and more)

---

## 🚀 Quick Start Command

If you just want to get it working ASAP:

```bash
cd /Users/cheolsovandara/Documents/D/Developments/2026/artweb/artweb/backend
node setup-cqi-procedures.js
```

Then refresh your CQI Dashboard and click "Populate Data"!

---

## ✅ Success Indicators

You'll know it worked when:
- ✅ The setup script shows all green checkmarks
- ✅ `SHOW PROCEDURE STATUS` lists PopulateAllCQIIndicators
- ✅ The CQI Dashboard "Populate Data" button works
- ✅ You see success toast with statistics
- ✅ Dashboard shows populated indicators

---

## 📞 Still Having Issues?

If problems persist:

1. **Check MySQL version:**
   ```sql
   SELECT VERSION();
   ```
   Needs: MySQL 5.7+ or MariaDB 10.2+

2. **Check database exists:**
   ```sql
   SHOW DATABASES LIKE 'preart_sites_registry';
   ```

3. **Check permissions:**
   ```sql
   SHOW GRANTS FOR CURRENT_USER();
   ```
   Should include: CREATE ROUTINE, ALTER ROUTINE

4. **Check logs:**
   ```bash
   tail -f backend/backend.log
   ```

---

**Last Updated:** December 5, 2025  
**Status:** Ready to fix your issue! 🎉


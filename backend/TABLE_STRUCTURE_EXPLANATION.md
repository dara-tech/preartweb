# CQI Indicators Table Structure Explanation

## ✅ CORRECT Structure: Each Row = One Indicator

The table structure is **CORRECT**. Here's why:

### Database Structure (Normalized - CORRECT)

```
Row 1: indicator_id='1', deaths=3, lost_to_followup=0, reengaged_within_28=0, ...
Row 2: indicator_id='2', deaths=0, lost_to_followup=10, reengaged_within_28=0, ...
Row 3: indicator_id='3', deaths=0, lost_to_followup=0, reengaged_within_28=11, ...
Row 4: indicator_id='4', deaths=0, lost_to_followup=0, reengaged_within_28=0, ...
```

**Each row = ONE indicator calculation for ONE site/period**

### Why `indicator_id` Column Exists

The `indicator_id` column is **NOT** storing indicators as columns. It's a **field** that identifies **which indicator** this row represents:

- `indicator_id = '1'` → This row contains data for Indicator 1 (Deaths)
- `indicator_id = '2'` → This row contains data for Indicator 2 (Lost to Follow-up)
- `indicator_id = '3'` → This row contains data for Indicator 3 (Reengaged Within 28)

### This is the CORRECT Database Design

**✅ CORRECT (Current Structure - Normalized):**
```
Table: cqi_indicators
- Each row = one indicator
- indicator_id column = which indicator (identifier)
- All other columns = data for that indicator
```

**❌ WRONG (What you might be thinking of - Denormalized):**
```
Table: cqi_indicators
- Each row = one site/period
- Columns: indicator_1_deaths, indicator_2_lost, indicator_3_reengaged, ...
```

### Why Current Structure is Better

1. **Scalable**: Easy to add new indicators without changing table structure
2. **Normalized**: Follows database best practices
3. **Queryable**: Easy to filter by indicator, site, or period
4. **Consistent**: All indicators use the same fields (standardized)

### Example Query

```sql
-- Get all indicators for site 2102, Q1 2025
SELECT indicator_id, indicator_name, deaths, lost_to_followup, reengaged_within_28
FROM cqi_indicators
WHERE site_code = '2102' 
  AND period_year = 2025 
  AND period_quarter = 1;
```

**Result:**
```
indicator_id | indicator_name                    | deaths | lost_to_followup | reengaged_within_28
-------------|-----------------------------------|--------|------------------|--------------------
1            | Percentage of ART patients died    | 3      | 0                | 0
2            | Lost to follow-up                  | 0      | 10               | 0
3            | Reengaged within 28 days          | 0      | 0                | 11
4            | Reengaged over 28 days            | 0      | 0                | 0
```

**Each row = ONE indicator** ✅

### Summary

- ✅ **Each row = one indicator** (correct!)
- ✅ **`indicator_id` column = identifier** (not storing indicators as columns)
- ✅ **All standardized fields in each row** (deaths, lost_to_followup, etc.)
- ✅ **This is the correct normalized database structure**

The table structure is **100% correct** for analytics!


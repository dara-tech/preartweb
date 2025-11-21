# Standard Indicator Query Structure

**CRITICAL**: All Mortality & Retention indicator queries MUST follow this exact field order for analytics to work correctly.

## Standard Field Order (First 5 Fields - REQUIRED)

**ALL indicators must have these first 5 fields in this exact order:**

1. **Indicator** - Indicator name/description (always first)
2. **Numerator** - Indicator-specific numerator field (e.g., Deaths, Lost_to_Followup, Reengaged_Within_28)
3. **TOTAL** - **MUST equal the numerator value** (this is critical for analytics)
4. **Denominator** - Indicator-specific denominator field (e.g., Total_ART, Total_Lost, Total_Eligible)
5. **Percentage** - Calculated percentage

## Remaining Fields (Order may vary by indicator type)

6. **Demographic Breakdown** - Standard demographic fields:
   - Male_0_14
   - Male_0_14_[Specific] (e.g., Male_0_14_Deaths, Male_0_14_Reengaged)
   - Female_0_14
   - Female_0_14_[Specific]
   - Male_over_14
   - Male_over_14_[Specific]
   - Female_over_14
   - Female_over_14_[Specific]

7. **Eligible/Total Fields** (if applicable):
   - Male_0_14_Eligible / Male_0_14_Total
   - Female_0_14_Eligible / Female_0_14_Total
   - Male_over_14_Eligible / Male_over_14_Total
   - Female_over_14_Eligible / Female_over_14_Total

8. **Aggregated Totals** (always last):
   - Children_Total
   - Adults_Total

## Verified Examples

### ✅ Indicator 1 (Deaths) - CORRECT
```sql
SELECT
    '1. Percentage of ART patients who died' AS Indicator,
    CAST(IFNULL(dead_stats.Deaths, 0) AS UNSIGNED) AS Deaths,        -- Numerator
    CAST(IFNULL(dead_stats.Deaths, 0) AS UNSIGNED) AS TOTAL,          -- = Numerator ✓
    CAST(IFNULL(total_stats.Total_ART, 0) AS UNSIGNED) AS Total_ART, -- Denominator
    CAST(CASE ... END AS DECIMAL(5,2)) AS Percentage,                 -- Percentage
    ...
```

### ✅ Indicator 2 (Lost to Follow-up) - CORRECT
```sql
SELECT
    '2. Percentage of ART patients who were lost to follow-up' AS Indicator,
    CAST(IFNULL(lost_stats.Lost_to_Followup, 0) AS UNSIGNED) AS Lost_to_Followup, -- Numerator
    CAST(IFNULL(lost_stats.Lost_to_Followup, 0) AS UNSIGNED) AS TOTAL,            -- = Numerator ✓
    CAST(IFNULL(total_stats.Total_ART, 0) AS UNSIGNED) AS Total_ART,             -- Denominator
    CAST(CASE ... END AS DECIMAL(5,2)) AS Percentage,                               -- Percentage
    ...
```

### ✅ Indicator 3 (Reengaged Within 28) - CORRECT
```sql
SELECT
    '3. Percentage of missed appointments reengaged within 28 days' AS Indicator,
    CAST(IFNULL(rs.Reengaged_Within_28, 0) AS UNSIGNED) AS Reengaged_Within_28, -- Numerator
    CAST(IFNULL(rs.Reengaged_Within_28, 0) AS UNSIGNED) AS TOTAL,                -- = Numerator ✓
    CAST(IFNULL(ms.Total_Missed, 0) AS UNSIGNED) AS Total_Lost,                 -- Denominator
    CAST(CASE ... END AS DECIMAL(5,2)) AS Percentage,                             -- Percentage
    ...
```

### ✅ Indicator 4 (Reengaged Over 28) - CORRECT
```sql
SELECT
    '4. Percentage of missed appointments reengaged after 28+ days' AS Indicator,
    CAST(IFNULL(rs.Reengaged_Over_28, 0) AS UNSIGNED) AS Reengaged_Over_28,      -- Numerator
    CAST(IFNULL(rs.Reengaged_Over_28, 0) AS UNSIGNED) AS TOTAL,                -- = Numerator ✓
    CAST(IFNULL(e.Total_Eligible, 0) AS UNSIGNED) AS Total_Lost,               -- Denominator
    CAST(CASE ... END AS DECIMAL(5,2)) AS Percentage,                            -- Percentage
    ...
```

## Validation

Run the validation script to check all queries:
```bash
node validate-indicator-queries.js
```

## Key Rules

1. **TOTAL MUST equal Numerator** - This is critical for analytics processing
2. **Indicator must be first field** - Required for identification
3. **First 5 fields must be in exact order**: Indicator, Numerator, TOTAL, Denominator, Percentage
4. **Demographic fields should be consistent** - Use same naming pattern across indicators
5. **Children_Total and Adults_Total should be last** - For consistent aggregation


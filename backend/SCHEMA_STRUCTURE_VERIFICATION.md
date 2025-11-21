# CQI Indicators Schema Structure Verification

## ✅ Schema Structure is Correct

The `cqi_indicators` table follows a **row-based structure** where:
- **Each row = One indicator** for a specific site and period
- **All standardized fields** are stored as columns
- **Non-applicable fields** default to 0

## Table Structure

### Primary Key Structure
- `indicator_id` - Identifies which indicator (e.g., "1", "2", "3", "4")
- `site_code` - Site identifier (e.g., "2102")
- `period_type`, `period_year`, `period_quarter`, `period_month` - Time period
- **Unique constraint**: `(indicator_id, site_code, period_type, period_year, period_quarter, period_month)`

### Example Data Structure

```
indicator_id | site_code | period_year | period_quarter | numerator | denominator | deaths | lost_to_followup | reengaged_within_28 | reengaged_over_28
-------------|-----------|-------------|---------------|-----------|-------------|--------|------------------|---------------------|-------------------
1            | 2102      | 2025        | 1             | 3         | 534         | 3      | 0                | 0                   | 0
2            | 2102      | 2025        | 1             | 0         | 534         | 0      | 10               | 0                   | 0
3            | 2102      | 2025        | 1             | 0         | 0           | 0      | 0                | 11                  | 0
4            | 2102      | 2025        | 1             | 0         | 0           | 0      | 0                | 0                   | 0
```

## Key Points

1. **One Row Per Indicator**: Each indicator calculation is stored as a separate row
2. **Standardized Fields**: All indicators return the same set of fields (46+ columns)
3. **Zero Defaults**: Fields not applicable to an indicator are set to 0
4. **Efficient Querying**: Easy to query all indicators for a site/period or compare across indicators

## Standardized Fields Included

### Core Fields (All Indicators)
- `indicator_id`, `indicator_name`
- `numerator`, `denominator`, `percentage`
- `total`, `male_0_14`, `female_0_14`, `male_over_14`, `female_over_14`
- `children_total`, `adults_total`

### Denominator Fields (All Indicators, 0 if not applicable)
- `total_art`, `total_lost`, `total_eligible`, `total_visits`, `total_newly_initiated`, `eligible_patients`

### Numerator Fields (All Indicators, 0 if not applicable)
- `deaths`, `lost_to_followup`, `reengaged_within_28`, `reengaged_over_28`
- `late_visits_beyond_buffer`, `late_visits_within_buffer`, `visits_on_schedule`, `early_visits`
- `same_day_initiation`, `initiation_1_7_days`, `initiation_over_7_days`
- `with_baseline_cd4`, `receiving_cotrimoxazole`, `receiving_fluconazole`
- `tpt_received`, `tpt_completed`
- `vl_tested_12m`, `vl_monitored_6m`, `vl_suppressed_12m`, `vl_suppressed_overall`, `within_10_days`
- `received_counseling`, `followup_received`, `achieved_suppression`
- `switched_to_second_line`, `switched_to_third_line`, `total_retained`

### Demographic Totals
- `male_0_14_total`, `female_0_14_total`, `male_over_14_total`, `female_over_14_total`

## Benefits of This Structure

1. **Uniform Analytics**: All indicators can be processed the same way
2. **Easy Aggregation**: Simple to sum/compare across indicators
3. **Consistent Reporting**: Same field names across all indicators
4. **Efficient Storage**: One table for all indicators
5. **Flexible Querying**: Easy to filter by indicator, site, or period

## Verification Query

```sql
-- Verify structure: Each row is one indicator
SELECT 
    indicator_id,
    indicator_name,
    site_code,
    period_year,
    period_quarter,
    numerator,
    denominator,
    percentage,
    deaths,
    lost_to_followup,
    reengaged_within_28,
    reengaged_over_28
FROM cqi_indicators
WHERE indicator_id IN ('1', '2', '3', '4')
ORDER BY indicator_id, site_code, period_year, period_quarter;
```

## Status: ✅ VERIFIED

The schema structure is correct and follows best practices for analytics data storage.


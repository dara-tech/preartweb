# CQI Indicator System Documentation

## Overview

The CQI (Continuous Quality Improvement) Indicator System is a comprehensive database solution designed to store, manage, and analyze all 15 mortality and retention indicators as specified in section 5.7 of the ART program requirements. This system consolidates both summary (aggregate) and detail (patient-level) data from all indicators into a unified structure.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Database Schema](#database-schema)
3. [Indicator Mapping](#indicator-mapping)
4. [Data Population](#data-population)
5. [Data Retrieval](#data-retrieval)
6. [Usage Examples](#usage-examples)
7. [Maintenance](#maintenance)
8. [Troubleshooting](#troubleshooting)

## System Architecture

The CQI Indicator System consists of:

- **Core Table**: `cqi_indicator` - Stores all indicator data
- **Migration Scripts**: Database schema creation and updates
- **Stored Procedures**: Data population from source queries
- **Helper Functions**: Data retrieval and analysis utilities
- **Views**: Simplified data access patterns

## Database Schema

### Main Table: `cqi_indicator`

The `cqi_indicator` table is designed to accommodate all 15 indicators with their varying data structures:

#### Core Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | INT AUTO_INCREMENT | Primary key |
| `indicator_code` | VARCHAR(10) | Indicator identifier (1, 2, 3, 4, 5a, 5b, etc.) |
| `indicator_name` | TEXT | Full indicator description |
| `indicator_type` | ENUM('summary', 'detail') | Data type: aggregate or patient-level |
| `start_date` | DATE | Reporting period start date |
| `end_date` | DATE | Reporting period end date |
| `site_id` | VARCHAR(50) | Site identifier (optional) |

#### Metrics Fields

| Field | Type | Description |
|-------|------|-------------|
| `numerator` | INT UNSIGNED | Main count (events, patients, etc.) |
| `denominator` | INT UNSIGNED | Total eligible population |
| `percentage` | DECIMAL(5,2) | Calculated percentage |

#### Demographic Breakdown

| Field | Type | Description |
|-------|------|-------------|
| `male_0_14` | INT UNSIGNED | Male children (0-14) numerator |
| `female_0_14` | INT UNSIGNED | Female children (0-14) numerator |
| `male_over_14` | INT UNSIGNED | Male adults (15+) numerator |
| `female_over_14` | INT UNSIGNED | Female adults (15+) numerator |
| `male_0_14_total` | INT UNSIGNED | Male children denominator |
| `female_0_14_total` | INT UNSIGNED | Female children denominator |
| `male_over_14_total` | INT UNSIGNED | Male adults denominator |
| `female_over_14_total` | INT UNSIGNED | Female adults denominator |
| `children_total` | INT UNSIGNED | Total children (0-14) |
| `adults_total` | INT UNSIGNED | Total adults (15+) |

#### Patient-Level Detail Fields

| Field | Type | Description |
|-------|------|-------------|
| `clinic_id` | VARCHAR(50) | Patient clinic ID |
| `art_number` | VARCHAR(50) | Patient ART number |
| `patient_sex` | TINYINT | Patient sex (0=Female, 1=Male) |
| `patient_sex_display` | VARCHAR(10) | Patient sex display |
| `patient_type` | VARCHAR(10) | Adult/Child |
| `patient_age` | INT | Patient age in years |
| `date_first_visit` | DATE | Date of first visit |
| `event_date` | DATE | Main event date |
| `event_value` | VARCHAR(255) | Event-specific value |
| `secondary_date` | DATE | Secondary date |
| `secondary_value` | VARCHAR(255) | Secondary value |

#### Flexible Data Storage

| Field | Type | Description |
|-------|------|-------------|
| `indicator_specific_data` | JSON | Additional indicator-specific metrics |

## Indicator Mapping

### 5.7.1 Mortality and Re-engagement Indicators

| Code | Indicator Name | Summary Fields | Detail Fields |
|------|----------------|----------------|---------------|
| 1 | Percentage of ART patients who died | Deaths, Total_ART, demographics | death_date, death_place, death_reason |
| 2 | Percentage lost to follow-up | Lost_to_Followup, Total_ART, demographics | ltf_date, ltf_status |
| 3 | Reengaged within 28 days | Reengaged_Within_28, Total_Lost, demographics | miss_date, reengage_date, days_to_reengage |
| 4 | Reengaged after 28+ days | Reengaged_Over_28, Total_Eligible, demographics | miss_date, reengage_date, days_to_reengage |

### 5.7.2 Visit Status Indicators

| Code | Indicator Name | Summary Fields | Detail Fields |
|------|----------------|----------------|---------------|
| 5a | Late visits beyond buffer | Late_Visits_Beyond_Buffer, Total_Visits | visit_date, appointment_date, days_late |
| 5b | Late visits within buffer | Late_Visits_Within_Buffer, Total_Visits | visit_date, appointment_date, days_late |
| 5c | Visits on schedule | On_Schedule_Visits, Total_Visits | visit_date, appointment_date, days_difference |
| 5d | Early visits | Early_Visits, Total_Visits | visit_date, appointment_date, days_early |

### 5.7.3 Treatment and Preventive Indicators

| Code | Indicator Name | Summary Fields | Detail Fields |
|------|----------------|----------------|---------------|
| 6a | Same-day ART initiation (0 day) | Same_Day_Initiation, Total_Newly_Initiated | diagnosis_date, art_start_date, days_to_initiation |
| 6b | ART initiation 1-7 days | Initiation_1_7_Days, Total_Newly_Initiated | diagnosis_date, art_start_date, days_to_initiation |
| 6c | ART initiation >7 days | Initiation_Over_7_Days, Total_Newly_Initiated | diagnosis_date, art_start_date, days_to_initiation |
| 7 | Baseline CD4 before ART | With_Baseline_CD4, Total_Newly_Initiated | art_start_date, cd4_test_date, baseline_cd4 |
| 8a | Cotrimoxazole prophylaxis (CD4<350) | Receiving_Cotrimoxazole, Total_CD4_Low_350 | cd4_test_date, latest_cd4, receiving_cotrimoxazole |
| 8b | Fluconazole prophylaxis (CD4<100) | Receiving_Fluconazole, Total_CD4_Low_100 | cd4_test_date, latest_cd4, receiving_fluconazole |

### 5.7.4 Multi-Month Dispensing (MMD) Indicators

| Code | Indicator Name | Summary Fields | Detail Fields |
|------|----------------|----------------|---------------|
| 9a | MMD <3 months | Less_Than_3M, Total_Patients | visit_date, appointment_date, days_difference, mmd_status |
| 9b | MMD 3 months | Three_Months, Total_Patients | visit_date, appointment_date, days_difference, mmd_status |
| 9c | MMD 4 months | Four_Months, Total_Patients | visit_date, appointment_date, days_difference, mmd_status |
| 9d | MMD 5 months | Five_Months, Total_Patients | visit_date, appointment_date, days_difference, mmd_status |
| 9e | MMD 6+ months | Six_Plus_Months, Total_Patients | visit_date, appointment_date, days_difference, mmd_status |

### 5.7.5 Treatment Optimization Indicators

| Code | Indicator Name | Summary Fields | Detail Fields |
|------|----------------|----------------|---------------|
| 10a | TLD new initiation | TLD_New_Initiation, Total_New_Patients | art_start_date, regimen_name, regimen_type |
| 10b | TLD cumulative | TLD_Cumulative, Total_Active_Patients | current_regimen, regimen_start_date, regimen_type |
| 11a | TPT received | TPT_Received, Total_Eligible | tpt_start_date, tpt_regimen, tpt_status |
| 11b | TPT completed | TPT_Completed, Total_Started | tpt_start_date, tpt_end_date, completion_status |

### 5.7.6 Viral Load and Treatment Monitoring

| Code | Indicator Name | Summary Fields | Detail Fields |
|------|----------------|----------------|---------------|
| 12a | VL testing coverage | VL_Testing_Coverage, Total_Eligible | vl_test_date, vl_result, months_on_art |
| 12b | VL monitored (6 months) | VL_Monitored_6M, Total_Eligible | vl_test_date, vl_result, months_on_art |
| 12c | VL suppression (12 months) | VL_Suppressed_12M, Total_With_VL | vl_test_date, vl_result, suppression_status |
| 12d | VL suppression overall | VL_Suppressed_Overall, Total_With_VL | vl_test_date, vl_result, suppression_status |
| 12e | VL results within 10 days | VL_Results_10_Days, Total_Tests | vl_test_date, result_date, days_to_result |
| 13a | Enhanced adherence counseling | EAC_Received, Total_High_VL | counseling_date, vl_result, counseling_sessions |
| 13b | Follow-up VL after counseling | Followup_VL_Done, Total_EAC | counseling_date, followup_vl_date, vl_result |
| 13c | VL suppression after counseling | VL_Suppressed_Post_EAC, Total_Followup_VL | counseling_date, followup_vl_date, suppression_status |

### 5.7.7 Treatment Switching and Retention

| Code | Indicator Name | Summary Fields | Detail Fields |
|------|----------------|----------------|---------------|
| 14a | First to second line switching | Switched_2nd_Line, Total_Eligible | switch_date, old_regimen, new_regimen |
| 14b | Second to third line switching | Switched_3rd_Line, Total_Eligible | switch_date, old_regimen, new_regimen |
| 15 | Retention rate | Retained, Total_Cohort | cohort_start_date, retention_status, months_retained |

## Data Population

### Automated Population

Use the main stored procedure to populate all indicators:

```sql
CALL PopulateAllCQIIndicators('2024-01-01', '2024-12-31', NULL, 4, 3, 1, 2);
```

Parameters:
- `p_start_date`: Reporting period start date
- `p_end_date`: Reporting period end date  
- `p_site_id`: Site identifier (NULL for all sites)
- `p_dead_code`: Status code for deaths (default: 4)
- `p_lost_code`: Status code for lost to follow-up (default: 3)
- `p_transfer_in_code`: Status code for transfers in (default: 1)
- `p_transfer_out_code`: Status code for transfers out (default: 2)

### Individual Indicator Population

Each indicator has its own stored procedure:

```sql
-- Populate only indicator 1 (deaths)
CALL PopulateIndicator1('2024-01-01', '2024-12-31', NULL, 4);

-- Populate only indicator 2 (lost to follow-up)
CALL PopulateIndicator2('2024-01-01', '2024-12-31', NULL, 3);
```

## Data Retrieval

### Helper Functions

#### Get Indicator Summary
```sql
SELECT GetIndicatorSummary('1', '2024-01-01', '2024-12-31', NULL);
```

#### Get All Indicators Summary
```sql
SELECT GetAllIndicatorsSummary('2024-01-01', '2024-12-31', NULL);
```

#### Get Demographic Breakdown
```sql
SELECT GetIndicatorDemographics('1', '2024-01-01', '2024-12-31', NULL);
```

#### Get Patient Details
```sql
SELECT GetIndicatorDetails('1', '2024-01-01', '2024-12-31', NULL, 100);
```

#### Calculate Performance Against Targets
```sql
SELECT CalculateIndicatorPerformance('15', '2024-01-01', '2024-12-31', 95.00, NULL);
```

### Direct Queries

#### Summary Data
```sql
SELECT * FROM cqi_indicator 
WHERE indicator_type = 'summary' 
  AND start_date = '2024-01-01' 
  AND end_date = '2024-12-31'
ORDER BY indicator_code;
```

#### Detail Data
```sql
SELECT * FROM cqi_indicator 
WHERE indicator_code = '1' 
  AND indicator_type = 'detail'
  AND start_date = '2024-01-01' 
  AND end_date = '2024-12-31'
ORDER BY event_date DESC;
```

### Using Views

#### Summary View
```sql
SELECT * FROM v_cqi_indicator_summary 
WHERE start_date = '2024-01-01' AND end_date = '2024-12-31';
```

#### Demographics View
```sql
SELECT * FROM v_cqi_indicator_demographics 
WHERE indicator_code = '1' 
  AND start_date = '2024-01-01' AND end_date = '2024-12-31';
```

## Usage Examples

### 1. Monthly Indicator Report

```sql
-- Get all indicators for January 2024
SELECT 
    indicator_code,
    indicator_name,
    numerator,
    denominator,
    percentage,
    children_total + adults_total as total_population
FROM cqi_indicator 
WHERE indicator_type = 'summary'
  AND start_date = '2024-01-01' 
  AND end_date = '2024-01-31'
ORDER BY CAST(SUBSTRING_INDEX(indicator_code, REGEXP '[a-z]', 1) AS UNSIGNED);
```

### 2. Trend Analysis

```sql
-- Compare indicator 1 (deaths) across quarters
SELECT 
    CONCAT('Q', QUARTER(start_date), ' ', YEAR(start_date)) as quarter,
    numerator as deaths,
    denominator as total_art,
    percentage
FROM cqi_indicator 
WHERE indicator_code = '1' 
  AND indicator_type = 'summary'
  AND start_date >= '2024-01-01'
ORDER BY start_date;
```

### 3. Demographic Analysis

```sql
-- Analyze deaths by demographics for 2024
SELECT 
    'Children Male' as demographic,
    male_0_14 as numerator,
    male_0_14_total as denominator,
    CASE WHEN male_0_14_total > 0 THEN ROUND((male_0_14 * 100.0 / male_0_14_total), 2) ELSE 0 END as percentage
FROM cqi_indicator 
WHERE indicator_code = '1' AND indicator_type = 'summary'
  AND start_date = '2024-01-01' AND end_date = '2024-12-31'

UNION ALL

SELECT 
    'Children Female' as demographic,
    female_0_14 as numerator,
    female_0_14_total as denominator,
    CASE WHEN female_0_14_total > 0 THEN ROUND((female_0_14 * 100.0 / female_0_14_total), 2) ELSE 0 END as percentage
FROM cqi_indicator 
WHERE indicator_code = '1' AND indicator_type = 'summary'
  AND start_date = '2024-01-01' AND end_date = '2024-12-31'

UNION ALL

SELECT 
    'Adults Male' as demographic,
    male_over_14 as numerator,
    male_over_14_total as denominator,
    CASE WHEN male_over_14_total > 0 THEN ROUND((male_over_14 * 100.0 / male_over_14_total), 2) ELSE 0 END as percentage
FROM cqi_indicator 
WHERE indicator_code = '1' AND indicator_type = 'summary'
  AND start_date = '2024-01-01' AND end_date = '2024-12-31'

UNION ALL

SELECT 
    'Adults Female' as demographic,
    female_over_14 as numerator,
    female_over_14_total as denominator,
    CASE WHEN female_over_14_total > 0 THEN ROUND((female_over_14 * 100.0 / female_over_14_total), 2) ELSE 0 END as percentage
FROM cqi_indicator 
WHERE indicator_code = '1' AND indicator_type = 'summary'
  AND start_date = '2024-01-01' AND end_date = '2024-12-31';
```

### 4. Patient-Level Investigation

```sql
-- Get details of all deaths in Q1 2024
SELECT 
    clinic_id,
    art_number,
    patient_sex_display,
    patient_type,
    patient_age,
    event_date as death_date,
    event_value as death_place,
    secondary_value as death_reason
FROM cqi_indicator 
WHERE indicator_code = '1' 
  AND indicator_type = 'detail'
  AND start_date = '2024-01-01' 
  AND end_date = '2024-03-31'
ORDER BY event_date DESC;
```

### 5. Performance Dashboard

```sql
-- Create a performance dashboard view
SELECT 
    indicator_code,
    LEFT(indicator_name, 50) as short_name,
    percentage,
    CASE 
        WHEN indicator_code IN ('1', '2') THEN -- Lower is better for mortality/LTF
            CASE 
                WHEN percentage <= 2 THEN 'Excellent'
                WHEN percentage <= 5 THEN 'Good'
                WHEN percentage <= 10 THEN 'Needs Improvement'
                ELSE 'Critical'
            END
        ELSE -- Higher is better for most other indicators
            CASE 
                WHEN percentage >= 95 THEN 'Excellent'
                WHEN percentage >= 85 THEN 'Good'
                WHEN percentage >= 70 THEN 'Needs Improvement'
                ELSE 'Critical'
            END
    END as performance_status,
    numerator,
    denominator
FROM cqi_indicator 
WHERE indicator_type = 'summary'
  AND start_date = '2024-01-01' 
  AND end_date = '2024-12-31'
ORDER BY indicator_code;
```

## Maintenance

### Regular Tasks

1. **Data Refresh**: Run population procedures monthly/quarterly
2. **Data Validation**: Check for data consistency and completeness
3. **Performance Monitoring**: Monitor query performance and optimize indexes
4. **Archive Old Data**: Archive historical data beyond retention period

### Data Validation Queries

```sql
-- Check for missing demographic totals
SELECT * FROM cqi_indicator 
WHERE indicator_type = 'summary'
  AND (male_0_14 + female_0_14 + male_over_14 + female_over_14) != numerator;

-- Check for percentage calculation errors
SELECT * FROM cqi_indicator 
WHERE indicator_type = 'summary'
  AND denominator > 0
  AND ABS(percentage - ROUND((numerator * 100.0 / denominator), 2)) > 0.01;

-- Check for orphaned detail records
SELECT DISTINCT d.indicator_code, d.start_date, d.end_date
FROM cqi_indicator d
WHERE d.indicator_type = 'detail'
  AND NOT EXISTS (
    SELECT 1 FROM cqi_indicator s 
    WHERE s.indicator_code = d.indicator_code
      AND s.indicator_type = 'summary'
      AND s.start_date = d.start_date
      AND s.end_date = d.end_date
  );
```

### Performance Optimization

```sql
-- Analyze table usage
ANALYZE TABLE cqi_indicator;

-- Check index usage
SHOW INDEX FROM cqi_indicator;

-- Optimize table
OPTIMIZE TABLE cqi_indicator;
```

## Troubleshooting

### Common Issues

1. **Duplicate Records**: Check unique constraints and data sources
2. **Missing Data**: Verify source table availability and date ranges
3. **Performance Issues**: Review indexes and query patterns
4. **Data Inconsistencies**: Run validation queries and check source data

### Error Handling

The stored procedures include transaction management and error handling:

```sql
-- Check for procedure errors
SHOW WARNINGS;

-- Manual rollback if needed
ROLLBACK;
```

### Debugging Queries

```sql
-- Check data population status
SELECT 
    indicator_code,
    COUNT(*) as record_count,
    MIN(created_at) as first_created,
    MAX(updated_at) as last_updated
FROM cqi_indicator 
WHERE start_date = '2024-01-01' AND end_date = '2024-12-31'
GROUP BY indicator_code
ORDER BY indicator_code;

-- Identify data gaps
SELECT DISTINCT indicator_code 
FROM (
    SELECT '1' as indicator_code UNION SELECT '2' UNION SELECT '3' UNION SELECT '4' UNION
    SELECT '5a' UNION SELECT '5b' UNION SELECT '5c' UNION SELECT '5d' UNION
    SELECT '6a' UNION SELECT '6b' UNION SELECT '6c' UNION SELECT '7' UNION
    SELECT '8a' UNION SELECT '8b' UNION SELECT '9a' UNION SELECT '9b' UNION
    SELECT '9c' UNION SELECT '9d' UNION SELECT '9e' UNION SELECT '10a' UNION
    SELECT '10b' UNION SELECT '11a' UNION SELECT '11b' UNION SELECT '12a' UNION
    SELECT '12b' UNION SELECT '12c' UNION SELECT '12d' UNION SELECT '12e' UNION
    SELECT '13a' UNION SELECT '13b' UNION SELECT '13c' UNION SELECT '14a' UNION
    SELECT '14b' UNION SELECT '15'
) expected
WHERE indicator_code NOT IN (
    SELECT DISTINCT indicator_code 
    FROM cqi_indicator 
    WHERE start_date = '2024-01-01' AND end_date = '2024-12-31'
      AND indicator_type = 'summary'
);
```

## Conclusion

The CQI Indicator System provides a comprehensive solution for managing all mortality and retention indicators in a unified structure. It supports both aggregate reporting and patient-level analysis while maintaining data integrity and performance through proper indexing and stored procedures.

For additional support or feature requests, please refer to the development team or create an issue in the project repository.

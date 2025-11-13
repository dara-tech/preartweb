# CQI (Continuous Quality Improvement) SQL Workbench Files

This directory contains SQL files for CQI mortality and retention indicators, ready to use in any SQL workbench environment (MySQL Workbench, phpMyAdmin, etc.).

## Files Generated

### Main Files
- `cqi-complete-indicators-workbench.sql` - Complete CQI analysis with all indicators
- `README-CQI-WORKBENCH.md` - This documentation file

### Individual CQI Indicator Files
- `cqi_10a_tld_new_initiation.sql` - 10A TLD NEW INITIATION
- `cqi_10b_tld_cumulative.sql` - 10B TLD CUMULATIVE
- `cqi_11a_tpt_received.sql` - 11A TPT RECEIVED
- `cqi_11b_tpt_completed.sql` - 11B TPT COMPLETED
- `cqi_12a_vl_testing_coverage.sql` - 12A VL TESTING COVERAGE
- `cqi_12b_vl_monitored_six_months.sql` - 12B VL MONITORED SIX MONTHS
- `cqi_12c_vl_suppression_12_months.sql` - 12C VL SUPPRESSION 12 MONTHS
- `cqi_12d_vl_suppression_overall.sql` - 12D VL SUPPRESSION OVERALL
- `cqi_12e_vl_results_10_days.sql` - 12E VL RESULTS 10 DAYS
- `cqi_13a_enhanced_adherence_counseling.sql` - 13A ENHANCED ADHERENCE COUNSELING
- `cqi_13b_followup_vl_after_counseling.sql` - 13B FOLLOWUP VL AFTER COUNSELING
- `cqi_13c_vl_suppression_after_counseling.sql` - 13C VL SUPPRESSION AFTER COUNSELING
- `cqi_14a_first_line_to_second_line.sql` - 14A FIRST LINE TO SECOND LINE
- `cqi_14b_second_line_to_third_line.sql` - 14B SECOND LINE TO THIRD LINE
- `cqi_15_retention_rate.sql` - 15 RETENTION RATE
- `cqi_1_percentage_died.sql` - 1 PERCENTAGE DIED
- `cqi_2_percentage_lost_to_followup.sql` - 2 PERCENTAGE LOST TO FOLLOWUP
- `cqi_3_reengaged_within_28_days.sql` - 3 REENGAGED WITHIN 28 DAYS
- `cqi_4_reengaged_over_28_days.sql` - 4 REENGAGED OVER 28 DAYS
- `cqi_5.7.1_mortality_indicators.sql` - 5.7.1 MORTALITY INDICATORS
- `cqi_5a_late_visits_beyond_buffer.sql` - 5A LATE VISITS BEYOND BUFFER
- `cqi_5b_late_visits_within_buffer.sql` - 5B LATE VISITS WITHIN BUFFER
- `cqi_5c_visits_on_schedule.sql` - 5C VISITS ON SCHEDULE
- `cqi_5d_early_visits.sql` - 5D EARLY VISITS
- `cqi_6_same_day_art_initiation.sql` - 6 SAME DAY ART INITIATION
- `cqi_7_baseline_cd4_before_art.sql` - 7 BASELINE CD4 BEFORE ART
- `cqi_8a_cotrimoxazole_prophylaxis.sql` - 8A COTRIMOXAZOLE PROPHYLAXIS
- `cqi_8b_fluconazole_prophylaxis.sql` - 8B FLUCONAZOLE PROPHYLAXIS
- `cqi_9_mmd_3_months.sql` - 9 MMD 3 MONTHS

## Quick Start

### 1. Set Parameters
Before running any queries, set these parameters (matching the CQI service configuration):

```sql
-- Date parameters (Quarterly period)
SET @StartDate = '2025-01-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-03-31';               -- End date (YYYY-MM-DD) - Q1 2025
SET @PreviousEndDate = '2024-12-31';       -- Previous period end date

-- Status codes (matching service defaults)
SET @lost_code = 0;                        -- Lost to follow-up status code
SET @dead_code = 1;                        -- Dead status code
SET @transfer_out_code = 3;                -- Transfer out status code
SET @transfer_in_code = 1;                 -- Transfer in status code
SET @mmd_eligible_code = 0;                -- MMD eligible status code

-- Clinical parameters
SET @mmd_drug_quantity = 60;               -- MMD drug quantity threshold
SET @vl_suppression_threshold = 1000;      -- Viral load suppression threshold
SET @tld_regimen_formula = '3TC + DTG + TDF'; -- TLD regimen formula
SET @tpt_drug_list = "'Isoniazid','3HP','6H'"; -- TPT drug list
```

### 2. Run Complete CQI Analysis
Execute the main file for all CQI indicators:
```sql
-- Run: cqi-complete-indicators-workbench.sql
```

### 3. Run Individual CQI Indicators
Execute specific CQI indicator files:
```sql
-- Run: cqi_1_percentage_died.sql
-- Run: cqi_2_percentage_lost_to_followup.sql
-- Run: cqi_3_reengaged_within_28_days.sql
-- etc.
```

## Available CQI Indicators

| Indicator | File | Category | Description |
|-----------|------|----------|-------------|
| 1 | cqi_1_percentage_died.sql | Mortality & Re-engagement | Percentage of ART patients who died |
| 2 | cqi_2_percentage_lost_to_followup.sql | Mortality & Re-engagement | Percentage of ART patients who were lost to follow-up |
| 3 | cqi_3_reengaged_within_28_days.sql | Mortality & Re-engagement | Percentage reengaged within 28 days |
| 4 | cqi_4_reengaged_over_28_days.sql | Mortality & Re-engagement | Percentage reengaged over 28 days |
| 5a | cqi_5a_late_visits_beyond_buffer.sql | Visit Status | Late visits beyond buffer |
| 5b | cqi_5b_late_visits_within_buffer.sql | Visit Status | Late visits within buffer |
| 5c | cqi_5c_visits_on_schedule.sql | Visit Status | Visits on schedule |
| 5d | cqi_5d_early_visits.sql | Visit Status | Early visits |
| 6 | cqi_6_same_day_art_initiation.sql | Treatment & Prevention | Same day ART initiation |
| 7 | cqi_7_baseline_cd4_before_art.sql | Treatment & Prevention | Baseline CD4 before ART |
| 8a | cqi_8a_cotrimoxazole_prophylaxis.sql | Treatment & Prevention | Cotrimoxazole prophylaxis |
| 8b | cqi_8b_fluconazole_prophylaxis.sql | Treatment & Prevention | Fluconazole prophylaxis |
| 9 | cqi_9_mmd_3_months.sql | Treatment & Prevention | MMD 3 months |
| 10a | cqi_10a_tld_new_initiation.sql | Treatment & Prevention | TLD new initiation |
| 10b | cqi_10b_tld_cumulative.sql | Treatment & Prevention | TLD cumulative |
| 11a | cqi_11a_tpt_received.sql | Treatment & Prevention | TPT received |
| 11b | cqi_11b_tpt_completed.sql | Treatment & Prevention | TPT completed |
| 12a | cqi_12a_vl_testing_coverage.sql | Viral Load | VL testing coverage |
| 12b | cqi_12b_vl_monitored_six_months.sql | Viral Load | VL monitored six months |
| 12c | cqi_12c_vl_suppression_12_months.sql | Viral Load | VL suppression 12 months |
| 12d | cqi_12d_vl_suppression_overall.sql | Viral Load | VL suppression overall |
| 12e | cqi_12e_vl_results_10_days.sql | Viral Load | VL results 10 days |
| 13a | cqi_13a_enhanced_adherence_counseling.sql | Adherence Counseling | Enhanced adherence counseling |
| 13b | cqi_13b_followup_vl_after_counseling.sql | Adherence Counseling | Followup VL after counseling |
| 13c | cqi_13c_vl_suppression_after_counseling.sql | Adherence Counseling | VL suppression after counseling |
| 14a | cqi_14a_first_line_to_second_line.sql | Switching & Retention | First line to second line |
| 14b | cqi_14b_second_line_to_third_line.sql | Switching & Retention | Second line to third line |
| 15 | cqi_15_retention_rate.sql | Switching & Retention | Retention rate |

## Database Requirements

### Required Tables
- `tblaimain` - Adult patient data
- `tblcimain` - Child patient data
- `tblaart` - Adult ART data
- `tblcart` - Child ART data
- `tblavpatientstatus` - Adult patient status data
- `tblcvpatientstatus` - Child patient status data
- `tblavmain` - Adult visit data
- `tblcvmain` - Child visit data

### Required Columns
- `ClinicID` - Clinic identifier
- `DafirstVisit` - First visit date
- `DaART` - ART start date
- `Sex` - Patient gender
- `DaBirth` - Birth date
- `Status` - Patient status
- `Da` - Status date

## Usage Examples

### Example 1: Run for specific period
```sql
-- Set all required parameters
SET @StartDate = '2024-01-01';
SET @EndDate = '2024-03-31';
SET @PreviousEndDate = '2023-12-31';
SET @lost_code = 0;
SET @dead_code = 1;
SET @transfer_out_code = 3;
SET @transfer_in_code = 1;
SET @mmd_eligible_code = 0;
SET @mmd_drug_quantity = 60;
SET @vl_suppression_threshold = 1000;
SET @tld_regimen_formula = '3TC + DTG + TDF';
SET @tpt_drug_list = "'Isoniazid','3HP','6H'";

-- Run any CQI indicator query
SOURCE cqi_1_percentage_died.sql;
```

### Example 2: Run complete CQI analysis
```sql
-- Set all required parameters
SET @StartDate = '2024-01-01';
SET @EndDate = '2024-03-31';
SET @PreviousEndDate = '2023-12-31';
SET @lost_code = 0;
SET @dead_code = 1;
SET @transfer_out_code = 3;
SET @transfer_in_code = 1;
SET @mmd_eligible_code = 0;
SET @mmd_drug_quantity = 60;
SET @vl_suppression_threshold = 1000;
SET @tld_regimen_formula = '3TC + DTG + TDF';
SET @tpt_drug_list = "'Isoniazid','3HP','6H'";

SOURCE cqi-complete-indicators-workbench.sql;
```

### Example 3: Export CQI results
```sql
-- Set all required parameters
SET @StartDate = '2024-01-01';
SET @EndDate = '2024-03-31';
SET @PreviousEndDate = '2023-12-31';
SET @lost_code = 0;
SET @dead_code = 1;
SET @transfer_out_code = 3;
SET @transfer_in_code = 1;
SET @mmd_eligible_code = 0;
SET @mmd_drug_quantity = 60;
SET @vl_suppression_threshold = 1000;
SET @tld_regimen_formula = '3TC + DTG + TDF';
SET @tpt_drug_list = "'Isoniazid','3HP','6H'";

-- Run query and export
SELECT * FROM (
    -- Your CQI indicator query here
) AS results
INTO OUTFILE '/tmp/cqi_indicator_results.csv'
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"' 
LINES TERMINATED BY '\n';
```

## CQI Categories

### 1. Mortality & Re-engagement
- Deaths, Lost to follow-up, Reengagement indicators
- Focus on patient retention and mortality tracking

### 2. Visit Status
- Visit timing and adherence patterns
- Late visits, on-schedule visits, early visits

### 3. Treatment & Prevention
- ART initiation, prophylaxis, MMD, TLD, TPT
- Treatment quality and prevention measures

### 4. Viral Load
- VL testing coverage, monitoring, suppression
- Viral load management and monitoring

### 5. Adherence Counseling
- Enhanced adherence counseling and follow-up
- Patient support and adherence improvement

### 6. Switching & Retention
- Regimen switching and patient retention
- Treatment optimization and retention strategies

## Troubleshooting

### Common Issues
1. **Parameter not set**: Make sure to set all @ parameters before running queries
2. **Table not found**: Ensure all required tables exist in your database
3. **Permission denied**: Check database user permissions for SELECT operations

### Performance Tips
1. **Index optimization**: Ensure proper indexes on ClinicID, DaART, Status columns
2. **Date filtering**: Use date ranges to limit data processing
3. **Site filtering**: Always filter by specific site codes for better performance

## Support

For technical support or questions about these CQI SQL files, please contact the development team.

## License

This software is licensed under the MIT License.

# ART Web SQL Workbench Files

This directory contains SQL files ready to use in any SQL workbench environment (MySQL Workbench, phpMyAdmin, etc.).

## Files Generated

### Main Files
- `artweb-complete-indicators-workbench.sql` - Complete analysis with all indicators
- `README-WORKBENCH.md` - This documentation file

### Individual Indicator Files
- `01_active_art_previous.sql` - 01 ACTIVE ART PREVIOUS
- `01_active_art_previous_details.sql` - 01 ACTIVE ART PREVIOUS DETAILS
- `02_active_pre_art_previous.sql` - 02 ACTIVE PRE ART PREVIOUS
- `02_active_pre_art_previous_details.sql` - 02 ACTIVE PRE ART PREVIOUS DETAILS
- `03_newly_enrolled.sql` - 03 NEWLY ENROLLED
- `03_newly_enrolled_details.sql` - 03 NEWLY ENROLLED DETAILS
- `04_retested_positive.sql` - 04 RETESTED POSITIVE
- `04_retested_positive_details.sql` - 04 RETESTED POSITIVE DETAILS
- `05.1.1_art_same_day.sql` - 05.1.1 ART SAME DAY
- `05.1.1_art_same_day_details.sql` - 05.1.1 ART SAME DAY DETAILS
- `05.1.2_art_1_7_days.sql` - 05.1.2 ART 1 7 DAYS
- `05.1.2_art_1_7_days_details.sql` - 05.1.2 ART 1 7 DAYS DETAILS
- `05.1.3_art_over_7_days.sql` - 05.1.3 ART OVER 7 DAYS
- `05.1.3_art_over_7_days_details.sql` - 05.1.3 ART OVER 7 DAYS DETAILS
- `05.2_art_with_tld.sql` - 05.2 ART WITH TLD
- `05.2_art_with_tld_details.sql` - 05.2 ART WITH TLD DETAILS
- `05_newly_initiated.sql` - 05 NEWLY INITIATED
- `05_newly_initiated_details.sql` - 05 NEWLY INITIATED DETAILS
- `06_transfer_in.sql` - 06 TRANSFER IN
- `06_transfer_in_details.sql` - 06 TRANSFER IN DETAILS
- `07_lost_and_return.sql` - 07 LOST AND RETURN
- `07_lost_and_return_details.sql` - 07 LOST AND RETURN DETAILS
- `08.1_dead.sql` - 08.1 DEAD
- `08.1_dead_details.sql` - 08.1 DEAD DETAILS
- `08.2_lost_to_followup.sql` - 08.2 LOST TO FOLLOWUP
- `08.2_lost_to_followup_details.sql` - 08.2 LOST TO FOLLOWUP DETAILS
- `08.3_transfer_out.sql` - 08.3 TRANSFER OUT
- `08.3_transfer_out_details.sql` - 08.3 TRANSFER OUT DETAILS
- `09_active_pre_art.sql` - 09 ACTIVE PRE ART
- `09_active_pre_art_details.sql` - 09 ACTIVE PRE ART DETAILS
- `10.1_eligible_mmd.sql` - 10.1 ELIGIBLE MMD
- `10.1_eligible_mmd_details.sql` - 10.1 ELIGIBLE MMD DETAILS
- `10.2_mmd.sql` - 10.2 MMD
- `10.2_mmd_details.sql` - 10.2 MMD DETAILS
- `10.3_tld.sql` - 10.3 TLD
- `10.3_tld_details.sql` - 10.3 TLD DETAILS
- `10.4_tpt_start.sql` - 10.4 TPT START
- `10.4_tpt_start_details.sql` - 10.4 TPT START DETAILS
- `10.5_tpt_complete.sql` - 10.5 TPT COMPLETE
- `10.5_tpt_complete_details.sql` - 10.5 TPT COMPLETE DETAILS
- `10.6_eligible_vl_test.sql` - 10.6 ELIGIBLE VL TEST
- `10.6_eligible_vl_test_details.sql` - 10.6 ELIGIBLE VL TEST DETAILS
- `10.7_vl_tested_12m.sql` - 10.7 VL TESTED 12M
- `10.7_vl_tested_12m_details.sql` - 10.7 VL TESTED 12M DETAILS
- `10.8_vl_suppression.sql` - 10.8 VL SUPPRESSION
- `10.8_vl_suppression_details.sql` - 10.8 VL SUPPRESSION DETAILS
- `10_active_art_current.sql` - 10 ACTIVE ART CURRENT
- `10_active_art_current_details.sql` - 10 ACTIVE ART CURRENT DETAILS
- `variables.sql` - VARIABLES

## Quick Start

### 1. Set Parameters
Before running any queries, set these parameters (matching the service configuration):

```sql
-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

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

### 2. Run Complete Analysis
Execute the main file for all indicators:
```sql
-- Run: artweb-complete-indicators-workbench.sql
```

### 3. Run Individual Indicators
Execute specific indicator files:
```sql
-- Run: workbench-01_active_art_previous.sql
-- Run: workbench-02_active_pre_art_previous.sql
-- etc.
```

## Available Indicators

| Indicator | File | Description |
|-----------|------|-------------|
| 01 | 01_active_art_previous.sql | Active ART patients from previous period |
| 02 | 02_active_pre_art_previous.sql | Active Pre-ART patients from previous period |
| 03 | 03_newly_enrolled.sql | Newly enrolled patients |
| 04 | 04_retested_positive.sql | Retested positive patients |
| 05 | 05_newly_initiated.sql | Newly initiated ART patients |
| 05.1.1 | 05.1.1_art_same_day.sql | ART same day initiation |
| 05.1.2 | 05.1.2_art_1_7_days.sql | ART 1-7 days initiation |
| 05.1.3 | 05.1.3_art_over_7_days.sql | ART over 7 days initiation |
| 05.2 | 05.2_art_with_tld.sql | ART with TLD |
| 06 | 06_transfer_in.sql | Transfer in patients |
| 07 | 07_lost_and_return.sql | Lost and return patients |
| 08.1 | 08.1_dead.sql | Deceased patients |
| 08.2 | 08.2_lost_to_followup.sql | Lost to follow-up patients |
| 08.3 | 08.3_transfer_out.sql | Transfer out patients |
| 09 | 09_active_pre_art.sql | Currently active Pre-ART patients |
| 10 | 10_active_art_current.sql | Currently active ART patients |
| 10.1 | 10.1_eligible_mmd.sql | Eligible for multi-month dispensing |
| 10.2 | 10.2_mmd.sql | Multi-month dispensing patients |
| 10.3 | 10.3_tld.sql | TLD patients |
| 10.4 | 10.4_tpt_start.sql | TPT started patients |
| 10.5 | 10.5_tpt_complete.sql | TPT completed patients |
| 10.6 | 10.6_eligible_vl_test.sql | Eligible for viral load testing |
| 10.7 | 10.7_vl_tested_12m.sql | Viral load tested in last 12 months |
| 10.8 | 10.8_vl_suppression.sql | Viral load suppression |

## Database Requirements

### Required Tables
- `tblaimain` - Adult patient data
- `tblcimain` - Child patient data
- `tbleimain` - Infant patient data
- `tblavpatientstatus` - Patient status data
- `tblsitename` - Site information
- `tblclinic` - Clinic information

### Required Columns
- `SiteName` - Site identifier
- `DafirstVisit` - First visit date
- `DaART` - ART start date
- `Sex` - Patient gender
- `DaBirth` - Birth date
- `ClinicID` - Clinic identifier

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

-- Run any indicator query
SOURCE 01_active_art_previous.sql;
```

### Example 2: Run complete analysis
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

SOURCE artweb-complete-indicators-workbench.sql;
```

### Example 3: Export results
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
    -- Your indicator query here
) AS results
INTO OUTFILE '/tmp/indicator_results.csv'
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"' 
LINES TERMINATED BY '\n';
```

## Troubleshooting

### Common Issues
1. **Parameter not set**: Make sure to set @siteCode, @startDate, @endDate before running queries
2. **Table not found**: Ensure all required tables exist in your database
3. **Permission denied**: Check database user permissions for SELECT operations

### Performance Tips
1. **Index optimization**: Ensure proper indexes on SiteName, DafirstVisit, DaART columns
2. **Date filtering**: Use date ranges to limit data processing
3. **Site filtering**: Always filter by specific site codes for better performance

## Support

For technical support or questions about these SQL files, please contact the development team.

## License

This software is licensed under the MIT License.

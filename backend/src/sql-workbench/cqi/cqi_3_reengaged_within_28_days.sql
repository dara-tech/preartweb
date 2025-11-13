-- =====================================================
-- CQI: 3 REENGAGED WITHIN 28 DAYS
-- Generated: 2025-10-17T07:41:43.525Z
-- =====================================================

-- =====================================================
-- PARAMETER SETUP (matching CQI service configuration)
-- =====================================================
-- Set these parameters before running this query
-- These match the parameters used in the ART Web CQI service

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

-- =====================================================
-- MAIN CQI QUERY
-- =====================================================
-- Indicator 3: Percentage reengaged within 28 days
SELECT
    'Indicator 3: Percentage reengaged within 28 days' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_0_14_Reengaged,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_0_14_Reengaged,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_over_14_Reengaged,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_over_14_Reengaged
FROM (
    SELECT 'Adult' as type, IF(main.Sex=0, 'Female', 'Male') as Sex FROM tblaimain main JOIN tblavpatientstatus s ON main.ClinicID = s.ClinicID WHERE s.Da BETWEEN @StartDate AND @EndDate AND s.Status = @transfer_in_code
    UNION ALL
    SELECT 'Child' as type, IF(main.Sex=0, 'Female', 'Male') as Sex FROM tblcimain main JOIN tblcvpatientstatus s ON main.ClinicID = s.ClinicID WHERE s.Da BETWEEN @StartDate AND @EndDate AND s.Status = @transfer_in_code
) AS PatientList;
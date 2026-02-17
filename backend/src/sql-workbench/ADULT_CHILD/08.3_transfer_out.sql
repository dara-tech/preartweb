-- =====================================================
-- 08.3 TRANSFER OUT
-- Generated: 2025-10-16T17:34:57.211Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025

-- Status codes
SET @transfer_out_code = 3;                -- Transfer out status code

-- MAIN QUERY
-- =====================================================
-- Indicator 8.3: Transfer-out
SELECT
    '8.3. Transfer-out' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_over_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_over_14
FROM (
    SELECT 'Adult' as type, IF(main.Sex=0, "Female", "Male") as Sex FROM tblaimain main JOIN tblavpatientstatus s ON main.ClinicID = s.ClinicID WHERE s.Da BETWEEN @StartDate AND @EndDate AND s.Status = @transfer_out_code
    UNION ALL
    SELECT 'Child' as type, IF(main.Sex=0, "Female", "Male") as Sex FROM tblcimain main JOIN tblcvpatientstatus s ON main.ClinicID = s.ClinicID WHERE s.Da BETWEEN @StartDate AND @EndDate AND s.Status = @transfer_out_code
) AS PatientList;


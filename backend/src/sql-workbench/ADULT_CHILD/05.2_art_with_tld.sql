-- =====================================================
-- 05.2 ART WITH TLD
-- Generated: 2025-10-16T17:34:57.207Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025

-- Status codes
SET @transfer_in_code = 1;                 -- Transfer in status code

-- Clinical parameters
SET @tld_regimen_formula = '3TC + DTG + TDF'; -- TLD regimen formula

-- MAIN QUERY
-- =====================================================
-- Indicator 5.2: New ART started with TLD
SELECT
    '5.2. New ART started with TLD' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_over_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_over_14
FROM (
    SELECT 'Adult' as type, IF(p.Sex=0, 'Female', 'Male') as Sex FROM tblaimain p
    JOIN tblaart art ON p.ClinicID = art.ClinicID JOIN tblavmain v ON p.ClinicID = v.ClinicID AND v.DatVisit = art.DaArt
    WHERE art.DaArt BETWEEN @StartDate AND @EndDate
    AND (p.OffIn IS NULL OR p.OffIn <> @transfer_in_code)
    AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)
    AND v.Vid IN (SELECT Vid FROM (SELECT Vid, GROUP_CONCAT(DrugName ORDER BY DrugName SEPARATOR ' + ') as regimen FROM tblavarvdrug WHERE Status <> 1 AND Status <> -1 GROUP BY Vid) rg WHERE rg.regimen = @tld_regimen_formula)
    UNION ALL
    SELECT 'Child' as type, IF(p.Sex=0, 'Female', 'Male') as Sex FROM tblcimain p
    JOIN tblcart art ON p.ClinicID = art.ClinicID JOIN tblcvmain v ON p.ClinicID = v.ClinicID AND v.DatVisit = art.DaArt
    AND art.DaArt BETWEEN @StartDate AND @EndDate
    AND v.Vid IN (SELECT Vid FROM (SELECT Vid, GROUP_CONCAT(DrugName ORDER BY DrugName SEPARATOR ' + ') as regimen FROM tblcvarvdrug WHERE Status <> 1 AND Status <> -1 GROUP BY Vid) rg WHERE rg.regimen = @tld_regimen_formula)
) AS PatientList;


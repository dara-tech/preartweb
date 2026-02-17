-- =====================================================
-- 05.2 ART WITH TLD DETAILS
-- Generated: 2025-10-16T17:34:57.208Z
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
-- Indicator 5.2: New ART started with TLD - Detailed Records (matching aggregate logic)
SELECT
    '5.2' as step,
    p.ClinicID as clinicid,
    p.Sex as sex,
    CASE 
        WHEN p.Sex = 0 THEN 'Female'
        WHEN p.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    '15+' as typepatients,
    p.DaBirth as DaBirth,
    p.DafirstVisit as DafirstVisit,
    art.ART as art_number,
    art.DaArt as DaArt,
    v.DatVisit as DatVisit,
    p.OffIn as OffIn,
    'Adult' as patient_type,
    TIMESTAMPDIFF(YEAR, p.DaBirth, @EndDate) as age,
    CASE 
        WHEN p.OffIn = 0 THEN 'Not Transferred'
        WHEN p.OffIn = 1 THEN 'Transferred In'
        WHEN p.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', p.OffIn)
    END as transfer_status,
    rg.regimen as drug_regimen,
    'TLD' as TLDStatus
FROM tblaimain p 
JOIN tblaart art ON p.ClinicID = art.ClinicID
JOIN tblavmain v ON p.ClinicID = v.ClinicID AND v.DatVisit = art.DaArt
JOIN (
    SELECT Vid, GROUP_CONCAT(DrugName ORDER BY DrugName SEPARATOR ' + ') as regimen 
    FROM tblavarvdrug 
    WHERE Status <> 1 AND Status <> -1
    GROUP BY Vid
) rg ON v.Vid = rg.Vid
WHERE art.DaArt BETWEEN @StartDate AND @EndDate
    AND (p.OffIn IS NULL OR p.OffIn <> @transfer_in_code)
    AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)
    AND rg.regimen = @tld_regimen_formula

UNION ALL

SELECT
    '5.2' as step,
    p.ClinicID as clinicid,
    p.Sex as sex,
    CASE 
        WHEN p.Sex = 0 THEN 'Female'
        WHEN p.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    '≤14' as typepatients,
    p.DaBirth as DaBirth,
    p.DafirstVisit as DafirstVisit,
    art.ART as art_number,
    art.DaArt as DaArt,
    v.DatVisit as DatVisit,
    p.OffIn as OffIn,
    'Child' as patient_type,
    TIMESTAMPDIFF(YEAR, p.DaBirth, @EndDate) as age,
    CASE 
        WHEN p.OffIn = 0 THEN 'Not Transferred'
        WHEN p.OffIn = 1 THEN 'Transferred In'
        WHEN p.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', p.OffIn)
    END as transfer_status,
    rg.regimen as drug_regimen,
    'TLD' as TLDStatus
FROM tblcimain p 
JOIN tblcart art ON p.ClinicID = art.ClinicID
JOIN tblcvmain v ON p.ClinicID = v.ClinicID AND v.DatVisit = art.DaArt
JOIN (
    SELECT Vid, GROUP_CONCAT(DrugName ORDER BY DrugName SEPARATOR ' + ') as regimen 
    FROM tblcvarvdrug 
    WHERE Status <> 1 AND Status <> -1
    GROUP BY Vid
) rg ON v.Vid = rg.Vid
WHERE art.DaArt BETWEEN @StartDate AND @EndDate
    AND (p.OffIn IS NULL OR p.OffIn <> @transfer_in_code)
    AND rg.regimen = @tld_regimen_formula
ORDER BY DaArt DESC, ClinicID;


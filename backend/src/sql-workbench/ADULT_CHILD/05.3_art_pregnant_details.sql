-- =====================================================
-- 05.3 ART PREGNANT DETAILS
-- Generated: 2026-05-26T13:19:28.145Z
-- =====================================================

-- =====================================================
-- PARAMETER SETUP (matching service configuration)
-- =====================================================
-- Set these parameters before running this query
-- These match the parameters used in the ART Web service

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

-- =====================================================
-- MAIN QUERY
-- =====================================================
-- Indicator 5.3: New ART patients who are pregnant - Detailed Records
SELECT
    '5.3' AS step,
    p.ClinicID AS clinicid,
    art.ART AS art_number,
    p.Sex AS sex,
    'Female' AS sex_display,
    '15+' AS typepatients,
    p.DaBirth AS DaBirth,
    p.DafirstVisit AS DafirstVisit,
    art.DaArt AS DaArt,
    v.DatVisit AS DatVisit,
    p.OffIn AS OffIn,
    'Adult' AS patient_type,
    TIMESTAMPDIFF(YEAR, p.DaBirth, @EndDate) AS age,
    v.Womenstatus AS Womenstatus,
    v.DaPreg AS DaPreg,
    CASE
        WHEN p.OffIn = 0 THEN 'Not Transferred'
        WHEN p.OffIn = 2 THEN 'Transferred In'
        WHEN p.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', p.OffIn)
    END AS transfer_status
FROM tblaimain p
JOIN tblaart art ON p.ClinicID = art.ClinicID
JOIN tblavmain v ON p.ClinicID = v.ClinicID AND v.DatVisit = art.DaArt
WHERE
    art.DaArt BETWEEN @StartDate AND @EndDate
    AND (p.OffIn IS NULL OR p.OffIn <> @transfer_in_code)
    AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)
    AND p.Sex = 0
    AND v.Womenstatus = 0
ORDER BY DaArt DESC, ClinicID;

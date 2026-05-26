-- =====================================================
-- 05 NEWLY INITIATED
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
-- Indicator 5: Newly Initiated
WITH tblnewlyinitiated AS (
    -- Adults: Must have ART start date in quarter, NOT be a transfer-in, AND NOT be a lost-return patient
    SELECT 
        'Adult' as type, 
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        art.DaArt
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    JOIN tblavmain v ON p.ClinicID = v.ClinicID AND v.DatVisit = art.DaArt 
    WHERE 
        art.DaArt BETWEEN @StartDate AND @EndDate 
        AND (p.OffIn IS NULL OR p.OffIn <> @transfer_in_code)
        AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)
    
    UNION ALL
    
    -- Children: Must have ART start date in quarter AND NOT be a transfer-in
    SELECT 
        'Child' as type, 
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        art.DaArt
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = art.ClinicID
    JOIN tblcvmain v ON p.ClinicID = v.ClinicID AND v.DatVisit = art.DaArt
    WHERE 
        art.DaArt BETWEEN @StartDate AND @EndDate 
        AND (p.OffIn IS NULL OR p.OffIn <> @transfer_in_code)
)

SELECT
    '5. Newly Initiated' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_0_14,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_0_14,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_over_14,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_over_14
FROM tblnewlyinitiated;

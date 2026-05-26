-- =====================================================
-- 06 TRANSFER IN DETAILS
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
-- Indicator 6: Transfer-in patients - Detailed Records
-- This matches the old system logic exactly:
-- Adult: LEFT JOIN with tblaart (no ART requirement)
-- Child: LEFT JOIN with tblcart but requires tblcart.ClinicID IS NOT NULL
SELECT
    p.ClinicID as clinicid,
    art.ART as art_number,
    p.Sex as sex,
    CASE 
        WHEN p.Sex = 0 THEN 'Female'
        WHEN p.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    '15+' as typepatients,
    p.DaBirth as DaBirth,
    p.DafirstVisit as DafirstVisit,
    art.DaArt as DaArt,
    p.OffIn as OffIn,
    'Adult' as patient_type,
    TIMESTAMPDIFF(YEAR, p.DaBirth, @EndDate) as age,
    CASE 
        WHEN p.OffIn = 0 THEN 'Not Transferred'
        WHEN p.OffIn = 1 THEN 'Transferred In'
        WHEN p.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', p.OffIn)
    END as transfer_status,
    p.TypeofReturn,
    NULL as ClinicIDold,
    NULL as SiteNameold
FROM tblaimain p 
LEFT JOIN tblaart art ON p.ClinicID = art.ClinicID
LEFT JOIN tblavpatientstatus pvs ON p.ClinicID = pvs.ClinicID
WHERE 
    p.DafirstVisit BETWEEN @StartDate AND @EndDate
    AND p.OffIn = 1
    AND p.TypeofReturn = -1

UNION ALL

SELECT
    p.ClinicID as clinicid,
    art.ART as art_number,
    p.Sex as sex,
    CASE 
        WHEN p.Sex = 0 THEN 'Female'
        WHEN p.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    '≤14' as typepatients,
    p.DaBirth as DaBirth,
    p.DafirstVisit as DafirstVisit,
    art.DaArt as DaArt,
    p.OffIn as OffIn,
    'Child' as patient_type,
    TIMESTAMPDIFF(YEAR, p.DaBirth, @EndDate) as age,
    CASE 
        WHEN p.OffIn = 0 THEN 'Not Transferred'
        WHEN p.OffIn = 1 THEN 'Transferred In'
        WHEN p.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', p.OffIn)
    END as transfer_status,
    NULL as TypeofReturn,
    p.ClinicIDold,
    p.SiteNameold
FROM tblcimain p 
LEFT JOIN tblcart art ON p.ClinicID = art.ClinicID
LEFT JOIN tblcvpatientstatus pvs ON p.ClinicID = pvs.ClinicID
WHERE 
    p.DafirstVisit BETWEEN @StartDate AND @EndDate
    AND p.OffIn = 1
    AND art.ClinicID IS NOT NULL
    AND p.LClinicID IS NOT NULL AND p.LClinicID <> ''
    AND p.ClinicIDold IS NOT NULL AND p.ClinicIDold <> ''
    AND p.SiteNameold IS NOT NULL AND p.SiteNameold <> ''
ORDER BY DaArt DESC, ClinicID;

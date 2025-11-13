-- =====================================================
-- 06 TRANSFER IN DETAILS
-- Generated: 2025-10-16T17:34:57.208Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025

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


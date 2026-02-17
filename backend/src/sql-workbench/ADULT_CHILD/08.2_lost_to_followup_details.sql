-- =====================================================
-- 08.2 LOST TO FOLLOWUP DETAILS
-- Generated: 2025-10-16T17:34:57.210Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025

-- Status codes
SET @lost_code = 0;                        -- Lost to follow-up status code

-- MAIN QUERY
-- =====================================================
-- Indicator 8.2: Lost to follow up (LTFU) - Detailed Records (matching aggregate logic)
SELECT
    main.ClinicID as clinicid,
    art.ART as art_number,
    main.Sex as sex,
    CASE 
        WHEN main.Sex = 0 THEN 'Female'
        WHEN main.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    '15+' as typepatients,
    main.DaBirth as DaBirth,
    main.DafirstVisit as DafirstVisit,
    main.OffIn as OffIn,
    'Adult' as patient_type,
    TIMESTAMPDIFF(YEAR, main.DaBirth, @EndDate) as age,
    CASE 
        WHEN main.OffIn = 0 THEN 'Not Transferred'
        WHEN main.OffIn = 2 THEN 'Transferred In'
        WHEN main.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', main.OffIn)
    END as transfer_status,
    s.Da as ltf_date,
    s.Status as ltf_status_code
FROM tblaimain main 
LEFT JOIN tblaart art ON main.ClinicID = art.ClinicID
JOIN tblavpatientstatus s ON main.ClinicID = s.ClinicID
WHERE s.Da BETWEEN @StartDate AND @EndDate 
    AND s.Status = @lost_code

UNION ALL

SELECT
    main.ClinicID as clinicid,
    art.ART as art_number,
    main.Sex as sex,
    CASE 
        WHEN main.Sex = 0 THEN 'Female'
        WHEN main.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    '≤14' as typepatients,
    main.DaBirth as DaBirth,
    main.DafirstVisit as DafirstVisit,
    main.OffIn as OffIn,
    'Child' as patient_type,
    TIMESTAMPDIFF(YEAR, main.DaBirth, @EndDate) as age,
    CASE 
        WHEN main.OffIn = 0 THEN 'Not Transferred'
        WHEN main.OffIn = 2 THEN 'Transferred In'
        WHEN main.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', main.OffIn)
    END as transfer_status,
    s.Da as ltf_date,
    s.Status as ltf_status_code
FROM tblcimain main 
LEFT JOIN tblcart art ON main.ClinicID = art.ClinicID
JOIN tblcvpatientstatus s ON main.ClinicID = s.ClinicID
WHERE s.Da BETWEEN @StartDate AND @EndDate 
    AND s.Status = @lost_code
ORDER BY ltf_date DESC, clinicid;


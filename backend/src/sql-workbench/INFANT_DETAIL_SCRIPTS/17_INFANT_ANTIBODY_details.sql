-- =====================================================
-- INFANT ANTIBODY TEST DETAILS
-- =====================================================

-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD)

-- MAIN QUERY
-- =====================================================
-- Antibody Test Results
-- Matches logic from Rinfants.vb: Antibody test (0 = Negative, 1 = Positive)
SELECT
    tbleimain.ClinicID as clinicid,
    tbleimain.Sex as sex,
    CASE 
        WHEN tbleimain.Sex = 0 THEN 'Female'
        WHEN tbleimain.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    tbleimain.DaBirth as DaBirth,
    NULL as DafirstVisit,
    tblevmain.DatVisit as DatVisit,
    NULL as TestDate,
    tblevmain.Antibody as antibody_result,
    CASE 
        WHEN tblevmain.Antibody = 0 THEN 'Negative'
        WHEN tblevmain.Antibody = 1 THEN 'Positive'
        ELSE CONCAT('Result: ', tblevmain.Antibody)
    END as antibody_display,
    tblevmain.DaAntibody as antibody_test_date,
    'Infant' as patient_type
FROM tblevmain 
INNER JOIN tbleimain ON tblevmain.ClinicID = tbleimain.ClinicID
WHERE 
    tblevmain.DatVisit BETWEEN @StartDate AND @EndDate
    AND tblevmain.Antibody IS NOT NULL
ORDER BY tblevmain.DatVisit DESC, tbleimain.ClinicID;


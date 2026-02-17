-- =====================================================
-- INFANT STARTED COTRIMOXAZOLE DETAILS
-- =====================================================

-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD)

-- MAIN QUERY
-- =====================================================
-- Started Cotrimoxazole
-- Matches logic from Rinfants.vb line 240: 
-- SELECT tblEImain.ClinicID, tblEImain.DaBirth, tblEImain.Sex, tblEVmain.DatVisit, 
--        tblevarvdrug.Status, tblevarvdrug.Da, tblEImain.DafirstVisit
-- FROM tblEVmain INNER JOIN tblEImain ON tblEVmain.ClinicID = tblEImain.ClinicID 
-- RIGHT OUTER JOIN tblevarvdrug ON tblEVmain.Vid = tblevarvdrug.Vid 
-- WHERE (tblevarvdrug.Status = 0 and tblevarvdrug.DrugName='Cotrimoxazole') 
--   and (tblevarvdrug.Da BETWEEN @StartDate AND @EndDate) 
-- GROUP BY tbleimain.clinicid 
-- ORDER BY tblevarvdrug.Da, tblEImain.Sex
SELECT 
    c.ClinicID as clinicid,
    MAX(c.Sex) as sex,
    CASE 
        WHEN MAX(c.Sex) = 0 THEN 'Female'
        WHEN MAX(c.Sex) = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    MAX(c.DaBirth) as DaBirth,
    MAX(c.DafirstVisit) as DafirstVisit,
    MAX(c.DatVisit) as DatVisit,
    MIN(c.start_date) as start_date,
    MAX(c.drug_status) as drug_status,
    MAX(c.drug_name) as drug_name,
    CASE 
        WHEN MAX(c.drug_status) = 0 THEN 'Started'
        ELSE CONCAT('Status: ', MAX(c.drug_status))
    END as status_display,
    'Infant' as patient_type
FROM (
    SELECT DISTINCT
        tbleimain.ClinicID,
        tbleimain.Sex,
        tbleimain.DaBirth,
        tbleimain.DafirstVisit,
        tblevmain.DatVisit,
        tblevarvdrug.Da as start_date,
        tblevarvdrug.Status as drug_status,
        tblevarvdrug.DrugName as drug_name
    FROM tblevmain 
    INNER JOIN tbleimain ON tblevmain.ClinicID = tbleimain.ClinicID
    RIGHT OUTER JOIN tblevarvdrug ON tblevmain.Vid = tblevarvdrug.Vid
    WHERE 
        tblevarvdrug.Status = 0
        AND tblevarvdrug.DrugName = 'Cotrimoxazole'
        AND tblevarvdrug.Da BETWEEN @StartDate AND @EndDate
) c
GROUP BY c.ClinicID
ORDER BY start_date, sex, clinicid;


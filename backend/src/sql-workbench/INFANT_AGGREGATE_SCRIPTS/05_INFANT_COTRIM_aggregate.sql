-- =====================================================
-- INFANT_COTRIM_aggregate - Cotrimoxazole Prophylaxis AGGREGATE
-- =====================================================
-- Derived from corresponding detail script
-- =====================================================
-- PARAMETER SETUP
-- =====================================================
SET @StartDate = '2025-01-01';
SET @EndDate = '2025-03-31';

-- =====================================================
-- MAIN QUERY
-- =====================================================
SELECT
  tblEImain.ClinicID,
  tblEImain.DaBirth,
  tblEImain.Sex,
  tblEVmain.DatVisit,
  tblevarvdrug.Status,
  tblevarvdrug.Da,
  tblEImain.DafirstVisit
FROM tblEVmain
INNER JOIN tblEImain ON tblEVmain.ClinicID = tblEImain.ClinicID
RIGHT OUTER JOIN tblevarvdrug ON tblEVmain.Vid = tblevarvdrug.Vid
WHERE (tblevarvdrug.Status = 0 
  AND tblevarvdrug.DrugName = 'Cotrimoxazole') 
  AND (tblevarvdrug.Da BETWEEN @StartDate AND @EndDate)
GROUP BY tbleimain.clinicid
ORDER BY tblevarvdrug.Da, tblEImain.Sex;

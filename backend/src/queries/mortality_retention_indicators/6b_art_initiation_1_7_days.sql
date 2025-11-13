-- ===================================================================
-- Indicator 6b: Percentage of patients newly initiating ART within 1-7 days of diagnosed date
-- ===================================================================

SELECT
    '6b. Percentage of patients newly initiating ART within 1-7 days of diagnosed date' AS Indicator,
    CAST(IFNULL(COUNT(*), 0) AS UNSIGNED) AS Initiation_1_7_Days,
    CAST(IFNULL(COUNT(*), 0) AS UNSIGNED) AS TOTAL,
    CAST(IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS UNSIGNED) AS Male_0_14,
    CAST(IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS UNSIGNED) AS Female_0_14,
    CAST(IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS UNSIGNED) AS Male_over_14,
    CAST(IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS UNSIGNED) AS Female_over_14
FROM (
    -- Adults: Must not be a lost-return patient
    SELECT 
        'Adult' as type, 
        IF(p.Sex=0, "Female", "Male") as Sex 
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID 
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate 
        AND DATEDIFF(art.DaArt, p.DafirstVisit) BETWEEN 1 AND 7 
        AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)
    
    UNION ALL
    
    -- Children
    SELECT 
        'Child' as type, 
        IF(p.Sex=0, "Female", "Male") as Sex 
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = art.ClinicID 
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate 
        AND DATEDIFF(art.DaArt, p.DafirstVisit) BETWEEN 1 AND 7
) as PatientList;


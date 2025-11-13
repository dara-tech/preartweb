-- ===================================================================
-- Indicator 12a: Percentage of people receiving antiretroviral therapy receiving a viral load test in the past 12 months
-- (the coverage of viral load testing)
-- ===================================================================

WITH tblvl_coverage AS (
    -- Adults with VL testing in past 12 months
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        pt.HIVLoad as ViralLoad,
        pt.Dat as VLTestDate,
        CASE 
            WHEN pt.HIVLoad IS NOT NULL AND pt.Dat >= DATE_SUB(:EndDate, INTERVAL 12 MONTH) THEN 'Tested'
            ELSE 'Not_Tested'
        END as VLStatus
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    LEFT JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID 
        AND pt.HIVLoad IS NOT NULL 
        AND pt.Dat >= DATE_SUB(:EndDate, INTERVAL 12 MONTH)
    WHERE 
        art.DaArt <= :EndDate
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
    
    UNION ALL
    
    -- Children with VL testing in past 12 months
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        pt.HIVLoad as ViralLoad,
        pt.Dat as VLTestDate,
        CASE 
            WHEN pt.HIVLoad IS NOT NULL AND pt.Dat >= DATE_SUB(:EndDate, INTERVAL 12 MONTH) THEN 'Tested'
            ELSE 'Not_Tested'
        END as VLStatus
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = p.ClinicID
    LEFT JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID 
        AND pt.HIVLoad IS NOT NULL 
        AND pt.Dat >= DATE_SUB(:EndDate, INTERVAL 12 MONTH)
    WHERE 
        art.DaArt <= :EndDate
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
)

SELECT
    '12a. Percentage of ART patients receiving VL test in past 12 months' AS Indicator,
    IFNULL(SUM(CASE WHEN VLStatus = 'Tested' THEN 1 ELSE 0 END), 0) AS VL_Tested_12M,
    IFNULL(COUNT(*), 0) AS Total_ART_Patients,
    CASE 
        WHEN COUNT(*) > 0 
        THEN ROUND((SUM(CASE WHEN VLStatus = 'Tested' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2)
        ELSE 0 
    END AS Percentage,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Male' AND VLStatus = 'Tested' THEN 1 ELSE 0 END), 0) AS Male_0_14_Tested,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Female' AND VLStatus = 'Tested' THEN 1 ELSE 0 END), 0) AS Female_0_14_Tested,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' AND VLStatus = 'Tested' THEN 1 ELSE 0 END), 0) AS Male_over_14_Tested,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' AND VLStatus = 'Tested' THEN 1 ELSE 0 END), 0) AS Female_over_14_Tested
FROM tblvl_coverage;




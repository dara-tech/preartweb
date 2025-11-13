-- ===================================================================
-- Indicator 12d: Percentage of people living with HIV and receiving antiretroviral therapy who have suppressed viral load [WHO VLS.3]
-- ===================================================================

WITH tblvl_suppression_overall AS (
    -- Adults with overall VL suppression
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        pt.HIVLoad as LatestViralLoad,
        pt.Dat as VLTestDate,
        CASE 
            WHEN pt.HIVLoad IS NOT NULL 
                AND pt.Dat >= DATE_SUB(:EndDate, INTERVAL 12 MONTH)
                AND CAST(REPLACE(pt.HIVLoad, '<', '') AS UNSIGNED) < 1000 THEN 'Suppressed'
            WHEN pt.HIVLoad IS NOT NULL 
                AND pt.Dat >= DATE_SUB(:EndDate, INTERVAL 12 MONTH) THEN 'Not_Suppressed'
            ELSE 'Not_Tested'
        END as VLStatus
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    LEFT JOIN (
        SELECT 
            pt1.ClinicID,
            pt1.HIVLoad,
            pt1.Dat,
            ROW_NUMBER() OVER (PARTITION BY pt1.ClinicID ORDER BY pt1.Dat DESC) as rn
        FROM tblpatienttest pt1
        WHERE pt1.HIVLoad IS NOT NULL 
        AND pt1.Dat >= DATE_SUB(:EndDate, INTERVAL 12 MONTH)
    ) pt ON p.ClinicID = pt.ClinicID AND pt.rn = 1
    WHERE 
        art.DaArt <= :EndDate
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
    
    UNION ALL
    
    -- Children with overall VL suppression
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        pt.HIVLoad as LatestViralLoad,
        pt.Dat as VLTestDate,
        CASE 
            WHEN pt.HIVLoad IS NOT NULL 
                AND pt.Dat >= DATE_SUB(:EndDate, INTERVAL 12 MONTH)
                AND CAST(REPLACE(pt.HIVLoad, '<', '') AS UNSIGNED) < 1000 THEN 'Suppressed'
            WHEN pt.HIVLoad IS NOT NULL 
                AND pt.Dat >= DATE_SUB(:EndDate, INTERVAL 12 MONTH) THEN 'Not_Suppressed'
            ELSE 'Not_Tested'
        END as VLStatus
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = p.ClinicID
    LEFT JOIN (
        SELECT 
            pt1.ClinicID,
            pt1.HIVLoad,
            pt1.Dat,
            ROW_NUMBER() OVER (PARTITION BY pt1.ClinicID ORDER BY pt1.Dat DESC) as rn
        FROM tblpatienttest pt1
        WHERE pt1.HIVLoad IS NOT NULL 
        AND pt1.Dat >= DATE_SUB(:EndDate, INTERVAL 12 MONTH)
    ) pt ON p.ClinicID = pt.ClinicID AND pt.rn = 1
    WHERE 
        art.DaArt <= :EndDate
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
)

SELECT
    '12d. Percentage of ART patients who have suppressed viral load [WHO VLS.3]' AS Indicator,
    IFNULL(SUM(CASE WHEN VLStatus = 'Suppressed' THEN 1 ELSE 0 END), 0) AS VL_Suppressed_Overall,
    IFNULL(SUM(CASE WHEN VLStatus IN ('Suppressed', 'Not_Suppressed') THEN 1 ELSE 0 END), 0) AS VL_Tested_Overall,
    IFNULL(COUNT(*), 0) AS Total_ART_Patients,
    CASE 
        WHEN SUM(CASE WHEN VLStatus IN ('Suppressed', 'Not_Suppressed') THEN 1 ELSE 0 END) > 0 
        THEN ROUND((SUM(CASE WHEN VLStatus = 'Suppressed' THEN 1 ELSE 0 END) * 100.0 / SUM(CASE WHEN VLStatus IN ('Suppressed', 'Not_Suppressed') THEN 1 ELSE 0 END)), 2)
        ELSE 0 
    END AS Percentage_Of_Tested,
    CASE 
        WHEN COUNT(*) > 0 
        THEN ROUND((SUM(CASE WHEN VLStatus = 'Suppressed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2)
        ELSE 0 
    END AS Percentage_Of_Total,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Male' AND VLStatus = 'Suppressed' THEN 1 ELSE 0 END), 0) AS Male_0_14_Suppressed,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Female' AND VLStatus = 'Suppressed' THEN 1 ELSE 0 END), 0) AS Female_0_14_Suppressed,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' AND VLStatus = 'Suppressed' THEN 1 ELSE 0 END), 0) AS Male_over_14_Suppressed,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' AND VLStatus = 'Suppressed' THEN 1 ELSE 0 END), 0) AS Female_over_14_Suppressed
FROM tblvl_suppression_overall;




-- ===================================================================
-- Indicator 12c: Percentage of people receiving antiretroviral therapy tested for viral load at <1000 copies/mL at 12 months after initiating antiretroviral therapy [WHO: VLS.1]
-- ===================================================================

WITH tblvl_suppression_12m AS (
    -- Adults with VL suppression at 12 months
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaART as ARTStartDate,
        pt.HIVLoad as ViralLoad,
        pt.Dat as VLTestDate,
        TIMESTAMPDIFF(MONTH, p.DaART, pt.Dat) as MonthsOnART,
        CASE 
            WHEN pt.HIVLoad IS NOT NULL 
                AND pt.Dat BETWEEN DATE_ADD(p.DaART, INTERVAL 11 MONTH) AND DATE_ADD(p.DaART, INTERVAL 13 MONTH)
                AND pt.Dat <= :EndDate
                AND CAST(REPLACE(pt.HIVLoad, '<', '') AS UNSIGNED) < 1000 THEN 'Suppressed'
            WHEN pt.HIVLoad IS NOT NULL 
                AND pt.Dat BETWEEN DATE_ADD(p.DaART, INTERVAL 11 MONTH) AND DATE_ADD(p.DaART, INTERVAL 13 MONTH)
                AND pt.Dat <= :EndDate THEN 'Not_Suppressed'
            ELSE 'Not_Tested'
        END as VLStatus
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    LEFT JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID 
        AND pt.HIVLoad IS NOT NULL
        AND pt.Dat BETWEEN DATE_ADD(art.DaArt, INTERVAL 11 MONTH) AND DATE_ADD(p.DaART, INTERVAL 13 MONTH)
        AND pt.Dat <= :EndDate
    WHERE 
        p.DaART BETWEEN DATE_SUB(:StartDate, INTERVAL 13 MONTH) AND DATE_SUB(:EndDate, INTERVAL 11 MONTH)
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
    
    UNION ALL
    
    -- Children with VL suppression at 12 months
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaART as ARTStartDate,
        pt.HIVLoad as ViralLoad,
        pt.Dat as VLTestDate,
        TIMESTAMPDIFF(MONTH, p.DaART, pt.Dat) as MonthsOnART,
        CASE 
            WHEN pt.HIVLoad IS NOT NULL 
                AND pt.Dat BETWEEN DATE_ADD(p.DaART, INTERVAL 11 MONTH) AND DATE_ADD(p.DaART, INTERVAL 13 MONTH)
                AND pt.Dat <= :EndDate
                AND CAST(REPLACE(pt.HIVLoad, '<', '') AS UNSIGNED) < 1000 THEN 'Suppressed'
            WHEN pt.HIVLoad IS NOT NULL 
                AND pt.Dat BETWEEN DATE_ADD(p.DaART, INTERVAL 11 MONTH) AND DATE_ADD(p.DaART, INTERVAL 13 MONTH)
                AND pt.Dat <= :EndDate THEN 'Not_Suppressed'
            ELSE 'Not_Tested'
        END as VLStatus
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = p.ClinicID
    LEFT JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID 
        AND pt.HIVLoad IS NOT NULL
        AND pt.Dat BETWEEN DATE_ADD(art.DaArt, INTERVAL 11 MONTH) AND DATE_ADD(p.DaART, INTERVAL 13 MONTH)
        AND pt.Dat <= :EndDate
    WHERE 
        p.DaART BETWEEN DATE_SUB(:StartDate, INTERVAL 13 MONTH) AND DATE_SUB(:EndDate, INTERVAL 11 MONTH)
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
)

SELECT
    '12c. Percentage of ART patients with VL <1000 copies/mL at 12 months [WHO VLS.1]' AS Indicator,
    IFNULL(SUM(CASE WHEN VLStatus = 'Suppressed' THEN 1 ELSE 0 END), 0) AS VL_Suppressed_12M,
    IFNULL(SUM(CASE WHEN VLStatus IN ('Suppressed', 'Not_Suppressed') THEN 1 ELSE 0 END), 0) AS VL_Tested_12M,
    IFNULL(COUNT(*), 0) AS Total_Eligible_Patients,
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
FROM tblvl_suppression_12m;




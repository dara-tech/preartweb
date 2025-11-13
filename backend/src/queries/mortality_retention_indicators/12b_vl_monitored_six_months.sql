-- ===================================================================
-- Indicator 12b: Percentage of people receiving antiretroviral therapy who had viral load monitored at six months [WHO VLS.6]
-- ===================================================================

WITH tblvl_six_months AS (
    -- Adults with VL testing at 6 months
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
                AND pt.Dat BETWEEN DATE_ADD(p.DaART, INTERVAL 5 MONTH) AND DATE_ADD(p.DaART, INTERVAL 7 MONTH)
                AND pt.Dat <= :EndDate THEN 'Monitored'
            ELSE 'Not_Monitored'
        END as VLStatus
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    LEFT JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID 
        AND pt.HIVLoad IS NOT NULL
        AND pt.Dat BETWEEN DATE_ADD(art.DaArt, INTERVAL 5 MONTH) AND DATE_ADD(p.DaART, INTERVAL 7 MONTH)
        AND pt.Dat <= :EndDate
    WHERE 
        p.DaART BETWEEN DATE_SUB(:StartDate, INTERVAL 7 MONTH) AND DATE_SUB(:EndDate, INTERVAL 5 MONTH)
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
    
    UNION ALL
    
    -- Children with VL testing at 6 months
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
                AND pt.Dat BETWEEN DATE_ADD(p.DaART, INTERVAL 5 MONTH) AND DATE_ADD(p.DaART, INTERVAL 7 MONTH)
                AND pt.Dat <= :EndDate THEN 'Monitored'
            ELSE 'Not_Monitored'
        END as VLStatus
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = p.ClinicID
    LEFT JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID 
        AND pt.HIVLoad IS NOT NULL
        AND pt.Dat BETWEEN DATE_ADD(art.DaArt, INTERVAL 5 MONTH) AND DATE_ADD(p.DaART, INTERVAL 7 MONTH)
        AND pt.Dat <= :EndDate
    WHERE 
        p.DaART BETWEEN DATE_SUB(:StartDate, INTERVAL 7 MONTH) AND DATE_SUB(:EndDate, INTERVAL 5 MONTH)
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
)

SELECT
    '12b. Percentage of ART patients who had VL monitored at six months [WHO VLS.6]' AS Indicator,
    IFNULL(SUM(CASE WHEN VLStatus = 'Monitored' THEN 1 ELSE 0 END), 0) AS VL_Monitored_6M,
    IFNULL(COUNT(*), 0) AS Total_Eligible_Patients,
    CASE 
        WHEN COUNT(*) > 0 
        THEN ROUND((SUM(CASE WHEN VLStatus = 'Monitored' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2)
        ELSE 0 
    END AS Percentage,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Male' AND VLStatus = 'Monitored' THEN 1 ELSE 0 END), 0) AS Male_0_14_Monitored,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Female' AND VLStatus = 'Monitored' THEN 1 ELSE 0 END), 0) AS Female_0_14_Monitored,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' AND VLStatus = 'Monitored' THEN 1 ELSE 0 END), 0) AS Male_over_14_Monitored,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' AND VLStatus = 'Monitored' THEN 1 ELSE 0 END), 0) AS Female_over_14_Monitored
FROM tblvl_six_months;




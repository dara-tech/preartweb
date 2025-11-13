-- ===================================================================
-- Indicator 2: Percentage of ART patients who were lost to follow-up
-- Combines Indicator 8.2 (Lost to follow-up) and active ART patients to calculate percentage
-- ===================================================================

WITH tblost AS (
    -- Lost to follow-up patients (from Indicator 8.2)
    SELECT 
        'Adult' as type,
        IF(main.Sex=0, 'Female', 'Male') as Sex,
        main.ClinicID
    FROM tblaimain main 
    JOIN tblavpatientstatus s ON main.ClinicID = s.ClinicID 
    WHERE s.Da BETWEEN :StartDate AND :EndDate AND s.Status = :lost_code
    
    UNION ALL
    
    SELECT 
        'Child' as type,
        IF(main.Sex=0, 'Female', 'Male') as Sex,
        main.ClinicID
    FROM tblcimain main 
    JOIN tblcvpatientstatus s ON main.ClinicID = s.ClinicID 
    WHERE s.Da BETWEEN :StartDate AND :EndDate AND s.Status = :lost_code
),


tblactive AS (
    -- Active ART patients (using proper Indicator 10 logic)
    SELECT 
        i.clinicid, 
        i.typepatients, 
        i.Sex
    FROM (
        SELECT 
            clinicid,
            DatVisit,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblavmain 
        WHERE DatVisit <= :EndDate
        
        UNION ALL 
        
        SELECT 
            clinicid,
            DatVisit,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblcvmain 
        WHERE DatVisit <= :EndDate
    ) v
    LEFT JOIN (
        SELECT 
            ClinicID,
            "15+" AS typepatients,
            Sex,
            OffIn 
        FROM tblaimain 
        WHERE DafirstVisit <= :EndDate
        
        UNION ALL 
        
        SELECT 
            ClinicID,
            "≤14" AS typepatients,
            Sex,
            OffIn 
        FROM tblcimain 
        WHERE DafirstVisit <= :EndDate
    ) i ON i.clinicid = v.clinicid
    LEFT JOIN (
        SELECT clinicid FROM tblaart WHERE DaArt <= :EndDate
        UNION ALL
        SELECT clinicid FROM tblcart WHERE DaArt <= :EndDate
    ) a ON a.clinicid = v.clinicid
    LEFT JOIN (
        SELECT clinicid, status FROM tblavpatientstatus WHERE da <= :EndDate
        UNION ALL
        SELECT clinicid, status FROM tblcvpatientstatus WHERE da <= :EndDate
    ) e ON v.clinicid = e.clinicid
    WHERE v.id = 1 AND e.status IS NULL AND a.clinicid IS NOT NULL
)

SELECT
    '2. Percentage of ART patients who were lost to follow-up' AS Indicator,
    CAST(IFNULL(lost_stats.Lost_to_Followup, 0) AS UNSIGNED) AS Lost_to_Followup,
    CAST(IFNULL(lost_stats.Lost_to_Followup, 0) AS UNSIGNED) AS TOTAL,
    CAST(IFNULL(active_stats.Total_ART, 0) AS UNSIGNED) AS Total_ART,
    CAST(CASE 
        WHEN active_stats.Total_ART > 0 
        THEN ROUND((lost_stats.Lost_to_Followup * 100.0 / active_stats.Total_ART), 2)
        ELSE 0.00 
    END AS DECIMAL(5,2)) AS Percentage,
    CAST(IFNULL(lost_stats.Male_0_14, 0) AS UNSIGNED) AS Male_0_14,
    CAST(IFNULL(lost_stats.Male_0_14, 0) AS UNSIGNED) AS Male_0_14_Lost,
    CAST(IFNULL(lost_stats.Female_0_14, 0) AS UNSIGNED) AS Female_0_14,
    CAST(IFNULL(lost_stats.Female_0_14, 0) AS UNSIGNED) AS Female_0_14_Lost,
    CAST(IFNULL(lost_stats.Male_over_14, 0) AS UNSIGNED) AS Male_over_14,
    CAST(IFNULL(lost_stats.Male_over_14, 0) AS UNSIGNED) AS Male_over_14_Lost,
    CAST(IFNULL(lost_stats.Female_over_14, 0) AS UNSIGNED) AS Female_over_14,
    CAST(IFNULL(lost_stats.Female_over_14, 0) AS UNSIGNED) AS Female_over_14_Lost
FROM (
    SELECT 
        COUNT(DISTINCT ClinicID) AS Lost_to_Followup,
        SUM(CASE WHEN type = 'Child' AND Sex = 'Male' THEN 1 ELSE 0 END) AS Male_0_14,
        SUM(CASE WHEN type = 'Child' AND Sex = 'Female' THEN 1 ELSE 0 END) AS Female_0_14,
        SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' THEN 1 ELSE 0 END) AS Male_over_14,
        SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' THEN 1 ELSE 0 END) AS Female_over_14
    FROM tblost
) lost_stats
CROSS JOIN (
    SELECT 
        COUNT(DISTINCT ClinicID) AS Total_ART
    FROM tblactive
) active_stats;

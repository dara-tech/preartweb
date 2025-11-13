-- ===================================================================
-- Indicator 9c: Percentage of ART patients with MMD 4 months
-- ===================================================================

WITH active_patients AS (
    -- Get latest visit for each patient
    WITH latest_visits AS (
        SELECT 
            clinicid,
            DatVisit,
            DaApp,
            vid,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS rn
        FROM tblavmain 
        WHERE DatVisit <= :EndDate
        
        UNION ALL 
        
        SELECT 
            clinicid,
            DatVisit,
            DaApp,
            vid,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS rn
        FROM tblcvmain 
        WHERE DatVisit <= :EndDate
    ),
    
    -- Patient information
    patient_info AS (
        SELECT 
            ClinicID,
            DafirstVisit,
            IF(TIMESTAMPDIFF(YEAR, DaBirth, :EndDate) <= 14, "Child", "Adult") AS type,
            IF(Sex=0, "Female", "Male") AS Sex,
            DaBirth,
            TIMESTAMPDIFF(YEAR, DaBirth, :EndDate) AS age,
            OffIn
        FROM tblaimain 
        WHERE DafirstVisit <= :EndDate
        
        UNION ALL 
        
        SELECT 
            ClinicID,
            DafirstVisit,
            "Child" AS type,
            IF(Sex=0, "Female", "Male") AS Sex,
            DaBirth,
            TIMESTAMPDIFF(YEAR, DaBirth, :EndDate) AS age,
            OffIn
        FROM tblcimain 
        WHERE DafirstVisit <= :EndDate
    ),
    
    -- ART information
    art_info AS (
        SELECT 
            ClinicID,
            DaArt,
            TIMESTAMPDIFF(MONTH, DaArt, :EndDate) AS months_on_art
        FROM tblaart 
        WHERE DaArt <= :EndDate
        
        UNION ALL 
        
        SELECT 
            ClinicID,
            DaArt,
            TIMESTAMPDIFF(MONTH, DaArt, :EndDate) AS months_on_art
        FROM tblcart 
        WHERE DaArt <= :EndDate
    ),
    
    -- Patient exit/status
    exit_status AS (
        SELECT ClinicID, Status
        FROM tblavpatientstatus 
        WHERE da <= :EndDate
        
        UNION ALL 
        
        SELECT ClinicID, Status
        FROM tblcvpatientstatus  
        WHERE da <= :EndDate
    )
    
    SELECT 
        p.ClinicID,
        p.type,
        p.Sex,
        p.age,
        v.DatVisit,
        v.DaApp,
        a.DaArt,
        a.months_on_art,
        DATEDIFF(v.DaApp, v.DatVisit) AS ndays
    FROM latest_visits v
    INNER JOIN patient_info p ON v.clinicid = p.ClinicID
    INNER JOIN art_info a ON v.clinicid = a.ClinicID
    LEFT JOIN exit_status e ON v.clinicid = e.ClinicID
    WHERE v.rn = 1
        AND e.Status IS NULL
        AND a.months_on_art >= 6
        AND v.DatVisit IS NOT NULL
        AND v.DatVisit <> '0000-00-00'
        AND v.DaApp IS NOT NULL
        AND v.DaApp <> '0000-00-00'
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
),

mmd_stats AS (
    SELECT
        COUNT(*) AS Total_Patients,
        SUM(CASE WHEN ndays BETWEEN 101 AND 130 THEN 1 ELSE 0 END) AS Four_Months,
        SUM(CASE WHEN type = 'Child' AND Sex = 'Male' THEN 1 ELSE 0 END) AS Male_0_14_Total,
        SUM(CASE WHEN type = 'Child' AND Sex = 'Female' THEN 1 ELSE 0 END) AS Female_0_14_Total,
        SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' THEN 1 ELSE 0 END) AS Male_over_14_Total,
        SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' THEN 1 ELSE 0 END) AS Female_over_14_Total,
        SUM(CASE WHEN type = 'Child' AND Sex = 'Male' AND ndays BETWEEN 101 AND 130 THEN 1 ELSE 0 END) AS Male_0_14_4M,
        SUM(CASE WHEN type = 'Child' AND Sex = 'Female' AND ndays BETWEEN 101 AND 130 THEN 1 ELSE 0 END) AS Female_0_14_4M,
        SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' AND ndays BETWEEN 101 AND 130 THEN 1 ELSE 0 END) AS Male_over_14_4M,
        SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' AND ndays BETWEEN 101 AND 130 THEN 1 ELSE 0 END) AS Female_over_14_4M
    FROM active_patients
)

SELECT
    '9c. Percentage of ART patients with MMD 4 months' AS Indicator,
    CAST(IFNULL(s.Four_Months, 0) AS UNSIGNED) AS TOTAL,
    CAST(IFNULL(s.Total_Patients, 0) AS UNSIGNED) AS Total_Patients,
    CAST(CASE 
        WHEN s.Total_Patients > 0 
        THEN ROUND((s.Four_Months * 100.0 / s.Total_Patients), 2)
        ELSE 0.00 
    END AS DECIMAL(5,2)) AS Percentage,
    CAST(IFNULL(s.Male_0_14_Total, 0) AS UNSIGNED) AS Male_0_14,
    CAST(IFNULL(s.Male_0_14_4M, 0) AS UNSIGNED) AS Male_0_14_4M,
    CAST(IFNULL(s.Female_0_14_Total, 0) AS UNSIGNED) AS Female_0_14,
    CAST(IFNULL(s.Female_0_14_4M, 0) AS UNSIGNED) AS Female_0_14_4M,
    CAST(IFNULL(s.Male_over_14_Total, 0) AS UNSIGNED) AS Male_over_14,
    CAST(IFNULL(s.Male_over_14_4M, 0) AS UNSIGNED) AS Male_over_14_4M,
    CAST(IFNULL(s.Female_over_14_Total, 0) AS UNSIGNED) AS Female_over_14,
    CAST(IFNULL(s.Female_over_14_4M, 0) AS UNSIGNED) AS Female_over_14_4M
FROM mmd_stats s;


-- ===================================================================
-- Indicator 10a: Percentage of patients newly initiating ART with TLD as 1st line regimen
-- ===================================================================

WITH tblactive AS (
    WITH tblvisit AS (
        SELECT 
            clinicid,
            DatVisit,
            ARTnum,
            DaApp,
            vid,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblavmain 
        WHERE DatVisit <= :EndDate
        
        UNION ALL 
        
        SELECT 
            clinicid,
            DatVisit,
            ARTnum,
            DaApp,
            vid,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblcvmain 
        WHERE DatVisit <= :EndDate
    ),
    
    tblimain AS (
        SELECT 
            ClinicID,
            DafirstVisit,
            "15+" AS typepatients,
            TypeofReturn,
            LClinicID,
            SiteNameold,
            DaBirth,
            TIMESTAMPDIFF(YEAR, DaBirth, :EndDate) AS age,
            Sex,
            DaHIV,
            OffIn 
        FROM tblaimain 
        WHERE DafirstVisit <= :EndDate
        
        UNION ALL 
        
        SELECT 
            ClinicID,
            DafirstVisit,
            "≤14" AS typepatients,
            '' AS TypeofReturn,
            LClinicID,
            SiteNameold,
            DaBirth,
            TIMESTAMPDIFF(YEAR, DaBirth, :EndDate) AS age,
            Sex,
            DaTest AS DaHIV,
            OffIn 
        FROM tblcimain 
        WHERE DafirstVisit <= :EndDate
    ),
    
    tblart AS (
        SELECT 
            *,
            TIMESTAMPDIFF(MONTH, DaArt, :EndDate) AS nmonthART 
        FROM tblaart 
        WHERE DaArt <= :EndDate
        
        UNION ALL 
        
        SELECT 
            *,
            TIMESTAMPDIFF(MONTH, DaArt, :EndDate) AS nmonthART 
        FROM tblcart 
        WHERE DaArt <= :EndDate
    ),
    
    tblexit AS (
        SELECT * 
        FROM tblavpatientstatus 
        WHERE da <= :EndDate
        
        UNION ALL 
        
        SELECT * 
        FROM tblcvpatientstatus  
        WHERE da <= :EndDate
    ),
    
    tblarvdrug AS ( 
        WITH tbldrug AS (
            SELECT 
                vid,
                GROUP_CONCAT(DISTINCT DrugName ORDER BY DrugName ASC SEPARATOR '+') AS drugname 
            FROM tblavarvdrug 
            WHERE status <> 1
            GROUP BY vid 
            
            UNION ALL 
            
            SELECT 
                vid,
                GROUP_CONCAT(DISTINCT DrugName ORDER BY DrugName ASC SEPARATOR '+') AS drugname 
            FROM tblcvarvdrug 
            WHERE status <> 1
            GROUP BY vid
        )
        SELECT 
            vid,
            drugname,
            IF(LOCATE('3TC+DTG+TDF', drugname) > 0, "TLD", "Not-TLD") AS TLDStatus 
        FROM tbldrug
    )

    SELECT 
        i.clinicid, 
        i.DafirstVisit,
        i.typepatients, 
        i.TypeofReturn, 
        i.LClinicID, 
        i.SiteNameold, 
        i.DaBirth,
        i.age, 
        i.Sex, 
        i.DaHIV, 
        i.OffIn, 
        a.ART, 
        a.DaArt,
        v.DatVisit, 
        v.ARTnum, 
        v.DaApp,
        a.nmonthART,
        IF(a.nmonthART >= 6, ">6M", "<6M") AS Startartstatus,
        DATEDIFF(v.DaApp, v.DatVisit) AS ndays,
        IF(DATEDIFF(v.DaApp, v.DatVisit) > 80, "MMD", "Not-MMD") AS MMDStatus,
        rd.drugname,
        IF(LEFT(i.clinicid, 1) = "P" AND rd.TLDStatus != "TLD" AND LOCATE('DTG', drugname) > 0, "TLD", rd.TLDStatus) AS TLDStatus
    FROM tblvisit v
    LEFT JOIN tblimain i ON i.clinicid = v.clinicid
    LEFT JOIN tblart a ON a.clinicid = v.clinicid
    LEFT JOIN tblexit e ON v.clinicid = e.clinicid
    LEFT JOIN tblarvdrug rd ON rd.vid = v.vid
    WHERE id = 1 AND e.status IS NULL AND a.ART IS NOT NULL
),

-- Newly initiated patients
newly_initiated AS (
    SELECT 
        clinicid,
        typepatients,
        Sex,
        DaArt,
        TLDStatus
    FROM tblactive
    WHERE DaArt BETWEEN :StartDate AND :EndDate
        AND (OffIn IS NULL OR OffIn <> 1)
),

-- Statistics
tld_stats AS (
    SELECT
        COUNT(*) AS Total_Newly_Initiated,
        SUM(CASE WHEN TLDStatus = 'TLD' THEN 1 ELSE 0 END) AS TLD_New_Initiation,
        SUM(CASE WHEN Sex = 1 AND typepatients = '≤14' THEN 1 ELSE 0 END) AS Male_0_14_Total,
        SUM(CASE WHEN Sex = 0 AND typepatients = '≤14' THEN 1 ELSE 0 END) AS Female_0_14_Total,
        SUM(CASE WHEN Sex = 1 AND typepatients = '15+' THEN 1 ELSE 0 END) AS Male_over_14_Total,
        SUM(CASE WHEN Sex = 0 AND typepatients = '15+' THEN 1 ELSE 0 END) AS Female_over_14_Total,
        SUM(CASE WHEN Sex = 1 AND typepatients = '≤14' AND TLDStatus = 'TLD' THEN 1 ELSE 0 END) AS Male_0_14_TLD,
        SUM(CASE WHEN Sex = 0 AND typepatients = '≤14' AND TLDStatus = 'TLD' THEN 1 ELSE 0 END) AS Female_0_14_TLD,
        SUM(CASE WHEN Sex = 1 AND typepatients = '15+' AND TLDStatus = 'TLD' THEN 1 ELSE 0 END) AS Male_over_14_TLD,
        SUM(CASE WHEN Sex = 0 AND typepatients = '15+' AND TLDStatus = 'TLD' THEN 1 ELSE 0 END) AS Female_over_14_TLD
    FROM newly_initiated
)

SELECT
    '10a. Percentage of patients newly initiating ART with TLD as 1st line regimen' AS Indicator,
    CAST(IFNULL(s.TLD_New_Initiation, 0) AS UNSIGNED) AS TLD_New_Initiation,
    CAST(IFNULL(s.TLD_New_Initiation, 0) AS UNSIGNED) AS TOTAL,
    CAST(IFNULL(s.Total_Newly_Initiated, 0) AS UNSIGNED) AS Total_Newly_Initiated,
    CAST(CASE 
        WHEN s.Total_Newly_Initiated > 0 
        THEN ROUND((s.TLD_New_Initiation * 100.0 / s.Total_Newly_Initiated), 2)
        ELSE 0.00 
    END AS DECIMAL(5,2)) AS Percentage,
    CAST(IFNULL(s.Male_0_14_Total, 0) AS UNSIGNED) AS Male_0_14,
    CAST(IFNULL(s.Male_0_14_TLD, 0) AS UNSIGNED) AS Male_0_14_TLD,
    CAST(IFNULL(s.Female_0_14_Total, 0) AS UNSIGNED) AS Female_0_14,
    CAST(IFNULL(s.Female_0_14_TLD, 0) AS UNSIGNED) AS Female_0_14_TLD,
    CAST(IFNULL(s.Male_over_14_Total, 0) AS UNSIGNED) AS Male_over_14,
    CAST(IFNULL(s.Male_over_14_TLD, 0) AS UNSIGNED) AS Male_over_14_TLD,
    CAST(IFNULL(s.Female_over_14_Total, 0) AS UNSIGNED) AS Female_over_14,
    CAST(IFNULL(s.Female_over_14_TLD, 0) AS UNSIGNED) AS Female_over_14_TLD
FROM tld_stats s;

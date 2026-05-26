-- =====================================================
-- 01 ACTIVE ART PREVIOUS DETAILS
-- Generated: 2026-05-26T13:19:28.142Z
-- =====================================================

-- =====================================================
-- PARAMETER SETUP (matching service configuration)
-- =====================================================
-- Set these parameters before running this query
-- These match the parameters used in the ART Web service

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes (matching service defaults)
SET @lost_code = 0;                        -- Lost to follow-up status code
SET @dead_code = 1;                        -- Dead status code
SET @transfer_out_code = 3;                -- Transfer out status code
SET @transfer_in_code = 1;                 -- Transfer in status code
SET @mmd_eligible_code = 0;                -- MMD eligible status code

-- Clinical parameters
SET @mmd_drug_quantity = 60;               -- MMD drug quantity threshold
SET @vl_suppression_threshold = 1000;      -- Viral load suppression threshold
SET @tld_regimen_formula = '3TC + DTG + TDF'; -- TLD regimen formula
SET @tpt_drug_list = "'Isoniazid','3HP','6H'"; -- TPT drug list

-- =====================================================
-- MAIN QUERY
-- =====================================================
-- 01_active_art_previous - Detailed Records (matching corrected aggregate logic)
-- This uses the exact same CTE structure and logic as the corrected aggregate query
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
        WHERE DatVisit <= @PreviousEndDate
        
        UNION ALL 
        
        SELECT 
            clinicid,
            DatVisit,
            ARTnum,
            DaApp,
            vid,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblcvmain 
        WHERE DatVisit <= @PreviousEndDate
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
            TIMESTAMPDIFF(year, DaBirth, @PreviousEndDate) AS age,
            Sex,
            DaHIV,
            OffIn
        FROM tblaimain 
        WHERE DafirstVisit <= @PreviousEndDate
        
        UNION ALL 
        
        SELECT 
            ClinicID,
            DafirstVisit,
            "≤14" AS typepatients,
            '' AS TypeofReturn,
            LClinicID,
            SiteNameold,
            DaBirth,
            TIMESTAMPDIFF(year, DaBirth, @PreviousEndDate) AS age,
            Sex,
            DaTest AS DaHIV,
            OffIn
        FROM tblcimain 
        WHERE DafirstVisit <= @PreviousEndDate
    ),
    
    tblart AS (
        SELECT 
            *,
            TIMESTAMPDIFF(month, DaArt, @PreviousEndDate) AS nmonthART 
        FROM tblaart 
        WHERE DaArt <= @PreviousEndDate 
        
        UNION ALL 
        
        SELECT 
            *,
            TIMESTAMPDIFF(month, DaArt, @PreviousEndDate) AS nmonthART 
        FROM tblcart 
        WHERE DaArt <= @PreviousEndDate
    ),
    
    tblexit AS (
        SELECT * 
        FROM tblavpatientstatus 
        WHERE da <= @PreviousEndDate  
        
        UNION ALL 
        
        SELECT * 
        FROM tblcvpatientstatus  
        WHERE da <= @PreviousEndDate
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
        a.nmonthART,
        v.DatVisit, 
        v.ARTnum, 
        v.DaApp
    FROM tblvisit v
    LEFT JOIN tblimain i ON i.clinicid = v.clinicid
    LEFT JOIN tblart a ON a.clinicid = v.clinicid
    LEFT JOIN tblexit e ON v.clinicid = e.clinicid
    WHERE id = 1 AND e.status IS NULL AND a.ART IS NOT NULL
)


SELECT
    ClinicID as clinicid,
    Sex as sex,
    CASE 
        WHEN Sex = 0 THEN 'Female'
        WHEN Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    typepatients,
    age,
    CASE 
        WHEN typepatients = '15+' THEN 'Adult'
        WHEN typepatients = '≤14' THEN 'Child'
        ELSE 'Unknown'
    END as patient_type,
    ART,
    DaArt,
    DafirstVisit,
    DaBirth,
    OffIn,
    CASE 
        WHEN OffIn = 0 THEN 'Not Transferred'
        WHEN OffIn = 1 THEN 'Transferred In'
        WHEN OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', OffIn)
    END as transfer_status,
    IF(nmonthART >= 6, '>6M', '<6M') as Startartstatus
FROM tblactive
ORDER BY DaArt DESC, ClinicID;
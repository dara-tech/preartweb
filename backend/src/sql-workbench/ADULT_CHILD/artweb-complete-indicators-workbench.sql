-- =====================================================
-- ART Web Complete Indicators Analysis - Workbench SQL
-- Generated: 2025-10-16T17:34:57.186Z
-- 
-- This file contains all HIV/AIDS indicators with parameters
-- Ready to use in MySQL Workbench, phpMyAdmin, or any SQL workbench
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 1: Number of active ART patients in previous quarter
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
    '1. Active ART patients in previous quarter' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN typepatients = '≤14' AND Sex = 1 THEN 1 ELSE 0 END), 0) AS Male_0_14,
    IFNULL(SUM(CASE WHEN typepatients = '≤14' AND Sex = 0 THEN 1 ELSE 0 END), 0) AS Female_0_14,
    IFNULL(SUM(CASE WHEN typepatients = '15+' AND Sex = 1 THEN 1 ELSE 0 END), 0) AS Male_over_14,
    IFNULL(SUM(CASE WHEN typepatients = '15+' AND Sex = 0 THEN 1 ELSE 0 END), 0) AS Female_over_14
FROM tblactive;


-- =====================================================

-- =====================================================
-- INDICATOR 2: 01 ACTIVE ART PREVIOUS DETAILS
-- File: 01_active_art_previous_details.sql
-- =====================================================

-- =====================================================
-- 01 ACTIVE ART PREVIOUS DETAILS
-- Generated: 2025-10-16T17:34:57.193Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- =====================================================

-- =====================================================
-- INDICATOR 3: 02 ACTIVE PRE ART PREVIOUS
-- File: 02_active_pre_art_previous.sql
-- =====================================================

-- =====================================================
-- 02 ACTIVE PRE ART PREVIOUS
-- Generated: 2025-10-16T17:34:57.193Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 2: Active Pre-ART patients in previous quarter
-- Based on script 9 logic but for previous quarter
with tblactive as (
    with tblvisit as (
        select clinicid, DatVisit, ARTnum, DaApp, vid, 
               ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) as id 
        from tblavmain 
        where DatVisit <= @PreviousEndDate
        union all 
        select clinicid, DatVisit, ARTnum, DaApp, vid, 
               ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) as id 
        from tblcvmain 
        where DatVisit <= @PreviousEndDate
    ),
    
    tblimain as (
        select ClinicID, DafirstVisit, "15+" as typepatients, TypeofReturn, LClinicID, 
               SiteNameold, DaBirth, timestampdiff(year, DaBirth, @PreviousEndDate) as age, 
               Sex, DaHIV, OffIn 
        from tblaimain 
        where DafirstVisit <= @PreviousEndDate
        union all 
        select ClinicID, DafirstVisit, "≤14" as typepatients, '' as TypeofReturn, 
               LClinicID, SiteNameold, DaBirth, timestampdiff(year, DaBirth, @PreviousEndDate) as age, 
               Sex, DaTest as DaHIV, OffIn 
        from tblcimain 
        where DafirstVisit <= @PreviousEndDate
    ),
    
    tblart as (
        select *, timestampdiff(month, DaArt, @PreviousEndDate) as nmonthART 
        from tblaart 
        where DaArt <= @PreviousEndDate 
        union all 
        select *, timestampdiff(month, DaArt, @PreviousEndDate) as nmonthART 
        from tblcart 
        where DaArt <= @PreviousEndDate
    ),
    
    tblexit as (
        select * 
        from tblavpatientstatus 
        where da <= @PreviousEndDate  
        union all 
        select * 
        from tblcvpatientstatus  
        where da <= @PreviousEndDate
    )
    
    select i.clinicid, i.DafirstVisit, i.typepatients, i.TypeofReturn, i.LClinicID, 
           i.SiteNameold, i.DaBirth, i.age, i.Sex, i.DaHIV, i.OffIn, 
           a.ART, a.DaArt, v.DatVisit, v.ARTnum, v.DaApp, a.nmonthART
    from tblvisit v
    left join tblimain i on i.clinicid = v.clinicid
    left join tblart a on a.clinicid = v.clinicid
    left join tblexit e on v.clinicid = e.clinicid
    where id = 1 and e.status is null
)

select '2. Active Pre-ART patients in previous quarter' as Indicator, 
       sum(if(typepatients = '≤14' and sex = 1, 1, 0)) as Male_0_14,
       sum(if(typepatients = '≤14' and sex = 0, 1, 0)) as Female_0_14,
       sum(if(typepatients = '15+' and sex = 1, 1, 0)) as Male_over_14,
       sum(if(typepatients = '15+' and sex = 0, 1, 0)) as Female_over_14,
       count(*) as TOTAL
from tblactive
where ART is null;


-- =====================================================

-- =====================================================
-- INDICATOR 4: 02 ACTIVE PRE ART PREVIOUS DETAILS
-- File: 02_active_pre_art_previous_details.sql
-- =====================================================

-- =====================================================
-- 02 ACTIVE PRE ART PREVIOUS DETAILS
-- Generated: 2025-10-16T17:34:57.193Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 2: Active Pre-ART patients in previous quarter - Detailed Records
-- Based on script 9 logic but for previous quarter
with tblactive as (
    with tblvisit as (
        select clinicid, DatVisit, ARTnum, DaApp, vid, 
               ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) as id 
        from tblavmain 
        where DatVisit <= @PreviousEndDate
        union all 
        select clinicid, DatVisit, ARTnum, DaApp, vid, 
               ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) as id 
        from tblcvmain 
        where DatVisit <= @PreviousEndDate
    ),
    
    tblimain as (
        select ClinicID, DafirstVisit, "15+" as typepatients, TypeofReturn, LClinicID, 
               SiteNameold, DaBirth, timestampdiff(year, DaBirth, @PreviousEndDate) as age, 
               Sex, DaHIV, OffIn 
        from tblaimain 
        where DafirstVisit <= @PreviousEndDate
        union all 
        select ClinicID, DafirstVisit, "≤14" as typepatients, '' as TypeofReturn, 
               LClinicID, SiteNameold, DaBirth, timestampdiff(year, DaBirth, @PreviousEndDate) as age, 
               Sex, DaTest as DaHIV, OffIn 
        from tblcimain 
        where DafirstVisit <= @PreviousEndDate
    ),
    
    tblart as (
        select *, timestampdiff(month, DaArt, @PreviousEndDate) as nmonthART 
        from tblaart 
        where DaArt <= @PreviousEndDate 
        union all 
        select *, timestampdiff(month, DaArt, @PreviousEndDate) as nmonthART 
        from tblcart 
        where DaArt <= @PreviousEndDate
    ),
    
    tblexit as (
        select * 
        from tblavpatientstatus 
        where da <= @PreviousEndDate  
        union all 
        select * 
        from tblcvpatientstatus  
        where da <= @PreviousEndDate
    )
    
    select i.clinicid, i.DafirstVisit, i.typepatients, i.TypeofReturn, i.LClinicID, 
           i.SiteNameold, i.DaBirth, i.age, i.Sex, i.DaHIV, i.OffIn, 
           a.ART, a.DaArt, v.DatVisit, v.ARTnum, v.DaApp, a.nmonthART
    from tblvisit v
    left join tblimain i on i.clinicid = v.clinicid
    left join tblart a on a.clinicid = v.clinicid
    left join tblexit e on v.clinicid = e.clinicid
    where id = 1 and e.status is null
)

select 
    clinicid,
    sex,
    case 
        when sex = 0 then 'Female'
        when sex = 1 then 'Male'
        else 'Unknown'
    end as sex_display,
    typepatients,
    DaBirth,
    DafirstVisit,
    DaArt,
    DatVisit,
    OffIn,
    case 
        when typepatients = '≤14' then 'Child'
        when typepatients = '15+' then 'Adult'
        else 'Unknown'
    end as patient_type,
    age,
    case 
        when OffIn = 0 then 'Not Transferred'
        when OffIn = 1 then 'Transferred In'
        when OffIn = 3 then 'Transferred Out'
        else concat('Status: ', OffIn)
    end as transfer_status
from tblactive
where ART is null
order by DafirstVisit DESC, clinicid;

-- =====================================================

-- =====================================================
-- INDICATOR 5: 03 NEWLY ENROLLED
-- File: 03_newly_enrolled.sql
-- =====================================================

-- =====================================================
-- 03 NEWLY ENROLLED
-- Generated: 2025-10-16T17:34:57.194Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 3: Newly Enrolled
SELECT
    '3. Newly Enrolled' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_over_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_over_14
FROM (
    -- Adults: Must have ART start date in quarter, NOT be a transfer-in, AND NOT be a lost-return patient
    SELECT 'Adult' as type, IF(p.Sex=0, "Female", "Male") as Sex
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    JOIN tblavmain v ON p.ClinicID = v.ClinicID AND v.DatVisit = art.DaArt 
    WHERE 
        art.DaArt BETWEEN @StartDate AND @EndDate 
        AND (p.OffIn IS NULL OR p.OffIn <> @transfer_in_code)
        AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)
    
    UNION ALL
    
    -- Children: Must have ART start date in quarter AND NOT be a transfer-in
    SELECT 'Child' as type, IF(p.Sex=0, "Female", "Male") as Sex
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = art.ClinicID
    JOIN tblcvmain v ON p.ClinicID = v.ClinicID AND v.DatVisit = art.DaArt
    WHERE 
        art.DaArt BETWEEN @StartDate AND @EndDate 
        AND (p.OffIn IS NULL OR p.OffIn <> @transfer_in_code)
) AS PatientList;


-- =====================================================

-- =====================================================
-- INDICATOR 6: 03 NEWLY ENROLLED DETAILS
-- File: 03_newly_enrolled_details.sql
-- =====================================================

-- =====================================================
-- 03 NEWLY ENROLLED DETAILS
-- Generated: 2025-10-16T17:34:57.194Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 3: Newly Enrolled - Detailed Records (matching aggregate logic)
SELECT
    p.ClinicID as clinicid,
    art.ART as art_number,
    p.Sex as sex,
    CASE 
        WHEN p.Sex = 0 THEN 'Female'
        WHEN p.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    '15+' as typepatients,
    p.DaBirth as DaBirth,
    p.DafirstVisit as DafirstVisit,
    art.DaArt as DaArt,
    v.DatVisit as DatVisit,
    p.OffIn as OffIn,
    'Adult' as patient_type,
    TIMESTAMPDIFF(YEAR, p.DaBirth, @EndDate) as age,
    CASE 
        WHEN p.OffIn = 0 THEN 'Not Transferred'
        WHEN p.OffIn = 2 THEN 'Transferred In'
        WHEN p.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', p.OffIn)
    END as transfer_status
FROM tblaimain p 
JOIN tblaart art ON p.ClinicID = art.ClinicID
JOIN tblavmain v ON p.ClinicID = v.ClinicID AND v.DatVisit = art.DaArt 
WHERE 
    art.DaArt BETWEEN @StartDate AND @EndDate 
    AND (p.OffIn IS NULL OR p.OffIn <> @transfer_in_code)
    AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)

UNION ALL

SELECT
    p.ClinicID as clinicid,
    art.ART as art_number,
    p.Sex as sex,
    CASE 
        WHEN p.Sex = 0 THEN 'Female'
        WHEN p.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    '≤14' as typepatients,
    p.DaBirth as DaBirth,
    p.DafirstVisit as DafirstVisit,
    art.DaArt as DaArt,
    v.DatVisit as DatVisit,
    p.OffIn as OffIn,
    'Child' as patient_type,
    TIMESTAMPDIFF(YEAR, p.DaBirth, @EndDate) as age,
    CASE 
        WHEN p.OffIn = 0 THEN 'Not Transferred'
        WHEN p.OffIn = 2 THEN 'Transferred In'
        WHEN p.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', p.OffIn)
    END as transfer_status
FROM tblcimain p 
JOIN tblcart art ON p.ClinicID = art.ClinicID
JOIN tblcvmain v ON p.ClinicID = v.ClinicID AND v.DatVisit = art.DaArt
WHERE 
    art.DaArt BETWEEN @StartDate AND @EndDate 
    AND (p.OffIn IS NULL OR p.OffIn <> @transfer_in_code)
ORDER BY DaArt DESC, ClinicID;


-- =====================================================

-- =====================================================
-- INDICATOR 7: 04 RETESTED POSITIVE
-- File: 04_retested_positive.sql
-- =====================================================

-- =====================================================
-- 04 RETESTED POSITIVE
-- Generated: 2025-10-16T17:34:57.194Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 4: Re-tested positive
-- This matches the old VB.NET implementation exactly
SELECT
    '4. Re-tested positive' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_over_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_over_14
FROM (
    -- Adult re-tested positive: OffIn <> 1, TypeofReturn = -1, DafirstVisit in quarter
    SELECT 'Adult' as type, IF(p.Sex=0, 'Female', 'Male') as Sex
    FROM (
        SELECT ai.ClinicID, ai.sex, ai.DafirstVisit, lt.DatVisit, lt.TestHIV, lt.ResultHIV
        FROM (
            SELECT v.ClinicID, v.ARTnum, v.DatVisit, v.TestHIV, v.ResultHIV, v.DaApp, v.Vid
            FROM (
                SELECT ClinicID, ARTnum, DatVisit, TestHIV, ResultHIV, DaApp, Vid
                FROM tblavmain
                WHERE DatVisit BETWEEN @StartDate AND @EndDate
            ) v
            INNER JOIN (
                SELECT vv.ClinicID, MAX(vv.DatVisit) as DatVisit, vv.TestHIV, vv.ResultHIV
                FROM (
                    SELECT ClinicID, ARTnum, DatVisit, TestHIV, ResultHIV, DaApp, Vid
                    FROM tblavmain
                    WHERE DatVisit BETWEEN @StartDate AND @EndDate AND TestHIV = 'True'
                ) vv
                GROUP BY vv.ClinicID
            ) mv ON mv.ClinicID = v.ClinicID AND mv.DatVisit = v.DatVisit
        ) lt
        LEFT JOIN tblaimain ai ON ai.ClinicID = lt.ClinicID
        WHERE ai.OffIn <> 1 AND ai.TypeofReturn = -1 AND ai.DafirstVisit BETWEEN @StartDate AND @EndDate
    ) p
    
    UNION ALL
    
    -- Child re-tested positive: OffIn <> 1, LClinicID = '', DafirstVisit in quarter
    SELECT 'Child' as type, IF(p.Sex=0, 'Female', 'Male') as Sex
    FROM (
        SELECT ci.ClinicID, ci.sex, ci.DafirstVisit, lt.DatVisit, lt.TestHIV, lt.ResultHIV
        FROM (
            SELECT c.ClinicID, c.ARTnum, c.DatVisit, c.TestHIV, c.ResultHIV, c.DaApp, c.Vid
            FROM (
                SELECT ClinicID, ARTnum, DatVisit, TestHIV, ResultHIV, DaApp, Vid
                FROM tblcvmain
                WHERE DatVisit BETWEEN @StartDate AND @EndDate
            ) c
            INNER JOIN (
                SELECT cc.ClinicID, MAX(cc.DatVisit) as DatVisit, cc.TestHIV, cc.ResultHIV
                FROM (
                    SELECT ClinicID, ARTnum, DatVisit, TestHIV, ResultHIV, DaApp, Vid
                    FROM tblcvmain
                    WHERE DatVisit BETWEEN @StartDate AND @EndDate AND TestHIV = 'True'
                ) cc
                GROUP BY cc.ClinicID
            ) mcv ON mcv.ClinicID = c.ClinicID AND mcv.DatVisit = c.DatVisit
        ) lt
        LEFT JOIN tblcimain ci ON ci.ClinicID = lt.ClinicID
        WHERE ci.OffIn <> 1 AND ci.LClinicID = '' AND ci.DafirstVisit BETWEEN @StartDate AND @EndDate
    ) p
) as PatientList;


-- =====================================================

-- =====================================================
-- INDICATOR 8: 04 RETESTED POSITIVE DETAILS
-- File: 04_retested_positive_details.sql
-- =====================================================

-- =====================================================
-- 04 RETESTED POSITIVE DETAILS
-- Generated: 2025-10-16T17:34:57.194Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 4: Re-tested positive - Detailed Records
-- This matches the old VB.NET implementation exactly
SELECT
    p.ClinicID as clinicid,
    COALESCE(art.ART, art2.ART) as art_number,
    p.Sex as sex,
    CASE 
        WHEN p.Sex = 0 THEN 'Female'
        WHEN p.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    CASE 
        WHEN p.type = 'Adult' THEN '15+'
        WHEN p.type = 'Child' THEN '≤14'
        ELSE 'Unknown'
    END as typepatients,
    p.DaBirth as DaBirth,
    p.DafirstVisit as DafirstVisit,
    COALESCE(art.DaArt, art2.DaArt) as DaArt,
    p.DatVisit as DatVisit,
    p.OffIn as OffIn,
    p.type as patient_type,
    TIMESTAMPDIFF(YEAR, p.DaBirth, @EndDate) as age,
    CASE 
        WHEN p.OffIn = 0 THEN 'Not Transferred'
        WHEN p.OffIn = 1 THEN 'Transferred In'
        WHEN p.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', p.OffIn)
    END as transfer_status
FROM (
    -- Adult re-tested positive: OffIn <> 1, TypeofReturn = -1, DafirstVisit in quarter
    SELECT 'Adult' as type, ai.ClinicID, ai.Sex, ai.DaBirth, ai.DafirstVisit, ai.OffIn, ai.TypeofReturn, lt.DatVisit, lt.TestHIV, lt.ResultHIV
    FROM (
        SELECT v.ClinicID, v.ARTnum, v.DatVisit, v.TestHIV, v.ResultHIV, v.DaApp, v.Vid
        FROM (
            SELECT ClinicID, ARTnum, DatVisit, TestHIV, ResultHIV, DaApp, Vid
            FROM tblavmain
            WHERE DatVisit BETWEEN @StartDate AND @EndDate
        ) v
        INNER JOIN (
            SELECT vv.ClinicID, MAX(vv.DatVisit) as DatVisit, vv.TestHIV, vv.ResultHIV
            FROM (
                SELECT ClinicID, ARTnum, DatVisit, TestHIV, ResultHIV, DaApp, Vid
                FROM tblavmain
                WHERE DatVisit BETWEEN @StartDate AND @EndDate AND TestHIV = 'True'
            ) vv
            GROUP BY vv.ClinicID
        ) mv ON mv.ClinicID = v.ClinicID AND mv.DatVisit = v.DatVisit
    ) lt
    LEFT JOIN tblaimain ai ON ai.ClinicID = lt.ClinicID
    WHERE ai.OffIn <> 1 AND ai.TypeofReturn = -1 AND ai.DafirstVisit BETWEEN @StartDate AND @EndDate
    
    UNION ALL
    
    -- Child re-tested positive: OffIn <> 1, LClinicID = '', DafirstVisit in quarter
    SELECT 'Child' as type, ci.ClinicID, ci.Sex, ci.DaBirth, ci.DafirstVisit, ci.OffIn, ci.LClinicID, lt.DatVisit, lt.TestHIV, lt.ResultHIV
    FROM (
        SELECT c.ClinicID, c.ARTnum, c.DatVisit, c.TestHIV, c.ResultHIV, c.DaApp, c.Vid
        FROM (
            SELECT ClinicID, ARTnum, DatVisit, TestHIV, ResultHIV, DaApp, Vid
            FROM tblcvmain
            WHERE DatVisit BETWEEN @StartDate AND @EndDate
        ) c
        INNER JOIN (
            SELECT cc.ClinicID, MAX(cc.DatVisit) as DatVisit, cc.TestHIV, cc.ResultHIV
            FROM (
                SELECT ClinicID, ARTnum, DatVisit, TestHIV, ResultHIV, DaApp, Vid
                FROM tblcvmain
                WHERE DatVisit BETWEEN @StartDate AND @EndDate AND TestHIV = 'True'
            ) cc
            GROUP BY cc.ClinicID
        ) mcv ON mcv.ClinicID = c.ClinicID AND mcv.DatVisit = c.DatVisit
    ) lt
    LEFT JOIN tblcimain ci ON ci.ClinicID = lt.ClinicID
    WHERE ci.OffIn <> 1 AND ci.LClinicID = '' AND ci.DafirstVisit BETWEEN @StartDate AND @EndDate
) p
LEFT JOIN tblaart art ON p.ClinicID = art.ClinicID AND p.type = 'Adult'
LEFT JOIN tblcart art2 ON p.ClinicID = art2.ClinicID AND p.type = 'Child'
ORDER BY p.DafirstVisit DESC, p.ClinicID;

-- =====================================================

-- =====================================================
-- INDICATOR 9: 05.1.1 ART SAME DAY
-- File: 05.1.1_art_same_day.sql
-- =====================================================

-- =====================================================
-- 05.1.1 ART SAME DAY
-- Generated: 2025-10-16T17:34:57.195Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 5.1.1: New ART started: Same day
SELECT
    '5.1.1. New ART started: Same day' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_over_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_over_14
FROM (
    -- Adults: Must not be a lost-return patient or transfer-in patient
    SELECT 'Adult' as type, IF(p.Sex=0, "Female", "Male") as Sex FROM tblaimain p JOIN tblaart art ON p.ClinicID = art.ClinicID WHERE art.DaArt BETWEEN @StartDate AND @EndDate AND DATEDIFF(art.DaArt, p.DafirstVisit) = 0 AND (p.OffIn IS NULL OR p.OffIn <> @transfer_in_code) AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)
    UNION ALL
    -- Children
    SELECT 'Child' as type, IF(p.Sex=0, "Female", "Male") as Sex FROM tblcimain p JOIN tblcart art ON p.ClinicID = art.ClinicID WHERE art.DaArt BETWEEN @StartDate AND @EndDate AND DATEDIFF(art.DaArt, p.DafirstVisit) = 0
) as PatientList;


-- =====================================================

-- =====================================================
-- INDICATOR 10: 05.1.1 ART SAME DAY DETAILS
-- File: 05.1.1_art_same_day_details.sql
-- =====================================================

-- =====================================================
-- 05.1.1 ART SAME DAY DETAILS
-- Generated: 2025-10-16T17:34:57.195Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 5.1.1: New ART started: Same day - Detailed Records
SELECT
    '05.1.1' as step,
    p.ClinicID as clinicid,
    art.ART as art_number,
    p.Sex as sex,
    CASE 
        WHEN p.Sex = 0 THEN 'Female'
        WHEN p.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    '15+' as typepatients,
    p.DaBirth as DaBirth,
    p.DafirstVisit as DafirstVisit,
    art.DaArt as DaArt,
    art.DaArt as DatVisit,
    p.OffIn as OffIn,
    'Adult' as patient_type,
    TIMESTAMPDIFF(YEAR, p.DaBirth, @EndDate) as age,
    CASE 
        WHEN p.OffIn = 0 THEN 'Not Transferred'
        WHEN p.OffIn = 2 THEN 'Transferred In'
        WHEN p.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', p.OffIn)
    END as transfer_status
FROM tblaimain p 
JOIN tblaart art ON p.ClinicID = art.ClinicID
WHERE 
    art.DaArt BETWEEN @StartDate AND @EndDate
    AND DATEDIFF(art.DaArt, p.DafirstVisit) = 0
    AND (p.OffIn IS NULL OR p.OffIn <> @transfer_in_code)
    AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)

UNION ALL

SELECT
    '05.1.1' as step,
    p.ClinicID as clinicid,
    art.ART as art_number,
    p.Sex as sex,
    CASE 
        WHEN p.Sex = 0 THEN 'Female'
        WHEN p.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    'Child' as typepatients,
    p.DaBirth as DaBirth,
    p.DafirstVisit as DafirstVisit,
    art.DaArt as DaArt,
    art.DaArt as DatVisit,
    p.OffIn as OffIn,
    'Child' as patient_type,
    TIMESTAMPDIFF(YEAR, p.DaBirth, @EndDate) as age,
    CASE 
        WHEN p.OffIn = 0 THEN 'Not Transferred'
        WHEN p.OffIn = 2 THEN 'Transferred In'
        WHEN p.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', p.OffIn)
    END as transfer_status
FROM tblcimain p 
JOIN tblcart art ON p.ClinicID = art.ClinicID
WHERE 
    art.DaArt BETWEEN @StartDate AND @EndDate
    AND DATEDIFF(art.DaArt, p.DafirstVisit) = 0
ORDER BY DaArt DESC, ClinicID;


-- =====================================================

-- =====================================================
-- INDICATOR 11: 05.1.2 ART 1 7 DAYS
-- File: 05.1.2_art_1_7_days.sql
-- =====================================================

-- =====================================================
-- 05.1.2 ART 1 7 DAYS
-- Generated: 2025-10-16T17:34:57.195Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 5.1.2: New ART started: 1-7 days
SELECT
    '5.1.2. New ART started: 1-7 days' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_over_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_over_14
FROM (
    -- Adults: Must not be a lost-return patient
    SELECT 'Adult' as type, IF(p.Sex=0, "Female", "Male") as Sex FROM tblaimain p JOIN tblaart art ON p.ClinicID = art.ClinicID WHERE art.DaArt BETWEEN @StartDate AND @EndDate AND DATEDIFF(art.DaArt, p.DafirstVisit) BETWEEN 1 AND 7 AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)
    UNION ALL
    -- Children
    SELECT 'Child' as type, IF(p.Sex=0, "Female", "Male") as Sex FROM tblcimain p JOIN tblcart art ON p.ClinicID = art.ClinicID WHERE art.DaArt BETWEEN @StartDate AND @EndDate AND DATEDIFF(art.DaArt, p.DafirstVisit) BETWEEN 1 AND 7
) as PatientList;


-- =====================================================

-- =====================================================
-- INDICATOR 12: 05.1.2 ART 1 7 DAYS DETAILS
-- File: 05.1.2_art_1_7_days_details.sql
-- =====================================================

-- =====================================================
-- 05.1.2 ART 1 7 DAYS DETAILS
-- Generated: 2025-10-16T17:34:57.195Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 5.1.2: New ART started: 1-7 days - Detailed Records
SELECT
    '5.1.2' as step,
    p.ClinicID as clinicid,
    art.ART as art_number,
    p.Sex as sex,
    CASE 
        WHEN p.Sex = 0 THEN 'Female'
        WHEN p.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    '15+' as typepatients,
    p.DaBirth as DaBirth,
    p.DafirstVisit as DafirstVisit,
    art.DaArt as DaArt,
    v.DatVisit as DatVisit,
    p.OffIn as OffIn,
    'Adult' as patient_type,
    TIMESTAMPDIFF(YEAR, p.DaBirth, @EndDate) as age,
    CASE 
        WHEN p.OffIn = 0 THEN 'Not Transferred'
        WHEN p.OffIn = 2 THEN 'Transferred In'
        WHEN p.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', p.OffIn)
    END as transfer_status
FROM tblaimain p 
JOIN tblaart art ON p.ClinicID = art.ClinicID
JOIN tblavmain v ON p.ClinicID = v.ClinicID AND v.DatVisit = art.DaArt 
WHERE art.DaArt BETWEEN @StartDate AND @EndDate
    AND DATEDIFF(art.DaArt, p.DafirstVisit) BETWEEN 1 AND 7
    AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)

UNION ALL

SELECT
    '5.1.2' as step,
    p.ClinicID as clinicid,
    art.ART as art_number,
    p.Sex as sex,
    CASE 
        WHEN p.Sex = 0 THEN 'Female'
        WHEN p.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    '≤14' as typepatients,
    p.DaBirth as DaBirth,
    p.DafirstVisit as DafirstVisit,
    art.DaArt as DaArt,
    v.DatVisit as DatVisit,
    p.OffIn as OffIn,
    'Child' as patient_type,
    TIMESTAMPDIFF(YEAR, p.DaBirth, @EndDate) as age,
    CASE 
        WHEN p.OffIn = 0 THEN 'Not Transferred'
        WHEN p.OffIn = 2 THEN 'Transferred In'
        WHEN p.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', p.OffIn)
    END as transfer_status
FROM tblcimain p 
JOIN tblcart art ON p.ClinicID = art.ClinicID
JOIN tblcvmain v ON p.ClinicID = v.ClinicID AND v.DatVisit = art.DaArt
WHERE art.DaArt BETWEEN @StartDate AND @EndDate
    AND DATEDIFF(art.DaArt, p.DafirstVisit) BETWEEN 1 AND 7
ORDER BY DaArt DESC, ClinicID;


-- =====================================================

-- =====================================================
-- INDICATOR 13: 05.1.3 ART OVER 7 DAYS
-- File: 05.1.3_art_over_7_days.sql
-- =====================================================

-- =====================================================
-- 05.1.3 ART OVER 7 DAYS
-- Generated: 2025-10-16T17:34:57.195Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 5.1.3: New ART started: >7 days
SELECT
    '5.1.3. New ART started: >7 days' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_over_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_over_14
FROM (
    -- Adults: Must not be a lost-return patient
    SELECT 'Adult' as type, IF(p.Sex=0, "Female", "Male") as Sex FROM tblaimain p JOIN tblaart art ON p.ClinicID = art.ClinicID WHERE art.DaArt BETWEEN @StartDate AND @EndDate AND DATEDIFF(art.DaArt, p.DafirstVisit) > 7 AND (p.OffIn IS NULL OR p.OffIn <> @transfer_in_code) AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)
    UNION ALL
    -- Children
    SELECT 'Child' as type, IF(p.Sex=0, "Female", "Male") as Sex FROM tblcimain p JOIN tblcart art ON p.ClinicID = art.ClinicID WHERE art.DaArt BETWEEN @StartDate AND @EndDate AND DATEDIFF(art.DaArt, p.DafirstVisit) > 7
) as PatientList;


-- =====================================================

-- =====================================================
-- INDICATOR 14: 05.1.3 ART OVER 7 DAYS DETAILS
-- File: 05.1.3_art_over_7_days_details.sql
-- =====================================================

-- =====================================================
-- 05.1.3 ART OVER 7 DAYS DETAILS
-- Generated: 2025-10-16T17:34:57.195Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 5.1.3: New ART started: >7 days - Detailed Records
SELECT
    '5.1.3' as step,
    p.ClinicID as clinicid,
    art.ART as art_number,
    p.Sex as sex,
    CASE 
        WHEN p.Sex = 0 THEN 'Female'
        WHEN p.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    'Adult' as typepatients,
    p.DaBirth as DaBirth,
    p.DafirstVisit as DafirstVisit,
    art.DaArt as DaArt,
    art.DaArt as DatVisit,
    p.OffIn as OffIn,
    'Adult' as patient_type,
    TIMESTAMPDIFF(YEAR, p.DaBirth, @EndDate) as age,
    CASE 
        WHEN p.OffIn = 0 THEN 'Not Transferred'
        WHEN p.OffIn = 2 THEN 'Transferred In'
        WHEN p.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', p.OffIn)
    END as transfer_status
FROM tblaimain p 
JOIN tblaart art ON p.ClinicID = art.ClinicID
WHERE art.DaArt BETWEEN @StartDate AND @EndDate
    AND DATEDIFF(art.DaArt, p.DafirstVisit) > 7
    AND (p.OffIn IS NULL OR p.OffIn <> @transfer_in_code)
    AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)

UNION ALL

SELECT
    '5.1.3' as step,
    p.ClinicID as clinicid,
    art.ART as art_number,
    p.Sex as sex,
    CASE 
        WHEN p.Sex = 0 THEN 'Female'
        WHEN p.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    'Child' as typepatients,
    p.DaBirth as DaBirth,
    p.DafirstVisit as DafirstVisit,
    art.DaArt as DaArt,
    art.DaArt as DatVisit,
    p.OffIn as OffIn,
    'Child' as patient_type,
    TIMESTAMPDIFF(YEAR, p.DaBirth, @EndDate) as age,
    CASE 
        WHEN p.OffIn = 0 THEN 'Not Transferred'
        WHEN p.OffIn = 2 THEN 'Transferred In'
        WHEN p.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', p.OffIn)
    END as transfer_status
FROM tblcimain p 
JOIN tblcart art ON p.ClinicID = art.ClinicID
WHERE art.DaArt BETWEEN @StartDate AND @EndDate
    AND DATEDIFF(art.DaArt, p.DafirstVisit) > 7
ORDER BY DaArt DESC, ClinicID;


-- =====================================================

-- =====================================================
-- INDICATOR 15: 05.2 ART WITH TLD
-- File: 05.2_art_with_tld.sql
-- =====================================================

-- =====================================================
-- 05.2 ART WITH TLD
-- Generated: 2025-10-16T17:34:57.195Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 5.2: New ART started with TLD
SELECT
    '5.2. New ART started with TLD' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_over_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_over_14
FROM (
    SELECT 'Adult' as type, IF(p.Sex=0, 'Female', 'Male') as Sex FROM tblaimain p
    JOIN tblaart art ON p.ClinicID = art.ClinicID JOIN tblavmain v ON p.ClinicID = v.ClinicID AND v.DatVisit = art.DaArt
    WHERE art.DaArt BETWEEN @StartDate AND @EndDate
    AND (p.OffIn IS NULL OR p.OffIn <> @transfer_in_code)
    AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)
    AND v.Vid IN (SELECT Vid FROM (SELECT Vid, GROUP_CONCAT(DrugName ORDER BY DrugName SEPARATOR ' + ') as regimen FROM tblavarvdrug WHERE Status <> 1 AND Status <> -1 GROUP BY Vid) rg WHERE rg.regimen = @tld_regimen_formula)
    UNION ALL
    SELECT 'Child' as type, IF(p.Sex=0, 'Female', 'Male') as Sex FROM tblcimain p
    JOIN tblcart art ON p.ClinicID = art.ClinicID JOIN tblcvmain v ON p.ClinicID = v.ClinicID AND v.DatVisit = art.DaArt
    AND art.DaArt BETWEEN @StartDate AND @EndDate
    AND v.Vid IN (SELECT Vid FROM (SELECT Vid, GROUP_CONCAT(DrugName ORDER BY DrugName SEPARATOR ' + ') as regimen FROM tblcvarvdrug WHERE Status <> 1 AND Status <> -1 GROUP BY Vid) rg WHERE rg.regimen = @tld_regimen_formula)
) AS PatientList;


-- =====================================================

-- =====================================================
-- INDICATOR 16: 05.2 ART WITH TLD DETAILS
-- File: 05.2_art_with_tld_details.sql
-- =====================================================

-- =====================================================
-- 05.2 ART WITH TLD DETAILS
-- Generated: 2025-10-16T17:34:57.195Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 5.2: New ART started with TLD - Detailed Records (matching aggregate logic)
SELECT
    '5.2' as step,
    p.ClinicID as clinicid,
    p.Sex as sex,
    CASE 
        WHEN p.Sex = 0 THEN 'Female'
        WHEN p.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    '15+' as typepatients,
    p.DaBirth as DaBirth,
    p.DafirstVisit as DafirstVisit,
    art.ART as art_number,
    art.DaArt as DaArt,
    v.DatVisit as DatVisit,
    p.OffIn as OffIn,
    'Adult' as patient_type,
    TIMESTAMPDIFF(YEAR, p.DaBirth, @EndDate) as age,
    CASE 
        WHEN p.OffIn = 0 THEN 'Not Transferred'
        WHEN p.OffIn = 1 THEN 'Transferred In'
        WHEN p.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', p.OffIn)
    END as transfer_status,
    rg.regimen as drug_regimen,
    'TLD' as TLDStatus
FROM tblaimain p 
JOIN tblaart art ON p.ClinicID = art.ClinicID
JOIN tblavmain v ON p.ClinicID = v.ClinicID AND v.DatVisit = art.DaArt
JOIN (
    SELECT Vid, GROUP_CONCAT(DrugName ORDER BY DrugName SEPARATOR ' + ') as regimen 
    FROM tblavarvdrug 
    WHERE Status <> 1 AND Status <> -1
    GROUP BY Vid
) rg ON v.Vid = rg.Vid
WHERE art.DaArt BETWEEN @StartDate AND @EndDate
    AND (p.OffIn IS NULL OR p.OffIn <> @transfer_in_code)
    AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)
    AND rg.regimen = @tld_regimen_formula

UNION ALL

SELECT
    '5.2' as step,
    p.ClinicID as clinicid,
    p.Sex as sex,
    CASE 
        WHEN p.Sex = 0 THEN 'Female'
        WHEN p.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    '≤14' as typepatients,
    p.DaBirth as DaBirth,
    p.DafirstVisit as DafirstVisit,
    art.ART as art_number,
    art.DaArt as DaArt,
    v.DatVisit as DatVisit,
    p.OffIn as OffIn,
    'Child' as patient_type,
    TIMESTAMPDIFF(YEAR, p.DaBirth, @EndDate) as age,
    CASE 
        WHEN p.OffIn = 0 THEN 'Not Transferred'
        WHEN p.OffIn = 1 THEN 'Transferred In'
        WHEN p.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', p.OffIn)
    END as transfer_status,
    rg.regimen as drug_regimen,
    'TLD' as TLDStatus
FROM tblcimain p 
JOIN tblcart art ON p.ClinicID = art.ClinicID
JOIN tblcvmain v ON p.ClinicID = v.ClinicID AND v.DatVisit = art.DaArt
JOIN (
    SELECT Vid, GROUP_CONCAT(DrugName ORDER BY DrugName SEPARATOR ' + ') as regimen 
    FROM tblcvarvdrug 
    WHERE Status <> 1 AND Status <> -1
    GROUP BY Vid
) rg ON v.Vid = rg.Vid
WHERE art.DaArt BETWEEN @StartDate AND @EndDate
    AND (p.OffIn IS NULL OR p.OffIn <> @transfer_in_code)
    AND rg.regimen = @tld_regimen_formula
ORDER BY DaArt DESC, ClinicID;


-- =====================================================

-- =====================================================
-- INDICATOR 17: 05 NEWLY INITIATED
-- File: 05_newly_initiated.sql
-- =====================================================

-- =====================================================
-- 05 NEWLY INITIATED
-- Generated: 2025-10-16T17:34:57.195Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 5: Newly Initiated
WITH tblnewlyinitiated AS (
    -- Adults: Must have ART start date in quarter, NOT be a transfer-in, AND NOT be a lost-return patient
    SELECT 
        'Adult' as type, 
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        art.DaArt
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    JOIN tblavmain v ON p.ClinicID = v.ClinicID AND v.DatVisit = art.DaArt 
    WHERE 
        art.DaArt BETWEEN @StartDate AND @EndDate 
        AND (p.OffIn IS NULL OR p.OffIn <> @transfer_in_code)
        AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)
    
    UNION ALL
    
    -- Children: Must have ART start date in quarter AND NOT be a transfer-in
    SELECT 
        'Child' as type, 
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        art.DaArt
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = art.ClinicID
    JOIN tblcvmain v ON p.ClinicID = v.ClinicID AND v.DatVisit = art.DaArt
    WHERE 
        art.DaArt BETWEEN @StartDate AND @EndDate 
        AND (p.OffIn IS NULL OR p.OffIn <> @transfer_in_code)
)

SELECT
    '5. Newly Initiated' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_0_14,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_0_14,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_over_14,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_over_14
FROM tblnewlyinitiated;


-- =====================================================

-- =====================================================
-- INDICATOR 18: 05 NEWLY INITIATED DETAILS
-- File: 05_newly_initiated_details.sql
-- =====================================================

-- =====================================================
-- 05 NEWLY INITIATED DETAILS
-- Generated: 2025-10-16T17:34:57.196Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 5: Newly Initiated - Detailed Records
SELECT
    p.ClinicID as clinicid,
    art.ART as art_number,
    p.Sex as sex,
    CASE 
        WHEN p.Sex = 0 THEN 'Female'
        WHEN p.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    '15+' as typepatients,
    p.DaBirth as DaBirth,
    p.DafirstVisit as DafirstVisit,
    art.DaArt as DaArt,
    v.DatVisit as DatVisit,
    p.OffIn as OffIn,
    'Adult' as patient_type,
    TIMESTAMPDIFF(YEAR, p.DaBirth, @EndDate) as age,
    CASE 
        WHEN p.OffIn = 0 THEN 'Not Transferred'
        WHEN p.OffIn = 2 THEN 'Transferred In'
        WHEN p.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', p.OffIn)
    END as transfer_status
FROM tblaimain p 
JOIN tblaart art ON p.ClinicID = art.ClinicID
JOIN tblavmain v ON p.ClinicID = v.ClinicID AND v.DatVisit = art.DaArt 
WHERE 
    art.DaArt BETWEEN @StartDate AND @EndDate 
    AND (p.OffIn IS NULL OR p.OffIn <> @transfer_in_code)
    AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)

UNION ALL

SELECT
    p.ClinicID as clinicid,
    art.ART as art_number,
    p.Sex as sex,
    CASE 
        WHEN p.Sex = 0 THEN 'Female'
        WHEN p.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    '≤14' as typepatients,
    p.DaBirth as DaBirth,
    p.DafirstVisit as DafirstVisit,
    art.DaArt as DaArt,
    v.DatVisit as DatVisit,
    p.OffIn as OffIn,
    'Child' as patient_type,
    TIMESTAMPDIFF(YEAR, p.DaBirth, @EndDate) as age,
    CASE 
        WHEN p.OffIn = 0 THEN 'Not Transferred'
        WHEN p.OffIn = 2 THEN 'Transferred In'
        WHEN p.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', p.OffIn)
    END as transfer_status
FROM tblcimain p 
JOIN tblcart art ON p.ClinicID = art.ClinicID
JOIN tblcvmain v ON p.ClinicID = v.ClinicID AND v.DatVisit = art.DaArt
WHERE 
    art.DaArt BETWEEN @StartDate AND @EndDate 
    AND (p.OffIn IS NULL OR p.OffIn <> @transfer_in_code)
ORDER BY DaArt DESC, ClinicID;


-- =====================================================

-- =====================================================
-- INDICATOR 19: 06 TRANSFER IN
-- File: 06_transfer_in.sql
-- =====================================================

-- =====================================================
-- 06 TRANSFER IN
-- Generated: 2025-10-16T17:34:57.196Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 6: Number of transfer-in patients
-- This matches the old system logic exactly:
-- Adult: LEFT JOIN with tblaart (no ART requirement)
-- Child: LEFT JOIN with tblcart but requires tblcart.ClinicID IS NOT NULL
SELECT
    '6. Transfer-in patients' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_over_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_over_14
FROM (
    -- Adult transfer-in patients: TypeofReturn = -1 (not lost and returned)
    SELECT 'Adult' as type, IF(p.Sex=0, 'Female', 'Male') as Sex 
    FROM tblaimain p 
    LEFT JOIN tblaart art ON p.ClinicID = art.ClinicID
    LEFT JOIN tblavpatientstatus pvs ON p.ClinicID = pvs.ClinicID
    WHERE p.DafirstVisit BETWEEN @StartDate AND @EndDate AND p.OffIn = 1
    AND p.TypeofReturn = -1
    UNION ALL
    -- Child transfer-in patients: LClinicID, ClinicIDold, SiteNameold all have values
    SELECT 'Child' as type, IF(p.Sex=0, 'Female', 'Male') as Sex 
    FROM tblcimain p 
    LEFT JOIN tblcart art ON p.ClinicID = art.ClinicID
    LEFT JOIN tblcvpatientstatus pvs ON p.ClinicID = pvs.ClinicID
    WHERE p.DafirstVisit BETWEEN @StartDate AND @EndDate AND p.OffIn = 1 
    AND art.ClinicID IS NOT NULL
    AND p.LClinicID IS NOT NULL AND p.LClinicID <> ''
    AND p.ClinicIDold IS NOT NULL AND p.ClinicIDold <> ''
    AND p.SiteNameold IS NOT NULL AND p.SiteNameold <> ''
) as PatientList;


-- =====================================================

-- =====================================================
-- INDICATOR 20: 06 TRANSFER IN DETAILS
-- File: 06_transfer_in_details.sql
-- =====================================================

-- =====================================================
-- 06 TRANSFER IN DETAILS
-- Generated: 2025-10-16T17:34:57.196Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 6: Transfer-in patients - Detailed Records
-- This matches the old system logic exactly:
-- Adult: LEFT JOIN with tblaart (no ART requirement)
-- Child: LEFT JOIN with tblcart but requires tblcart.ClinicID IS NOT NULL
SELECT
    p.ClinicID as clinicid,
    art.ART as art_number,
    p.Sex as sex,
    CASE 
        WHEN p.Sex = 0 THEN 'Female'
        WHEN p.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    '15+' as typepatients,
    p.DaBirth as DaBirth,
    p.DafirstVisit as DafirstVisit,
    art.DaArt as DaArt,
    p.OffIn as OffIn,
    'Adult' as patient_type,
    TIMESTAMPDIFF(YEAR, p.DaBirth, @EndDate) as age,
    CASE 
        WHEN p.OffIn = 0 THEN 'Not Transferred'
        WHEN p.OffIn = 1 THEN 'Transferred In'
        WHEN p.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', p.OffIn)
    END as transfer_status,
    p.TypeofReturn,
    NULL as ClinicIDold,
    NULL as SiteNameold
FROM tblaimain p 
LEFT JOIN tblaart art ON p.ClinicID = art.ClinicID
LEFT JOIN tblavpatientstatus pvs ON p.ClinicID = pvs.ClinicID
WHERE 
    p.DafirstVisit BETWEEN @StartDate AND @EndDate
    AND p.OffIn = 1
    AND p.TypeofReturn = -1

UNION ALL

SELECT
    p.ClinicID as clinicid,
    art.ART as art_number,
    p.Sex as sex,
    CASE 
        WHEN p.Sex = 0 THEN 'Female'
        WHEN p.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    '≤14' as typepatients,
    p.DaBirth as DaBirth,
    p.DafirstVisit as DafirstVisit,
    art.DaArt as DaArt,
    p.OffIn as OffIn,
    'Child' as patient_type,
    TIMESTAMPDIFF(YEAR, p.DaBirth, @EndDate) as age,
    CASE 
        WHEN p.OffIn = 0 THEN 'Not Transferred'
        WHEN p.OffIn = 1 THEN 'Transferred In'
        WHEN p.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', p.OffIn)
    END as transfer_status,
    NULL as TypeofReturn,
    p.ClinicIDold,
    p.SiteNameold
FROM tblcimain p 
LEFT JOIN tblcart art ON p.ClinicID = art.ClinicID
LEFT JOIN tblcvpatientstatus pvs ON p.ClinicID = pvs.ClinicID
WHERE 
    p.DafirstVisit BETWEEN @StartDate AND @EndDate
    AND p.OffIn = 1
    AND art.ClinicID IS NOT NULL
    AND p.LClinicID IS NOT NULL AND p.LClinicID <> ''
    AND p.ClinicIDold IS NOT NULL AND p.ClinicIDold <> ''
    AND p.SiteNameold IS NOT NULL AND p.SiteNameold <> ''
ORDER BY DaArt DESC, ClinicID;


-- =====================================================

-- =====================================================
-- INDICATOR 21: 07 LOST AND RETURN
-- File: 07_lost_and_return.sql
-- =====================================================

-- =====================================================
-- 07 LOST AND RETURN
-- Generated: 2025-10-16T17:34:57.196Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 7: Lost and Return
-- Corrected to match old VB.NET implementation exactly
SELECT
    '7. Lost and Return' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_over_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_over_14
FROM (
    -- Adult Lost & Return: TypeofReturn <> -1 AND DafirstVisit in quarter
    SELECT 'Adult' as type, IF(p.Sex=0, 'Female', 'Male') as Sex
    FROM tblaimain p
    LEFT OUTER JOIN tblaart art ON p.ClinicID = art.ClinicID
    WHERE p.TypeofReturn IS NOT NULL
      AND p.TypeofReturn >= 0
      AND p.DafirstVisit BETWEEN @StartDate AND @EndDate
    GROUP BY p.Sex, art.ART, p.ClinicID
    
    UNION ALL
    
    -- Child Lost & Return: LClinicID <> '' AND DafirstVisit in quarter
    SELECT 'Child' as type, IF(p.Sex=0, 'Female', 'Male') as Sex
    FROM tblcimain p
    LEFT OUTER JOIN tblcart art ON p.ClinicID = art.ClinicID
    WHERE p.LClinicID IS NOT NULL
      AND p.LClinicID <> ''
      AND p.DafirstVisit BETWEEN @StartDate AND @EndDate
    GROUP BY p.Sex, art.ART
) as PatientList;


-- =====================================================

-- =====================================================
-- INDICATOR 22: 07 LOST AND RETURN DETAILS
-- File: 07_lost_and_return_details.sql
-- =====================================================

-- =====================================================
-- 07 LOST AND RETURN DETAILS
-- Generated: 2025-10-16T17:34:57.196Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 7: Lost and Return - Detailed Records (matching corrected aggregate logic)
SELECT
    p.ClinicID as clinicid,
    p.Sex as sex,
    CASE 
        WHEN p.Sex = 0 THEN 'Female'
        WHEN p.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    '15+' as typepatients,
    p.DaBirth as DaBirth,
    p.DafirstVisit as DafirstVisit,
    art.DaArt as DaArt,
    p.OffIn as OffIn,
    'Adult' as patient_type,
    TIMESTAMPDIFF(YEAR, p.DaBirth, @EndDate) as age,
    CASE 
        WHEN p.OffIn = 0 THEN 'Not Transferred'
        WHEN p.OffIn = 2 THEN 'Transferred In'
        WHEN p.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', p.OffIn)
    END as transfer_status,
    CASE 
        WHEN p.TypeofReturn = 0 THEN 'Lost and Return'
        WHEN p.TypeofReturn = 1 THEN 'Return'
        WHEN p.TypeofReturn = 2 THEN 'Transfer In'
        WHEN p.TypeofReturn = 3 THEN 'Transfer Out'
        WHEN p.TypeofReturn = 4 THEN 'Re-enrollment'
        ELSE CONCAT('Type: ', p.TypeofReturn)
    END as return_type,
    art.ART as art_number
FROM tblaimain p
LEFT OUTER JOIN tblaart art ON p.ClinicID = art.ClinicID
WHERE p.TypeofReturn IS NOT NULL 
    AND p.TypeofReturn >= 0
    AND p.DafirstVisit BETWEEN @StartDate AND @EndDate
GROUP BY p.Sex, art.ART, p.ClinicID

UNION ALL

SELECT
    p.ClinicID as clinicid,
    p.Sex as sex,
    CASE 
        WHEN p.Sex = 0 THEN 'Female'
        WHEN p.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    '≤14' as typepatients,
    p.DaBirth as DaBirth,
    p.DafirstVisit as DafirstVisit,
    art.DaArt as DaArt,
    p.OffIn as OffIn,
    'Child' as patient_type,
    TIMESTAMPDIFF(YEAR, p.DaBirth, @EndDate) as age,
    CASE 
        WHEN p.OffIn = 0 THEN 'Not Transferred'
        WHEN p.OffIn = 2 THEN 'Transferred In'
        WHEN p.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', p.OffIn)
    END as transfer_status,
    'Lost and Return' as return_type,
    art.ART as art_number
FROM tblcimain p
LEFT OUTER JOIN tblcart art ON p.ClinicID = art.ClinicID
WHERE p.LClinicID IS NOT NULL 
    AND p.LClinicID <> ''
    AND p.DafirstVisit BETWEEN @StartDate AND @EndDate
GROUP BY p.Sex, art.ART

ORDER BY DafirstVisit DESC, clinicid;


-- =====================================================

-- =====================================================
-- INDICATOR 23: 08.1 DEAD
-- File: 08.1_dead.sql
-- =====================================================

-- =====================================================
-- 08.1 DEAD
-- Generated: 2025-10-16T17:34:57.196Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 8.1: Dead
SELECT
    '8.1. Dead' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_over_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_over_14
FROM (
    SELECT 'Adult' as type, IF(main.Sex=0, 'Female', 'Male') as Sex FROM tblaimain main JOIN tblavpatientstatus s ON main.ClinicID = s.ClinicID WHERE s.Da BETWEEN @StartDate AND @EndDate AND s.Status = @dead_code
    UNION ALL
    SELECT 'Child' as type, IF(main.Sex=0, 'Female', 'Male') as Sex FROM tblcimain main JOIN tblcvpatientstatus s ON main.ClinicID = s.ClinicID WHERE s.Da BETWEEN @StartDate AND @EndDate AND s.Status = @dead_code
) AS PatientList;


-- =====================================================

-- =====================================================
-- INDICATOR 24: 08.1 DEAD DETAILS
-- File: 08.1_dead_details.sql
-- =====================================================

-- =====================================================
-- 08.1 DEAD DETAILS
-- Generated: 2025-10-16T17:34:57.196Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 8.1: Dead - Detailed Records (matching aggregate logic exactly)
SELECT
    main.ClinicID as clinicid,
    art.ART as art_number,
    main.Sex as sex,
    CASE 
        WHEN main.Sex = 0 THEN 'Female'
        WHEN main.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    '15+' as typepatients,
    main.DafirstVisit as DafirstVisit,
    main.OffIn as OffIn,
    'Adult' as patient_type,
    TIMESTAMPDIFF(YEAR, main.DaBirth, @EndDate) as age,
    CASE 
        WHEN main.OffIn = 0 THEN 'Not Transferred'
        WHEN main.OffIn = 2 THEN 'Transferred In'
        WHEN main.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', main.OffIn)
    END as transfer_status,
    s.Da as death_date,
    s.Status as death_status,
    CASE 
        WHEN s.Place = 0 THEN 'Home'
        WHEN s.Place = 1 THEN 'Hospital'
        WHEN s.Place = 2 THEN COALESCE(s.OPlace, 'Other')
        ELSE 'Unknown'
    END as death_place,
    CASE 
        WHEN s.Cause LIKE '%/%' THEN 
            CASE 
                WHEN SUBSTRING_INDEX(s.Cause, '/', -1) REGEXP '^[0-9]+$' THEN 
                    COALESCE(r.Reason, 'Unknown')
                ELSE 
                    CONCAT(
                        COALESCE(r.Reason, 'Unknown'), 
                        ' - ', 
                        SUBSTRING_INDEX(s.Cause, '/', -1)
                    )
            END
        ELSE COALESCE(r.Reason, s.Cause)
    END as death_reason
FROM tblaimain main 
JOIN tblavpatientstatus s ON main.ClinicID = s.ClinicID
LEFT JOIN tblaart art ON main.ClinicID = art.ClinicID
LEFT JOIN tblreason r ON CAST(SUBSTRING_INDEX(s.Cause, '/', 1) AS UNSIGNED) = r.Rid
WHERE s.Da BETWEEN @StartDate AND @EndDate 
    AND s.Status = @dead_code

UNION ALL

SELECT
    main.ClinicID as clinicid,
    art.ART as art_number,
    main.Sex as sex,
    CASE 
        WHEN main.Sex = 0 THEN 'Female'
        WHEN main.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    '≤14' as typepatients,
    main.DafirstVisit as DafirstVisit,
    main.OffIn as OffIn,
    'Child' as patient_type,
    TIMESTAMPDIFF(YEAR, main.DaBirth, @EndDate) as age,
    CASE 
        WHEN main.OffIn = 0 THEN 'Not Transferred'
        WHEN main.OffIn = 2 THEN 'Transferred In'
        WHEN main.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', main.OffIn)
    END as transfer_status,
    s.Da as death_date,
    s.Status as death_status,
    CASE 
        WHEN s.Place = 0 THEN 'Home'
        WHEN s.Place = 1 THEN 'Hospital'
        WHEN s.Place = 2 THEN COALESCE(s.OPlace, 'Other')
        ELSE 'Unknown'
    END as death_place,
    CASE 
        WHEN s.Cause LIKE '%/%' THEN 
            CASE 
                WHEN SUBSTRING_INDEX(s.Cause, '/', -1) REGEXP '^[0-9]+$' THEN 
                    COALESCE(r.Reason, 'Unknown')
                ELSE 
                    CONCAT(
                        COALESCE(r.Reason, 'Unknown'), 
                        ' - ', 
                        SUBSTRING_INDEX(s.Cause, '/', -1)
                    )
            END
        ELSE COALESCE(r.Reason, s.Cause)
    END as death_reason
FROM tblcimain main 
JOIN tblcvpatientstatus s ON main.ClinicID = s.ClinicID
LEFT JOIN tblcart art ON main.ClinicID = art.ClinicID
LEFT JOIN tblreason r ON CAST(SUBSTRING_INDEX(s.Cause, '/', 1) AS UNSIGNED) = r.Rid
WHERE s.Da BETWEEN @StartDate AND @EndDate 
    AND s.Status = @dead_code
ORDER BY death_date DESC, clinicid;


-- =====================================================

-- =====================================================
-- INDICATOR 25: 08.2 LOST TO FOLLOWUP
-- File: 08.2_lost_to_followup.sql
-- =====================================================

-- =====================================================
-- 08.2 LOST TO FOLLOWUP
-- Generated: 2025-10-16T17:34:57.196Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 8.2: Lost to follow up (LTFU)
SELECT
    '8.2. Lost to follow up (LTFU)' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_over_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_over_14
FROM (
    SELECT 'Adult' as type, IF(main.Sex=0, 'Female', 'Male') as Sex FROM tblaimain main JOIN tblavpatientstatus s ON main.ClinicID = s.ClinicID WHERE s.Da BETWEEN @StartDate AND @EndDate AND s.Status = @lost_code
    UNION ALL
    SELECT 'Child' as type, IF(main.Sex=0, 'Female', 'Male') as Sex FROM tblcimain main JOIN tblcvpatientstatus s ON main.ClinicID = s.ClinicID WHERE s.Da BETWEEN @StartDate AND @EndDate AND s.Status = @lost_code
) AS PatientList;


-- =====================================================

-- =====================================================
-- INDICATOR 26: 08.2 LOST TO FOLLOWUP DETAILS
-- File: 08.2_lost_to_followup_details.sql
-- =====================================================

-- =====================================================
-- 08.2 LOST TO FOLLOWUP DETAILS
-- Generated: 2025-10-16T17:34:57.196Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 8.2: Lost to follow up (LTFU) - Detailed Records (matching aggregate logic)
SELECT
    main.ClinicID as clinicid,
    art.ART as art_number,
    main.Sex as sex,
    CASE 
        WHEN main.Sex = 0 THEN 'Female'
        WHEN main.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    '15+' as typepatients,
    main.DaBirth as DaBirth,
    main.DafirstVisit as DafirstVisit,
    main.OffIn as OffIn,
    'Adult' as patient_type,
    TIMESTAMPDIFF(YEAR, main.DaBirth, @EndDate) as age,
    CASE 
        WHEN main.OffIn = 0 THEN 'Not Transferred'
        WHEN main.OffIn = 2 THEN 'Transferred In'
        WHEN main.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', main.OffIn)
    END as transfer_status,
    s.Da as ltf_date,
    s.Status as ltf_status_code
FROM tblaimain main 
LEFT JOIN tblaart art ON main.ClinicID = art.ClinicID
JOIN tblavpatientstatus s ON main.ClinicID = s.ClinicID
WHERE s.Da BETWEEN @StartDate AND @EndDate 
    AND s.Status = @lost_code

UNION ALL

SELECT
    main.ClinicID as clinicid,
    art.ART as art_number,
    main.Sex as sex,
    CASE 
        WHEN main.Sex = 0 THEN 'Female'
        WHEN main.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    '≤14' as typepatients,
    main.DaBirth as DaBirth,
    main.DafirstVisit as DafirstVisit,
    main.OffIn as OffIn,
    'Child' as patient_type,
    TIMESTAMPDIFF(YEAR, main.DaBirth, @EndDate) as age,
    CASE 
        WHEN main.OffIn = 0 THEN 'Not Transferred'
        WHEN main.OffIn = 2 THEN 'Transferred In'
        WHEN main.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', main.OffIn)
    END as transfer_status,
    s.Da as ltf_date,
    s.Status as ltf_status_code
FROM tblcimain main 
LEFT JOIN tblcart art ON main.ClinicID = art.ClinicID
JOIN tblcvpatientstatus s ON main.ClinicID = s.ClinicID
WHERE s.Da BETWEEN @StartDate AND @EndDate 
    AND s.Status = @lost_code
ORDER BY ltf_date DESC, clinicid;


-- =====================================================

-- =====================================================
-- INDICATOR 27: 08.3 TRANSFER OUT
-- File: 08.3_transfer_out.sql
-- =====================================================

-- =====================================================
-- 08.3 TRANSFER OUT
-- Generated: 2025-10-16T17:34:57.198Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 8.3: Transfer-out
SELECT
    '8.3. Transfer-out' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_over_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_over_14
FROM (
    SELECT 'Adult' as type, IF(main.Sex=0, "Female", "Male") as Sex FROM tblaimain main JOIN tblavpatientstatus s ON main.ClinicID = s.ClinicID WHERE s.Da BETWEEN @StartDate AND @EndDate AND s.Status = @transfer_out_code
    UNION ALL
    SELECT 'Child' as type, IF(main.Sex=0, "Female", "Male") as Sex FROM tblcimain main JOIN tblcvpatientstatus s ON main.ClinicID = s.ClinicID WHERE s.Da BETWEEN @StartDate AND @EndDate AND s.Status = @transfer_out_code
) AS PatientList;


-- =====================================================

-- =====================================================
-- INDICATOR 28: 08.3 TRANSFER OUT DETAILS
-- File: 08.3_transfer_out_details.sql
-- =====================================================

-- =====================================================
-- 08.3 TRANSFER OUT DETAILS
-- Generated: 2025-10-16T17:34:57.198Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 8.3: Transfer-out - Detailed Records (matching aggregate logic)
SELECT
    '8.3' as step,
    main.ClinicID as clinicid,
    art.ART as art_number,
    main.Sex as sex,
    CASE 
        WHEN main.Sex = 0 THEN 'Female'
        WHEN main.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    '15+' as typepatients,
    main.DaBirth as DaBirth,
    main.DafirstVisit as DafirstVisit,
    main.OffIn as OffIn,
    'Adult' as patient_type,
    TIMESTAMPDIFF(YEAR, main.DaBirth, @EndDate) as age,
    CASE 
        WHEN main.OffIn = 0 THEN 'Not Transferred'
        WHEN main.OffIn = 2 THEN 'Transferred In'
        WHEN main.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', main.OffIn)
    END as transfer_status,
    s.Da as transfer_date,
    s.Status as transfer_status_code
FROM tblaimain main 
LEFT JOIN tblaart art ON main.ClinicID = art.ClinicID
JOIN tblavpatientstatus s ON main.ClinicID = s.ClinicID
WHERE 
    s.Da BETWEEN @StartDate AND @EndDate 
    AND s.Status = @transfer_out_code

UNION ALL

SELECT
    '8.3' as step,
    main.ClinicID as clinicid,
    art.ART as art_number,
    main.Sex as sex,
    CASE 
        WHEN main.Sex = 0 THEN 'Female'
        WHEN main.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    '≤14' as typepatients,
    main.DaBirth as DaBirth,
    main.DafirstVisit as DafirstVisit,
    main.OffIn as OffIn,
    'Child' as patient_type,
    TIMESTAMPDIFF(YEAR, main.DaBirth, @EndDate) as age,
    CASE 
        WHEN main.OffIn = 0 THEN 'Not Transferred'
        WHEN main.OffIn = 2 THEN 'Transferred In'
        WHEN main.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', main.OffIn)
    END as transfer_status,
    s.Da as transfer_date,
    s.Status as transfer_status_code
FROM tblcimain main 
LEFT JOIN tblcart art ON main.ClinicID = art.ClinicID
JOIN tblcvpatientstatus s ON main.ClinicID = s.ClinicID
WHERE 
    s.Da BETWEEN @StartDate AND @EndDate 
    AND s.Status = @transfer_out_code
ORDER BY transfer_date DESC, clinicid;


-- =====================================================

-- =====================================================
-- INDICATOR 29: 09 ACTIVE PRE ART
-- File: 09_active_pre_art.sql
-- =====================================================

-- =====================================================
-- 09 ACTIVE PRE ART
-- Generated: 2025-10-16T17:34:57.198Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Active Pre-ART patients
with tblactive as (
    with tblvisit as (
        select clinicid, DatVisit, ARTnum, DaApp, vid, 
               ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) as id 
        from tblavmain 
        where DatVisit <= @EndDate
        union all 
        select clinicid, DatVisit, ARTnum, DaApp, vid, 
               ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) as id 
        from tblcvmain 
        where DatVisit <= @EndDate
    ),
    
    tblimain as (
        select ClinicID, DafirstVisit, "15+" as typepatients, TypeofReturn, LClinicID, 
               SiteNameold, DaBirth, timestampdiff(year, DaBirth, @EndDate) as age, 
               Sex, DaHIV, OffIn 
        from tblaimain 
        where DafirstVisit <= @EndDate
        union all 
        select ClinicID, DafirstVisit, "≤14" as typepatients, '' as TypeofReturn, 
               LClinicID, SiteNameold, DaBirth, timestampdiff(year, DaBirth, @EndDate) as age, 
               Sex, DaTest as DaHIV, OffIn 
        from tblcimain 
        where DafirstVisit <= @EndDate
    ),
    
    tblart as (
        select *, timestampdiff(month, DaArt, @EndDate) as nmonthART 
        from tblaart 
        where DaArt <= @EndDate 
        union all 
        select *, timestampdiff(month, DaArt, @EndDate) as nmonthART 
        from tblcart 
        where DaArt <= @EndDate
    ),
    
    tblexit as (
        select * 
        from tblavpatientstatus 
        where da <= @EndDate  
        union all 
        select * 
        from tblcvpatientstatus  
        where da <= @EndDate
    ),
    
    tblarvdrug as (
        with tbldrug as (
            select vid, group_concat(distinct DrugName order by DrugName asc SEPARATOR '+') as drugname 
            from tblavarvdrug 
            where status <> 1 
            group by vid 
            union all 
            select vid, group_concat(distinct DrugName order by DrugName asc SEPARATOR '+') as drugname 
            from tblcvarvdrug 
            where status <> 1 
            group by vid
        )
        select vid, drugname, 
               if(LOCATE('3TC+DTG+TDF', drugname) > 0, "TLD", "Not-TLD") as TLDStatus 
        from tbldrug
    ),
    
    tblvltested as (
        with tblvltest as (
            select ClinicID, if(DaArrival < Dat, Dat, DaArrival) as DateResult, HIVLoad 
            from tblpatienttest 
            where HIVLoad != ''
            having DateResult <= @EndDate
        ) 
        select distinct ClinicID, DateResult, HIVLoad,
               if(DateResult > datelast, "Do_VL_in_12M", "Do_VL_greatn_12M") as VLdostatus,
               if(HIVLoad < 1000, "VL-Suppression", "Not-Suppression") as vlresultstatus  
        from (
            select ClinicID, DateResult, HIVLoad, 
                   date_sub(@EndDate, interval 1 year) as datelast, 
                   row_number() over (partition by clinicid order by DateResult desc) as id 
            from tblvltest 
        ) pt 
        where pt.id = 1
    ),
    
    tbltptdrug as (
        with tbltptdrugs as (
            select DrugName, Status, Da, Vid 
            from tblavtptdrug 
            where DrugName != "B6" 
            union all 
            select DrugName, Status, Da, Vid 
            from tblcvtptdrug 
            where DrugName != "B6"
        ),
        tblvisit as (
            select clinicid, DatVisit, vid 
            from tblavmain 
            union all 
            select clinicid, DatVisit, vid 
            from tblcvmain 
        ),
        tbltptall as (
            select clinicid, DatVisit, DrugName, Status, Da 
            from tbltptdrugs tp 
            left join tblvisit v on tp.vid = v.vid
        ),
        tbltptstart as (
            select * 
            from (
                select *, row_number() over(partition by clinicid order by DatVisit asc) as id 
                from tbltptall 
                where status = 0 and DatVisit <= @EndDate
            ) s 
            where id = 1
        ),
        tbltptstope as (
            select * 
            from (
                select *, row_number() over(partition by clinicid order by Da desc) as id 
                from tbltptall 
                where status = 1 and Da <= @EndDate
            ) s 
            where id = 1
        )
        select s.clinicid, s.DatVisit as dateStart, s.DrugName as Tptdrugname,
               st.da as Datestop, datediff(st.da, s.DatVisit)/30 as duration  
        from tbltptstart s
        left join tbltptstope st on s.clinicid = st.clinicid
    )

    select i.clinicid, i.DafirstVisit, i.typepatients, i.TypeofReturn, i.LClinicID, 
           i.SiteNameold, i.DaBirth, i.age, i.Sex, i.DaHIV, i.OffIn, 
           a.ART, a.DaArt, v.DatVisit, v.ARTnum, v.DaApp, a.nmonthART,
           if(a.nmonthART >= 6, ">6M", "<6M") as Startartstatus,
           datediff(v.DaApp, v.DatVisit) as ndays,
           if(datediff(v.DaApp, v.DatVisit) > 80, "MMD", "Not-MMD") as MMDStatus,
           rd.drugname, 
           if(left(i.clinicid, 1) = "P" and rd.TLDStatus != "TLD" and LOCATE('DTG', drugname) > 0, "TLD", rd.TLDStatus) as TLDStatus,
           vl.DateResult, vl.HIVLoad, vl.VLdostatus, vl.vlresultstatus,
           tp.Tptdrugname, tp.dateStart, tp.Datestop, tp.duration,
           if(left(tp.Tptdrugname, 1) = 3 and tp.duration >= 2.50, "TPT Complete",
              if(left(tp.Tptdrugname, 1) = 6 and tp.duration >= 5.50, "TPT Complete",
                 if(tp.Tptdrugname is null, "Not Start", "Not complete"))) as tptstatus 
    from tblvisit v
    left join tblimain i on i.clinicid = v.clinicid
    left join tblart a on a.clinicid = v.clinicid
    left join tblexit e on v.clinicid = e.clinicid
    left join tblarvdrug rd on rd.vid = v.vid
    left join tblvltested vl on vl.clinicid = v.clinicid
    left join tbltptdrug tp on tp.clinicid = v.clinicid
    where id = 1 and e.status is null -- and a.clinicid is not null 
)

select '9. Active Pre-ART' as Indicator, 
       sum(if(typepatients = '≤14' and sex = 1, 1, 0)) as Male_0_14,
       sum(if(typepatients = '≤14' and sex = 0, 1, 0)) as Female_0_14,
       sum(if(typepatients = '15+' and sex = 1, 1, 0)) as Male_over_14,
       sum(if(typepatients = '15+' and sex = 0, 1, 0)) as Female_over_14,
       count(*) as TOTAL
from tblactive
where ART is null;


-- =====================================================

-- =====================================================
-- INDICATOR 30: 09 ACTIVE PRE ART DETAILS
-- File: 09_active_pre_art_details.sql
-- =====================================================

-- =====================================================
-- 09 ACTIVE PRE ART DETAILS
-- Generated: 2025-10-16T17:34:57.198Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 9: Active Pre-ART - Detailed Records (matching aggregate logic)
-- This replicates the exact same CTE structure and logic as the aggregate query
WITH tblvisit AS (
    SELECT clinicid, DatVisit, ARTnum, DaApp, vid, 
           ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
    FROM tblavmain 
    WHERE DatVisit <= @EndDate
    UNION ALL 
    SELECT clinicid, DatVisit, ARTnum, DaApp, vid, 
           ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
    FROM tblcvmain 
    WHERE DatVisit <= @EndDate
),

tblimain AS (
    SELECT ClinicID, DafirstVisit, "15+" AS typepatients, TypeofReturn, LClinicID, 
           SiteNameold, DaBirth, TIMESTAMPDIFF(YEAR, DaBirth, @EndDate) AS age, 
           Sex, DaHIV, OffIn 
    FROM tblaimain 
    WHERE DafirstVisit <= @EndDate
    UNION ALL 
    SELECT ClinicID, DafirstVisit, "≤14" AS typepatients, '' AS TypeofReturn, 
           LClinicID, SiteNameold, DaBirth, TIMESTAMPDIFF(YEAR, DaBirth, @EndDate) AS age, 
           Sex, DaTest AS DaHIV, OffIn 
    FROM tblcimain 
    WHERE DafirstVisit <= @EndDate
),

tblart AS (
    SELECT *, TIMESTAMPDIFF(MONTH, DaArt, @EndDate) AS nmonthART 
    FROM tblaart 
    WHERE DaArt <= @EndDate
    UNION ALL 
    SELECT *, TIMESTAMPDIFF(MONTH, DaArt, @EndDate) AS nmonthART 
    FROM tblcart 
    WHERE DaArt <= @EndDate
),

tblexit AS (
    SELECT * 
    FROM tblavpatientstatus 
    WHERE da <= @EndDate
    UNION ALL 
    SELECT * 
    FROM tblcvpatientstatus  
    WHERE da <= @EndDate
),

tblarvdrug AS (
    WITH tbldrug AS (
        SELECT vid, GROUP_CONCAT(DISTINCT DrugName ORDER BY DrugName ASC SEPARATOR '+') AS drugname 
        FROM tblavarvdrug 
        WHERE status <> 1
        GROUP BY vid 
        UNION ALL 
        SELECT vid, GROUP_CONCAT(DISTINCT DrugName ORDER BY DrugName ASC SEPARATOR '+') AS drugname 
        FROM tblcvarvdrug 
        WHERE status <> 1
        GROUP BY vid
    )
    SELECT vid, drugname, 
           IF(LOCATE('3TC+DTG+TDF', drugname) > 0, "TLD", "Not-TLD") AS TLDStatus 
    FROM tbldrug
),

tblvltested AS (
    WITH tblvltest AS (
        SELECT ClinicID, IF(DaArrival < Dat, Dat, DaArrival) AS DateResult, HIVLoad 
        FROM tblpatienttest 
        WHERE HIVLoad != ''
        HAVING DateResult <= @EndDate
    )
    SELECT DISTINCT ClinicID, DateResult, HIVLoad,
           IF(DateResult > DATE_SUB(@EndDate, INTERVAL 1 YEAR), "Do_VL_in_12M", "Do_VL_greatn_12M") AS VLdostatus,
           IF(HIVLoad < 1000, "VL-Suppression", "Not-Suppression") AS vlresultstatus
    FROM (
        SELECT ClinicID, DateResult, HIVLoad,
               DATE_SUB(@EndDate, INTERVAL 1 YEAR) AS datelast, 
               ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DateResult DESC) AS id 
        FROM tblvltest 
    ) pt 
    WHERE pt.id = 1
),

tbltptdrug AS (
    WITH tbltptdrugs AS (
        SELECT DrugName, Status, Da, Vid 
        FROM tblavtptdrug 
        WHERE DrugName != "B6"
        UNION ALL 
        SELECT DrugName, Status, Da, Vid 
        FROM tblcvtptdrug 
        WHERE DrugName != "B6"
    ),
    
    tblvisit_tpt AS (
        SELECT clinicid, DatVisit, vid 
        FROM tblavmain 
        UNION ALL 
        SELECT clinicid, DatVisit, vid 
        FROM tblcvmain
    ),
    
    tbltptall AS (
        SELECT clinicid, DatVisit, DrugName, Status, Da 
        FROM tbltptdrugs tp 
        LEFT JOIN tblvisit_tpt v ON tp.vid = v.vid
    ),
    
    tbltptstart AS (
        SELECT * 
        FROM (
            SELECT *, ROW_NUMBER() OVER(PARTITION BY clinicid ORDER BY DatVisit ASC) AS id 
            FROM tbltptall 
            WHERE status = 0 AND DatVisit <= @EndDate
        ) s 
        WHERE id = 1
    ),
    
    tbltptstope AS (
        SELECT * 
        FROM (
            SELECT *, ROW_NUMBER() OVER(PARTITION BY clinicid ORDER BY Da DESC) AS id 
            FROM tbltptall 
            WHERE status = 1 AND Da <= @EndDate
        ) s 
        WHERE id = 1
    )
    
    SELECT s.clinicid, s.DatVisit AS dateStart, s.DrugName AS Tptdrugname,
           st.da AS Datestop, DATEDIFF(st.da, s.DatVisit) / 30 AS duration,
           IF(LEFT(s.DrugName, 1) = 3 AND DATEDIFF(st.da, s.DatVisit) / 30 >= 2.50, "TPT Complete",
              IF(LEFT(s.DrugName, 1) = 6 AND DATEDIFF(st.da, s.DatVisit) / 30 >= 5.50, "TPT Complete",
                 IF(s.DrugName IS NULL, "Not Start", "Not complete"))) AS tptstatus
    FROM tbltptstart s
    LEFT JOIN tbltptstope st ON s.clinicid = st.clinicid
)

-- Return exactly the same records as the aggregate query
SELECT
    '9' as step,
    i.clinicid,
    i.Sex AS sex,
    CASE 
        WHEN i.Sex = 0 THEN 'Female'
        WHEN i.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END AS sex_display,
    i.typepatients,
    i.DaBirth,
    i.DafirstVisit,
    a.DaArt,
    v.DatVisit,
    i.OffIn,
    CASE 
        WHEN i.typepatients = '15+' THEN 'Adult'
        ELSE 'Child'
    END AS patient_type,
    i.age,
    CASE
        WHEN i.OffIn = 0 THEN 'Not Transferred'
        WHEN i.OffIn = 2 THEN 'Transferred In'
        WHEN i.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', i.OffIn)
    END AS transfer_status
FROM tblvisit v
LEFT JOIN tblimain i ON i.clinicid = v.clinicid
LEFT JOIN tblart a ON a.clinicid = v.clinicid
LEFT JOIN tblexit e ON v.clinicid = e.clinicid
LEFT JOIN tblarvdrug rd ON rd.vid = v.vid
LEFT JOIN tblvltested vl ON vl.clinicid = v.clinicid
LEFT JOIN tbltptdrug tp ON tp.clinicid = v.clinicid
WHERE v.id = 1 AND e.status IS NULL
  AND a.ART IS NULL
ORDER BY v.DatVisit DESC, i.clinicid;

-- =====================================================

-- =====================================================
-- INDICATOR 31: 10.1 ELIGIBLE MMD
-- File: 10.1_eligible_mmd.sql
-- =====================================================

-- =====================================================
-- 10.1 ELIGIBLE MMD
-- Generated: 2025-10-16T17:34:57.198Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Eligible for MMD

with tblactive as (
    with tblvisit as (
        select clinicid, DatVisit, ARTnum, DaApp, vid, 
               ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) as id 
        from tblavmain 
        where DatVisit <= @EndDate
        union all 
        select clinicid, DatVisit, ARTnum, DaApp, vid, 
               ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) as id 
        from tblcvmain 
        where DatVisit <= @EndDate
    ),
    
    tblimain as (
        select ClinicID, DafirstVisit, "15+" as typepatients, TypeofReturn, LClinicID, 
               SiteNameold, DaBirth, timestampdiff(year, DaBirth, @EndDate) as age, 
               Sex, DaHIV, OffIn 
        from tblaimain 
        where DafirstVisit <= @EndDate
        union all 
        select ClinicID, DafirstVisit, "≤14" as typepatients, '' as TypeofReturn, 
               LClinicID, SiteNameold, DaBirth, timestampdiff(year, DaBirth, @EndDate) as age, 
               Sex, DaTest as DaHIV, OffIn 
        from tblcimain 
        where DafirstVisit <= @EndDate
    ),
    
    tblart as (
        select *, timestampdiff(month, DaArt, @EndDate) as nmonthART 
        from tblaart 
        where DaArt <= @EndDate
        union all 
        select *, timestampdiff(month, DaArt, @EndDate) as nmonthART 
        from tblcart 
        where DaArt <= @EndDate
    ),
    
    tblexit as (
        select * 
        from tblavpatientstatus 
        where da <= @EndDate  
        union all 
        select * 
        from tblcvpatientstatus  
        where da <= @EndDate
    ),
    
    tblarvdrug as (
        with tbldrug as (
            select vid, group_concat(distinct DrugName order by DrugName asc SEPARATOR '+') as drugname 
            from tblavarvdrug 
            where status <> 1 
            group by vid 
            union all 
            select vid, group_concat(distinct DrugName order by DrugName asc SEPARATOR '+') as drugname 
            from tblcvarvdrug 
            where status <> 1 
            group by vid
        )
        select vid, drugname, 
               if(LOCATE('3TC+DTG+TDF', drugname) > 0, "TLD", "Not-TLD") as TLDStatus 
        from tbldrug
    ),
    
    tblvltested as (
        with tblvltest as (
            select ClinicID, if(DaArrival < Dat, Dat, DaArrival) as DateResult, HIVLoad 
            from tblpatienttest 
            where HIVLoad != ''
            having DateResult <= @EndDate
        ) 
        select distinct ClinicID, DateResult, HIVLoad,
               if(DateResult > datelast, "Do_VL_in_12M", "Do_VL_greatn_12M") as VLdostatus,
               if(HIVLoad < 1000, "VL-Suppression", "Not-Suppression") as vlresultstatus  
        from (
            select ClinicID, DateResult, HIVLoad, 
                   date_sub(@EndDate, interval 1 year) as datelast, 
                   row_number() over (partition by clinicid order by DateResult desc) as id 
            from tblvltest 
        ) pt 
        where pt.id = 1
    ),
    
    tbltptdrug as (
        with tbltptdrugs as (
            select DrugName, Status, Da, Vid 
            from tblavtptdrug 
            where DrugName != "B6" 
            union all 
            select DrugName, Status, Da, Vid 
            from tblcvtptdrug 
            where DrugName != "B6"
        ),
        
        tblvisit as (
            select clinicid, DatVisit, vid 
            from tblavmain 
            union all 
            select clinicid, DatVisit, vid 
            from tblcvmain 
        ),
        
        tbltptall as (
            select clinicid, DatVisit, DrugName, Status, Da 
            from tbltptdrugs tp 
            left join tblvisit v on tp.vid = v.vid
        ),
        
        tbltptstart as (
            select * 
            from (
                select *, row_number() over(partition by clinicid order by DatVisit asc) as id 
                from tbltptall 
                where status = 0 and DatVisit <= @EndDate
            ) s 
            where id = 1
        ),
        
        tbltptstope as (
            select * 
            from (
                select *, row_number() over(partition by clinicid order by Da desc) as id 
                from tbltptall 
                where status = 1 and Da <= @EndDate
            ) s 
            where id = 1
        )
        
        select s.clinicid, s.DatVisit as dateStart, s.DrugName as Tptdrugname, 
               st.da as Datestop, datediff(st.da, s.DatVisit) / 30 as duration  
        from tbltptstart s
        left join tbltptstope st on s.clinicid = st.clinicid
    )

    select i.clinicid, i.DafirstVisit, i.typepatients, i.TypeofReturn, i.LClinicID, 
           i.SiteNameold, i.DaBirth, i.age, i.Sex, i.DaHIV, i.OffIn, 
           a.ART, a.DaArt, v.DatVisit, v.ARTnum, v.DaApp, a.nmonthART,
           if(a.nmonthART >= 6, ">6M", "<6M") as Startartstatus,
           datediff(v.DaApp, v.DatVisit) as ndays,
           if(datediff(v.DaApp, v.DatVisit) > 80, "MMD", "Not-MMD") as MMDStatus,
           rd.drugname,
           if(left(i.clinicid, 1) = "P" and rd.TLDStatus != "TLD" and LOCATE('DTG', drugname) > 0, 
              "TLD", rd.TLDStatus) as TLDStatus,
           vl.DateResult, vl.HIVLoad, vl.VLdostatus, vl.vlresultstatus,
           tp.Tptdrugname, tp.dateStart, tp.Datestop, tp.duration,
           if(left(tp.Tptdrugname, 1) = 3 and tp.duration >= 2.50, "TPT Complete",
              if(left(tp.Tptdrugname, 1) = 6 and tp.duration >= 5.50, "TPT Complete",
                 if(tp.Tptdrugname is null, "Not Start", "Not complete"))) as tptstatus 
    from tblvisit v
    left join tblimain i on i.clinicid = v.clinicid
    left join tblart a on a.clinicid = v.clinicid
    left join tblexit e on v.clinicid = e.clinicid
    left join tblarvdrug rd on rd.vid = v.vid
    left join tblvltested vl on vl.clinicid = v.clinicid
    left join tbltptdrug tp on tp.clinicid = v.clinicid
    where id = 1 and e.status is null and a.ART is not null 
)

select '10.1. Eligible MMD' as Indicator, 
       sum(if(sex = 1 and typepatients = '≤14', 1, 0)) as Male_0_14,
       sum(if(sex = 0 and typepatients = '≤14', 1, 0)) as Female_0_14,
       sum(if(sex = 1 and typepatients = '15+', 1, 0)) as Male_over_14,
       sum(if(sex = 0 and typepatients = '15+', 1, 0)) as Female_over_14,
       count(*) as TOTAL
from tblactive
where ART is not null and Startartstatus = '>6M';


-- =====================================================

-- =====================================================
-- INDICATOR 32: 10.1 ELIGIBLE MMD DETAILS
-- File: 10.1_eligible_mmd_details.sql
-- =====================================================

-- =====================================================
-- 10.1 ELIGIBLE MMD DETAILS
-- Generated: 2025-10-16T17:34:57.199Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 10.1: Eligible MMD - Detailed Records (matching corrected aggregate logic)
WITH tblactive AS (
    WITH tblvisit AS (
        SELECT clinicid, DatVisit, ARTnum, DaApp, vid, 
               ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblavmain 
        WHERE DatVisit <= @EndDate
        UNION ALL 
        SELECT clinicid, DatVisit, ARTnum, DaApp, vid, 
               ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblcvmain 
        WHERE DatVisit <= @EndDate
    ),
    
    tblimain AS (
        SELECT ClinicID, DafirstVisit, "15+" AS typepatients, TypeofReturn, LClinicID, 
               SiteNameold, DaBirth, TIMESTAMPDIFF(YEAR, DaBirth, @EndDate) AS age, 
               Sex, DaHIV, OffIn
        FROM tblaimain 
        WHERE DafirstVisit <= @EndDate
        UNION ALL 
        SELECT ClinicID, DafirstVisit, "≤14" AS typepatients, '' AS TypeofReturn, 
               LClinicID, SiteNameold, DaBirth, TIMESTAMPDIFF(YEAR, DaBirth, @EndDate) AS age, 
               Sex, DaTest AS DaHIV, OffIn
        FROM tblcimain 
        WHERE DafirstVisit <= @EndDate
    ),
    
    tblart AS (
        SELECT *, TIMESTAMPDIFF(MONTH, DaArt, @EndDate) AS nmonthART 
        FROM tblaart 
        WHERE DaArt <= @EndDate 
        UNION ALL 
        SELECT *, TIMESTAMPDIFF(MONTH, DaArt, @EndDate) AS nmonthART 
        FROM tblcart 
        WHERE DaArt <= @EndDate
    ),
    
    tblexit AS (
        SELECT * 
        FROM tblavpatientstatus 
        WHERE da <= @EndDate  
        UNION ALL 
        SELECT * 
        FROM tblcvpatientstatus  
        WHERE da <= @EndDate
    ),
    
    tblarvdrug AS (
        WITH tbldrug AS (
            SELECT vid, GROUP_CONCAT(DISTINCT DrugName ORDER BY DrugName ASC SEPARATOR '+') AS drugname 
            FROM tblavarvdrug 
            WHERE status <> 1 
            GROUP BY vid 
            UNION ALL 
            SELECT vid, GROUP_CONCAT(DISTINCT DrugName ORDER BY DrugName ASC SEPARATOR '+') AS drugname 
            FROM tblcvarvdrug 
            WHERE status <> 1 
            GROUP BY vid
        )
        SELECT vid, drugname, 
               IF(LOCATE('3TC+DTG+TDF', drugname) > 0, "TLD", "Not-TLD") AS TLDStatus 
        FROM tbldrug
    ),
    
    tblvltested AS (
        WITH tblvltest AS (
            SELECT ClinicID, IF(DaArrival < Dat, Dat, DaArrival) AS DateResult, HIVLoad 
            FROM tblpatienttest 
            WHERE HIVLoad != ''
            HAVING DateResult <= @EndDate
        ) 
        SELECT DISTINCT ClinicID, DateResult, HIVLoad,
               IF(DateResult > datelast, "Do_VL_in_12M", "Do_VL_greatn_12M") AS VLdostatus,
               IF(HIVLoad < 1000, "VL-Suppression", "Not-Suppression") AS vlresultstatus  
        FROM (
            SELECT ClinicID, DateResult, HIVLoad, 
                   DATE_SUB(@EndDate, INTERVAL 1 YEAR) AS datelast, 
                   ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DateResult DESC) AS id 
            FROM tblvltest 
        ) pt 
        WHERE pt.id = 1
    ),
    
    tbltptdrug AS (
        WITH tbltptdrugs AS (
            SELECT DrugName, Status, Da, Vid 
            FROM tblavtptdrug 
            WHERE DrugName != "B6" 
            UNION ALL 
            SELECT DrugName, Status, Da, Vid 
            FROM tblcvtptdrug 
            WHERE DrugName != "B6"
        ),
        
        tblvisit AS (
            SELECT clinicid, DatVisit, vid 
            FROM tblavmain 
            UNION ALL 
            SELECT clinicid, DatVisit, vid 
            FROM tblcvmain 
        ),
        
        tbltptall AS (
            SELECT clinicid, DatVisit, DrugName, Status, Da 
            FROM tbltptdrugs tp 
            LEFT JOIN tblvisit v ON tp.vid = v.vid
        ),
        
        tbltptstart AS (
            SELECT * 
            FROM (
                SELECT *, ROW_NUMBER() OVER(PARTITION BY clinicid ORDER BY DatVisit ASC) AS id 
                FROM tbltptall 
                WHERE status = 0 AND DatVisit <= @EndDate
            ) s 
            WHERE id = 1
        ),
        
        tbltptstope AS (
            SELECT * 
            FROM (
                SELECT *, ROW_NUMBER() OVER(PARTITION BY clinicid ORDER BY Da DESC) AS id 
                FROM tbltptall 
                WHERE status = 1 AND Da <= @EndDate
            ) s 
            WHERE id = 1
        )
        
        SELECT s.clinicid, s.DatVisit AS dateStart, s.DrugName AS Tptdrugname, 
               st.da AS Datestop, DATEDIFF(st.da, s.DatVisit) / 30 AS duration  
        FROM tbltptstart s
        LEFT JOIN tbltptstope st ON s.clinicid = st.clinicid
    )

    SELECT i.clinicid, i.DafirstVisit, i.typepatients, i.TypeofReturn, i.LClinicID, 
           i.SiteNameold, i.DaBirth, i.age, i.Sex, i.DaHIV, i.OffIn,
           a.ART, a.DaArt, v.DatVisit, v.ARTnum, v.DaApp, a.nmonthART,
           IF(a.nmonthART >= 6, ">6M", "<6M") AS Startartstatus,
           DATEDIFF(v.DaApp, v.DatVisit) AS ndays,
           IF(DATEDIFF(v.DaApp, v.DatVisit) > 80, "MMD", "Not-MMD") AS MMDStatus,
           rd.drugname,
           IF(LEFT(i.clinicid, 1) = "P" AND rd.TLDStatus != "TLD" AND LOCATE('DTG', drugname) > 0, 
              "TLD", rd.TLDStatus) AS TLDStatus,
           vl.DateResult, vl.HIVLoad, vl.VLdostatus, vl.vlresultstatus,
           tp.Tptdrugname, tp.dateStart, tp.Datestop, tp.duration,
           IF(LEFT(tp.Tptdrugname, 1) = 3 AND tp.duration >= 2.50, "TPT Complete",
              IF(LEFT(tp.Tptdrugname, 1) = 6 AND tp.duration >= 5.50, "TPT Complete",
                 IF(tp.Tptdrugname IS NULL, "Not Start", "Not complete"))) AS tptstatus 
    FROM tblvisit v
    LEFT JOIN tblimain i ON i.clinicid = v.clinicid
    LEFT JOIN tblart a ON a.clinicid = v.clinicid
    LEFT JOIN tblexit e ON v.clinicid = e.clinicid
    LEFT JOIN tblarvdrug rd ON rd.vid = v.vid
    LEFT JOIN tblvltested vl ON vl.clinicid = v.clinicid
    LEFT JOIN tbltptdrug tp ON tp.clinicid = v.clinicid
    WHERE id = 1 AND e.status IS NULL AND a.ART IS NOT NULL 
)

SELECT
    '10.1' as step,
    clinicid,
    Sex AS sex,
    CASE 
        WHEN Sex = 0 THEN 'Female'
        WHEN Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END AS sex_display,
    typepatients,
    age,
    CASE 
        WHEN typepatients = '15+' THEN 'Adult'
        WHEN typepatients = '≤14' THEN 'Child'
        ELSE 'Unknown'
    END AS patient_type,
    ART,
    DaArt,
    DafirstVisit,
    DaBirth,
    DatVisit AS datevisit,
    OffIn,
    CASE 
        WHEN OffIn = 0 THEN 'Not Transferred'
        WHEN OffIn = 2 THEN 'Transferred In'
        WHEN OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', OffIn)
    END AS transfer_status,
    Startartstatus,
    MMDStatus,
    TLDStatus,
    tptstatus
FROM tblactive
WHERE ART IS NOT NULL AND Startartstatus = '>6M'
ORDER BY DaArt DESC, clinicid;

-- =====================================================

-- =====================================================
-- INDICATOR 33: 10.2 MMD
-- File: 10.2_mmd.sql
-- =====================================================

-- =====================================================
-- 10.2 MMD
-- Generated: 2025-10-16T17:34:57.199Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- MMD

WITH tblactive AS (
    -- Visit data from both adult and child tables
    WITH tblvisit AS (
        SELECT 
            clinicid,
            DatVisit,
            ARTnum,
            DaApp,
            vid,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblavmain 
        WHERE DatVisit <= @EndDate
        
        UNION ALL 
        
        SELECT 
            clinicid,
            DatVisit,
            ARTnum,
            DaApp,
            vid,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblcvmain 
        WHERE DatVisit <= @EndDate
    ),
    
    -- Patient main information (adults and children)
    tblimain AS (
        SELECT 
            ClinicID,
            DafirstVisit,
            "15+" AS typepatients,
            TypeofReturn,
            LClinicID,
            SiteNameold,
            DaBirth,
            TIMESTAMPDIFF(YEAR, DaBirth, @EndDate) AS age,
            Sex,
            DaHIV,
            OffIn 
        FROM tblaimain 
        WHERE DafirstVisit <= @EndDate
        
        UNION ALL 
        
        SELECT 
            ClinicID,
            DafirstVisit,
            "≤14" AS typepatients,
            '' AS TypeofReturn,
            LClinicID,
            SiteNameold,
            DaBirth,
            TIMESTAMPDIFF(YEAR, DaBirth, @EndDate) AS age,
            Sex,
            DaTest AS DaHIV,
            OffIn 
        FROM tblcimain 
        WHERE DafirstVisit <= @EndDate
    ),
    
    -- ART start information
    tblart AS (
        SELECT 
            *,
            TIMESTAMPDIFF(MONTH, DaArt, @EndDate) AS nmonthART 
        FROM tblaart 
        WHERE DaArt <= @EndDate
        
        UNION ALL 
        
        SELECT 
            *,
            TIMESTAMPDIFF(MONTH, DaArt, @EndDate) AS nmonthART 
        FROM tblcart 
        WHERE DaArt <= @EndDate
    ),
    
    -- Patient exit/status information
    tblexit AS (
        SELECT * 
        FROM tblavpatientstatus 
        WHERE da <= @EndDate
        
        UNION ALL 
        
        SELECT * 
        FROM tblcvpatientstatus  
        WHERE da <= @EndDate
    ),
    
    -- ARV drug information
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
    ),
    
    -- Viral load testing information
    tblvltested AS (
        WITH tblvltest AS (
            SELECT 
                ClinicID,
                IF(DaArrival < Dat, Dat, DaArrival) AS DateResult,
                HIVLoad 
            FROM tblpatienttest 
            WHERE HIVLoad != ''
            HAVING DateResult <= @EndDate
        ) 
        SELECT DISTINCT 
            ClinicID,
            DateResult,
            HIVLoad,
            IF(DateResult > datelast, "Do_VL_in_12M", "Do_VL_greatn_12M") AS VLdostatus,
            IF(HIVLoad < 1000, "VL-Suppression", "Not-Suppression") AS vlresultstatus  
        FROM (
            SELECT 
                ClinicID,
                DateResult,
                HIVLoad,
                DATE_SUB(@EndDate, INTERVAL 1 YEAR) AS datelast, 
                ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DateResult DESC) AS id 
            FROM tblvltest 
        ) pt 
        WHERE pt.id = 1
    ),
    
    -- TPT drug information
    tbltptdrug AS (
        WITH tbltptdrugs AS (
            SELECT 
                DrugName, 
                Status, 
                Da, 
                Vid 
            FROM tblavtptdrug 
            WHERE DrugName != "B6"
            
            UNION ALL 
            
            SELECT 
                DrugName, 
                Status, 
                Da, 
                Vid 
            FROM tblcvtptdrug 
            WHERE DrugName != "B6"
        ),
        tblvisit AS (
            SELECT clinicid, DatVisit, vid 
            FROM tblavmain 
            
            UNION ALL 
            
            SELECT clinicid, DatVisit, vid 
            FROM tblcvmain 
        ),
        tbltptall AS (
            SELECT 
                clinicid,
                DatVisit,
                DrugName, 
                Status, 
                Da 
            FROM tbltptdrugs tp 
            LEFT JOIN tblvisit v ON tp.vid = v.vid
        ),
        tbltptstart AS (
            SELECT * 
            FROM (
                SELECT 
                    *,
                    ROW_NUMBER() OVER(PARTITION BY clinicid ORDER BY DatVisit ASC) AS id 
                FROM tbltptall 
                WHERE status = 0 AND DatVisit <= @EndDate
            ) s 
            WHERE id = 1
        ),
        tbltptstope AS (
            SELECT * 
            FROM (
                SELECT 
                    *,
                    ROW_NUMBER() OVER(PARTITION BY clinicid ORDER BY Da DESC) AS id 
                FROM tbltptall 
                WHERE status = 1 AND Da <= @EndDate
            ) s 
            WHERE id = 1
        )
        SELECT 
            s.clinicid,
            s.DatVisit AS dateStart,
            s.DrugName AS Tptdrugname,
            st.da AS Datestop,
            DATEDIFF(st.da, s.DatVisit) / 30 AS duration  
        FROM tbltptstart s
        LEFT JOIN tbltptstope st ON s.clinicid = st.clinicid
    )

    -- Main query combining all data
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
        CASE 
            WHEN DATEDIFF(v.DaApp, v.DatVisit) <= 80 THEN "Not-MMD"
            WHEN DATEDIFF(v.DaApp, v.DatVisit) BETWEEN 81 AND 100 THEN "3M"
            WHEN DATEDIFF(v.DaApp, v.DatVisit) BETWEEN 101 AND 130 THEN "4M"
            WHEN DATEDIFF(v.DaApp, v.DatVisit) BETWEEN 131 AND 160 THEN "5M"
            WHEN DATEDIFF(v.DaApp, v.DatVisit) >= 161 THEN "6M"
            ELSE "Not-MMD"
        END AS MMDStatus,
        rd.drugname,
        IF(LEFT(i.clinicid, 1) = "P" AND rd.TLDStatus != "TLD" AND LOCATE('DTG', drugname) > 0, 
           "TLD", rd.TLDStatus) AS TLDStatus,
        vl.DateResult,
        vl.HIVLoad,
        vl.VLdostatus,
        vl.vlresultstatus,
        tp.Tptdrugname,
        tp.dateStart,
        tp.Datestop,
        tp.duration,
        IF(LEFT(tp.Tptdrugname, 1) = 3 AND tp.duration >= 2.50, "TPT Complete",
           IF(LEFT(tp.Tptdrugname, 1) = 6 AND tp.duration >= 5.50, "TPT Complete",
              IF(tp.Tptdrugname IS NULL, "Not Start", "Not complete"))) AS tptstatus 
    FROM tblvisit v
    LEFT JOIN tblimain i ON i.clinicid = v.clinicid
    LEFT JOIN tblart a ON a.clinicid = v.clinicid
    LEFT JOIN tblexit e ON v.clinicid = e.clinicid
    LEFT JOIN tblarvdrug rd ON rd.vid = v.vid
    LEFT JOIN tblvltested vl ON vl.clinicid = v.clinicid
    LEFT JOIN tbltptdrug tp ON tp.clinicid = v.clinicid
    WHERE id = 1 AND e.status IS NULL AND a.ART IS NOT NULL
)

SELECT 
    '10.2. MMD' AS Indicator, 
    SUM(IF(sex = 1 AND typepatients = '≤14', 1, 0)) AS Male_0_14,
    SUM(IF(sex = 0 AND typepatients = '≤14', 1, 0)) AS Female_0_14,
    SUM(IF(sex = 1 AND typepatients = '15+', 1, 0)) AS Male_over_14,
    SUM(IF(sex = 0 AND typepatients = '15+', 1, 0)) AS Female_over_14,
    COUNT(*) AS TOTAL
FROM tblactive
WHERE ART IS NOT NULL
    AND Startartstatus = '>6M' 
    AND MMDStatus IN ('3M', '4M', '5M', '6M');


-- =====================================================

-- =====================================================
-- INDICATOR 34: 10.2 MMD DETAILS
-- File: 10.2_mmd_details.sql
-- =====================================================

-- =====================================================
-- 10.2 MMD DETAILS
-- Generated: 2025-10-16T17:34:57.200Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- 10.2 MMD - Detailed Records (matching corrected aggregate logic)
WITH tblactive AS (
    -- Visit data from both adult and child tables
    WITH tblvisit AS (
        SELECT 
            clinicid,
            DatVisit,
            ARTnum,
            DaApp,
            vid,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblavmain 
        WHERE DatVisit <= @EndDate
        
        UNION ALL 
        
        SELECT 
            clinicid,
            DatVisit,
            ARTnum,
            DaApp,
            vid,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblcvmain 
        WHERE DatVisit <= @EndDate
    ),
    
    -- Patient main information (adults and children)
    tblimain AS (
        SELECT 
            ClinicID,
            DafirstVisit,
            "15+" AS typepatients,
            TypeofReturn,
            LClinicID,
            SiteNameold,
            DaBirth,
            TIMESTAMPDIFF(YEAR, DaBirth, @EndDate) AS age,
            Sex,
            DaHIV,
            OffIn 
        FROM tblaimain 
        WHERE DafirstVisit <= @EndDate
        
        UNION ALL 
        
        SELECT 
            ClinicID,
            DafirstVisit,
            "≤14" AS typepatients,
            '' AS TypeofReturn,
            LClinicID,
            SiteNameold,
            DaBirth,
            TIMESTAMPDIFF(YEAR, DaBirth, @EndDate) AS age,
            Sex,
            DaTest AS DaHIV,
            OffIn 
        FROM tblcimain 
        WHERE DafirstVisit <= @EndDate
    ),
    
    -- ART start information
    tblart AS (
        SELECT 
            *,
            TIMESTAMPDIFF(MONTH, DaArt, @EndDate) AS nmonthART 
        FROM tblaart 
        WHERE DaArt <= @EndDate
        
        UNION ALL 
        
        SELECT 
            *,
            TIMESTAMPDIFF(MONTH, DaArt, @EndDate) AS nmonthART 
        FROM tblcart 
        WHERE DaArt <= @EndDate
    ),
    
    -- Patient exit/status information
    tblexit AS (
        SELECT * 
        FROM tblavpatientstatus 
        WHERE da <= @EndDate
        
        UNION ALL 
        
        SELECT * 
        FROM tblcvpatientstatus  
        WHERE da <= @EndDate
    ),
    
    -- ARV drug information
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
    ),
    
    -- Viral load testing information
    tblvltested AS (
        WITH tblvltest AS (
            SELECT 
                ClinicID,
                IF(DaArrival < Dat, Dat, DaArrival) AS DateResult,
                HIVLoad 
            FROM tblpatienttest 
            WHERE HIVLoad != ''
            HAVING DateResult <= @EndDate
        ) 
        SELECT DISTINCT 
            ClinicID,
            DateResult,
            HIVLoad,
            IF(DateResult > datelast, "Do_VL_in_12M", "Do_VL_greatn_12M") AS VLdostatus,
            IF(HIVLoad < 1000, "VL-Suppression", "Not-Suppression") AS vlresultstatus  
        FROM (
            SELECT 
                ClinicID,
                DateResult,
                HIVLoad,
                DATE_SUB(@EndDate, INTERVAL 1 YEAR) AS datelast, 
                ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DateResult DESC) AS id 
            FROM tblvltest 
        ) pt 
        WHERE pt.id = 1
    ),
    
    -- TPT drug information
    tbltptdrug AS (
        WITH tbltptdrugs AS (
            SELECT 
                DrugName, 
                Status, 
                Da, 
                Vid 
            FROM tblavtptdrug 
            WHERE DrugName != "B6"
            
            UNION ALL 
            
            SELECT 
                DrugName, 
                Status, 
                Da, 
                Vid 
            FROM tblcvtptdrug 
            WHERE DrugName != "B6"
        ),
        tblvisit AS (
            SELECT clinicid, DatVisit, vid 
            FROM tblavmain 
            
            UNION ALL 
            
            SELECT clinicid, DatVisit, vid 
            FROM tblcvmain 
        ),
        tbltptall AS (
            SELECT 
                clinicid,
                DatVisit,
                DrugName, 
                Status, 
                Da 
            FROM tbltptdrugs tp 
            LEFT JOIN tblvisit v ON tp.vid = v.vid
        ),
        tbltptstart AS (
            SELECT * 
            FROM (
                SELECT 
                    *,
                    ROW_NUMBER() OVER(PARTITION BY clinicid ORDER BY DatVisit ASC) AS id 
                FROM tbltptall 
                WHERE status = 0 AND DatVisit <= @EndDate
            ) s 
            WHERE id = 1
        ),
        tbltptstope AS (
            SELECT * 
            FROM (
                SELECT 
                    *,
                    ROW_NUMBER() OVER(PARTITION BY clinicid ORDER BY Da DESC) AS id 
                FROM tbltptall 
                WHERE status = 1 AND Da <= @EndDate
            ) s 
            WHERE id = 1
        )
        SELECT 
            s.clinicid,
            s.DatVisit AS dateStart,
            s.DrugName AS Tptdrugname,
            st.da AS Datestop,
            DATEDIFF(st.da, s.DatVisit) / 30 AS duration  
        FROM tbltptstart s
        LEFT JOIN tbltptstope st ON s.clinicid = st.clinicid
    )

    -- Main query combining all data
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
        v.DatVisit AS DatVisit, 
        v.ARTnum, 
        v.DaApp,
        a.nmonthART,
        IF(a.nmonthART >= 6, ">6M", "<6M") AS Startartstatus,
        DATEDIFF(v.DaApp, v.DatVisit) AS ndays,
        CASE 
            WHEN DATEDIFF(v.DaApp, v.DatVisit) <= 80 THEN "Not-MMD"
            WHEN DATEDIFF(v.DaApp, v.DatVisit) BETWEEN 81 AND 100 THEN "3M"
            WHEN DATEDIFF(v.DaApp, v.DatVisit) BETWEEN 101 AND 130 THEN "4M"
            WHEN DATEDIFF(v.DaApp, v.DatVisit) BETWEEN 131 AND 160 THEN "5M"
            WHEN DATEDIFF(v.DaApp, v.DatVisit) >= 161 THEN "6M"
            ELSE "Not-MMD"
        END AS MMDStatus,
        rd.drugname,
        IF(LEFT(i.clinicid, 1) = "P" AND rd.TLDStatus != "TLD" AND LOCATE('DTG', drugname) > 0, 
           "TLD", rd.TLDStatus) AS TLDStatus,
        vl.DateResult,
        vl.HIVLoad,
        vl.VLdostatus,
        vl.vlresultstatus,
        tp.Tptdrugname,
        tp.dateStart,
        tp.Datestop,
        tp.duration,
        IF(LEFT(tp.Tptdrugname, 1) = 3 AND tp.duration >= 2.50, "TPT Complete",
           IF(LEFT(tp.Tptdrugname, 1) = 6 AND tp.duration >= 5.50, "TPT Complete",
              IF(tp.Tptdrugname IS NULL, "Not Start", "Not complete"))) AS tptstatus 
    FROM tblvisit v
    LEFT JOIN tblimain i ON i.clinicid = v.clinicid
    LEFT JOIN tblart a ON a.clinicid = v.clinicid
    LEFT JOIN tblexit e ON v.clinicid = e.clinicid
    LEFT JOIN tblarvdrug rd ON rd.vid = v.vid
    LEFT JOIN tblvltested vl ON vl.clinicid = v.clinicid
    LEFT JOIN tbltptdrug tp ON tp.clinicid = v.clinicid
    WHERE id = 1 AND e.status IS NULL AND a.ART IS NOT NULL
)

SELECT
    '10.2' as step,
    clinicid,
    Sex AS sex,
    CASE 
        WHEN Sex = 0 THEN 'Female'
        WHEN Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END AS sex_display,
    typepatients,
    age,
    CASE 
        WHEN typepatients = '15+' THEN 'Adult'
        WHEN typepatients = '≤14' THEN 'Child'
        ELSE 'Unknown'
    END AS patient_type,
    ART,
    DaArt,
    DafirstVisit,
    DaBirth,
    DatVisit AS datevisit,
    OffIn,
    CASE 
        WHEN OffIn = 0 THEN 'Not Transferred'
        WHEN OffIn = 2 THEN 'Transferred In'
        WHEN OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', OffIn)
    END AS transfer_status,
    Startartstatus,
    MMDStatus,
    TLDStatus,
    tptstatus
FROM tblactive
WHERE ART IS NOT NULL
    AND Startartstatus = '>6M' 
    AND MMDStatus IN ('3M', '4M', '5M', '6M')
ORDER BY DaArt DESC, clinicid;

-- =====================================================

-- =====================================================
-- INDICATOR 35: 10.3 TLD
-- File: 10.3_tld.sql
-- =====================================================

-- =====================================================
-- 10.3 TLD
-- Generated: 2025-10-16T17:34:57.200Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- TLD

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
        WHERE DatVisit <= @EndDate
        
        UNION ALL 
        
        SELECT 
            clinicid,
            DatVisit,
            ARTnum,
            DaApp,
            vid,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblcvmain 
        WHERE DatVisit <= @EndDate
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
            TIMESTAMPDIFF(YEAR, DaBirth, @EndDate) AS age,
            Sex,
            DaHIV,
            OffIn 
        FROM tblaimain 
        WHERE DafirstVisit <= @EndDate
        
        UNION ALL 
        
        SELECT 
            ClinicID,
            DafirstVisit,
            "≤14" AS typepatients,
            '' AS TypeofReturn,
            LClinicID,
            SiteNameold,
            DaBirth,
            TIMESTAMPDIFF(YEAR, DaBirth, @EndDate) AS age,
            Sex,
            DaTest AS DaHIV,
            OffIn 
        FROM tblcimain 
        WHERE DafirstVisit <= @EndDate
    ),
    
    tblart AS (
        SELECT 
            *,
            TIMESTAMPDIFF(MONTH, DaArt, @EndDate) AS nmonthART 
        FROM tblaart 
        WHERE DaArt <= @EndDate
        
        UNION ALL 
        
        SELECT 
            *,
            TIMESTAMPDIFF(MONTH, DaArt, @EndDate) AS nmonthART 
        FROM tblcart 
        WHERE DaArt <= @EndDate
    ),
    
    tblexit AS (
        SELECT * 
        FROM tblavpatientstatus 
        WHERE da <= @EndDate
        
        UNION ALL 
        
        SELECT * 
        FROM tblcvpatientstatus  
        WHERE da <= @EndDate
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
    ),
    
    tblvltested AS (
        WITH tblvltest AS (
            SELECT 
                ClinicID,
                IF(DaArrival < Dat, Dat, DaArrival) AS DateResult,
                HIVLoad 
            FROM tblpatienttest 
            WHERE HIVLoad != ''
            HAVING DateResult <= @EndDate
        ) 
        SELECT DISTINCT 
            ClinicID,
            DateResult,
            HIVLoad,
            IF(DateResult > datelast, "Do_VL_in_12M", "Do_VL_greatn_12M") AS VLdostatus,
            IF(HIVLoad < 1000, "VL-Suppression", "Not-Suppression") AS vlresultstatus  
        FROM (
            SELECT 
                ClinicID,
                DateResult,
                HIVLoad,
                DATE_SUB(@EndDate, INTERVAL 1 YEAR) AS datelast, 
                ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DateResult DESC) AS id 
            FROM tblvltest 
        ) pt 
        WHERE pt.id = 1
    ),
    
    tbltptdrug AS (
        WITH tbltptdrugs AS (
            SELECT 
                DrugName, 
                Status, 
                Da, 
                Vid 
            FROM tblavtptdrug 
            WHERE DrugName != "B6"
            
            UNION ALL 
            
            SELECT 
                DrugName, 
                Status, 
                Da, 
                Vid 
            FROM tblcvtptdrug 
            WHERE DrugName != "B6"
        ),
        
        tblvisit AS (
            SELECT 
                clinicid,
                DatVisit,
                vid 
            FROM tblavmain 
            
            UNION ALL 
            
            SELECT 
                clinicid,
                DatVisit,
                vid 
            FROM tblcvmain 
        ),
        
        tbltptall AS (
            SELECT 
                clinicid,
                DatVisit,
                DrugName, 
                Status, 
                Da 
            FROM tbltptdrugs tp 
            LEFT JOIN tblvisit v ON tp.vid = v.vid
        ),
        
        tbltptstart AS (
            SELECT * 
            FROM (
                SELECT 
                    *,
                    ROW_NUMBER() OVER(PARTITION BY clinicid ORDER BY DatVisit ASC) AS id 
                FROM tbltptall 
                WHERE status = 0 AND DatVisit <= @EndDate
            ) s 
            WHERE id = 1
        ),
        
        tbltptstope AS (
            SELECT * 
            FROM (
                SELECT 
                    *,
                    ROW_NUMBER() OVER(PARTITION BY clinicid ORDER BY Da DESC) AS id 
                FROM tbltptall 
                WHERE status = 1 AND Da <= @EndDate
            ) s 
            WHERE id = 1
        )
        
        SELECT 
            s.clinicid,
            s.DatVisit AS dateStart,
            s.DrugName AS Tptdrugname,
            st.da AS Datestop,
            DATEDIFF(st.da, s.DatVisit) / 30 AS duration  
        FROM tbltptstart s
        LEFT JOIN tbltptstope st ON s.clinicid = st.clinicid
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
        IF(LEFT(i.clinicid, 1) = "P" AND rd.TLDStatus != "TLD" AND LOCATE('DTG', drugname) > 0, "TLD", rd.TLDStatus) AS TLDStatus,
        vl.DateResult,
        vl.HIVLoad,
        vl.VLdostatus,
        vl.vlresultstatus,
        tp.Tptdrugname,
        tp.dateStart,
        tp.Datestop,
        tp.duration,
        IF(LEFT(tp.Tptdrugname, 1) = 3 AND tp.duration >= 2.50, "TPT Complete",
           IF(LEFT(tp.Tptdrugname, 1) = 6 AND tp.duration >= 5.50, "TPT Complete",
              IF(tp.Tptdrugname IS NULL, "Not Start", "Not complete"))) AS tptstatus 
    FROM tblvisit v
    LEFT JOIN tblimain i ON i.clinicid = v.clinicid
    LEFT JOIN tblart a ON a.clinicid = v.clinicid
    LEFT JOIN tblexit e ON v.clinicid = e.clinicid
    LEFT JOIN tblarvdrug rd ON rd.vid = v.vid
    LEFT JOIN tblvltested vl ON vl.clinicid = v.clinicid
    LEFT JOIN tbltptdrug tp ON tp.clinicid = v.clinicid
    WHERE id = 1 AND e.status IS NULL AND a.ART IS NOT NULL
)

SELECT 
    '10.3. TLD' AS Indicator, 
    SUM(IF(sex = 1 AND typepatients = '≤14', 1, 0)) AS Male_0_14,
    SUM(IF(sex = 0 AND typepatients = '≤14', 1, 0)) AS Female_0_14,
    SUM(IF(sex = 1 AND typepatients = '15+', 1, 0)) AS Male_over_14,
    SUM(IF(sex = 0 AND typepatients = '15+', 1, 0)) AS Female_over_14,
    COUNT(*) AS TOTAL
FROM tblactive
WHERE ART IS NOT NULL
    AND TLDStatus = 'TLD';


-- =====================================================

-- =====================================================
-- INDICATOR 36: 10.3 TLD DETAILS
-- File: 10.3_tld_details.sql
-- =====================================================

-- =====================================================
-- 10.3 TLD DETAILS
-- Generated: 2025-10-16T17:34:57.200Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- 10.3 TLD - Detailed Records (matching corrected aggregate logic)
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
        WHERE DatVisit <= @EndDate
        
        UNION ALL 
        
        SELECT 
            clinicid,
            DatVisit,
            ARTnum,
            DaApp,
            vid,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblcvmain 
        WHERE DatVisit <= @EndDate
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
            TIMESTAMPDIFF(YEAR, DaBirth, @EndDate) AS age,
            Sex,
            DaHIV,
            OffIn 
        FROM tblaimain 
        WHERE DafirstVisit <= @EndDate
        
        UNION ALL 
        
        SELECT 
            ClinicID,
            DafirstVisit,
            "≤14" AS typepatients,
            '' AS TypeofReturn,
            LClinicID,
            SiteNameold,
            DaBirth,
            TIMESTAMPDIFF(YEAR, DaBirth, @EndDate) AS age,
            Sex,
            DaTest AS DaHIV,
            OffIn 
        FROM tblcimain 
        WHERE DafirstVisit <= @EndDate
    ),
    
    tblart AS (
        SELECT 
            *,
            TIMESTAMPDIFF(MONTH, DaArt, @EndDate) AS nmonthART 
        FROM tblaart 
        WHERE DaArt <= @EndDate
        
        UNION ALL 
        
        SELECT 
            *,
            TIMESTAMPDIFF(MONTH, DaArt, @EndDate) AS nmonthART 
        FROM tblcart 
        WHERE DaArt <= @EndDate
    ),
    
    tblexit AS (
        SELECT * 
        FROM tblavpatientstatus 
        WHERE da <= @EndDate
        
        UNION ALL 
        
        SELECT * 
        FROM tblcvpatientstatus  
        WHERE da <= @EndDate
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
    ),
    
    tblvltested AS (
        WITH tblvltest AS (
            SELECT 
                ClinicID,
                IF(DaArrival < Dat, Dat, DaArrival) AS DateResult,
                HIVLoad 
            FROM tblpatienttest 
            WHERE HIVLoad != ''
            HAVING DateResult <= @EndDate
        ) 
        SELECT DISTINCT 
            ClinicID,
            DateResult,
            HIVLoad,
            IF(DateResult > datelast, "Do_VL_in_12M", "Do_VL_greatn_12M") AS VLdostatus,
            IF(HIVLoad < 1000, "VL-Suppression", "Not-Suppression") AS vlresultstatus  
        FROM (
            SELECT 
                ClinicID,
                DateResult,
                HIVLoad,
                DATE_SUB(@EndDate, INTERVAL 1 YEAR) AS datelast, 
                ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DateResult DESC) AS id 
            FROM tblvltest 
        ) pt 
        WHERE pt.id = 1
    ),
    
    tbltptdrug AS (
        WITH tbltptdrugs AS (
            SELECT 
                DrugName, 
                Status, 
                Da, 
                Vid 
            FROM tblavtptdrug 
            WHERE DrugName != "B6"
            
            UNION ALL 
            
            SELECT 
                DrugName, 
                Status, 
                Da, 
                Vid 
            FROM tblcvtptdrug 
            WHERE DrugName != "B6"
        ),
        
        tblvisit AS (
            SELECT 
                clinicid,
                DatVisit,
                vid 
            FROM tblavmain 
            
            UNION ALL 
            
            SELECT 
                clinicid,
                DatVisit,
                vid 
            FROM tblcvmain 
        ),
        
        tbltptall AS (
            SELECT 
                clinicid,
                DatVisit,
                DrugName, 
                Status, 
                Da 
            FROM tbltptdrugs tp 
            LEFT JOIN tblvisit v ON tp.vid = v.vid
        ),
        
        tbltptstart AS (
            SELECT * 
            FROM (
                SELECT 
                    *,
                    ROW_NUMBER() OVER(PARTITION BY clinicid ORDER BY DatVisit ASC) AS id 
                FROM tbltptall 
                WHERE status = 0 AND DatVisit <= @EndDate
            ) s 
            WHERE id = 1
        ),
        
        tbltptstope AS (
            SELECT * 
            FROM (
                SELECT 
                    *,
                    ROW_NUMBER() OVER(PARTITION BY clinicid ORDER BY Da DESC) AS id 
                FROM tbltptall 
                WHERE status = 1 AND Da <= @EndDate
            ) s 
            WHERE id = 1
        )
        
        SELECT 
            s.clinicid,
            s.DatVisit AS dateStart,
            s.DrugName AS Tptdrugname,
            st.da AS Datestop,
            DATEDIFF(st.da, s.DatVisit) / 30 AS duration  
        FROM tbltptstart s
        LEFT JOIN tbltptstope st ON s.clinicid = st.clinicid
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
        IF(LEFT(i.clinicid, 1) = "P" AND rd.TLDStatus != "TLD" AND LOCATE('DTG', drugname) > 0, "TLD", rd.TLDStatus) AS TLDStatus,
        vl.DateResult,
        vl.HIVLoad,
        vl.VLdostatus,
        vl.vlresultstatus,
        tp.Tptdrugname,
        tp.dateStart,
        tp.Datestop,
        tp.duration,
        IF(LEFT(tp.Tptdrugname, 1) = 3 AND tp.duration >= 2.50, "TPT Complete",
           IF(LEFT(tp.Tptdrugname, 1) = 6 AND tp.duration >= 5.50, "TPT Complete",
              IF(tp.Tptdrugname IS NULL, "Not Start", "Not complete"))) AS tptstatus 
    FROM tblvisit v
    LEFT JOIN tblimain i ON i.clinicid = v.clinicid
    LEFT JOIN tblart a ON a.clinicid = v.clinicid
    LEFT JOIN tblexit e ON v.clinicid = e.clinicid
    LEFT JOIN tblarvdrug rd ON rd.vid = v.vid
    LEFT JOIN tblvltested vl ON vl.clinicid = v.clinicid
    LEFT JOIN tbltptdrug tp ON tp.clinicid = v.clinicid
    WHERE id = 1 AND e.status IS NULL AND a.ART IS NOT NULL
)

SELECT
    '10.3' as step,
    clinicid,
    Sex AS sex,
    CASE 
        WHEN Sex = 0 THEN 'Female'
        WHEN Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END AS sex_display,
    typepatients,
    age,
    CASE 
        WHEN typepatients = '15+' THEN 'Adult'
        WHEN typepatients = '≤14' THEN 'Child'
        ELSE 'Unknown'
    END AS patient_type,
    ART,
    DaArt,
    DafirstVisit,
    DaBirth,
    OffIn,
    CASE 
        WHEN OffIn = 0 THEN 'Not Transferred'
        WHEN OffIn = 2 THEN 'Transferred In'
        WHEN OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', OffIn)
    END AS transfer_status,
    Startartstatus,
    MMDStatus,
    TLDStatus,
    tptstatus
FROM tblactive
WHERE ART IS NOT NULL
    AND TLDStatus = 'TLD'
ORDER BY DaArt DESC, clinicid;

-- =====================================================

-- =====================================================
-- INDICATOR 37: 10.4 TPT START
-- File: 10.4_tpt_start.sql
-- =====================================================

-- =====================================================
-- 10.4 TPT START
-- Generated: 2025-10-16T17:34:57.201Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- TPT Start

WITH tblactive AS (
    -- Visit data CTE
    WITH tblvisit AS (
        SELECT 
            clinicid,
            DatVisit,
            ARTnum,
            DaApp,
            vid,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblavmain 
        WHERE DatVisit <= @EndDate
        
        UNION ALL 
        
        SELECT 
            clinicid,
            DatVisit,
            ARTnum,
            DaApp,
            vid,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblcvmain 
        WHERE DatVisit <= @EndDate
    ),
    
    -- Patient main data CTE
    tblimain AS (
        SELECT 
            ClinicID,
            DafirstVisit,
            "15+" AS typepatients,
            TypeofReturn,
            LClinicID,
            SiteNameold,
            DaBirth,
            TIMESTAMPDIFF(YEAR, DaBirth, @EndDate) AS age,
            Sex,
            DaHIV,
            OffIn 
        FROM tblaimain 
        WHERE DafirstVisit <= @EndDate
        
        UNION ALL 
        
        SELECT 
            ClinicID,
            DafirstVisit,
            "≤14" AS typepatients,
            '' AS TypeofReturn,
            LClinicID,
            SiteNameold,
            DaBirth,
            TIMESTAMPDIFF(YEAR, DaBirth, @EndDate) AS age,
            Sex,
            DaTest AS DaHIV,
            OffIn 
        FROM tblcimain 
        WHERE DafirstVisit <= @EndDate
    ),
    
    -- ART data CTE
    tblart AS (
        SELECT 
            *,
            TIMESTAMPDIFF(MONTH, DaArt, @EndDate) AS nmonthART 
        FROM tblaart 
        WHERE DaArt <= @EndDate
        
        UNION ALL 
        
        SELECT 
            *,
            TIMESTAMPDIFF(MONTH, DaArt, @EndDate) AS nmonthART 
        FROM tblcart 
        WHERE DaArt <= @EndDate
    ),
    
    -- Exit status CTE
    tblexit AS (
        SELECT * FROM tblavpatientstatus WHERE da <= @EndDate
        UNION ALL 
        SELECT * FROM tblcvpatientstatus WHERE da <= @EndDate
    ),
    
    -- ARV drug combinations CTE
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
    ),
    
    -- Viral load testing CTE
    tblvltested AS (
        WITH tblvltest AS (
            SELECT 
                ClinicID,
                IF(DaArrival < Dat, Dat, DaArrival) AS DateResult,
                HIVLoad 
            FROM tblpatienttest 
            WHERE HIVLoad != ''
            HAVING DateResult <= @EndDate
        ) 
        SELECT DISTINCT 
            ClinicID,
            DateResult,
            HIVLoad,
            IF(DateResult > datelast, "Do_VL_in_12M", "Do_VL_greatn_12M") AS VLdostatus,
            IF(HIVLoad < 1000, "VL-Suppression", "Not-Suppression") AS vlresultstatus  
        FROM (
            SELECT 
                ClinicID,
                DateResult,
                HIVLoad,
                DATE_SUB(@EndDate, INTERVAL 1 YEAR) AS datelast, 
                ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DateResult DESC) AS id 
            FROM tblvltest 
        ) pt 
        WHERE pt.id = 1
    ),
    
    -- TPT drug data CTE
    tbltptdrug AS (
        WITH tbltptdrugs AS (
            SELECT DrugName, Status, Da, Vid 
            FROM tblavtptdrug 
            WHERE DrugName != "B6"
            
            UNION ALL 
            
            SELECT DrugName, Status, Da, Vid 
            FROM tblcvtptdrug 
            WHERE DrugName != "B6"
        ),
        tblvisit AS (
            SELECT clinicid, DatVisit, vid 
            FROM tblavmain 
            
            UNION ALL 
            
            SELECT clinicid, DatVisit, vid 
            FROM tblcvmain 
        ),
        tbltptall AS (
            SELECT 
                clinicid,
                DatVisit,
                DrugName, 
                Status, 
                Da 
            FROM tbltptdrugs tp 
            LEFT JOIN tblvisit v ON tp.vid = v.vid
        ),
        tbltptstart AS (
            SELECT * 
            FROM (
                SELECT 
                    *,
                    ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit ASC) AS id 
                FROM tbltptall 
                WHERE status = 0 AND DatVisit <= @EndDate
            ) s 
            WHERE id = 1
        ),
        tbltptstope AS (
            SELECT * 
            FROM (
                SELECT 
                    *,
                    ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY Da DESC) AS id 
                FROM tbltptall 
                WHERE status = 1 AND Da <= @EndDate
            ) s 
            WHERE id = 1
        )
        SELECT 
            s.clinicid,
            CASE 
                WHEN s.Da IS NULL OR s.Da = '1900-12-31' OR YEAR(s.Da) < 2000 OR YEAR(s.Da) > 2030 
                THEN s.DatVisit 
                ELSE s.Da 
            END AS dateStart,
            s.DrugName AS Tptdrugname,
            st.da AS Datestop,
            DATEDIFF(st.da, CASE 
                WHEN s.Da IS NULL OR s.Da = '1900-12-31' OR YEAR(s.Da) < 2000 OR YEAR(s.Da) > 2030 
                THEN s.DatVisit 
                ELSE s.Da 
            END) / 30 AS duration  
        FROM tbltptstart s
        LEFT JOIN tbltptstope st ON s.clinicid = st.clinicid
    )

    -- Main query combining all CTEs
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
        IF(LEFT(i.clinicid, 1) = "P" AND rd.TLDStatus != "TLD" AND LOCATE('DTG', drugname) > 0, "TLD", rd.TLDStatus) AS TLDStatus,
        vl.DateResult,
        vl.HIVLoad,
        vl.VLdostatus,
        vl.vlresultstatus,
        tp.Tptdrugname,
        tp.dateStart,
        tp.Datestop,
        tp.duration,
        IF(
            LEFT(tp.Tptdrugname, 1) = 3 AND tp.duration >= 2.50, "TPT Complete",
            IF(
                LEFT(tp.Tptdrugname, 1) = 6 AND tp.duration >= 5.50, "TPT Complete",
                IF(tp.Tptdrugname IS NULL, "Not Start", "Not complete")
            )
        ) AS tptstatus 
    FROM tblvisit v
    LEFT JOIN tblimain i ON i.clinicid = v.clinicid
    LEFT JOIN tblart a ON a.clinicid = v.clinicid
    LEFT JOIN tblexit e ON v.clinicid = e.clinicid
    LEFT JOIN tblarvdrug rd ON rd.vid = v.vid
    LEFT JOIN tblvltested vl ON vl.clinicid = v.clinicid
    LEFT JOIN tbltptdrug tp ON tp.clinicid = v.clinicid
    WHERE id = 1 AND e.status IS NULL AND a.ART IS NOT NULL
)

SELECT 
    '10.4. TPT Start' AS Indicator, 
    SUM(IF(sex = 1 AND typepatients = '≤14', 1, 0)) AS Male_0_14,
    SUM(IF(sex = 0 AND typepatients = '≤14', 1, 0)) AS Female_0_14,
    SUM(IF(sex = 1 AND typepatients = '15+', 1, 0)) AS Male_over_14,
    SUM(IF(sex = 0 AND typepatients = '15+', 1, 0)) AS Female_over_14,
    COUNT(*) AS TOTAL
FROM tblactive
WHERE ART IS NOT NULL AND tptstatus != 'Not Start';


-- =====================================================

-- =====================================================
-- INDICATOR 38: 10.4 TPT START DETAILS
-- File: 10.4_tpt_start_details.sql
-- =====================================================

-- =====================================================
-- 10.4 TPT START DETAILS
-- Generated: 2025-10-16T17:34:57.201Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- 10.4 TPT Start - Detailed Records (matching corrected aggregate logic)
WITH tblactive AS (
    -- Visit data CTE
    WITH tblvisit AS (
        SELECT 
            clinicid,
            DatVisit,
            ARTnum,
            DaApp,
            vid,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblavmain 
        WHERE DatVisit <= @EndDate
        
        UNION ALL 
        
        SELECT 
            clinicid,
            DatVisit,
            ARTnum,
            DaApp,
            vid,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblcvmain 
        WHERE DatVisit <= @EndDate
    ),
    
    -- Patient main data CTE
    tblimain AS (
        SELECT 
            ClinicID,
            DafirstVisit,
            "15+" AS typepatients,
            TypeofReturn,
            LClinicID,
            SiteNameold,
            DaBirth,
            TIMESTAMPDIFF(YEAR, DaBirth, @EndDate) AS age,
            Sex,
            DaHIV,
            OffIn 
        FROM tblaimain 
        WHERE DafirstVisit <= @EndDate
        
        UNION ALL 
        
        SELECT 
            ClinicID,
            DafirstVisit,
            "≤14" AS typepatients,
            '' AS TypeofReturn,
            LClinicID,
            SiteNameold,
            DaBirth,
            TIMESTAMPDIFF(YEAR, DaBirth, @EndDate) AS age,
            Sex,
            DaTest AS DaHIV,
            OffIn 
        FROM tblcimain 
        WHERE DafirstVisit <= @EndDate
    ),
    
    -- ART data CTE
    tblart AS (
        SELECT 
            *,
            TIMESTAMPDIFF(MONTH, DaArt, @EndDate) AS nmonthART 
        FROM tblaart 
        WHERE DaArt <= @EndDate
        
        UNION ALL 
        
        SELECT 
            *,
            TIMESTAMPDIFF(MONTH, DaArt, @EndDate) AS nmonthART 
        FROM tblcart 
        WHERE DaArt <= @EndDate
    ),
    
    -- Exit status CTE
    tblexit AS (
        SELECT * FROM tblavpatientstatus WHERE da <= @EndDate
        UNION ALL 
        SELECT * FROM tblcvpatientstatus WHERE da <= @EndDate
    ),
    
    -- ARV drug combinations CTE
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
    ),
    
    -- Viral load testing CTE
    tblvltested AS (
        WITH tblvltest AS (
            SELECT 
                ClinicID,
                IF(DaArrival < Dat, Dat, DaArrival) AS DateResult,
                HIVLoad 
            FROM tblpatienttest 
            WHERE HIVLoad != ''
            HAVING DateResult <= @EndDate
        ) 
        SELECT DISTINCT 
            ClinicID,
            DateResult,
            HIVLoad,
            IF(DateResult > datelast, "Do_VL_in_12M", "Do_VL_greatn_12M") AS VLdostatus,
            IF(HIVLoad < 1000, "VL-Suppression", "Not-Suppression") AS vlresultstatus  
        FROM (
            SELECT 
                ClinicID,
                DateResult,
                HIVLoad,
                DATE_SUB(@EndDate, INTERVAL 1 YEAR) AS datelast, 
                ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DateResult DESC) AS id 
            FROM tblvltest 
        ) pt 
        WHERE pt.id = 1
    ),
    
    -- TPT drug data CTE
    tbltptdrug AS (
        WITH tbltptdrugs AS (
            SELECT DrugName, Status, Da, Vid 
            FROM tblavtptdrug 
            WHERE DrugName != "B6"
            
            UNION ALL 
            
            SELECT DrugName, Status, Da, Vid 
            FROM tblcvtptdrug 
            WHERE DrugName != "B6"
        ),
        tblvisit AS (
            SELECT clinicid, DatVisit, vid 
            FROM tblavmain 
            
            UNION ALL 
            
            SELECT clinicid, DatVisit, vid 
            FROM tblcvmain 
        ),
        tbltptall AS (
            SELECT 
                clinicid,
                DatVisit,
                DrugName, 
                Status, 
                Da 
            FROM tbltptdrugs tp 
            LEFT JOIN tblvisit v ON tp.vid = v.vid
        ),
        tbltptstart AS (
            SELECT * 
            FROM (
                SELECT 
                    *,
                    ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit ASC) AS id 
                FROM tbltptall 
                WHERE status = 0 AND DatVisit <= @EndDate
            ) s 
            WHERE id = 1
        ),
        tbltptstope AS (
            SELECT * 
            FROM (
                SELECT 
                    *,
                    ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY Da DESC) AS id 
                FROM tbltptall 
                WHERE status = 1 AND Da <= @EndDate
            ) s 
            WHERE id = 1
        )
        SELECT 
            s.clinicid,
            CASE 
                WHEN s.Da IS NULL OR s.Da = '1900-12-31' OR YEAR(s.Da) < 2000 OR YEAR(s.Da) > 2030 
                THEN s.DatVisit 
                ELSE s.Da 
            END AS dateStart,
            s.DrugName AS Tptdrugname,
            st.da AS Datestop,
            DATEDIFF(st.da, CASE 
                WHEN s.Da IS NULL OR s.Da = '1900-12-31' OR YEAR(s.Da) < 2000 OR YEAR(s.Da) > 2030 
                THEN s.DatVisit 
                ELSE s.Da 
            END) / 30 AS duration  
        FROM tbltptstart s
        LEFT JOIN tbltptstope st ON s.clinicid = st.clinicid
    )

    -- Main query combining all CTEs
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
        IF(LEFT(i.clinicid, 1) = "P" AND rd.TLDStatus != "TLD" AND LOCATE('DTG', drugname) > 0, "TLD", rd.TLDStatus) AS TLDStatus,
        vl.DateResult,
        vl.HIVLoad,
        vl.VLdostatus,
        vl.vlresultstatus,
        tp.Tptdrugname,
        tp.dateStart,
        tp.Datestop,
        tp.duration,
        IF(
            LEFT(tp.Tptdrugname, 1) = 3 AND tp.duration >= 2.50, "TPT Complete",
            IF(
                LEFT(tp.Tptdrugname, 1) = 6 AND tp.duration >= 5.50, "TPT Complete",
                IF(tp.Tptdrugname IS NULL, "Not Start", "Not complete")
            )
        ) AS tptstatus 
    FROM tblvisit v
    LEFT JOIN tblimain i ON i.clinicid = v.clinicid
    LEFT JOIN tblart a ON a.clinicid = v.clinicid
    LEFT JOIN tblexit e ON v.clinicid = e.clinicid
    LEFT JOIN tblarvdrug rd ON rd.vid = v.vid
    LEFT JOIN tblvltested vl ON vl.clinicid = v.clinicid
    LEFT JOIN tbltptdrug tp ON tp.clinicid = v.clinicid
    WHERE id = 1 AND e.status IS NULL AND a.ART IS NOT NULL
)

SELECT
    '10.4' as step,
    clinicid,
    Sex AS sex,
    CASE 
        WHEN Sex = 0 THEN 'Female'
        WHEN Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END AS sex_display,
    typepatients,
    age,
    CASE 
        WHEN typepatients = '15+' THEN 'Adult'
        WHEN typepatients = '≤14' THEN 'Child'
        ELSE 'Unknown'
    END AS patient_type,
    ART,
    DaArt,
    DafirstVisit,
    DaBirth,
    OffIn,
    CASE 
        WHEN OffIn = 0 THEN 'Not Transferred'
        WHEN OffIn = 2 THEN 'Transferred In'
        WHEN OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', OffIn)
    END AS transfer_status,
    Startartstatus,
    MMDStatus,
    TLDStatus,
    Tptdrugname,
    dateStart,
    tptstatus
FROM tblactive
WHERE ART IS NOT NULL AND tptstatus != 'Not Start'
ORDER BY DaArt DESC, clinicid;

-- =====================================================

-- =====================================================
-- INDICATOR 39: 10.5 TPT COMPLETE
-- File: 10.5_tpt_complete.sql
-- =====================================================

-- =====================================================
-- 10.5 TPT COMPLETE
-- Generated: 2025-10-16T17:34:57.201Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- TPT Complete

with tblactive as (
    with tblvisit as (
        select 
            clinicid,
            DatVisit,
            ARTnum,
            DaApp,
            vid,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) as id 
        from tblavmain 
        where DatVisit <= @EndDate
        
        union all 
        
        select 
            clinicid,
            DatVisit,
            ARTnum,
            DaApp,
            vid,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) as id 
        from tblcvmain 
        where DatVisit <= @EndDate
    ),
    
    tblimain as (
        select 
            ClinicID,
            DafirstVisit,
            "15+" as typepatients,
            TypeofReturn,
            LClinicID,
            SiteNameold,
            DaBirth,
            timestampdiff(year, DaBirth, @EndDate) as age,
            Sex,
            DaHIV,
            OffIn 
        from tblaimain 
        where DafirstVisit <= @EndDate
        
        union all 
        
        select 
            ClinicID,
            DafirstVisit,
            "≤14" as typepatients,
            '' as TypeofReturn,
            LClinicID,
            SiteNameold,
            DaBirth,
            timestampdiff(year, DaBirth, @EndDate) as age,
            Sex,
            DaTest as DaHIV,
            OffIn 
        from tblcimain 
        where DafirstVisit <= @EndDate
    ),
    
    tblart as (
        select 
            *,
            timestampdiff(month, DaArt, @EndDate) as nmonthART 
        from tblaart 
        where DaArt <= @EndDate 
        
        union all 
        
        select 
            *,
            timestampdiff(month, DaArt, @EndDate) as nmonthART 
        from tblcart 
        where DaArt <= @EndDate
    ),
    
    tblexit as (
        select * from tblavpatientstatus where da <= @EndDate  
        
        union all 
        
        select * from tblcvpatientstatus where da <= @EndDate
    ),
    
    tblarvdrug as (
        with tbldrug as (
            select 
                vid,
                group_concat(distinct DrugName order by DrugName asc SEPARATOR '+') as drugname 
            from tblavarvdrug 
            where status <> 1 
            group by vid 
            
            union all 
            
            select 
                vid,
                group_concat(distinct DrugName order by DrugName asc SEPARATOR '+') as drugname 
            from tblcvarvdrug 
            where status <> 1 
            group by vid
        )
        select 
            vid,
            drugname,
            if(LOCATE('3TC+DTG+TDF', drugname) > 0, "TLD", "Not-TLD") as TLDStatus 
        from tbldrug
    ),
    
    tblvltested as (
        with tblvltest as (
            select 
                ClinicID,
                if(DaArrival < Dat, Dat, DaArrival) as DateResult,
                HIVLoad 
            from tblpatienttest 
            where HIVLoad != ''
            having DateResult <= @EndDate
        ) 
        select distinct 
            ClinicID,
            DateResult,
            HIVLoad,
            if(DateResult > datelast, "Do_VL_in_12M", "Do_VL_greatn_12M") as VLdostatus,
            if(HIVLoad < 1000, "VL-Suppression", "Not-Suppression") as vlresultstatus  
        from (
            select 
                ClinicID,
                DateResult,
                HIVLoad,
                date_sub(@EndDate, interval 1 year) as datelast, 
                row_number() over (partition by clinicid order by DateResult desc) as id 
            from tblvltest 
        ) pt 
        where pt.id = 1
    ),
    
    tbltptdrug as (
        with tbltptdrugs as (
            select DrugName, Status, Da, Vid 
            from tblavtptdrug 
            where DrugName != "B6" 
            
            union all 
            
            select DrugName, Status, Da, Vid 
            from tblcvtptdrug 
            where DrugName != "B6"
        ),
        
        tblvisit as (
            select clinicid, DatVisit, vid 
            from tblavmain 
            
            union all 
            
            select clinicid, DatVisit, vid 
            from tblcvmain
        ),
        
        tbltptall as (
            select 
                clinicid,
                DatVisit,
                DrugName, 
                Status, 
                Da 
            from tbltptdrugs tp 
            left join tblvisit v on tp.vid = v.vid
        ),
        
        tbltptstart as (
            select * 
            from (
                select 
                    *,
                    row_number() over(partition by clinicid order by DatVisit asc) as id 
                from tbltptall 
                where status = 0 and DatVisit <= @EndDate
            ) s 
            where id = 1
        ),
        
        tbltptstope as (
            select * 
            from (
                select 
                    *,
                    row_number() over(partition by clinicid order by Da desc) as id 
                from tbltptall 
                where status = 1 and Da <= @EndDate
            ) s 
            where id = 1
        )
        
        select 
            s.clinicid,
            s.DatVisit as dateStart,
            s.DrugName as Tptdrugname,
            st.da as Datestop,
            datediff(st.da, s.DatVisit) / 30 as duration  
        from tbltptstart s
        left join tbltptstope st on s.clinicid = st.clinicid
    )

    select 
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
        if(a.nmonthART >= 6, ">6M", "<6M") as Startartstatus,
        datediff(v.DaApp, v.DatVisit) as ndays,
        if(datediff(v.DaApp, v.DatVisit) > 80, "MMD", "Not-MMD") as MMDStatus,
        rd.drugname,
        if(left(i.clinicid, 1) = "P" and rd.TLDStatus != "TLD" and LOCATE('DTG', drugname) > 0, "TLD", rd.TLDStatus) as TLDStatus,
        vl.DateResult,
        vl.HIVLoad,
        vl.VLdostatus,
        vl.vlresultstatus,
        tp.Tptdrugname,
        tp.dateStart,
        tp.Datestop,
        tp.duration,
        if(
            left(tp.Tptdrugname, 1) = 3 and tp.duration >= 2.50, "TPT Complete",
            if(
                left(tp.Tptdrugname, 1) = 6 and tp.duration >= 5.50, "TPT Complete",
                if(tp.Tptdrugname is null, "Not Start", "Not complete")
            )
        ) as tptstatus 
    from tblvisit v
    left join tblimain i on i.clinicid = v.clinicid
    left join tblart a on a.clinicid = v.clinicid
    left join tblexit e on v.clinicid = e.clinicid
    left join tblarvdrug rd on rd.vid = v.vid
    left join tblvltested vl on vl.clinicid = v.clinicid
    left join tbltptdrug tp on tp.clinicid = v.clinicid
    where id = 1 and e.status is null and a.ART is not null 
)

select 
    '10.5. TPT Complete' as Indicator, 
    sum(if(sex = 1 and typepatients = '≤14', 1, 0)) as Male_0_14,
    sum(if(sex = 0 and typepatients = '≤14', 1, 0)) as Female_0_14,
    sum(if(sex = 1 and typepatients = '15+', 1, 0)) as Male_over_14,
    sum(if(sex = 0 and typepatients = '15+', 1, 0)) as Female_over_14,
    count(*) as TOTAL
from tblactive
where ART is not null and tptstatus = 'TPT Complete';


-- =====================================================

-- =====================================================
-- INDICATOR 40: 10.5 TPT COMPLETE DETAILS
-- File: 10.5_tpt_complete_details.sql
-- =====================================================

-- =====================================================
-- 10.5 TPT COMPLETE DETAILS
-- Generated: 2025-10-16T17:34:57.201Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 10.5: TPT Complete - Detailed Records (matching aggregate logic)
-- This replicates the exact same CTE structure and logic as the aggregate query
WITH tblvisit AS (
    SELECT clinicid, DatVisit, ARTnum, DaApp, vid, 
           ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
    FROM tblavmain 
    WHERE DatVisit <= @EndDate
    UNION ALL 
    SELECT clinicid, DatVisit, ARTnum, DaApp, vid, 
           ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
    FROM tblcvmain 
    WHERE DatVisit <= @EndDate
),

tblimain AS (
    SELECT ClinicID, DafirstVisit, "15+" AS typepatients, TypeofReturn, LClinicID, 
           SiteNameold, DaBirth, TIMESTAMPDIFF(YEAR, DaBirth, @EndDate) AS age, 
           Sex, DaHIV, OffIn 
    FROM tblaimain 
    WHERE DafirstVisit <= @EndDate
    UNION ALL 
    SELECT ClinicID, DafirstVisit, "≤14" AS typepatients, '' AS TypeofReturn, 
           LClinicID, SiteNameold, DaBirth, TIMESTAMPDIFF(YEAR, DaBirth, @EndDate) AS age, 
           Sex, DaTest AS DaHIV, OffIn 
    FROM tblcimain 
    WHERE DafirstVisit <= @EndDate
),

tblart AS (
    SELECT *, TIMESTAMPDIFF(MONTH, DaArt, @EndDate) AS nmonthART 
    FROM tblaart 
    WHERE DaArt <= @EndDate
    UNION ALL 
    SELECT *, TIMESTAMPDIFF(MONTH, DaArt, @EndDate) AS nmonthART 
    FROM tblcart 
    WHERE DaArt <= @EndDate
),

tblexit AS (
    SELECT * 
    FROM tblavpatientstatus 
    WHERE da <= @EndDate
    UNION ALL 
    SELECT * 
    FROM tblcvpatientstatus  
    WHERE da <= @EndDate
),

tbltptdrug AS (
    WITH tbltptdrugs AS (
        SELECT DrugName, Status, Da, Vid 
        FROM tblavtptdrug 
        WHERE DrugName != "B6"
        UNION ALL 
        SELECT DrugName, Status, Da, Vid 
        FROM tblcvtptdrug 
        WHERE DrugName != "B6"
    ),
    
    tblvisit AS (
        SELECT clinicid, DatVisit, vid 
        FROM tblavmain 
        UNION ALL 
        SELECT clinicid, DatVisit, vid 
        FROM tblcvmain 
    ),
    
    tbltptall AS (
        SELECT clinicid, DatVisit, DrugName, Status, Da 
        FROM tbltptdrugs tp 
        LEFT JOIN tblvisit v ON tp.vid = v.vid
    ),
    
    tbltptstart AS (
        SELECT * 
        FROM (
            SELECT *, ROW_NUMBER() OVER(PARTITION BY clinicid ORDER BY DatVisit ASC) AS id 
            FROM tbltptall 
            WHERE status = 0 AND DatVisit <= @EndDate
        ) s 
        WHERE id = 1
    ),
    
    tbltptstope AS (
        SELECT * 
        FROM (
            SELECT *, ROW_NUMBER() OVER(PARTITION BY clinicid ORDER BY Da DESC) AS id 
            FROM tbltptall 
            WHERE status = 1 AND Da <= @EndDate
        ) s 
        WHERE id = 1
    )
    
    SELECT s.clinicid, s.DatVisit AS dateStart, s.DrugName AS Tptdrugname, 
           st.da AS Datestop, DATEDIFF(st.da, s.DatVisit) / 30 AS duration,
           IF(LEFT(s.DrugName, 1) = 3 AND DATEDIFF(st.da, s.DatVisit) / 30 >= 2.50, "TPT Complete",
              IF(LEFT(s.DrugName, 1) = 6 AND DATEDIFF(st.da, s.DatVisit) / 30 >= 5.50, "TPT Complete",
                 IF(s.DrugName IS NULL, "Not Start", "Not complete"))) AS tptstatus
    FROM tbltptstart s
    LEFT JOIN tbltptstope st ON s.clinicid = st.clinicid
)

SELECT
    '10.5' as step,
    i.clinicid,
    a.ART as art_number,
    i.Sex AS sex,
    CASE 
        WHEN i.Sex = 0 THEN 'Female'
        WHEN i.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END AS sex_display,
    i.typepatients,
    i.DaBirth,
    i.DafirstVisit,
    a.DaArt,
    v.DatVisit,
    i.OffIn,
    CASE 
        WHEN i.typepatients = '15+' THEN 'Adult'
        ELSE 'Child'
    END AS patient_type,
    i.age,
    CASE
        WHEN i.OffIn = 0 THEN 'Not Transferred'
        WHEN i.OffIn = 2 THEN 'Transferred In'
        WHEN i.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', i.OffIn)
    END AS transfer_status,
    tp.Tptdrugname,
    tp.dateStart,
    tp.Datestop,
    tp.duration,
    tp.tptstatus
FROM tblvisit v
LEFT JOIN tblimain i ON i.clinicid = v.clinicid
LEFT JOIN tblart a ON a.clinicid = v.clinicid
LEFT JOIN tblexit e ON v.clinicid = e.clinicid
LEFT JOIN tbltptdrug tp ON tp.clinicid = v.clinicid
WHERE v.id = 1 AND e.status IS NULL AND a.ART IS NOT NULL
  AND tp.tptstatus = 'TPT Complete'
ORDER BY v.DatVisit DESC, i.clinicid;


-- =====================================================

-- =====================================================
-- INDICATOR 41: 10.6 ELIGIBLE VL TEST
-- File: 10.6_eligible_vl_test.sql
-- =====================================================

-- =====================================================
-- 10.6 ELIGIBLE VL TEST
-- Generated: 2025-10-16T17:34:57.201Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 10.6: Eligible for Viral Load test (Corrected to match audit query exactly)
WITH tblimain AS (
    SELECT 
        ClinicID,
        DafirstVisit,
        "15+" AS typepatients,
        TypeofReturn,
        LClinicID,
        SiteNameold,
        DaBirth,
        TIMESTAMPDIFF(YEAR, DaBirth, @EndDate) AS age,
        Sex,
        DaHIV,
        OffIn 
    FROM tblaimain 
    WHERE DaART <= @EndDate
    
    UNION ALL 
    
    SELECT 
        ClinicID,
        DafirstVisit,
        "≤14" AS typepatients,
        '' AS TypeofReturn,
        LClinicID,
        SiteNameold,
        DaBirth,
        TIMESTAMPDIFF(YEAR, DaBirth, @EndDate) AS age,
        Sex,
        DaTest AS DaHIV,
        OffIn 
    FROM tblcimain 
    WHERE DaART <= @EndDate
),
tblactive AS (
    SELECT 
        a.ClinicID, 
        a.ART, 
        a.DaArt, 
        lvl.Dat, 
        lvl.HIVLoad,
        i.typepatients,
        i.Sex,
        -- Use exact audit query logic
        IF(lvl.hivload IS NULL AND TIMESTAMPDIFF(MONTH, a.daart, @EndDate) >= 5, "DO VL",
        IF(lvl.hivload >= 40 AND TIMESTAMPDIFF(MONTH, lvl.Dat, @EndDate) > 4, "DO VL",
        IF(lvl.hivload < 40 AND TIMESTAMPDIFF(MONTH, lvl.Dat, @EndDate) >= 10, "DO VL",
        IF(lvl.hivload < 40 AND TIMESTAMPDIFF(MONTH, a.DaART, lvl.Dat) >= 5 AND TIMESTAMPDIFF(MONTH, a.DaART, lvl.Dat) <= 7 AND TIMESTAMPDIFF(MONTH, lvl.Dat, @EndDate) >= 5 AND TIMESTAMPDIFF(MONTH, lvl.Dat, @EndDate) <= 7, "DO VL",
        "")))) AS StatusVL
    FROM (SELECT DISTINCT * FROM tblaart UNION SELECT DISTINCT * FROM tblcart) a
    LEFT JOIN (
        SELECT DISTINCT * FROM tblavpatientstatus WHERE Da <= @StartDate
        UNION
        SELECT DISTINCT * FROM tblcvpatientstatus WHERE Da <= @StartDate
    ) ps ON ps.clinicid = a.clinicid
    LEFT JOIN (
        SELECT DISTINCT p.ClinicID, p.Dat, p.DaCollect, p.HIVLoad, p.HIVLog 
        FROM tblpatienttest p
        INNER JOIN (
            SELECT pt.ClinicID, MAX(pt.dat) AS dat 
            FROM (
                SELECT CAST(ClinicID AS SIGNED) AS clinicid, Dat, DaCollect, HIVLoad, HIVLog 
                FROM tblpatienttest
                WHERE hivload <> '' AND Dat < @StartDate AND clinicid NOT LIKE 'P%'
                UNION
                SELECT ClinicID, Dat, DaCollect, HIVLoad, HIVLog 
                FROM tblpatienttest
                WHERE hivload <> '' AND Dat < @StartDate AND clinicid LIKE 'P%'
            ) pt
            GROUP BY pt.clinicid
        ) mp ON mp.clinicid = p.clinicid AND mp.dat = p.dat
    ) lvl ON lvl.clinicid = a.ClinicID
    LEFT JOIN tblimain i ON CAST(i.clinicid AS CHAR) = CAST(a.clinicid AS CHAR)
    WHERE ps.da IS NULL OR ps.da > @EndDate
)

SELECT 
    '10.6. Eligible for VL test' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN typepatients = '≤14' AND Sex = 1 THEN 1 ELSE 0 END), 0) AS Male_0_14,
    IFNULL(SUM(CASE WHEN typepatients = '≤14' AND Sex = 0 THEN 1 ELSE 0 END), 0) AS Female_0_14,
    IFNULL(SUM(CASE WHEN typepatients = '15+' AND Sex = 1 THEN 1 ELSE 0 END), 0) AS Male_over_14,
    IFNULL(SUM(CASE WHEN typepatients = '15+' AND Sex = 0 THEN 1 ELSE 0 END), 0) AS Female_over_14
FROM tblactive
WHERE StatusVL <> '';


-- =====================================================

-- =====================================================
-- INDICATOR 42: 10.6 ELIGIBLE VL TEST DETAILS
-- File: 10.6_eligible_vl_test_details.sql
-- =====================================================

-- =====================================================
-- 10.6 ELIGIBLE VL TEST DETAILS
-- Generated: 2025-10-16T17:34:57.201Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- 10.6_eligible_vl_test - Detailed Records (matching corrected aggregate logic)
WITH tblimain AS (
    SELECT 
        ClinicID,
        DafirstVisit,
        "15+" AS typepatients,
        TypeofReturn,
        LClinicID,
        SiteNameold,
        DaBirth,
        TIMESTAMPDIFF(YEAR, DaBirth, @EndDate) AS age,
        Sex,
        DaHIV,
        OffIn 
    FROM tblaimain 
    WHERE DaART <= @EndDate
    
    UNION ALL 
    
    SELECT 
        ClinicID,
        DafirstVisit,
        "≤14" AS typepatients,
        '' AS TypeofReturn,
        LClinicID,
        SiteNameold,
        DaBirth,
        TIMESTAMPDIFF(YEAR, DaBirth, @EndDate) AS age,
        Sex,
        DaTest AS DaHIV,
        OffIn 
    FROM tblcimain 
    WHERE DaART <= @EndDate
),
tblactive AS (
    SELECT 
        a.ClinicID, 
        a.ART, 
        a.DaArt, 
        lvl.Dat as LastVLDate,
        lvl.HIVLoad as LastVLLoad,
        i.typepatients,
        i.Sex,
        i.age,
        i.DaBirth,
        i.DafirstVisit,
        i.OffIn,
        TIMESTAMPDIFF(MONTH, a.daart, @EndDate) as MonthsOnART,
        TIMESTAMPDIFF(MONTH, lvl.Dat, @EndDate) as MonthsSinceLastVL,
        -- Use exact audit query logic
        IF(lvl.hivload IS NULL AND TIMESTAMPDIFF(MONTH, a.daart, @EndDate) >= 5, 'DO VL',
        IF(lvl.hivload >= 40 AND TIMESTAMPDIFF(MONTH, lvl.Dat, @EndDate) > 4, 'DO VL',
        IF(lvl.hivload < 40 AND TIMESTAMPDIFF(MONTH, lvl.Dat, @EndDate) >= 10, 'DO VL',
        IF(lvl.hivload < 40 AND TIMESTAMPDIFF(MONTH, a.DaART, lvl.Dat) >= 5 AND TIMESTAMPDIFF(MONTH, a.DaART, lvl.Dat) <= 7 AND TIMESTAMPDIFF(MONTH, lvl.Dat, @EndDate) >= 5 AND TIMESTAMPDIFF(MONTH, lvl.Dat, @EndDate) <= 7, 'DO VL',
        '')))) AS StatusVL
    FROM (SELECT DISTINCT * FROM tblaart UNION SELECT DISTINCT * FROM tblcart) a
    LEFT JOIN (
        SELECT DISTINCT * FROM tblavpatientstatus WHERE Da <= @StartDate
        UNION
        SELECT DISTINCT * FROM tblcvpatientstatus WHERE Da <= @StartDate
    ) ps ON ps.clinicid = a.clinicid
    LEFT JOIN (
        SELECT DISTINCT p.ClinicID, p.Dat, p.DaCollect, p.HIVLoad, p.HIVLog 
        FROM tblpatienttest p
        INNER JOIN (
            SELECT pt.ClinicID, MAX(pt.dat) AS dat 
            FROM (
                SELECT CAST(ClinicID AS SIGNED) AS clinicid, Dat, DaCollect, HIVLoad, HIVLog 
                FROM tblpatienttest
                WHERE hivload <> '' AND Dat < @StartDate AND clinicid NOT LIKE 'P%'
                UNION
                SELECT ClinicID, Dat, DaCollect, HIVLoad, HIVLog 
                FROM tblpatienttest
                WHERE hivload <> '' AND Dat < @StartDate AND clinicid LIKE 'P%'
            ) pt
            GROUP BY pt.clinicid
        ) mp ON mp.clinicid = p.clinicid AND mp.dat = p.dat
    ) lvl ON lvl.clinicid = a.ClinicID
    LEFT JOIN tblimain i ON CAST(i.clinicid AS CHAR) = CAST(a.clinicid AS CHAR)
    WHERE ps.da IS NULL OR ps.da > @EndDate
)

SELECT
    '10.6' as step,
    ClinicID as clinicid,
    Sex as sex,
    CASE 
        WHEN Sex = 0 THEN 'Female'
        WHEN Sex = 1 THEN 'Male'
        WHEN Sex IS NULL THEN 'Unknown (No patient data)'
        ELSE 'Unknown'
    END as sex_display,
    typepatients,
    age,
    CASE 
        WHEN typepatients = '15+' THEN 'Adult'
        WHEN typepatients = '≤14' THEN 'Child'
        WHEN typepatients IS NULL THEN 'Unknown (No patient data)'
        ELSE 'Unknown'
    END as patient_type,
    ART,
    DaArt,
    DaBirth,
    DafirstVisit,
    OffIn as transfer_status,
    LastVLDate,
    LastVLLoad,
    MonthsOnART,
    MonthsSinceLastVL,
    StatusVL
FROM tblactive
WHERE StatusVL <> ''
ORDER BY DaArt DESC, ClinicID;

-- =====================================================

-- =====================================================
-- INDICATOR 43: 10.7 VL TESTED 12M
-- File: 10.7_vl_tested_12m.sql
-- =====================================================

-- =====================================================
-- 10.7 VL TESTED 12M
-- Generated: 2025-10-16T17:34:57.202Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 10.7: VL tested in 12M (visit-based logic)
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
        WHERE DatVisit <= @EndDate
        
        UNION ALL 
        
        SELECT 
            clinicid,
            DatVisit,
            ARTnum,
            DaApp,
            vid,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblcvmain 
        WHERE DatVisit <= @EndDate
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
            TIMESTAMPDIFF(YEAR, DaBirth, @EndDate) AS age,
            Sex,
            DaHIV,
            OffIn 
        FROM tblaimain 
        WHERE DafirstVisit <= @EndDate
        
        UNION ALL 
        
        SELECT 
            ClinicID,
            DafirstVisit,
            "≤14" AS typepatients,
            '' AS TypeofReturn,
            LClinicID,
            SiteNameold,
            DaBirth,
            TIMESTAMPDIFF(YEAR, DaBirth, @EndDate) AS age,
            Sex,
            DaTest AS DaHIV,
            OffIn 
        FROM tblcimain 
        WHERE DafirstVisit <= @EndDate
    ),
    
    tblart AS (
        SELECT *,
               TIMESTAMPDIFF(MONTH, DaArt, @EndDate) AS nmonthART 
        FROM tblaart 
        WHERE DaArt <= @EndDate
        
        UNION ALL 
        
        SELECT *,
               TIMESTAMPDIFF(MONTH, DaArt, @EndDate) AS nmonthART 
        FROM tblcart 
        WHERE DaArt <= @EndDate
    ),
    
    tblexit AS (
        SELECT * 
        FROM tblavpatientstatus 
        WHERE da <= @EndDate
        
        UNION ALL 
        
        SELECT * 
        FROM tblcvpatientstatus  
        WHERE da <= @EndDate
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
    ),
    
    tblvltested AS (
        WITH tblvltest AS (
            SELECT 
                ClinicID,
                IF(DaArrival < Dat, Dat, DaArrival) AS DateResult,
                HIVLoad 
            FROM tblpatienttest 
            WHERE HIVLoad != ''
            HAVING DateResult <= @EndDate
        )
        SELECT DISTINCT 
            ClinicID,
            DateResult,
            HIVLoad,
            IF(DateResult > datelast, "Do_VL_in_12M", "Do_VL_greatn_12M") AS VLdostatus,
            IF(HIVLoad < 1000, "VL-Suppression", "Not-Suppression") AS vlresultstatus  
        FROM (
            SELECT 
                ClinicID,
                DateResult,
                HIVLoad,
                DATE_SUB(@EndDate, INTERVAL 1 YEAR) AS datelast,
                ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DateResult DESC) AS id 
            FROM tblvltest 
        ) pt 
        WHERE pt.id = 1
    ),
    
    tbltptdrug AS (
        WITH tbltptdrugs AS (
            SELECT 
                DrugName,
                Status,
                Da,
                Vid 
            FROM tblavtptdrug 
            WHERE DrugName != "B6"
            
            UNION ALL 
            
            SELECT 
                DrugName,
                Status,
                Da,
                Vid 
            FROM tblcvtptdrug 
            WHERE DrugName != "B6"
        ),
        
        tblvisit AS (
            SELECT clinicid, DatVisit, vid 
            FROM tblavmain 
            
            UNION ALL 
            
            SELECT clinicid, DatVisit, vid 
            FROM tblcvmain 
        ),
        
        tbltptall AS (
            SELECT 
                clinicid,
                DatVisit,
                DrugName,
                Status,
                Da 
            FROM tbltptdrugs tp 
            LEFT JOIN tblvisit v ON tp.vid = v.vid
        ),
        
        tbltptstart AS (
            SELECT * 
            FROM (
                SELECT *,
                       ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit ASC) AS id 
                FROM tbltptall 
                WHERE status = 0 AND DatVisit <= @EndDate
            ) s 
            WHERE id = 1
        ),
        
        tbltptstope AS (
            SELECT * 
            FROM (
                SELECT *,
                       ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY Da DESC) AS id 
                FROM tbltptall 
                WHERE status = 1 AND Da <= @EndDate
            ) s 
            WHERE id = 1
        )
        
        SELECT 
            s.clinicid,
            s.DatVisit AS dateStart,
            s.DrugName AS Tptdrugname,
            st.da AS Datestop,
            DATEDIFF(st.da, s.DatVisit) / 30 AS duration  
        FROM tbltptstart s
        LEFT JOIN tbltptstope st ON s.clinicid = st.clinicid
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
        IF(LEFT(i.clinicid, 1) = "P" AND rd.TLDStatus != "TLD" AND LOCATE('DTG', drugname) > 0, "TLD", rd.TLDStatus) AS TLDStatus,
        vl.DateResult,
        vl.HIVLoad,
        vl.VLdostatus,
        vl.vlresultstatus,
        tp.Tptdrugname,
        tp.dateStart,
        tp.Datestop,
        tp.duration,
        IF(LEFT(tp.Tptdrugname, 1) = 3 AND tp.duration >= 2.50, "TPT Complete",
           IF(LEFT(tp.Tptdrugname, 1) = 6 AND tp.duration >= 5.50, "TPT Complete",
              IF(tp.Tptdrugname IS NULL, "Not Start", "Not complete"))) AS tptstatus 
    FROM tblvisit v
    LEFT JOIN tblimain i ON i.clinicid = v.clinicid
    LEFT JOIN tblart a ON a.clinicid = v.clinicid
    LEFT JOIN tblexit e ON v.clinicid = e.clinicid
    LEFT JOIN tblarvdrug rd ON rd.vid = v.vid
    LEFT JOIN tblvltested vl ON vl.clinicid = v.clinicid
    LEFT JOIN tbltptdrug tp ON tp.clinicid = v.clinicid
    WHERE id = 1 AND e.status IS NULL
)

SELECT 
    '10.7. VL tested in 12M' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN typepatients = '≤14' AND Sex = 1 THEN 1 ELSE 0 END), 0) AS Male_0_14,
    IFNULL(SUM(CASE WHEN typepatients = '≤14' AND Sex = 0 THEN 1 ELSE 0 END), 0) AS Female_0_14,
    IFNULL(SUM(CASE WHEN typepatients = '15+' AND Sex = 1 THEN 1 ELSE 0 END), 0) AS Male_over_14,
    IFNULL(SUM(CASE WHEN typepatients = '15+' AND Sex = 0 THEN 1 ELSE 0 END), 0) AS Female_over_14
FROM tblactive
WHERE ART IS NOT NULL
    AND Startartstatus = '>6M' 
    AND VLdostatus = 'Do_VL_in_12M'
    AND DateResult IS NOT NULL;

-- =====================================================

-- =====================================================
-- INDICATOR 44: 10.7 VL TESTED 12M DETAILS
-- File: 10.7_vl_tested_12m_details.sql
-- =====================================================

-- =====================================================
-- 10.7 VL TESTED 12M DETAILS
-- Generated: 2025-10-16T17:34:57.202Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- 10.7 VL Tested 12M - Detailed Records (matching corrected aggregate logic)
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
        WHERE DatVisit <= @EndDate
        
        UNION ALL 
        
        SELECT 
            clinicid,
            DatVisit,
            ARTnum,
            DaApp,
            vid,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblcvmain 
        WHERE DatVisit <= @EndDate
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
            TIMESTAMPDIFF(YEAR, DaBirth, @EndDate) AS age,
            Sex,
            DaHIV,
            OffIn 
        FROM tblaimain 
        WHERE DafirstVisit <= @EndDate
        
        UNION ALL 
        
        SELECT 
            ClinicID,
            DafirstVisit,
            "≤14" AS typepatients,
            '' AS TypeofReturn,
            LClinicID,
            SiteNameold,
            DaBirth,
            TIMESTAMPDIFF(YEAR, DaBirth, @EndDate) AS age,
            Sex,
            DaTest AS DaHIV,
            OffIn 
        FROM tblcimain 
        WHERE DafirstVisit <= @EndDate
    ),
    
    tblart AS (
        SELECT *,
               TIMESTAMPDIFF(MONTH, DaArt, @EndDate) AS nmonthART 
        FROM tblaart 
        WHERE DaArt <= @EndDate
        
        UNION ALL 
        
        SELECT *,
               TIMESTAMPDIFF(MONTH, DaArt, @EndDate) AS nmonthART 
        FROM tblcart 
        WHERE DaArt <= @EndDate
    ),
    
    tblexit AS (
        SELECT * 
        FROM tblavpatientstatus 
        WHERE da <= @EndDate
        
        UNION ALL 
        
        SELECT * 
        FROM tblcvpatientstatus  
        WHERE da <= @EndDate
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
    ),
    
    tblvltested AS (
        WITH tblvltest AS (
            SELECT 
                ClinicID,
                IF(DaArrival < Dat, Dat, DaArrival) AS DateResult,
                HIVLoad 
            FROM tblpatienttest 
            WHERE HIVLoad != ''
            HAVING DateResult <= @EndDate
        )
        SELECT DISTINCT 
            ClinicID,
            DateResult,
            HIVLoad,
            IF(DateResult > datelast, "Do_VL_in_12M", "Do_VL_greatn_12M") AS VLdostatus,
            IF(HIVLoad < 1000, "VL-Suppression", "Not-Suppression") AS vlresultstatus  
        FROM (
            SELECT 
                ClinicID,
                DateResult,
                HIVLoad,
                DATE_SUB(@EndDate, INTERVAL 1 YEAR) AS datelast,
                ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DateResult DESC) AS id 
            FROM tblvltest 
        ) pt 
        WHERE pt.id = 1
    ),
    
    tbltptdrug AS (
        WITH tbltptdrugs AS (
            SELECT 
                DrugName,
                Status,
                Da,
                Vid 
            FROM tblavtptdrug 
            WHERE DrugName != "B6"
            
            UNION ALL 
            
            SELECT 
                DrugName,
                Status,
                Da,
                Vid 
            FROM tblcvtptdrug 
            WHERE DrugName != "B6"
        ),
        
        tblvisit AS (
            SELECT clinicid, DatVisit, vid 
            FROM tblavmain 
            
            UNION ALL 
            
            SELECT clinicid, DatVisit, vid 
            FROM tblcvmain 
        ),
        
        tbltptall AS (
            SELECT 
                clinicid,
                DatVisit,
                DrugName,
                Status,
                Da 
            FROM tbltptdrugs tp 
            LEFT JOIN tblvisit v ON tp.vid = v.vid
        ),
        
        tbltptstart AS (
            SELECT * 
            FROM (
                SELECT *,
                       ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit ASC) AS id 
                FROM tbltptall 
                WHERE status = 0 AND DatVisit <= @EndDate
            ) s 
            WHERE id = 1
        ),
        
        tbltptstope AS (
            SELECT * 
            FROM (
                SELECT *,
                       ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY Da DESC) AS id 
                FROM tbltptall 
                WHERE status = 1 AND Da <= @EndDate
            ) s 
            WHERE id = 1
        )
        
        SELECT 
            s.clinicid,
            s.DatVisit AS dateStart,
            s.DrugName AS Tptdrugname,
            st.da AS Datestop,
            DATEDIFF(st.da, s.DatVisit) / 30 AS duration  
        FROM tbltptstart s
        LEFT JOIN tbltptstope st ON s.clinicid = st.clinicid
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
        IF(LEFT(i.clinicid, 1) = "P" AND rd.TLDStatus != "TLD" AND LOCATE('DTG', drugname) > 0, "TLD", rd.TLDStatus) AS TLDStatus,
        vl.DateResult,
        vl.HIVLoad,
        vl.VLdostatus,
        vl.vlresultstatus,
        tp.Tptdrugname,
        tp.dateStart,
        tp.Datestop,
        tp.duration,
        IF(LEFT(tp.Tptdrugname, 1) = 3 AND tp.duration >= 2.50, "TPT Complete",
           IF(LEFT(tp.Tptdrugname, 1) = 6 AND tp.duration >= 5.50, "TPT Complete",
              IF(tp.Tptdrugname IS NULL, "Not Start", "Not complete"))) AS tptstatus 
    FROM tblvisit v
    LEFT JOIN tblimain i ON i.clinicid = v.clinicid
    LEFT JOIN tblart a ON a.clinicid = v.clinicid
    LEFT JOIN tblexit e ON v.clinicid = e.clinicid
    LEFT JOIN tblarvdrug rd ON rd.vid = v.vid
    LEFT JOIN tblvltested vl ON vl.clinicid = v.clinicid
    LEFT JOIN tbltptdrug tp ON tp.clinicid = v.clinicid
    WHERE id = 1 AND e.status IS NULL
)

SELECT
    '10.7' as step,
    clinicid,
    Sex AS sex,
    CASE 
        WHEN Sex = 0 THEN 'Female'
        WHEN Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END AS sex_display,
    typepatients,
    age,
    CASE 
        WHEN typepatients = '15+' THEN 'Adult'
        WHEN typepatients = '≤14' THEN 'Child'
        ELSE 'Unknown'
    END AS patient_type,
    ART,
    DaArt,
    DafirstVisit,
    DaBirth,
    OffIn,
    CASE 
        WHEN OffIn = 0 THEN 'Not Transferred'
        WHEN OffIn = 2 THEN 'Transferred In'
        WHEN OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', OffIn)
    END AS transfer_status,
    Startartstatus,
    MMDStatus,
    TLDStatus,
    DateResult,
    HIVLoad,
    VLdostatus,
    vlresultstatus,
    tptstatus
FROM tblactive
WHERE ART IS NOT NULL
    AND Startartstatus = '>6M' 
    AND VLdostatus = 'Do_VL_in_12M'
    AND DateResult IS NOT NULL
ORDER BY DaArt DESC, clinicid;

-- =====================================================

-- =====================================================
-- INDICATOR 45: 10.8 VL SUPPRESSION
-- File: 10.8_vl_suppression.sql
-- =====================================================

-- =====================================================
-- 10.8 VL SUPPRESSION
-- Generated: 2025-10-16T17:34:57.202Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 10.8: VL suppression (visit-based logic)
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
        WHERE DatVisit <= @EndDate
        
        UNION ALL 
        
        SELECT 
            clinicid,
            DatVisit,
            ARTnum,
            DaApp,
            vid,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblcvmain 
        WHERE DatVisit <= @EndDate
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
            TIMESTAMPDIFF(YEAR, DaBirth, @EndDate) AS age,
            Sex,
            DaHIV,
            OffIn 
        FROM tblaimain 
        WHERE DafirstVisit <= @EndDate
        
        UNION ALL 
        
        SELECT 
            ClinicID,
            DafirstVisit,
            "≤14" AS typepatients,
            '' AS TypeofReturn,
            LClinicID,
            SiteNameold,
            DaBirth,
            TIMESTAMPDIFF(YEAR, DaBirth, @EndDate) AS age,
            Sex,
            DaTest AS DaHIV,
            OffIn 
        FROM tblcimain 
        WHERE DafirstVisit <= @EndDate
    ),
    
    tblart AS (
        SELECT *,
               TIMESTAMPDIFF(MONTH, DaArt, @EndDate) AS nmonthART 
        FROM tblaart 
        WHERE DaArt <= @EndDate
        
        UNION ALL 
        
        SELECT *,
               TIMESTAMPDIFF(MONTH, DaArt, @EndDate) AS nmonthART 
        FROM tblcart 
        WHERE DaArt <= @EndDate
    ),
    
    tblexit AS (
        SELECT * 
        FROM tblavpatientstatus 
        WHERE da <= @EndDate
        
        UNION ALL 
        
        SELECT * 
        FROM tblcvpatientstatus  
        WHERE da <= @EndDate
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
    ),
    
    tblvltested AS (
        WITH tblvltest AS (
            SELECT 
                ClinicID,
                IF(DaArrival < Dat, Dat, DaArrival) AS DateResult,
                HIVLoad 
            FROM tblpatienttest 
            WHERE HIVLoad != ''
            HAVING DateResult <= @EndDate
        )
        SELECT DISTINCT 
            ClinicID,
            DateResult,
            HIVLoad,
            IF(DateResult > datelast, "Do_VL_in_12M", "Do_VL_greatn_12M") AS VLdostatus,
            IF(HIVLoad < 1000, "VL-Suppression", "Not-Suppression") AS vlresultstatus  
        FROM (
            SELECT 
                ClinicID,
                DateResult,
                HIVLoad,
                DATE_SUB(@EndDate, INTERVAL 1 YEAR) AS datelast,
                ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DateResult DESC) AS id 
            FROM tblvltest 
        ) pt 
        WHERE pt.id = 1
    ),
    
    tbltptdrug AS (
        WITH tbltptdrugs AS (
            SELECT 
                DrugName,
                Status,
                Da,
                Vid 
            FROM tblavtptdrug 
            WHERE DrugName != "B6"
            
            UNION ALL 
            
            SELECT 
                DrugName,
                Status,
                Da,
                Vid 
            FROM tblcvtptdrug 
            WHERE DrugName != "B6"
        ),
        
        tblvisit AS (
            SELECT clinicid, DatVisit, vid 
            FROM tblavmain 
            
            UNION ALL 
            
            SELECT clinicid, DatVisit, vid 
            FROM tblcvmain 
        ),
        
        tbltptall AS (
            SELECT 
                clinicid,
                DatVisit,
                DrugName,
                Status,
                Da 
            FROM tbltptdrugs tp 
            LEFT JOIN tblvisit v ON tp.vid = v.vid
        ),
        
        tbltptstart AS (
            SELECT * 
            FROM (
                SELECT *,
                       ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit ASC) AS id 
                FROM tbltptall 
                WHERE status = 0 AND DatVisit <= @EndDate
            ) s 
            WHERE id = 1
        ),
        
        tbltptstope AS (
            SELECT * 
            FROM (
                SELECT *,
                       ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY Da DESC) AS id 
                FROM tbltptall 
                WHERE status = 1 AND Da <= @EndDate
            ) s 
            WHERE id = 1
        )
        
        SELECT 
            s.clinicid,
            s.DatVisit AS dateStart,
            s.DrugName AS Tptdrugname,
            st.da AS Datestop,
            DATEDIFF(st.da, s.DatVisit) / 30 AS duration  
        FROM tbltptstart s
        LEFT JOIN tbltptstope st ON s.clinicid = st.clinicid
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
        IF(LEFT(i.clinicid, 1) = "P" AND rd.TLDStatus != "TLD" AND LOCATE('DTG', drugname) > 0, "TLD", rd.TLDStatus) AS TLDStatus,
        vl.DateResult,
        vl.HIVLoad,
        vl.VLdostatus,
        vl.vlresultstatus,
        tp.Tptdrugname,
        tp.dateStart,
        tp.Datestop,
        tp.duration,
        IF(LEFT(tp.Tptdrugname, 1) = 3 AND tp.duration >= 2.50, "TPT Complete",
           IF(LEFT(tp.Tptdrugname, 1) = 6 AND tp.duration >= 5.50, "TPT Complete",
              IF(tp.Tptdrugname IS NULL, "Not Start", "Not complete"))) AS tptstatus 
    FROM tblvisit v
    LEFT JOIN tblimain i ON i.clinicid = v.clinicid
    LEFT JOIN tblart a ON a.clinicid = v.clinicid
    LEFT JOIN tblexit e ON v.clinicid = e.clinicid
    LEFT JOIN tblarvdrug rd ON rd.vid = v.vid
    LEFT JOIN tblvltested vl ON vl.clinicid = v.clinicid
    LEFT JOIN tbltptdrug tp ON tp.clinicid = v.clinicid
    WHERE id = 1 AND e.status IS NULL
)

SELECT 
    '10.8. VL suppression' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN typepatients = '≤14' AND Sex = 1 THEN 1 ELSE 0 END), 0) AS Male_0_14,
    IFNULL(SUM(CASE WHEN typepatients = '≤14' AND Sex = 0 THEN 1 ELSE 0 END), 0) AS Female_0_14,
    IFNULL(SUM(CASE WHEN typepatients = '15+' AND Sex = 1 THEN 1 ELSE 0 END), 0) AS Male_over_14,
    IFNULL(SUM(CASE WHEN typepatients = '15+' AND Sex = 0 THEN 1 ELSE 0 END), 0) AS Female_over_14
FROM tblactive
WHERE ART IS NOT NULL
    AND Startartstatus = '>6M' 
    AND VLdostatus = 'Do_VL_in_12M' 
    AND vlresultstatus = 'VL-Suppression'
    AND DateResult IS NOT NULL
    AND HIVLoad < 1000;

-- =====================================================

-- =====================================================
-- INDICATOR 46: 10.8 VL SUPPRESSION DETAILS
-- File: 10.8_vl_suppression_details.sql
-- =====================================================

-- =====================================================
-- 10.8 VL SUPPRESSION DETAILS
-- Generated: 2025-10-16T17:34:57.202Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- 10.8 VL Suppression - Detailed Records (matching corrected aggregate logic)
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
        WHERE DatVisit <= @EndDate
        
        UNION ALL 
        
        SELECT 
            clinicid,
            DatVisit,
            ARTnum,
            DaApp,
            vid,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblcvmain 
        WHERE DatVisit <= @EndDate
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
            TIMESTAMPDIFF(YEAR, DaBirth, @EndDate) AS age,
            Sex,
            DaHIV,
            OffIn 
        FROM tblaimain 
        WHERE DafirstVisit <= @EndDate
        
        UNION ALL 
        
        SELECT 
            ClinicID,
            DafirstVisit,
            "≤14" AS typepatients,
            '' AS TypeofReturn,
            LClinicID,
            SiteNameold,
            DaBirth,
            TIMESTAMPDIFF(YEAR, DaBirth, @EndDate) AS age,
            Sex,
            DaTest AS DaHIV,
            OffIn 
        FROM tblcimain 
        WHERE DafirstVisit <= @EndDate
    ),
    
    tblart AS (
        SELECT *,
               TIMESTAMPDIFF(MONTH, DaArt, @EndDate) AS nmonthART 
        FROM tblaart 
        WHERE DaArt <= @EndDate
        
        UNION ALL 
        
        SELECT *,
               TIMESTAMPDIFF(MONTH, DaArt, @EndDate) AS nmonthART 
        FROM tblcart 
        WHERE DaArt <= @EndDate
    ),
    
    tblexit AS (
        SELECT * 
        FROM tblavpatientstatus 
        WHERE da <= @EndDate
        
        UNION ALL 
        
        SELECT * 
        FROM tblcvpatientstatus  
        WHERE da <= @EndDate
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
    ),
    
    tblvltested AS (
        WITH tblvltest AS (
            SELECT 
                ClinicID,
                IF(DaArrival < Dat, Dat, DaArrival) AS DateResult,
                HIVLoad 
            FROM tblpatienttest 
            WHERE HIVLoad != ''
            HAVING DateResult <= @EndDate
        )
        SELECT DISTINCT 
            ClinicID,
            DateResult,
            HIVLoad,
            IF(DateResult > datelast, "Do_VL_in_12M", "Do_VL_greatn_12M") AS VLdostatus,
            IF(HIVLoad < 1000, "VL-Suppression", "Not-Suppression") AS vlresultstatus  
        FROM (
            SELECT 
                ClinicID,
                DateResult,
                HIVLoad,
                DATE_SUB(@EndDate, INTERVAL 1 YEAR) AS datelast,
                ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DateResult DESC) AS id 
            FROM tblvltest 
        ) pt 
        WHERE pt.id = 1
    ),
    
    tbltptdrug AS (
        WITH tbltptdrugs AS (
            SELECT 
                DrugName,
                Status,
                Da,
                Vid 
            FROM tblavtptdrug 
            WHERE DrugName != "B6"
            
            UNION ALL 
            
            SELECT 
                DrugName,
                Status,
                Da,
                Vid 
            FROM tblcvtptdrug 
            WHERE DrugName != "B6"
        ),
        
        tblvisit AS (
            SELECT clinicid, DatVisit, vid 
            FROM tblavmain 
            
            UNION ALL 
            
            SELECT clinicid, DatVisit, vid 
            FROM tblcvmain 
        ),
        
        tbltptall AS (
            SELECT 
                clinicid,
                DatVisit,
                DrugName,
                Status,
                Da 
            FROM tbltptdrugs tp 
            LEFT JOIN tblvisit v ON tp.vid = v.vid
        ),
        
        tbltptstart AS (
            SELECT * 
            FROM (
                SELECT *,
                       ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit ASC) AS id 
                FROM tbltptall 
                WHERE status = 0 AND DatVisit <= @EndDate
            ) s 
            WHERE id = 1
        ),
        
        tbltptstope AS (
            SELECT * 
            FROM (
                SELECT *,
                       ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY Da DESC) AS id 
                FROM tbltptall 
                WHERE status = 1 AND Da <= @EndDate
            ) s 
            WHERE id = 1
        )
        
        SELECT 
            s.clinicid,
            s.DatVisit AS dateStart,
            s.DrugName AS Tptdrugname,
            st.da AS Datestop,
            DATEDIFF(st.da, s.DatVisit) / 30 AS duration  
        FROM tbltptstart s
        LEFT JOIN tbltptstope st ON s.clinicid = st.clinicid
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
        IF(LEFT(i.clinicid, 1) = "P" AND rd.TLDStatus != "TLD" AND LOCATE('DTG', drugname) > 0, "TLD", rd.TLDStatus) AS TLDStatus,
        vl.DateResult,
        vl.HIVLoad,
        vl.VLdostatus,
        vl.vlresultstatus,
        tp.Tptdrugname,
        tp.dateStart,
        tp.Datestop,
        tp.duration,
        IF(LEFT(tp.Tptdrugname, 1) = 3 AND tp.duration >= 2.50, "TPT Complete",
           IF(LEFT(tp.Tptdrugname, 1) = 6 AND tp.duration >= 5.50, "TPT Complete",
              IF(tp.Tptdrugname IS NULL, "Not Start", "Not complete"))) AS tptstatus 
    FROM tblvisit v
    LEFT JOIN tblimain i ON i.clinicid = v.clinicid
    LEFT JOIN tblart a ON a.clinicid = v.clinicid
    LEFT JOIN tblexit e ON v.clinicid = e.clinicid
    LEFT JOIN tblarvdrug rd ON rd.vid = v.vid
    LEFT JOIN tblvltested vl ON vl.clinicid = v.clinicid
    LEFT JOIN tbltptdrug tp ON tp.clinicid = v.clinicid
    WHERE id = 1 AND e.status IS NULL
)

SELECT
    '10.8' as step,
    clinicid,
    Sex AS sex,
    CASE 
        WHEN Sex = 0 THEN 'Female'
        WHEN Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END AS sex_display,
    typepatients,
    age,
    CASE 
        WHEN typepatients = '15+' THEN 'Adult'
        WHEN typepatients = '≤14' THEN 'Child'
        ELSE 'Unknown'
    END AS patient_type,
    ART,
    DaArt,
    DafirstVisit,
    DaBirth,
    OffIn,
    CASE 
        WHEN OffIn = 0 THEN 'Not Transferred'
        WHEN OffIn = 2 THEN 'Transferred In'
        WHEN OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', OffIn)
    END AS transfer_status,
    Startartstatus,
    MMDStatus,
    TLDStatus,
    DateResult,
    HIVLoad,
    VLdostatus,
    vlresultstatus,
    tptstatus
FROM tblactive
WHERE ART IS NOT NULL
    AND Startartstatus = '>6M' 
    AND VLdostatus = 'Do_VL_in_12M' 
    AND vlresultstatus = 'VL-Suppression'
    AND DateResult IS NOT NULL
    AND HIVLoad < 1000
ORDER BY DaArt DESC, clinicid;

-- =====================================================

-- =====================================================
-- INDICATOR 47: 10 ACTIVE ART CURRENT
-- File: 10_active_art_current.sql
-- =====================================================

-- =====================================================
-- 10 ACTIVE ART CURRENT
-- Generated: 2025-10-16T17:34:57.202Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 10: Number of active ART patients in this quarter
WITH tblvisit AS (
    SELECT 
        clinicid,
        DatVisit,
        ARTnum,
        DaApp,
        vid,
        ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
    FROM tblavmain 
    WHERE DatVisit <= @EndDate
    
    UNION ALL 
    
    SELECT 
        clinicid,
        DatVisit,
        ARTnum,
        DaApp,
        vid,
        ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
    FROM tblcvmain 
    WHERE DatVisit <= @EndDate
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
        TIMESTAMPDIFF(year, DaBirth, @EndDate) AS age,
        Sex,
        DaHIV,
        OffIn 
    FROM tblaimain 
    WHERE DafirstVisit <= @EndDate
    
    UNION ALL 
    
    SELECT 
        ClinicID,
        DafirstVisit,
        "≤14" AS typepatients,
        '' AS TypeofReturn,
        LClinicID,
        SiteNameold,
        DaBirth,
        TIMESTAMPDIFF(year, DaBirth, @EndDate) AS age,
        Sex,
        DaTest AS DaHIV,
        OffIn 
    FROM tblcimain 
    WHERE DafirstVisit <= @EndDate
),

tblart AS (
    SELECT 
        *,
        TIMESTAMPDIFF(month, DaArt, @EndDate) AS nmonthART 
    FROM tblaart 
    WHERE DaArt <= @EndDate
    
    UNION ALL 
    
    SELECT 
        *,
        TIMESTAMPDIFF(month, DaArt, @EndDate) AS nmonthART 
    FROM tblcart 
    WHERE DaArt <= @EndDate
),

tblexit AS (
    SELECT * 
    FROM tblavpatientstatus 
    WHERE da <= @EndDate
    
    UNION ALL 
    
    SELECT * 
    FROM tblcvpatientstatus  
    WHERE da <= @EndDate
),

tblactive AS (
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
        v.DaApp
    FROM tblvisit v
    LEFT JOIN tblimain i ON i.clinicid = v.clinicid
    LEFT JOIN tblart a ON a.clinicid = v.clinicid
    LEFT JOIN tblexit e ON v.clinicid = e.clinicid
    WHERE v.id = 1 AND e.status IS NULL AND a.ART IS NOT NULL
)

SELECT 
    '10. Active ART patients in this quarter' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN typepatients = '≤14' AND Sex = 1 THEN 1 ELSE 0 END), 0) AS Male_0_14,
    IFNULL(SUM(CASE WHEN typepatients = '≤14' AND Sex = 0 THEN 1 ELSE 0 END), 0) AS Female_0_14,
    IFNULL(SUM(CASE WHEN typepatients = '15+' AND Sex = 1 THEN 1 ELSE 0 END), 0) AS Male_over_14,
    IFNULL(SUM(CASE WHEN typepatients = '15+' AND Sex = 0 THEN 1 ELSE 0 END), 0) AS Female_over_14
FROM tblactive;


-- =====================================================

-- =====================================================
-- INDICATOR 48: 10 ACTIVE ART CURRENT DETAILS
-- File: 10_active_art_current_details.sql
-- =====================================================

-- =====================================================
-- 10 ACTIVE ART CURRENT DETAILS
-- Generated: 2025-10-16T17:34:57.202Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- Indicator 10: Active ART patients in this quarter - Detailed Records
-- This replicates the exact same CTE structure and logic as the aggregate query
WITH tblvisit AS (
    SELECT 
        clinicid,
        DatVisit,
        ARTnum,
        DaApp,
        vid,
        ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
    FROM tblavmain 
    WHERE DatVisit <= @EndDate
    
    UNION ALL 
    
    SELECT 
        clinicid,
        DatVisit,
        ARTnum,
        DaApp,
        vid,
        ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
    FROM tblcvmain 
    WHERE DatVisit <= @EndDate
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
        TIMESTAMPDIFF(year, DaBirth, @EndDate) AS age,
        Sex,
        DaHIV,
        OffIn 
    FROM tblaimain 
    WHERE DafirstVisit <= @EndDate
    
    UNION ALL 
    
    SELECT 
        ClinicID,
        DafirstVisit,
        "≤14" AS typepatients,
        '' AS TypeofReturn,
        LClinicID,
        SiteNameold,
        DaBirth,
        TIMESTAMPDIFF(year, DaBirth, @EndDate) AS age,
        Sex,
        DaTest AS DaHIV,
        OffIn 
    FROM tblcimain 
    WHERE DafirstVisit <= @EndDate
),

tblart AS (
    SELECT 
        *,
        TIMESTAMPDIFF(month, DaArt, @EndDate) AS nmonthART 
    FROM tblaart 
    WHERE DaArt <= @EndDate
    
    UNION ALL 
    
    SELECT 
        *,
        TIMESTAMPDIFF(month, DaArt, @EndDate) AS nmonthART 
    FROM tblcart 
    WHERE DaArt <= @EndDate
),

tblexit AS (
    SELECT * 
    FROM tblavpatientstatus 
    WHERE da <= @EndDate
    
    UNION ALL 
    
    SELECT * 
    FROM tblcvpatientstatus  
    WHERE da <= @EndDate
)

SELECT
    '10' as step,
    i.clinicid as site_code,
    i.clinicid,
    i.Sex AS sex,
    CASE 
        WHEN i.Sex = 0 THEN 'Female'
        WHEN i.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END AS sex_display,
    i.typepatients,
    i.DaBirth,
    i.DafirstVisit,
    a.ART,
    a.DaArt,
    a.nmonthART,
    IF(a.nmonthART >= 6, ">6M", "<6M") AS Startartstatus,
    v.DatVisit,
    v.ARTnum,
    v.DaApp,
    i.OffIn,
    CASE 
        WHEN i.typepatients = '15+' THEN 'Adult'
        WHEN i.typepatients = '≤14' THEN 'Child'
        ELSE 'Unknown'
    END AS patient_type,
    i.age,
    CASE
        WHEN i.OffIn = 0 THEN 'Not Transferred'
        WHEN i.OffIn = 2 THEN 'Transferred In'
        WHEN i.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', i.OffIn)
    END AS transfer_status
FROM tblvisit v
LEFT JOIN tblimain i ON i.clinicid = v.clinicid
LEFT JOIN tblart a ON a.clinicid = v.clinicid
LEFT JOIN tblexit e ON v.clinicid = e.clinicid
WHERE v.id = 1 AND e.status IS NULL AND a.ART IS NOT NULL
ORDER BY v.DatVisit DESC, i.clinicid;


-- =====================================================

-- =====================================================
-- INDICATOR 49: VARIABLES
-- File: variables.sql
-- =====================================================

-- =====================================================
-- VARIABLES
-- Generated: 2025-10-16T17:34:57.202Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes
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

-- MAIN QUERY
-- =====================================================
-- ===================================================================
-- SCRIPT SETUP - Common Variables
-- ===================================================================
-- Variables are now handled by Sequelize replacements
-- This file is kept for reference but not used directly


-- =====================================================

-- =====================================================
-- SUMMARY QUERY
-- =====================================================
-- This query provides a summary of all indicators

SELECT 
    'Active ART Previous' as indicator_name,
    'Total active ART patients from previous period' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'Active Pre-ART Previous' as indicator_name,
    'Total active Pre-ART patients from previous period' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'Newly Enrolled' as indicator_name,
    'Total newly enrolled patients' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'Retested Positive' as indicator_name,
    'Total retested positive patients' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'Newly Initiated ART' as indicator_name,
    'Total newly initiated ART patients' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'Transfer In' as indicator_name,
    'Total transfer in patients' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'Lost and Return' as indicator_name,
    'Total lost and return patients' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'Dead' as indicator_name,
    'Total deceased patients' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'Lost to Follow-up' as indicator_name,
    'Total lost to follow-up patients' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'Transfer Out' as indicator_name,
    'Total transfer out patients' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'Active Pre-ART Current' as indicator_name,
    'Currently active Pre-ART patients' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'Active ART Current' as indicator_name,
    'Currently active ART patients' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'Eligible MMD' as indicator_name,
    'Eligible for multi-month dispensing' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'MMD' as indicator_name,
    'Multi-month dispensing patients' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'TLD' as indicator_name,
    'TLD patients' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'TPT Start' as indicator_name,
    'TPT started patients' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'TPT Complete' as indicator_name,
    'TPT completed patients' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'Eligible VL Test' as indicator_name,
    'Eligible for viral load testing' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'VL Tested 12M' as indicator_name,
    'Viral load tested in last 12 months' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'VL Suppression' as indicator_name,
    'Viral load suppression' as description,
    'Count' as metric_type,
    'N/A' as value;

-- =====================================================
-- END OF ANALYSIS
-- =====================================================
-- Generated by ART Web System
-- For support, contact the development team


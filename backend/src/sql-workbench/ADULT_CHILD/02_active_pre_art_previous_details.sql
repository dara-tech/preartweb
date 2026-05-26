-- =====================================================
-- 02 ACTIVE PRE ART PREVIOUS DETAILS
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
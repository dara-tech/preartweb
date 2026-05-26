-- =====================================================
-- 08.2 DEAD DETAILS
-- Generated: 2026-05-26T13:19:28.146Z
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
-- Indicator 9.1: Dead - Detailed Records (matching aggregate logic exactly)
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

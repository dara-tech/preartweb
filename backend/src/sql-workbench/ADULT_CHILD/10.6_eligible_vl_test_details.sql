-- =====================================================
-- 10.6 ELIGIBLE VL TEST DETAILS
-- Generated: 2026-05-26T13:19:28.150Z
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
    '11.6' as step,
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
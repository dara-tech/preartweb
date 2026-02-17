-- =====================================================
-- 10.4 TPT START DETAILS
-- Generated: 2025-10-16T17:34:57.215Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025

-- MAIN QUERY
-- =====================================================
-- Indicator 10.4: TPT Start - Detailed Records (matching aggregate logic)
-- This replicates the exact same CTE structure and logic as the aggregate query

-- Create temporary tables to replace CTEs
CREATE TEMPORARY TABLE temp_tblvisit AS (
    SELECT clinicid, DatVisit, ARTnum, DaApp, vid, 
           ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
    FROM tblavmain 
    WHERE DatVisit <= @EndDate
    UNION ALL 
    SELECT clinicid, DatVisit, ARTnum, DaApp, vid, 
           ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
    FROM tblcvmain 
    WHERE DatVisit <= @EndDate
);

CREATE TEMPORARY TABLE temp_tblimain AS (
    SELECT ClinicID, DafirstVisit, "15+" AS typepatients, TypeofReturn, LClinicID, 
           SiteNameold, DaBirth, TIMESTAMPDIFF(YEAR, DaBirth, @EndDate) AS age, Sex, DaHIV, OffIn 
    FROM tblaimain 
    WHERE DafirstVisit <= @EndDate
    UNION ALL 
    SELECT ClinicID, DafirstVisit, "≤14" AS typepatients, '' AS TypeofReturn, LClinicID, 
           SiteNameold, DaBirth, TIMESTAMPDIFF(YEAR, DaBirth, @EndDate) AS age, Sex, DaTest AS DaHIV, OffIn 
    FROM tblcimain 
    WHERE DafirstVisit <= @EndDate
);

CREATE TEMPORARY TABLE temp_tblart AS (
    SELECT *, TIMESTAMPDIFF(MONTH, DaArt, @EndDate) AS nmonthART 
    FROM tblaart 
    WHERE DaArt <= @EndDate
    UNION ALL 
    SELECT *, TIMESTAMPDIFF(MONTH, DaArt, @EndDate) AS nmonthART 
    FROM tblcart 
    WHERE DaArt <= @EndDate
);

CREATE TEMPORARY TABLE temp_tblexit AS (
    SELECT * FROM tblavpatientstatus WHERE da <= @EndDate
    UNION ALL 
    SELECT * FROM tblcvpatientstatus WHERE da <= @EndDate
);

CREATE TEMPORARY TABLE temp_tblarvdrug AS (
    SELECT vid, drugname, IF(LOCATE('3TC+DTG+TDF', drugname) > 0, "TLD", "Not-TLD") AS TLDStatus 
    FROM (
        SELECT vid, GROUP_CONCAT(DISTINCT DrugName ORDER BY DrugName ASC SEPARATOR '+') AS drugname 
        FROM tblavarvdrug 
        WHERE status <> 1
        GROUP BY vid 
        UNION ALL 
        SELECT vid, GROUP_CONCAT(DISTINCT DrugName ORDER BY DrugName ASC SEPARATOR '+') AS drugname 
        FROM tblcvarvdrug 
        WHERE status <> 1
        GROUP BY vid
    ) tbldrug
);

CREATE TEMPORARY TABLE temp_tblvltested AS (
    SELECT DISTINCT ClinicID, DateResult, HIVLoad,
           IF(DateResult > datelast, "Do_VL_in_12M", "Do_VL_greatn_12M") AS VLdostatus,
           IF(HIVLoad < 1000, "VL-Suppression", "Not-Suppression") AS vlresultstatus  
    FROM (
        SELECT ClinicID, DateResult, HIVLoad, DATE_SUB(@EndDate, INTERVAL 1 YEAR) AS datelast, 
               ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DateResult DESC) AS id 
        FROM (
            SELECT ClinicID, IF(DaArrival < Dat, Dat, DaArrival) AS DateResult, HIVLoad 
            FROM tblpatienttest 
            WHERE HIVLoad != '' AND IF(DaArrival < Dat, Dat, DaArrival) <= @EndDate
        ) tblvltest 
    ) pt 
    WHERE pt.id = 1
);

-- Create temporary table for TPT drug data
CREATE TEMPORARY TABLE temp_tbltptdrugs AS (
    SELECT DrugName, Status, Da, Vid 
    FROM tblavtptdrug 
    WHERE DrugName != "B6"
    UNION ALL 
    SELECT DrugName, Status, Da, Vid 
    FROM tblcvtptdrug 
    WHERE DrugName != "B6"
);

CREATE TEMPORARY TABLE temp_tblvisit_tpt AS (
    SELECT clinicid, DatVisit, vid 
    FROM tblavmain 
    UNION ALL 
    SELECT clinicid, DatVisit, vid 
    FROM tblcvmain 
);

CREATE TEMPORARY TABLE temp_tbltptall AS (
    SELECT clinicid, DatVisit, DrugName, Status, Da 
    FROM temp_tbltptdrugs tp 
    LEFT JOIN temp_tblvisit_tpt v ON tp.vid = v.vid
);

CREATE TEMPORARY TABLE temp_tbltptstart AS (
    SELECT * 
    FROM (
        SELECT *, ROW_NUMBER() OVER(PARTITION BY clinicid ORDER BY DatVisit ASC) AS id 
        FROM temp_tbltptall 
        WHERE status = 0 AND DatVisit <= @EndDate
    ) s 
    WHERE id = 1
);

CREATE TEMPORARY TABLE temp_tbltptstope AS (
    SELECT * 
    FROM (
        SELECT *, ROW_NUMBER() OVER(PARTITION BY clinicid ORDER BY Da DESC) AS id 
        FROM temp_tbltptall 
        WHERE status = 1 AND Da <= @EndDate
    ) s 
    WHERE id = 1
);

CREATE TEMPORARY TABLE temp_tbltptdrug AS (
    SELECT s.clinicid,
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
    FROM temp_tbltptstart s
    LEFT JOIN temp_tbltptstope st ON s.clinicid = st.clinicid
);

-- Main query
SELECT
    '10.4' as step,
    i.clinicid,
    i.Sex AS sex,
    CASE 
        WHEN i.Sex = 0 THEN 'Female'
        WHEN i.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END AS sex_display,
    i.typepatients,
    i.age,
    CASE 
        WHEN i.typepatients = '15+' THEN 'Adult'
        WHEN i.typepatients = '≤14' THEN 'Child'
        ELSE 'Unknown'
    END AS patient_type,
    i.DaBirth,
    i.DafirstVisit,
    a.DaArt,
    v.DatVisit,
    i.OffIn,
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
    CASE
        WHEN LEFT(tp.Tptdrugname, 1) = '3' AND tp.duration >= 2.50 THEN 'TPT Complete'
        WHEN LEFT(tp.Tptdrugname, 1) = '6' AND tp.duration >= 5.50 THEN 'TPT Complete'
        WHEN tp.Tptdrugname IS NULL THEN 'Not Start'
        ELSE 'Not complete'
    END AS tptstatus
FROM temp_tblvisit v
LEFT JOIN temp_tblimain i ON i.clinicid = v.clinicid
LEFT JOIN temp_tblart a ON a.clinicid = v.clinicid
LEFT JOIN temp_tblexit e ON v.clinicid = e.clinicid
LEFT JOIN temp_tbltptdrug tp ON tp.clinicid = v.clinicid
WHERE v.id = 1 AND e.status IS NULL AND a.ART IS NOT NULL
  AND tp.Tptdrugname IS NOT NULL
ORDER BY v.DatVisit DESC, i.clinicid;

-- Clean up temporary tables
DROP TEMPORARY TABLE temp_tblvisit;
DROP TEMPORARY TABLE temp_tblimain;
DROP TEMPORARY TABLE temp_tblart;
DROP TEMPORARY TABLE temp_tblexit;
DROP TEMPORARY TABLE temp_tblarvdrug;
DROP TEMPORARY TABLE temp_tblvltested;
DROP TEMPORARY TABLE temp_tbltptdrugs;
DROP TEMPORARY TABLE temp_tblvisit_tpt;
DROP TEMPORARY TABLE temp_tbltptall;
DROP TEMPORARY TABLE temp_tbltptstart;
DROP TEMPORARY TABLE temp_tbltptstope;
DROP TEMPORARY TABLE temp_tbltptdrug;

-- =====================================================
-- 10.5 TPT COMPLETE DETAILS
-- Generated: 2025-10-16T17:34:57.216Z
-- =====================================================

-- =====================================================
-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters (Quarterly period)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025

-- MAIN QUERY
-- =====================================================
-- Indicator 10.5: TPT Complete - Detailed Records (matching aggregate logic)
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
    SELECT * 
    FROM tblavpatientstatus 
    WHERE da <= @EndDate
    UNION ALL 
    SELECT * 
    FROM tblcvpatientstatus  
    WHERE da <= @EndDate
);

-- Create TPT drug related temporary tables
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
    SELECT s.clinicid, s.DatVisit AS dateStart, s.DrugName AS Tptdrugname, 
           st.da AS Datestop, DATEDIFF(st.da, s.DatVisit) / 30 AS duration,
           CASE 
               WHEN LEFT(s.DrugName, 1) = '3' AND DATEDIFF(st.da, s.DatVisit) / 30 >= 2.50 THEN "TPT Complete"
               WHEN LEFT(s.DrugName, 1) = '6' AND DATEDIFF(st.da, s.DatVisit) / 30 >= 5.50 THEN "TPT Complete"
               WHEN s.DrugName IS NULL THEN "Not Start"
               ELSE "Not complete"
           END AS tptstatus
    FROM temp_tbltptstart s
    LEFT JOIN temp_tbltptstope st ON s.clinicid = st.clinicid
);

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
FROM temp_tblvisit v
LEFT JOIN temp_tblimain i ON i.clinicid = v.clinicid
LEFT JOIN temp_tblart a ON a.clinicid = v.clinicid
LEFT JOIN temp_tblexit e ON v.clinicid = e.clinicid
LEFT JOIN temp_tbltptdrug tp ON tp.clinicid = v.clinicid
WHERE v.id = 1 AND e.status IS NULL AND a.ART IS NOT NULL
  AND tp.tptstatus = 'TPT Complete'
ORDER BY v.DatVisit DESC, i.clinicid;

-- Clean up temporary tables
DROP TEMPORARY TABLE IF EXISTS temp_tblvisit;
DROP TEMPORARY TABLE IF EXISTS temp_tblimain;
DROP TEMPORARY TABLE IF EXISTS temp_tblart;
DROP TEMPORARY TABLE IF EXISTS temp_tblexit;
DROP TEMPORARY TABLE IF EXISTS temp_tbltptdrugs;
DROP TEMPORARY TABLE IF EXISTS temp_tblvisit_tpt;
DROP TEMPORARY TABLE IF EXISTS temp_tbltptall;
DROP TEMPORARY TABLE IF EXISTS temp_tbltptstart;
DROP TEMPORARY TABLE IF EXISTS temp_tbltptstope;
DROP TEMPORARY TABLE IF EXISTS temp_tbltptdrug;

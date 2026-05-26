-- =====================================================
-- 08 TPT NEW START
-- Generated: 2026-05-26T13:19:28.147Z
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
-- TPT Start - new start in reporting period only (8)
-- Same cohort logic as 10.4_tpt_start; counts patients whose first TPT start date is between @StartDate and @EndDate.
WITH tblvisit AS (
    SELECT clinicid
    FROM (
        SELECT
            clinicid,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS rn
        FROM (
            SELECT clinicid, DatVisit
            FROM tblavmain
            WHERE DatVisit <= @EndDate
            UNION ALL
            SELECT clinicid, DatVisit
            FROM tblcvmain
            WHERE DatVisit <= @EndDate
        ) all_visits
    ) latest_visit
    WHERE rn = 1
),
tblimain AS (
    SELECT ClinicID, "15+" AS typepatients, Sex
    FROM tblaimain
    WHERE DafirstVisit <= @EndDate
    UNION ALL
    SELECT ClinicID, "<=14" AS typepatients, Sex
    FROM tblcimain
    WHERE DafirstVisit <= @EndDate
),
tblart AS (
    SELECT ClinicID, ART
    FROM tblaart
    WHERE DaArt <= @EndDate
    UNION ALL
    SELECT ClinicID, ART
    FROM tblcart
    WHERE DaArt <= @EndDate
),
tblexit AS (
    SELECT clinicid, status
    FROM tblavpatientstatus
    WHERE da <= @EndDate
    UNION ALL
    SELECT clinicid, status
    FROM tblcvpatientstatus
    WHERE da <= @EndDate
),
tbltptdrug_visit AS (
    WITH tbltptdrugs AS (
        SELECT DrugName, Status, Da, Vid
        FROM tblavtptdrug
        WHERE DrugName != "B6"
        UNION ALL
        SELECT DrugName, Status, Da, Vid
        FROM tblcvtptdrug
        WHERE DrugName != "B6"
    ),
    tptvisit AS (
        SELECT clinicid, DatVisit, vid
        FROM tblavmain
        UNION ALL
        SELECT clinicid, DatVisit, vid
        FROM tblcvmain
    ),
    tbltptall AS (
        SELECT
            v.clinicid,
            v.DatVisit,
            tp.DrugName,
            tp.Status,
            tp.Da
        FROM tbltptdrugs tp
        LEFT JOIN tptvisit v ON tp.vid = v.vid
    ),
    tbltptstart AS (
        SELECT *
        FROM (
            SELECT
                *,
                ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit ASC) AS rn
            FROM tbltptall
            WHERE status = 0
              AND DatVisit <= @EndDate
        ) s
        WHERE rn = 1
    ),
    tbltptstope AS (
        SELECT *
        FROM (
            SELECT
                *,
                ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY Da DESC) AS rn
            FROM tbltptall
            WHERE status = 1
              AND Da <= @EndDate
        ) s
        WHERE rn = 1
    )
    SELECT
        s.clinicid,
        CASE
            WHEN s.Da IS NULL OR s.Da = '1900-12-31' OR YEAR(s.Da) < 2000 OR YEAR(s.Da) > 2030
            THEN s.DatVisit
            ELSE s.Da
        END AS dateStart,
        s.DrugName AS Tptdrugname,
        st.Da AS Datestop,
        DATEDIFF(
            st.Da,
            CASE
                WHEN s.Da IS NULL OR s.Da = '1900-12-31' OR YEAR(s.Da) < 2000 OR YEAR(s.Da) > 2030
                THEN s.DatVisit
                ELSE s.Da
            END
        ) / 30 AS duration
    FROM tbltptstart s
    LEFT JOIN tbltptstope st ON s.clinicid = st.clinicid
),
tbltptdrug_forma AS (
    SELECT
        ClinicID AS clinicid,
        DaStartTPT AS dateStart,
        CASE TPTdrug
            WHEN 0 THEN '3HP'
            WHEN 1 THEN '6H'
            WHEN 2 THEN '3RH'
            WHEN 3 THEN 'INH'
            ELSE NULL
        END AS Tptdrugname,
        IF(DaEndTPT >= '1990-01-02', DaEndTPT, NULL) AS Datestop,
        IF(DaEndTPT >= '1990-01-02', DATEDIFF(DaEndTPT, DaStartTPT) / 30, NULL) AS duration
    FROM tblaimain
    WHERE DaStartTPT >= '1990-01-02'
      AND TPTdrug >= 0
      AND TPT IN (1, 2)
      AND DafirstVisit <= @EndDate
    UNION ALL
    SELECT
        ClinicID AS clinicid,
        DaStartTPT AS dateStart,
        CASE TPTdrug
            WHEN 0 THEN '3HP'
            WHEN 1 THEN '6H'
            WHEN 2 THEN '3RH'
            WHEN 3 THEN 'INH'
            ELSE NULL
        END AS Tptdrugname,
        IF(DaEndTPT >= '1990-01-02', DaEndTPT, NULL) AS Datestop,
        IF(DaEndTPT >= '1990-01-02', DATEDIFF(DaEndTPT, DaStartTPT) / 30, NULL) AS duration
    FROM tblcimain
    WHERE DaStartTPT >= '1990-01-02'
      AND TPTdrug >= 0
      AND Inh IN (0, 3)
      AND DaFirstVisit <= @EndDate
),
tpt_merged AS (
    SELECT
        v.clinicid,
        i.typepatients,
        i.Sex,
        IF(tv.Tptdrugname IS NOT NULL, tv.Tptdrugname, tf.Tptdrugname) AS Tptdrugname,
        IF(tv.Tptdrugname IS NOT NULL, tv.dateStart, tf.dateStart) AS dateStart,
        IF(tv.Tptdrugname IS NOT NULL, tv.duration, tf.duration) AS duration,
        IF(
            tv.Tptdrugname IS NOT NULL,
            IF(
                LEFT(tv.Tptdrugname, 1) = 3 AND tv.duration >= 2.50, 'TPT Complete',
                IF(
                    LEFT(tv.Tptdrugname, 1) = 6 AND tv.duration >= 5.50, 'TPT Complete',
                    IF(tv.Tptdrugname IS NULL, 'Not Start', 'Not complete')
                )
            ),
            IF(
                LEFT(tf.Tptdrugname, 1) = 3 AND tf.duration >= 2.50, 'TPT Complete',
                IF(
                    LEFT(tf.Tptdrugname, 1) = 6 AND tf.duration >= 5.50, 'TPT Complete',
                    IF(tf.Tptdrugname IS NOT NULL, 'Not complete', 'Not Start')
                )
            )
        ) AS tptstatus
    FROM tblvisit v
    LEFT JOIN tblimain i ON i.ClinicID = v.clinicid
    LEFT JOIN tblart a ON a.ClinicID = v.clinicid
    LEFT JOIN tblexit e ON e.clinicid = v.clinicid
    LEFT JOIN tbltptdrug_visit tv ON tv.clinicid = v.clinicid
    LEFT JOIN tbltptdrug_forma tf ON tf.clinicid = v.clinicid
    WHERE e.status IS NULL
      AND a.ART IS NOT NULL
)

SELECT
    '8. Number of patients started TPT in this quarter' AS Indicator,
    IFNULL(SUM(IF(Sex = 1 AND typepatients = '<=14', 1, 0)), 0) AS Male_0_14,
    IFNULL(SUM(IF(Sex = 0 AND typepatients = '<=14', 1, 0)), 0) AS Female_0_14,
    IFNULL(SUM(IF(Sex = 1 AND typepatients = '15+', 1, 0)), 0) AS Male_over_14,
    IFNULL(SUM(IF(Sex = 0 AND typepatients = '15+', 1, 0)), 0) AS Female_over_14,
    IFNULL(COUNT(*), 0) AS TOTAL
FROM tpt_merged
WHERE tptstatus != 'Not Start'
  AND dateStart BETWEEN @StartDate AND @EndDate;

-- ===================================================================
-- Indicator 5d: Percentage of early visits among ART patients
-- Logic: Compare current visit date with previous appointment date
-- Early: Visit date is before previous appointment date (<0 days difference)
-- ===================================================================

WITH adult_visits AS (
    SELECT
        'Adult' AS type,
        CASE WHEN p.Sex = 0 THEN 'Female' ELSE 'Male' END AS Sex,
        p.ClinicID,
        v.DatVisit,
        v.DaApp AS CurrentAppointment,
        LAG(v.DaApp) OVER (PARTITION BY v.ClinicID ORDER BY v.DatVisit) AS PreviousAppointment,
        DATEDIFF(v.DatVisit, LAG(v.DaApp) OVER (PARTITION BY v.ClinicID ORDER BY v.DatVisit)) AS DaysFromPreviousApp
    FROM tblaimain p
    JOIN tblavmain v ON p.ClinicID = v.ClinicID
    WHERE v.DatVisit BETWEEN :StartDate AND :EndDate
      AND v.DatVisit IS NOT NULL
      AND v.DatVisit <> '0000-00-00'
),

child_visits AS (
    SELECT
        'Child' AS type,
        CASE WHEN p.Sex = 0 THEN 'Female' ELSE 'Male' END AS Sex,
        p.ClinicID,
        v.DatVisit,
        v.DaApp AS CurrentAppointment,
        LAG(v.DaApp) OVER (PARTITION BY v.ClinicID ORDER BY v.DatVisit) AS PreviousAppointment,
        DATEDIFF(v.DatVisit, LAG(v.DaApp) OVER (PARTITION BY v.ClinicID ORDER BY v.DatVisit)) AS DaysFromPreviousApp
    FROM tblcimain p
    JOIN tblcvmain v ON p.ClinicID = v.ClinicID
    WHERE v.DatVisit BETWEEN :StartDate AND :EndDate
      AND v.DatVisit IS NOT NULL
      AND v.DatVisit <> '0000-00-00'
),

all_visits AS (
    SELECT type, Sex, ClinicID, DatVisit, CurrentAppointment, PreviousAppointment, DaysFromPreviousApp
    FROM adult_visits
    UNION ALL
    SELECT type, Sex, ClinicID, DatVisit, CurrentAppointment, PreviousAppointment, DaysFromPreviousApp
    FROM child_visits
),

early_visits AS (
    -- Visits that are before the previous appointment date (negative days difference)
    SELECT
        type,
        Sex,
        ClinicID,
        DatVisit
    FROM all_visits
    WHERE PreviousAppointment IS NOT NULL
      AND PreviousAppointment <> '0000-00-00'
      AND DaysFromPreviousApp < 0  -- Early (visit before appointment)
),

total_visits AS (
    -- All visits (excluding first visits where there's no previous appointment)
    SELECT
        type,
        Sex,
        ClinicID,
        DatVisit
    FROM all_visits
    WHERE PreviousAppointment IS NOT NULL
      AND PreviousAppointment <> '0000-00-00'
)

SELECT
    '5d. Percentage of early visits among ART patients' AS Indicator,
    CAST(IFNULL(COUNT(e.ClinicID), 0) AS UNSIGNED) AS Early_Visits,
    CAST(IFNULL(COUNT(e.ClinicID), 0) AS UNSIGNED) AS TOTAL,
    CAST(IFNULL(COUNT(t.ClinicID), 0) AS UNSIGNED) AS Total_Visits,
    CAST(CASE 
        WHEN COUNT(t.ClinicID) > 0 
        THEN ROUND((COUNT(e.ClinicID) * 100.0 / COUNT(t.ClinicID)), 2)
        ELSE 0.00 
    END AS DECIMAL(5,2)) AS Percentage,
    CAST(IFNULL(SUM(CASE WHEN e.type = 'Child' AND e.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS UNSIGNED) AS Male_0_14,
    CAST(IFNULL(SUM(CASE WHEN e.type = 'Child' AND e.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS UNSIGNED) AS Female_0_14,
    CAST(IFNULL(SUM(CASE WHEN e.type = 'Adult' AND e.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS UNSIGNED) AS Male_over_14,
    CAST(IFNULL(SUM(CASE WHEN e.type = 'Adult' AND e.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS UNSIGNED) AS Female_over_14
FROM total_visits t
LEFT JOIN early_visits e ON e.ClinicID = t.ClinicID 
    AND e.DatVisit = t.DatVisit 
    AND e.type = t.type 
    AND e.Sex = t.Sex;

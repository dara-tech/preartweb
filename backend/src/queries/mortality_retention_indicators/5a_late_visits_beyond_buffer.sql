-- ===================================================================
-- Indicator 5a: Percentage of late visits beyond ARV supply buffer date
-- Logic: Compare current visit date with previous appointment date
-- Late Beyond Buffer: >5 days late from previous appointment
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

late_beyond_buffer AS (
    -- Visits that are more than 5 days late from previous appointment
    SELECT
        type,
        Sex,
        ClinicID,
        DatVisit
    FROM all_visits
    WHERE PreviousAppointment IS NOT NULL
      AND PreviousAppointment <> '0000-00-00'
      AND DaysFromPreviousApp > 5  -- More than 5 days late
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
    '5a. Percentage of late visits beyond ARV supply buffer date' AS Indicator,
    CAST(IFNULL(COUNT(l.ClinicID), 0) AS UNSIGNED) AS Late_Visits_Beyond_Buffer,
    CAST(IFNULL(COUNT(l.ClinicID), 0) AS UNSIGNED) AS TOTAL,
    CAST(IFNULL(COUNT(t.ClinicID), 0) AS UNSIGNED) AS Total_Visits,
    CAST(CASE 
        WHEN COUNT(t.ClinicID) > 0 
        THEN ROUND((COUNT(l.ClinicID) * 100.0 / COUNT(t.ClinicID)), 2)
        ELSE 0.00 
    END AS DECIMAL(5,2)) AS Percentage,
    CAST(IFNULL(SUM(CASE WHEN l.type = 'Child' AND l.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS UNSIGNED) AS Male_0_14,
    CAST(IFNULL(SUM(CASE WHEN l.type = 'Child' AND l.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS UNSIGNED) AS Female_0_14,
    CAST(IFNULL(SUM(CASE WHEN l.type = 'Adult' AND l.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS UNSIGNED) AS Male_over_14,
    CAST(IFNULL(SUM(CASE WHEN l.type = 'Adult' AND l.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS UNSIGNED) AS Female_over_14
FROM total_visits t
LEFT JOIN late_beyond_buffer l ON l.ClinicID = t.ClinicID 
    AND l.DatVisit = t.DatVisit 
    AND l.type = t.type 
    AND l.Sex = t.Sex;

-- ===================================================================
-- CQI Script 3: Missed Appointments
-- ===================================================================
-- Parameters (configure via SET statements below):
--   @StartDate           -- Reporting period start date (YYYY-MM-DD)
--   @EndDate             -- Reporting period end date (YYYY-MM-DD)
--   @GraceDays           -- Allowed grace period after scheduled appointment (days, default 7)
--   @dead_code           -- Patient status code for death (typically 1)
--   @transfer_out_code   -- Patient status code for transfer out (typically 3)
--
-- Notes:
--   * Requires MySQL 8.0+ (uses window functions)
--   * Flags appointments whose grace window ends inside the reporting period
--   * Excludes patients marked as dead or transferred out on/before the grace window end

-- =====================================================
-- PARAMETER SETUP
-- =====================================================
-- Set these parameters before running this query
SET @StartDate = '2025-01-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-03-31';               -- End date (YYYY-MM-DD)
SET @GraceDays = 7;                        -- Grace period after appointment (days)
SET @dead_code = 1;                        -- Dead status code
SET @transfer_out_code = 3;                -- Transfer out status code

WITH adult_visits AS (
    SELECT
        'Adult' AS PatientType,
        CASE WHEN p.Sex = 0 THEN 'Female' ELSE 'Male' END AS Sex,
        p.ClinicID,
        v.ARTnum,
        v.Vid,
        v.DatVisit AS LastVisitDate,
        v.DaApp AS ScheduledAppointment,
        DATE_ADD(v.DaApp, INTERVAL @GraceDays DAY) AS GraceDeadline,
        LEAD(v.DatVisit) OVER (PARTITION BY v.ClinicID ORDER BY v.DatVisit) AS NextVisitDate
    FROM tblaimain p
    JOIN tblavmain v ON p.ClinicID = v.ClinicID
    WHERE
        v.DaApp IS NOT NULL
        AND v.DaApp <> '0000-00-00'
),
adult_latest_status AS (
    SELECT
        s.ClinicID,
        s.Status,
        s.Da,
        ROW_NUMBER() OVER (PARTITION BY s.ClinicID ORDER BY s.Da DESC) AS rn
    FROM tblavpatientstatus s
    WHERE
        s.Status IN (0, 1, 3)
        AND s.Da IS NOT NULL
        AND s.Da <> '0000-00-00'
),
adult_missed AS (
    SELECT
        a.PatientType,
        a.Sex,
        a.ClinicID,
        a.ARTnum,
        a.Vid AS LastVisitID,
        a.LastVisitDate,
        a.ScheduledAppointment,
        a.GraceDeadline,
        a.NextVisitDate,
        CASE
            WHEN a.NextVisitDate IS NULL THEN CONCAT('No follow-up recorded as of ', DATE_FORMAT(@EndDate, '%Y-%m-%d'))
            WHEN a.NextVisitDate > @EndDate THEN CONCAT('Follow-up on ', DATE_FORMAT(a.NextVisitDate, '%Y-%m-%d'), ' (after reporting period)')
            ELSE CONCAT('Follow-up after ', DATEDIFF(a.NextVisitDate, a.ScheduledAppointment), ' days')
        END AS MissedReason,
        GREATEST(
            DATEDIFF(
                LEAST(COALESCE(a.NextVisitDate, @EndDate), @EndDate),
                a.GraceDeadline
            ),
            0
        ) AS DaysBeyondGrace,
        als.Status AS LatestStatusCode,
        als.Da AS LatestStatusDate
    FROM adult_visits a
    LEFT JOIN adult_latest_status als ON als.ClinicID = a.ClinicID AND als.rn = 1
    WHERE
        a.ScheduledAppointment BETWEEN @StartDate AND @EndDate
        AND a.GraceDeadline <= @EndDate
        AND (
            a.NextVisitDate IS NULL
            OR a.NextVisitDate > a.GraceDeadline
        )
        AND NOT EXISTS (
            SELECT 1
            FROM tblavpatientstatus s
            WHERE s.ClinicID = a.ClinicID
              AND s.Status IN (@dead_code, @transfer_out_code)
              AND s.Da IS NOT NULL
              AND s.Da <> '0000-00-00'
              AND s.Da <= a.GraceDeadline
        )
),
child_visits AS (
    SELECT
        'Child' AS PatientType,
        CASE WHEN p.Sex = 0 THEN 'Female' ELSE 'Male' END AS Sex,
        p.ClinicID,
        v.ARTnum,
        v.Vid,
        v.DatVisit AS LastVisitDate,
        v.DaApp AS ScheduledAppointment,
        DATE_ADD(v.DaApp, INTERVAL @GraceDays DAY) AS GraceDeadline,
        LEAD(v.DatVisit) OVER (PARTITION BY v.ClinicID ORDER BY v.DatVisit) AS NextVisitDate
    FROM tblcimain p
    JOIN tblcvmain v ON p.ClinicID = v.ClinicID
    WHERE
        v.DaApp IS NOT NULL
        AND v.DaApp <> '0000-00-00'
),
child_latest_status AS (
    SELECT
        s.ClinicID,
        s.Status,
        s.Da,
        ROW_NUMBER() OVER (PARTITION BY s.ClinicID ORDER BY s.Da DESC) AS rn
    FROM tblcvpatientstatus s
    WHERE
        s.Status IN (0, 1, 3)
        AND s.Da IS NOT NULL
        AND s.Da <> '0000-00-00'
),
child_missed AS (
    SELECT
        c.PatientType,
        c.Sex,
        c.ClinicID,
        c.ARTnum,
        c.Vid AS LastVisitID,
        c.LastVisitDate,
        c.ScheduledAppointment,
        c.GraceDeadline,
        c.NextVisitDate,
        CASE
            WHEN c.NextVisitDate IS NULL THEN CONCAT('No follow-up recorded as of ', DATE_FORMAT(@EndDate, '%Y-%m-%d'))
            WHEN c.NextVisitDate > @EndDate THEN CONCAT('Follow-up on ', DATE_FORMAT(c.NextVisitDate, '%Y-%m-%d'), ' (after reporting period)')
            ELSE CONCAT('Follow-up after ', DATEDIFF(c.NextVisitDate, c.ScheduledAppointment), ' days')
        END AS MissedReason,
        GREATEST(
            DATEDIFF(
                LEAST(COALESCE(c.NextVisitDate, @EndDate), @EndDate),
                c.GraceDeadline
            ),
            0
        ) AS DaysBeyondGrace,
        cls.Status AS LatestStatusCode,
        cls.Da AS LatestStatusDate
    FROM child_visits c
    LEFT JOIN child_latest_status cls ON cls.ClinicID = c.ClinicID AND cls.rn = 1
    WHERE
        c.ScheduledAppointment BETWEEN @StartDate AND @EndDate
        AND c.GraceDeadline <= @EndDate
        AND (
            c.NextVisitDate IS NULL
            OR c.NextVisitDate > c.GraceDeadline
        )
        AND NOT EXISTS (
            SELECT 1
            FROM tblcvpatientstatus s
            WHERE s.ClinicID = c.ClinicID
              AND s.Status IN (@dead_code, @transfer_out_code)
              AND s.Da IS NOT NULL
              AND s.Da <> '0000-00-00'
              AND s.Da <= c.GraceDeadline
        )
),
missed_appointments AS (
    SELECT * FROM adult_missed
    UNION ALL
    SELECT * FROM child_missed
)
SELECT
    PatientType,
    Sex,
    ClinicID,
    ARTnum,
    LastVisitID,
    LastVisitDate,
    ScheduledAppointment,
    GraceDeadline,
    NextVisitDate,
    DaysBeyondGrace,
    MissedReason,
    CASE LatestStatusCode
        WHEN 0 THEN 'Lost'
        WHEN 1 THEN 'Dead'
        WHEN 3 THEN 'Transfer Out'
        ELSE NULL
    END AS LatestStatus,
    LatestStatusDate
FROM missed_appointments
ORDER BY ScheduledAppointment, ClinicID;

-- Optional aggregate breakdown (uncomment if needed)
-- SELECT PatientType, Sex, COUNT(*) AS MissedCount
-- FROM missed_appointments
-- GROUP BY PatientType, Sex
-- ORDER BY PatientType, Sex;
 
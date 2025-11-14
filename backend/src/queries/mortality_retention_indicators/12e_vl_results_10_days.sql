-- ===================================================================
-- Indicator 12e: Percentage of VL test results received within 10 days of sample taken
-- ===================================================================

WITH tblvl_turnaround AS (
    -- Adults with VL test turnaround time
    -- Denominator: All VL tests in the reporting period (who tested in that period)
    -- Numerator: VL tests returned within 10 days (who return in 10 days)
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        pt.HIVLoad as ViralLoad,
        pt.Dat as TestDate,
        pt.DaCollect as SampleDate,
        pt.DaArrival as ResultReceiveDate,
        DATEDIFF(pt.DaArrival, pt.DaCollect) as TurnaroundDays,
        CASE 
            WHEN pt.DaCollect IS NOT NULL 
                AND pt.DaCollect <> '0000-00-00'
                AND pt.DaArrival IS NOT NULL
                AND pt.DaArrival <> '0000-00-00'
                AND DATEDIFF(pt.DaArrival, pt.DaCollect) <= 10 THEN 'Within_10_Days'
            WHEN pt.DaCollect IS NOT NULL 
                AND pt.DaCollect <> '0000-00-00'
                AND pt.DaArrival IS NOT NULL
                AND pt.DaArrival <> '0000-00-00'
                AND DATEDIFF(pt.DaArrival, pt.DaCollect) > 10 THEN 'Over_10_Days'
            ELSE 'No_Result_Yet'
        END as TurnaroundStatus
    FROM tblaimain p 
    INNER JOIN tblpatienttest pt ON CONVERT(p.ClinicID, CHAR) = CONVERT(pt.ClinicID, CHAR)
    WHERE 
        pt.HIVLoad IS NOT NULL
        AND pt.HIVLoad != ''
        AND pt.HIVLoad != '0'
        AND pt.Dat BETWEEN :StartDate AND :EndDate
    
    UNION ALL
    
    -- Children with VL test turnaround time
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        pt.HIVLoad as ViralLoad,
        pt.Dat as TestDate,
        pt.DaCollect as SampleDate,
        pt.DaArrival as ResultReceiveDate,
        DATEDIFF(pt.DaArrival, pt.DaCollect) as TurnaroundDays,
        CASE 
            WHEN pt.DaCollect IS NOT NULL 
                AND pt.DaCollect <> '0000-00-00'
                AND pt.DaArrival IS NOT NULL
                AND pt.DaArrival <> '0000-00-00'
                AND DATEDIFF(pt.DaArrival, pt.DaCollect) <= 10 THEN 'Within_10_Days'
            WHEN pt.DaCollect IS NOT NULL 
                AND pt.DaCollect <> '0000-00-00'
                AND pt.DaArrival IS NOT NULL
                AND pt.DaArrival <> '0000-00-00'
                AND DATEDIFF(pt.DaArrival, pt.DaCollect) > 10 THEN 'Over_10_Days'
            ELSE 'No_Result_Yet'
        END as TurnaroundStatus
    FROM tblcimain p 
    INNER JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID
    WHERE 
        pt.HIVLoad IS NOT NULL
        AND pt.HIVLoad != ''
        AND pt.HIVLoad != '0'
        AND pt.Dat BETWEEN :StartDate AND :EndDate
)

SELECT
    '12e. Percentage of VL test results received within 10 days of sample taken' AS Indicator,
    CAST(SUM(IF(TurnaroundStatus = 'Within_10_Days', 1, 0)) AS UNSIGNED) AS Within_10_Days,
    CAST(SUM(IF(TurnaroundStatus = 'Within_10_Days', 1, 0)) AS UNSIGNED) AS TOTAL,
    -- Denominator: All VL tests in the reporting period (who tested in that period)
    CAST(COUNT(*) AS UNSIGNED) AS Total_With_Dates,
    CAST(CASE 
        WHEN COUNT(*) > 0 
        THEN ROUND((SUM(IF(TurnaroundStatus = 'Within_10_Days', 1, 0)) * 100.0 / COUNT(*)), 2)
        ELSE 0.00 
    END AS DECIMAL(5,2)) AS Percentage,
    -- Total counts by demographic (all VL tests in the reporting period - denominator)
    CAST(SUM(IF(type = 'Child' AND Sex = 'Male', 1, 0)) AS UNSIGNED) AS Male_0_14,
    CAST(SUM(IF(type = 'Child' AND Sex = 'Female', 1, 0)) AS UNSIGNED) AS Female_0_14,
    CAST(SUM(IF(type = 'Adult' AND Sex = 'Male', 1, 0)) AS UNSIGNED) AS Male_over_14,
    CAST(SUM(IF(type = 'Adult' AND Sex = 'Female', 1, 0)) AS UNSIGNED) AS Female_over_14,
    -- Within 10 Days counts by demographic (numerator - who return in 10 days)
    CAST(SUM(IF(type = 'Child' AND Sex = 'Male' AND TurnaroundStatus = 'Within_10_Days', 1, 0)) AS UNSIGNED) AS Male_0_14_Within_10_Days,
    CAST(SUM(IF(type = 'Child' AND Sex = 'Female' AND TurnaroundStatus = 'Within_10_Days', 1, 0)) AS UNSIGNED) AS Female_0_14_Within_10_Days,
    CAST(SUM(IF(type = 'Adult' AND Sex = 'Male' AND TurnaroundStatus = 'Within_10_Days', 1, 0)) AS UNSIGNED) AS Male_over_14_Within_10_Days,
    CAST(SUM(IF(type = 'Adult' AND Sex = 'Female' AND TurnaroundStatus = 'Within_10_Days', 1, 0)) AS UNSIGNED) AS Female_over_14_Within_10_Days
FROM tblvl_turnaround;

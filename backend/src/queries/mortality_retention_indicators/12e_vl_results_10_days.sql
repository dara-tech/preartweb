-- ===================================================================
-- Indicator 12e: Percentage of viral load test results received at sites within 10 days of sample taken
-- (Note: WHO within one month)
-- ===================================================================

WITH tblvl_turnaround AS (
    -- Adults with VL test turnaround time
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        pt.HIVLoad as ViralLoad,
        pt.DaCollect as SampleDate,
        pt.DaArrival as ResultReceiveDate,
        DATEDIFF(pt.DaArrival, pt.DaCollect) as TurnaroundDays,
        CASE 
            WHEN pt.DaCollect IS NOT NULL AND pt.DaArrival IS NOT NULL
                AND DATEDIFF(pt.DaArrival, pt.DaCollect) <= 10 THEN 'Within_10_Days'
            WHEN pt.DaCollect IS NOT NULL AND pt.DaArrival IS NOT NULL THEN 'Over_10_Days'
            ELSE 'Missing_Dates'
        END as TurnaroundStatus
    FROM tblaimain p 
    JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID
    WHERE 
        pt.HIVLoad IS NOT NULL
        AND pt.Dat BETWEEN :StartDate AND :EndDate
        AND pt.DaCollect IS NOT NULL
        AND pt.DaArrival IS NOT NULL
    
    UNION ALL
    
    -- Children with VL test turnaround time
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        pt.HIVLoad as ViralLoad,
        pt.DaCollect as SampleDate,
        pt.DaArrival as ResultReceiveDate,
        DATEDIFF(pt.DaArrival, pt.DaCollect) as TurnaroundDays,
        CASE 
            WHEN pt.DaCollect IS NOT NULL AND pt.DaArrival IS NOT NULL
                AND DATEDIFF(pt.DaArrival, pt.DaCollect) <= 10 THEN 'Within_10_Days'
            WHEN pt.DaCollect IS NOT NULL AND pt.DaArrival IS NOT NULL THEN 'Over_10_Days'
            ELSE 'Missing_Dates'
        END as TurnaroundStatus
    FROM tblcimain p 
    JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID
    WHERE 
        pt.HIVLoad IS NOT NULL
        AND pt.Dat BETWEEN :StartDate AND :EndDate
        AND pt.DaCollect IS NOT NULL
        AND pt.DaArrival IS NOT NULL
)

SELECT
    '12e. Percentage of VL test results received within 10 days of sample taken' AS Indicator,
    IFNULL(SUM(CASE WHEN TurnaroundStatus = 'Within_10_Days' THEN 1 ELSE 0 END), 0) AS Within_10_Days,
    IFNULL(SUM(CASE WHEN TurnaroundStatus IN ('Within_10_Days', 'Over_10_Days') THEN 1 ELSE 0 END), 0) AS Total_With_Dates,
    IFNULL(COUNT(*), 0) AS Total_VL_Tests,
    CASE 
        WHEN SUM(CASE WHEN TurnaroundStatus IN ('Within_10_Days', 'Over_10_Days') THEN 1 ELSE 0 END) > 0 
        THEN ROUND((SUM(CASE WHEN TurnaroundStatus = 'Within_10_Days' THEN 1 ELSE 0 END) * 100.0 / SUM(CASE WHEN TurnaroundStatus IN ('Within_10_Days', 'Over_10_Days') THEN 1 ELSE 0 END)), 2)
        ELSE 0 
    END AS Percentage,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Male' AND TurnaroundStatus = 'Within_10_Days' THEN 1 ELSE 0 END), 0) AS Male_0_14_Within_10_Days,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Female' AND TurnaroundStatus = 'Within_10_Days' THEN 1 ELSE 0 END), 0) AS Female_0_14_Within_10_Days,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' AND TurnaroundStatus = 'Within_10_Days' THEN 1 ELSE 0 END), 0) AS Male_over_14_Within_10_Days,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' AND TurnaroundStatus = 'Within_10_Days' THEN 1 ELSE 0 END), 0) AS Female_over_14_Within_10_Days
FROM tblvl_turnaround;




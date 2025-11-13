-- =====================================================
-- CQI: 12E VL RESULTS 10 DAYS
-- Generated: 2025-10-17T07:41:43.522Z
-- =====================================================

-- =====================================================
-- PARAMETER SETUP (matching CQI service configuration)
-- =====================================================
-- Set these parameters before running this query
-- These match the parameters used in the ART Web CQI service

-- Date parameters (Quarterly period)
SET @StartDate = '2025-01-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-03-31';               -- End date (YYYY-MM-DD) - Q1 2025
SET @PreviousEndDate = '2024-12-31';       -- Previous period end date

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
-- MAIN CQI QUERY
-- =====================================================
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
        AND pt.Dat BETWEEN @StartDate AND @EndDate
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
        AND pt.Dat BETWEEN @StartDate AND @EndDate
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

-- =====================================================
-- CQI: 5D EARLY VISITS
-- Generated: 2025-10-17T07:41:43.526Z
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
-- Indicator 5d: Percentage of early visits among ART patients
-- ===================================================================

WITH tblearlyvisits AS (
    -- Adults with early visits
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        v.DatVisit,
        v.DaApp,
        v.TypeVisit,
        DATEDIFF(v.DaApp, v.DatVisit) as DaysEarly
    FROM tblaimain p 
    JOIN tblavmain v ON p.ClinicID = v.ClinicID
    WHERE 
        v.DatVisit BETWEEN @StartDate AND @EndDate
        AND v.TypeVisit = 1  -- Early visit
    
    UNION ALL
    
    -- Children with early visits
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        v.DatVisit,
        v.DaApp,
        v.TypeVisit,
        DATEDIFF(v.DaApp, v.DatVisit) as DaysEarly
    FROM tblcimain p 
    JOIN tblcvmain v ON p.ClinicID = v.ClinicID
    WHERE 
        v.DatVisit BETWEEN @StartDate AND @EndDate
        AND v.TypeVisit = 1  -- Early visit
),

-- Total visits for denominator
tbltotalvisits AS (
    -- Adult visits
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        v.DatVisit,
        v.DaApp,
        v.TypeVisit
    FROM tblaimain p 
    JOIN tblavmain v ON p.ClinicID = v.ClinicID
    WHERE 
        v.DatVisit BETWEEN @StartDate AND @EndDate
    
    UNION ALL
    
    -- Child visits
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        v.DatVisit,
        v.DaApp,
        v.TypeVisit
    FROM tblcimain p 
    JOIN tblcvmain v ON p.ClinicID = v.ClinicID
    WHERE 
        v.DatVisit BETWEEN @StartDate AND @EndDate
)

SELECT
    '5d. Percentage of early visits among ART patients' AS Indicator,
    IFNULL(COUNT(DISTINCT e.ClinicID), 0) AS Early_Visits,
    IFNULL(COUNT(DISTINCT t.ClinicID), 0) AS Total_Visits,
    CASE 
        WHEN COUNT(DISTINCT t.ClinicID) > 0 
        THEN ROUND((COUNT(DISTINCT e.ClinicID) * 100.0 / COUNT(DISTINCT t.ClinicID)), 2)
        ELSE 0 
    END AS Percentage,
    IFNULL(SUM(CASE WHEN e.type = 'Child' AND e.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_0_14_Early,
    IFNULL(SUM(CASE WHEN e.type = 'Child' AND e.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_0_14_Early,
    IFNULL(SUM(CASE WHEN e.type = 'Adult' AND e.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_over_14_Early,
    IFNULL(SUM(CASE WHEN e.type = 'Adult' AND e.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_over_14_Early
FROM tblearlyvisits e
RIGHT JOIN tbltotalvisits t ON e.ClinicID = t.ClinicID AND e.type = t.type;

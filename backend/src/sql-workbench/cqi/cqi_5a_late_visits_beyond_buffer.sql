-- =====================================================
-- CQI: 5A LATE VISITS BEYOND BUFFER
-- Generated: 2025-10-17T07:41:43.525Z
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
-- Indicator 5a: Percentage of late visits beyond ARV supply buffer date
-- ===================================================================

WITH tbllatevisitsbeyond AS (
    -- Adults with late visits beyond buffer
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        v.DatVisit,
        v.DaApp,
        DATEDIFF(v.DatVisit, v.DaApp) as DaysLate,
        CASE 
            WHEN DATEDIFF(v.DatVisit, v.DaApp) > 30 THEN 'Beyond Buffer'
            ELSE 'Within Buffer'
        END as VisitStatus
    FROM tblaimain p 
    JOIN tblavmain v ON p.ClinicID = v.ClinicID
    WHERE 
        v.DatVisit BETWEEN @StartDate AND @EndDate
        AND v.TypeVisit = 3  -- Late visit
        AND DATEDIFF(v.DatVisit, v.DaApp) > 30  -- Beyond 30-day buffer
    
    UNION ALL
    
    -- Children with late visits beyond buffer
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        v.DatVisit,
        v.DaApp,
        DATEDIFF(v.DatVisit, v.DaApp) as DaysLate,
        CASE 
            WHEN DATEDIFF(v.DatVisit, v.DaApp) > 30 THEN 'Beyond Buffer'
            ELSE 'Within Buffer'
        END as VisitStatus
    FROM tblcimain p 
    JOIN tblcvmain v ON p.ClinicID = v.ClinicID
    WHERE 
        v.DatVisit BETWEEN @StartDate AND @EndDate
        AND v.TypeVisit = 3  -- Late visit
        AND DATEDIFF(v.DatVisit, v.DaApp) > 30  -- Beyond 30-day buffer
),

-- Total visits for denominator
tbltotalvisits AS (
    -- Adult visits
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        v.DatVisit,
        v.DaApp
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
        v.DaApp
    FROM tblcimain p 
    JOIN tblcvmain v ON p.ClinicID = v.ClinicID
    WHERE 
        v.DatVisit BETWEEN @StartDate AND @EndDate
)

SELECT
    '5a. Percentage of late visits beyond ARV supply buffer date' AS Indicator,
    IFNULL(COUNT(DISTINCT l.ClinicID), 0) AS Late_Visits_Beyond_Buffer,
    IFNULL(COUNT(DISTINCT t.ClinicID), 0) AS Total_Visits,
    CASE 
        WHEN COUNT(DISTINCT t.ClinicID) > 0 
        THEN ROUND((COUNT(DISTINCT l.ClinicID) * 100.0 / COUNT(DISTINCT t.ClinicID)), 2)
        ELSE 0 
    END AS Percentage,
    IFNULL(SUM(CASE WHEN l.type = 'Child' AND l.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_0_14_Late,
    IFNULL(SUM(CASE WHEN l.type = 'Child' AND l.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_0_14_Late,
    IFNULL(SUM(CASE WHEN l.type = 'Adult' AND l.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_over_14_Late,
    IFNULL(SUM(CASE WHEN l.type = 'Adult' AND l.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_over_14_Late
FROM tbllatevisitsbeyond l
RIGHT JOIN tbltotalvisits t ON l.ClinicID = t.ClinicID AND l.type = t.type;

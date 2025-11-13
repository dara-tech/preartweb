-- =====================================================
-- CQI: 5.7.1 MORTALITY INDICATORS
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
-- 5.7.1 Mortality indicators and re-engage into care indicators
-- ===================================================================

-- Indicator 1: Percentage of ART patients who died
WITH tblmortality AS (
    -- Adults who died
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        ps.Da as DeathDate,
        ps.Cause as DeathCause
    FROM tblaimain p 
    JOIN tblavpatientstatus ps ON p.ClinicID = ps.ClinicID
    WHERE 
        ps.Status = 1  -- Dead
        AND ps.Da BETWEEN @StartDate AND @EndDate
    
    UNION ALL
    
    -- Children who died
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        ps.Da as DeathDate,
        ps.Cause as DeathCause
    FROM tblcimain p 
    JOIN tblcvpatientstatus ps ON p.ClinicID = ps.ClinicID
    WHERE 
        ps.Status = 1  -- Dead
        AND ps.Da BETWEEN @StartDate AND @EndDate
),

-- Total active ART patients for denominator
tbltotalart AS (
    -- Adults on ART
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaART
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    WHERE 
        art.DaArt <= @EndDate
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
    
    UNION ALL
    
    -- Children on ART
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaART
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = p.ClinicID
    WHERE 
        art.DaArt <= @EndDate
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
)

SELECT
    '1. Percentage of ART patients who died' AS Indicator,
    IFNULL(COUNT(DISTINCT m.ClinicID), 0) AS Deaths,
    IFNULL(COUNT(DISTINCT t.ClinicID), 0) AS Total_ART,
    CASE 
        WHEN COUNT(DISTINCT t.ClinicID) > 0 
        THEN ROUND((COUNT(DISTINCT m.ClinicID) * 100.0 / COUNT(DISTINCT t.ClinicID)), 2)
        ELSE 0 
    END AS Percentage,
    IFNULL(SUM(CASE WHEN m.type = 'Child' AND m.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_0_14_Deaths,
    IFNULL(SUM(CASE WHEN m.type = 'Child' AND m.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_0_14_Deaths,
    IFNULL(SUM(CASE WHEN m.type = 'Adult' AND m.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_over_14_Deaths,
    IFNULL(SUM(CASE WHEN m.type = 'Adult' AND m.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_over_14_Deaths
FROM tblmortality m
RIGHT JOIN tbltotalart t ON m.ClinicID = t.ClinicID AND m.type = t.type;

-- =====================================================
-- CQI: 6 SAME DAY ART INITIATION
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
-- Indicator 6: Percentage of patients newly initiating ART on same-day as diagnosed date
-- (disaggregate: 0 day, 1-7 days, >7 days)
-- ===================================================================

WITH tblsame_day_art AS (
    -- Adults with same-day ART initiation
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaHIV as DiagnosisDate,
        p.DaART as ARTStartDate,
        DATEDIFF(p.DaART, p.DaHIV) as DaysBetween,
        CASE 
            WHEN DATEDIFF(p.DaART, p.DaHIV) = 0 THEN '0 day'
            WHEN DATEDIFF(p.DaART, p.DaHIV) BETWEEN 1 AND 7 THEN '1-7 days'
            WHEN DATEDIFF(p.DaART, p.DaHIV) > 7 THEN '>7 days'
            ELSE 'Unknown'
        END as TimeToART
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    WHERE 
        art.DaArt BETWEEN @StartDate AND @EndDate
        AND p.DaHIV IS NOT NULL
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
    
    UNION ALL
    
    -- Children with same-day ART initiation
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaTest as DiagnosisDate,
        p.DaART as ARTStartDate,
        DATEDIFF(p.DaART, p.DaTest) as DaysBetween,
        CASE 
            WHEN DATEDIFF(p.DaART, p.DaTest) = 0 THEN '0 day'
            WHEN DATEDIFF(p.DaART, p.DaTest) BETWEEN 1 AND 7 THEN '1-7 days'
            WHEN DATEDIFF(p.DaART, p.DaTest) > 7 THEN '>7 days'
            ELSE 'Unknown'
        END as TimeToART
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = p.ClinicID
    WHERE 
        art.DaArt BETWEEN @StartDate AND @EndDate
        AND p.DaTest IS NOT NULL
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
),

-- Total newly initiated patients
tbltotal_initiated AS (
    SELECT 
        type,
        Sex,
        ClinicID,
        TimeToART
    FROM tblsame_day_art
)

SELECT
    '6. Percentage of patients newly initiating ART on same-day as diagnosed date' AS Indicator,
    IFNULL(SUM(CASE WHEN TimeToART = '0 day' THEN 1 ELSE 0 END), 0) AS Same_Day_Initiation,
    IFNULL(SUM(CASE WHEN TimeToART = '1-7 days' THEN 1 ELSE 0 END), 0) AS Initiation_1_7_Days,
    IFNULL(SUM(CASE WHEN TimeToART = '>7 days' THEN 1 ELSE 0 END), 0) AS Initiation_Over_7_Days,
    IFNULL(COUNT(*), 0) AS Total_Newly_Initiated,
    CASE 
        WHEN COUNT(*) > 0 
        THEN ROUND((SUM(CASE WHEN TimeToART = '0 day' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2)
        ELSE 0 
    END AS Percentage_Same_Day,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Male' AND TimeToART = '0 day' THEN 1 ELSE 0 END), 0) AS Male_0_14_Same_Day,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Female' AND TimeToART = '0 day' THEN 1 ELSE 0 END), 0) AS Female_0_14_Same_Day,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' AND TimeToART = '0 day' THEN 1 ELSE 0 END), 0) AS Male_over_14_Same_Day,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' AND TimeToART = '0 day' THEN 1 ELSE 0 END), 0) AS Female_over_14_Same_Day
FROM tbltotal_initiated;

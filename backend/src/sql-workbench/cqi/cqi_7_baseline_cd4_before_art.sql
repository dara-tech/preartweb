-- =====================================================
-- CQI: 7 BASELINE CD4 BEFORE ART
-- Generated: 2025-10-17T07:41:43.527Z
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
-- Indicator 7: Percentage of HIV infected patients who received a baseline CD4 count before starting ART
-- ===================================================================

WITH tblbaseline_cd4 AS (
    -- Adults with baseline CD4 before ART
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaART as ARTStartDate,
        pt.CD4 as BaselineCD4,
        pt.Dat as CD4TestDate,
        CASE 
            WHEN pt.CD4 IS NOT NULL AND pt.Dat <= p.DaART THEN 'Yes'
            ELSE 'No'
        END as HasBaselineCD4
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    LEFT JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID 
        AND pt.CD4 IS NOT NULL 
        AND pt.Dat <= art.DaArt
    WHERE 
        p.DaART BETWEEN @StartDate AND @EndDate
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
    
    UNION ALL
    
    -- Children with baseline CD4 before ART
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaART as ARTStartDate,
        pt.CD4 as BaselineCD4,
        pt.Dat as CD4TestDate,
        CASE 
            WHEN pt.CD4 IS NOT NULL AND pt.Dat <= p.DaART THEN 'Yes'
            ELSE 'No'
        END as HasBaselineCD4
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = p.ClinicID
    LEFT JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID 
        AND pt.CD4 IS NOT NULL 
        AND pt.Dat <= art.DaArt
    WHERE 
        p.DaART BETWEEN @StartDate AND @EndDate
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
)

SELECT
    '7. Percentage of HIV infected patients who received a baseline CD4 count before starting ART' AS Indicator,
    IFNULL(SUM(CASE WHEN HasBaselineCD4 = 'Yes' THEN 1 ELSE 0 END), 0) AS With_Baseline_CD4,
    IFNULL(COUNT(*), 0) AS Total_Newly_Initiated,
    CASE 
        WHEN COUNT(*) > 0 
        THEN ROUND((SUM(CASE WHEN HasBaselineCD4 = 'Yes' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2)
        ELSE 0 
    END AS Percentage,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Male' AND HasBaselineCD4 = 'Yes' THEN 1 ELSE 0 END), 0) AS Male_0_14_With_CD4,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Female' AND HasBaselineCD4 = 'Yes' THEN 1 ELSE 0 END), 0) AS Female_0_14_With_CD4,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' AND HasBaselineCD4 = 'Yes' THEN 1 ELSE 0 END), 0) AS Male_over_14_With_CD4,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' AND HasBaselineCD4 = 'Yes' THEN 1 ELSE 0 END), 0) AS Female_over_14_With_CD4
FROM tblbaseline_cd4;

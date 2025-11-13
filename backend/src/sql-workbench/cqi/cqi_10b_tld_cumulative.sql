-- =====================================================
-- CQI: 10B TLD CUMULATIVE
-- Generated: 2025-10-17T07:41:43.520Z
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
-- Indicator 10b: Percentage of ART patients using TLD as 1st line regimen (cumulative)
-- ===================================================================

WITH tbltld_cumulative AS (
    -- Adults currently using TLD
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        ard.DrugName,
        ard.Da as DrugStartDate,
        ard.Status as DrugStatus,
        CASE 
            WHEN ard.DrugName LIKE '%TLD%' OR ard.DrugName LIKE '%DTG%' THEN 'TLD'
            ELSE 'Non-TLD'
        END as RegimenType
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    JOIN tblavmain v ON p.ClinicID = v.ClinicID
    JOIN tblavarvdrug ard ON v.Vid = ard.Vid
    WHERE 
        v.DatVisit BETWEEN @StartDate AND @EndDate
        AND ard.Status IN (0, 2)  -- Start or Continue
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
    
    UNION ALL
    
    -- Children currently using TLD
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        crd.DrugName,
        crd.Da as DrugStartDate,
        crd.Status as DrugStatus,
        CASE 
            WHEN crd.DrugName LIKE '%TLD%' OR crd.DrugName LIKE '%DTG%' THEN 'TLD'
            ELSE 'Non-TLD'
        END as RegimenType
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = p.ClinicID
    JOIN tblcvmain v ON p.ClinicID = v.ClinicID
    JOIN tblcvarvdrug crd ON v.Vid = crd.Vid
    WHERE 
        v.DatVisit BETWEEN @StartDate AND @EndDate
        AND crd.Status IN (0, 2)  -- Start or Continue
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
),

-- Total ART patients for denominator
tbltotal_art AS (
    -- Adults on ART
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID
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
        p.ClinicID
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = p.ClinicID
    WHERE 
        art.DaArt <= @EndDate
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
)

SELECT
    '10b. Percentage of ART patients using TLD as 1st line regimen (cumulative)' AS Indicator,
    IFNULL(COUNT(DISTINCT CASE WHEN RegimenType = 'TLD' THEN t.ClinicID END), 0) AS TLD_Cumulative,
    IFNULL(COUNT(DISTINCT t.ClinicID), 0) AS Total_ART_Patients,
    CASE 
        WHEN COUNT(DISTINCT t.ClinicID) > 0 
        THEN ROUND((COUNT(DISTINCT CASE WHEN RegimenType = 'TLD' THEN t.ClinicID END) * 100.0 / COUNT(DISTINCT t.ClinicID)), 2)
        ELSE 0 
    END AS Percentage,
    IFNULL(SUM(CASE WHEN tc.type = 'Child' AND tc.Sex = 'Male' AND tc.RegimenType = 'TLD' THEN 1 ELSE 0 END), 0) AS Male_0_14_TLD,
    IFNULL(SUM(CASE WHEN tc.type = 'Child' AND tc.Sex = 'Female' AND tc.RegimenType = 'TLD' THEN 1 ELSE 0 END), 0) AS Female_0_14_TLD,
    IFNULL(SUM(CASE WHEN tc.type = 'Adult' AND tc.Sex = 'Male' AND tc.RegimenType = 'TLD' THEN 1 ELSE 0 END), 0) AS Male_over_14_TLD,
    IFNULL(SUM(CASE WHEN tc.type = 'Adult' AND tc.Sex = 'Female' AND tc.RegimenType = 'TLD' THEN 1 ELSE 0 END), 0) AS Female_over_14_TLD
FROM tbltotal_art t
LEFT JOIN tbltld_cumulative tc ON t.ClinicID = tc.ClinicID AND t.type = tc.type;

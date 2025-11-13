-- =====================================================
-- CQI: 10A TLD NEW INITIATION
-- Generated: 2025-10-17T07:41:43.519Z
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
-- Indicator 10a: Percentage of patients newly initiating ART with TLD as 1st line regimen
-- ===================================================================

WITH tbltld_new_initiation AS (
    -- Adults newly initiating with TLD
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaART as ARTStartDate,
        ard.DrugName,
        CASE 
            WHEN ard.DrugName LIKE '%TLD%' OR ard.DrugName LIKE '%DTG%' THEN 'TLD'
            ELSE 'Non-TLD'
        END as RegimenType
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    JOIN tblavmain v ON p.ClinicID = v.ClinicID AND v.DatVisit = art.DaArt
    JOIN tblavarvdrug ard ON v.Vid = ard.Vid
    WHERE 
        p.DaART BETWEEN @StartDate AND @EndDate
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
        AND ard.Status = 0  -- Start
    
    UNION ALL
    
    -- Children newly initiating with TLD
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaART as ARTStartDate,
        crd.DrugName,
        CASE 
            WHEN crd.DrugName LIKE '%TLD%' OR crd.DrugName LIKE '%DTG%' THEN 'TLD'
            ELSE 'Non-TLD'
        END as RegimenType
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = p.ClinicID
    JOIN tblcvmain v ON p.ClinicID = v.ClinicID AND v.DatVisit = art.DaArt
    JOIN tblcvarvdrug crd ON v.Vid = crd.Vid
    WHERE 
        p.DaART BETWEEN @StartDate AND @EndDate
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
        AND crd.Status = 0  -- Start
)

SELECT
    '10a. Percentage of patients newly initiating ART with TLD as 1st line regimen' AS Indicator,
    IFNULL(SUM(CASE WHEN RegimenType = 'TLD' THEN 1 ELSE 0 END), 0) AS TLD_New_Initiation,
    IFNULL(COUNT(*), 0) AS Total_New_Initiation,
    CASE 
        WHEN COUNT(*) > 0 
        THEN ROUND((SUM(CASE WHEN RegimenType = 'TLD' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2)
        ELSE 0 
    END AS Percentage,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Male' AND RegimenType = 'TLD' THEN 1 ELSE 0 END), 0) AS Male_0_14_TLD,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Female' AND RegimenType = 'TLD' THEN 1 ELSE 0 END), 0) AS Female_0_14_TLD,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' AND RegimenType = 'TLD' THEN 1 ELSE 0 END), 0) AS Male_over_14_TLD,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' AND RegimenType = 'TLD' THEN 1 ELSE 0 END), 0) AS Female_over_14_TLD
FROM tbltld_new_initiation;

-- =====================================================
-- CQI: 9 MMD 3 MONTHS
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
-- Indicator 9: Percentage of ART patients have received MMD ≥ 3 months 
-- (disaggregated: <3m, 3m, 4m, 5m, ≥ 6m)
-- ===================================================================

WITH tblmmd AS (
    -- Adults with MMD dispensed
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        v.DatVisit,
        v.DaApp,
        DATEDIFF(v.DaApp, v.DatVisit) as SupplyDays,
        CASE 
            WHEN DATEDIFF(v.DaApp, v.DatVisit) < 81 THEN '<3m'
            WHEN DATEDIFF(v.DaApp, v.DatVisit) BETWEEN 81 AND 100 THEN '3m'
            WHEN DATEDIFF(v.DaApp, v.DatVisit) BETWEEN 101 AND 130 THEN '4m'
            WHEN DATEDIFF(v.DaApp, v.DatVisit) BETWEEN 131 AND 160 THEN '5m'
            WHEN DATEDIFF(v.DaApp, v.DatVisit) >= 161 THEN '≥6m'
            ELSE '<3m'
        END as MMDCategory
    FROM tblaimain p 
    JOIN tblavmain v ON p.ClinicID = v.ClinicID
    WHERE 
        v.DatVisit BETWEEN @StartDate AND @EndDate
        AND EXISTS (
            SELECT 1 FROM tblaimain art 
            WHERE p.ClinicID = p.ClinicID 
            AND p.DaART <= v.DatVisit
        )
    
    UNION ALL
    
    -- Children with MMD dispensed
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        v.DatVisit,
        v.DaApp,
        DATEDIFF(v.DaApp, v.DatVisit) as SupplyDays,
        CASE 
            WHEN DATEDIFF(v.DaApp, v.DatVisit) < 81 THEN '<3m'
            WHEN DATEDIFF(v.DaApp, v.DatVisit) BETWEEN 81 AND 100 THEN '3m'
            WHEN DATEDIFF(v.DaApp, v.DatVisit) BETWEEN 101 AND 130 THEN '4m'
            WHEN DATEDIFF(v.DaApp, v.DatVisit) BETWEEN 131 AND 160 THEN '5m'
            WHEN DATEDIFF(v.DaApp, v.DatVisit) >= 161 THEN '≥6m'
            ELSE '<3m'
        END as MMDCategory
    FROM tblcimain p 
    JOIN tblcvmain v ON p.ClinicID = v.ClinicID
    WHERE 
        v.DatVisit BETWEEN @StartDate AND @EndDate
        AND EXISTS (
            SELECT 1 FROM tblcart art 
            WHERE p.ClinicID = p.ClinicID 
            AND p.DaART <= v.DatVisit
        )
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
    '9. Percentage of ART patients have received MMD ≥ 3 months' AS Indicator,
    IFNULL(SUM(CASE WHEN MMDCategory IN ('3m', '4m', '5m', '≥6m') THEN 1 ELSE 0 END), 0) AS MMD_3_Plus_Months,
    IFNULL(SUM(CASE WHEN MMDCategory = '<3m' THEN 1 ELSE 0 END), 0) AS MMD_Less_Than_3m,
    IFNULL(SUM(CASE WHEN MMDCategory = '3m' THEN 1 ELSE 0 END), 0) AS MMD_3m,
    IFNULL(SUM(CASE WHEN MMDCategory = '4m' THEN 1 ELSE 0 END), 0) AS MMD_4m,
    IFNULL(SUM(CASE WHEN MMDCategory = '5m' THEN 1 ELSE 0 END), 0) AS MMD_5m,
    IFNULL(SUM(CASE WHEN MMDCategory = '≥6m' THEN 1 ELSE 0 END), 0) AS MMD_6m_Plus,
    IFNULL(COUNT(DISTINCT t.ClinicID), 0) AS Total_ART_Patients,
    CASE 
        WHEN COUNT(DISTINCT t.ClinicID) > 0 
        THEN ROUND((SUM(CASE WHEN MMDCategory IN ('3m', '4m', '5m', '≥6m') THEN 1 ELSE 0 END) * 100.0 / COUNT(DISTINCT t.ClinicID)), 2)
        ELSE 0 
    END AS Percentage_MMD_3_Plus,
    IFNULL(SUM(CASE WHEN m.type = 'Child' AND m.Sex = 'Male' AND MMDCategory IN ('3m', '4m', '5m', '≥6m') THEN 1 ELSE 0 END), 0) AS Male_0_14_MMD_3_Plus,
    IFNULL(SUM(CASE WHEN m.type = 'Child' AND m.Sex = 'Female' AND MMDCategory IN ('3m', '4m', '5m', '≥6m') THEN 1 ELSE 0 END), 0) AS Female_0_14_MMD_3_Plus,
    IFNULL(SUM(CASE WHEN m.type = 'Adult' AND m.Sex = 'Male' AND MMDCategory IN ('3m', '4m', '5m', '≥6m') THEN 1 ELSE 0 END), 0) AS Male_over_14_MMD_3_Plus,
    IFNULL(SUM(CASE WHEN m.type = 'Adult' AND m.Sex = 'Female' AND MMDCategory IN ('3m', '4m', '5m', '≥6m') THEN 1 ELSE 0 END), 0) AS Female_over_14_MMD_3_Plus
FROM tblmmd m
RIGHT JOIN tbltotal_art t ON m.ClinicID = t.ClinicID AND m.type = t.type;

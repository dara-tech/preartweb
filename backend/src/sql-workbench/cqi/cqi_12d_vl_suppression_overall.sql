-- =====================================================
-- CQI: 12D VL SUPPRESSION OVERALL
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
-- Indicator 12d: Percentage of people living with HIV and receiving antiretroviral therapy who have suppressed viral load [WHO VLS.3]
-- ===================================================================

WITH tblvl_suppression_overall AS (
    -- Adults with overall VL suppression
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        pt.HIVLoad as LatestViralLoad,
        pt.Dat as VLTestDate,
        CASE 
            WHEN pt.HIVLoad IS NOT NULL 
                AND pt.Dat >= DATE_SUB(@EndDate, INTERVAL 12 MONTH)
                AND CAST(REPLACE(pt.HIVLoad, '<', '') AS UNSIGNED) < 1000 THEN 'Suppressed'
            WHEN pt.HIVLoad IS NOT NULL 
                AND pt.Dat >= DATE_SUB(@EndDate, INTERVAL 12 MONTH) THEN 'Not_Suppressed'
            ELSE 'Not_Tested'
        END as VLStatus
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    LEFT JOIN (
        SELECT 
            pt1.ClinicID,
            pt1.HIVLoad,
            pt1.Dat,
            ROW_NUMBER() OVER (PARTITION BY pt1.ClinicID ORDER BY pt1.Dat DESC) as rn
        FROM tblpatienttest pt1
        WHERE pt1.HIVLoad IS NOT NULL 
        AND pt1.Dat >= DATE_SUB(@EndDate, INTERVAL 12 MONTH)
    ) pt ON p.ClinicID = pt.ClinicID AND pt.rn = 1
    WHERE 
        art.DaArt <= @EndDate
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
    
    UNION ALL
    
    -- Children with overall VL suppression
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        pt.HIVLoad as LatestViralLoad,
        pt.Dat as VLTestDate,
        CASE 
            WHEN pt.HIVLoad IS NOT NULL 
                AND pt.Dat >= DATE_SUB(@EndDate, INTERVAL 12 MONTH)
                AND CAST(REPLACE(pt.HIVLoad, '<', '') AS UNSIGNED) < 1000 THEN 'Suppressed'
            WHEN pt.HIVLoad IS NOT NULL 
                AND pt.Dat >= DATE_SUB(@EndDate, INTERVAL 12 MONTH) THEN 'Not_Suppressed'
            ELSE 'Not_Tested'
        END as VLStatus
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = p.ClinicID
    LEFT JOIN (
        SELECT 
            pt1.ClinicID,
            pt1.HIVLoad,
            pt1.Dat,
            ROW_NUMBER() OVER (PARTITION BY pt1.ClinicID ORDER BY pt1.Dat DESC) as rn
        FROM tblpatienttest pt1
        WHERE pt1.HIVLoad IS NOT NULL 
        AND pt1.Dat >= DATE_SUB(@EndDate, INTERVAL 12 MONTH)
    ) pt ON p.ClinicID = pt.ClinicID AND pt.rn = 1
    WHERE 
        art.DaArt <= @EndDate
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
)

SELECT
    '12d. Percentage of ART patients who have suppressed viral load [WHO VLS.3]' AS Indicator,
    IFNULL(SUM(CASE WHEN VLStatus = 'Suppressed' THEN 1 ELSE 0 END), 0) AS VL_Suppressed_Overall,
    IFNULL(SUM(CASE WHEN VLStatus IN ('Suppressed', 'Not_Suppressed') THEN 1 ELSE 0 END), 0) AS VL_Tested_Overall,
    IFNULL(COUNT(*), 0) AS Total_ART_Patients,
    CASE 
        WHEN SUM(CASE WHEN VLStatus IN ('Suppressed', 'Not_Suppressed') THEN 1 ELSE 0 END) > 0 
        THEN ROUND((SUM(CASE WHEN VLStatus = 'Suppressed' THEN 1 ELSE 0 END) * 100.0 / SUM(CASE WHEN VLStatus IN ('Suppressed', 'Not_Suppressed') THEN 1 ELSE 0 END)), 2)
        ELSE 0 
    END AS Percentage_Of_Tested,
    CASE 
        WHEN COUNT(*) > 0 
        THEN ROUND((SUM(CASE WHEN VLStatus = 'Suppressed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2)
        ELSE 0 
    END AS Percentage_Of_Total,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Male' AND VLStatus = 'Suppressed' THEN 1 ELSE 0 END), 0) AS Male_0_14_Suppressed,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Female' AND VLStatus = 'Suppressed' THEN 1 ELSE 0 END), 0) AS Female_0_14_Suppressed,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' AND VLStatus = 'Suppressed' THEN 1 ELSE 0 END), 0) AS Male_over_14_Suppressed,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' AND VLStatus = 'Suppressed' THEN 1 ELSE 0 END), 0) AS Female_over_14_Suppressed
FROM tblvl_suppression_overall;

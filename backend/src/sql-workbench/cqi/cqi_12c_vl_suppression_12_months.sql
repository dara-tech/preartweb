-- =====================================================
-- CQI: 12C VL SUPPRESSION 12 MONTHS
-- Generated: 2025-10-17T07:41:43.521Z
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
-- Indicator 12c: Percentage of people receiving antiretroviral therapy tested for viral load at <1000 copies/mL at 12 months after initiating antiretroviral therapy [WHO: VLS.1]
-- ===================================================================

WITH tblvl_suppression_12m AS (
    -- Adults with VL suppression at 12 months
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaART as ARTStartDate,
        pt.HIVLoad as ViralLoad,
        pt.Dat as VLTestDate,
        TIMESTAMPDIFF(MONTH, p.DaART, pt.Dat) as MonthsOnART,
        CASE 
            WHEN pt.HIVLoad IS NOT NULL 
                AND pt.Dat BETWEEN DATE_ADD(p.DaART, INTERVAL 11 MONTH) AND DATE_ADD(p.DaART, INTERVAL 13 MONTH)
                AND pt.Dat <= @EndDate
                AND CAST(REPLACE(pt.HIVLoad, '<', '') AS UNSIGNED) < 1000 THEN 'Suppressed'
            WHEN pt.HIVLoad IS NOT NULL 
                AND pt.Dat BETWEEN DATE_ADD(p.DaART, INTERVAL 11 MONTH) AND DATE_ADD(p.DaART, INTERVAL 13 MONTH)
                AND pt.Dat <= @EndDate THEN 'Not_Suppressed'
            ELSE 'Not_Tested'
        END as VLStatus
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    LEFT JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID 
        AND pt.HIVLoad IS NOT NULL
        AND pt.Dat BETWEEN DATE_ADD(art.DaArt, INTERVAL 11 MONTH) AND DATE_ADD(p.DaART, INTERVAL 13 MONTH)
        AND pt.Dat <= @EndDate
    WHERE 
        p.DaART BETWEEN DATE_SUB(@StartDate, INTERVAL 13 MONTH) AND DATE_SUB(@EndDate, INTERVAL 11 MONTH)
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
    
    UNION ALL
    
    -- Children with VL suppression at 12 months
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaART as ARTStartDate,
        pt.HIVLoad as ViralLoad,
        pt.Dat as VLTestDate,
        TIMESTAMPDIFF(MONTH, p.DaART, pt.Dat) as MonthsOnART,
        CASE 
            WHEN pt.HIVLoad IS NOT NULL 
                AND pt.Dat BETWEEN DATE_ADD(p.DaART, INTERVAL 11 MONTH) AND DATE_ADD(p.DaART, INTERVAL 13 MONTH)
                AND pt.Dat <= @EndDate
                AND CAST(REPLACE(pt.HIVLoad, '<', '') AS UNSIGNED) < 1000 THEN 'Suppressed'
            WHEN pt.HIVLoad IS NOT NULL 
                AND pt.Dat BETWEEN DATE_ADD(p.DaART, INTERVAL 11 MONTH) AND DATE_ADD(p.DaART, INTERVAL 13 MONTH)
                AND pt.Dat <= @EndDate THEN 'Not_Suppressed'
            ELSE 'Not_Tested'
        END as VLStatus
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = p.ClinicID
    LEFT JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID 
        AND pt.HIVLoad IS NOT NULL
        AND pt.Dat BETWEEN DATE_ADD(art.DaArt, INTERVAL 11 MONTH) AND DATE_ADD(p.DaART, INTERVAL 13 MONTH)
        AND pt.Dat <= @EndDate
    WHERE 
        p.DaART BETWEEN DATE_SUB(@StartDate, INTERVAL 13 MONTH) AND DATE_SUB(@EndDate, INTERVAL 11 MONTH)
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
)

SELECT
    '12c. Percentage of ART patients with VL <1000 copies/mL at 12 months [WHO VLS.1]' AS Indicator,
    IFNULL(SUM(CASE WHEN VLStatus = 'Suppressed' THEN 1 ELSE 0 END), 0) AS VL_Suppressed_12M,
    IFNULL(SUM(CASE WHEN VLStatus IN ('Suppressed', 'Not_Suppressed') THEN 1 ELSE 0 END), 0) AS VL_Tested_12M,
    IFNULL(COUNT(*), 0) AS Total_Eligible_Patients,
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
FROM tblvl_suppression_12m;

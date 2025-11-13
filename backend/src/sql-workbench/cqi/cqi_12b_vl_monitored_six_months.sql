-- =====================================================
-- CQI: 12B VL MONITORED SIX MONTHS
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
-- Indicator 12b: Percentage of people receiving antiretroviral therapy who had viral load monitored at six months [WHO VLS.6]
-- ===================================================================

WITH tblvl_six_months AS (
    -- Adults with VL testing at 6 months
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
                AND pt.Dat BETWEEN DATE_ADD(p.DaART, INTERVAL 5 MONTH) AND DATE_ADD(p.DaART, INTERVAL 7 MONTH)
                AND pt.Dat <= @EndDate THEN 'Monitored'
            ELSE 'Not_Monitored'
        END as VLStatus
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    LEFT JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID 
        AND pt.HIVLoad IS NOT NULL
        AND pt.Dat BETWEEN DATE_ADD(art.DaArt, INTERVAL 5 MONTH) AND DATE_ADD(p.DaART, INTERVAL 7 MONTH)
        AND pt.Dat <= @EndDate
    WHERE 
        p.DaART BETWEEN DATE_SUB(@StartDate, INTERVAL 7 MONTH) AND DATE_SUB(@EndDate, INTERVAL 5 MONTH)
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
    
    UNION ALL
    
    -- Children with VL testing at 6 months
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
                AND pt.Dat BETWEEN DATE_ADD(p.DaART, INTERVAL 5 MONTH) AND DATE_ADD(p.DaART, INTERVAL 7 MONTH)
                AND pt.Dat <= @EndDate THEN 'Monitored'
            ELSE 'Not_Monitored'
        END as VLStatus
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = p.ClinicID
    LEFT JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID 
        AND pt.HIVLoad IS NOT NULL
        AND pt.Dat BETWEEN DATE_ADD(art.DaArt, INTERVAL 5 MONTH) AND DATE_ADD(p.DaART, INTERVAL 7 MONTH)
        AND pt.Dat <= @EndDate
    WHERE 
        p.DaART BETWEEN DATE_SUB(@StartDate, INTERVAL 7 MONTH) AND DATE_SUB(@EndDate, INTERVAL 5 MONTH)
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
)

SELECT
    '12b. Percentage of ART patients who had VL monitored at six months [WHO VLS.6]' AS Indicator,
    IFNULL(SUM(CASE WHEN VLStatus = 'Monitored' THEN 1 ELSE 0 END), 0) AS VL_Monitored_6M,
    IFNULL(COUNT(*), 0) AS Total_Eligible_Patients,
    CASE 
        WHEN COUNT(*) > 0 
        THEN ROUND((SUM(CASE WHEN VLStatus = 'Monitored' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2)
        ELSE 0 
    END AS Percentage,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Male' AND VLStatus = 'Monitored' THEN 1 ELSE 0 END), 0) AS Male_0_14_Monitored,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Female' AND VLStatus = 'Monitored' THEN 1 ELSE 0 END), 0) AS Female_0_14_Monitored,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' AND VLStatus = 'Monitored' THEN 1 ELSE 0 END), 0) AS Male_over_14_Monitored,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' AND VLStatus = 'Monitored' THEN 1 ELSE 0 END), 0) AS Female_over_14_Monitored
FROM tblvl_six_months;

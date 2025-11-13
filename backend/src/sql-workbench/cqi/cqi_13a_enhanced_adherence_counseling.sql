-- =====================================================
-- CQI: 13A ENHANCED ADHERENCE COUNSELING
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
-- Indicator 13a: Percentage of PLHIV receiving ART with a viral load ≥1000 copies/mL who received enhanced adherence counselling
-- ===================================================================

WITH tblenhanced_adherence AS (
    -- Adults with high VL who received enhanced adherence counseling
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        pt.HIVLoad as ViralLoad,
        pt.Dat as VLTestDate,
        v.VLDetectable as EnhancedCounseling,
        CASE 
            WHEN pt.HIVLoad IS NOT NULL 
                AND CAST(REPLACE(pt.HIVLoad, '<', '') AS UNSIGNED) >= 1000
                AND v.VLDetectable IS NOT NULL 
                AND v.VLDetectable > 0 THEN 'Received'
            WHEN pt.HIVLoad IS NOT NULL 
                AND CAST(REPLACE(pt.HIVLoad, '<', '') AS UNSIGNED) >= 1000 THEN 'Not_Received'
            ELSE 'Not_Eligible'
        END as CounselingStatus
    FROM tblaimain p 
    JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID
    LEFT JOIN tblavmain v ON p.ClinicID = v.ClinicID 
        AND v.DatVisit >= pt.Dat
        AND v.VLDetectable IS NOT NULL
        AND v.VLDetectable > 0
    WHERE 
        pt.HIVLoad IS NOT NULL
        AND pt.Dat BETWEEN @StartDate AND @EndDate
        AND CAST(REPLACE(pt.HIVLoad, '<', '') AS UNSIGNED) >= 1000
    
    UNION ALL
    
    -- Children with high VL who received enhanced adherence counseling
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        pt.HIVLoad as ViralLoad,
        pt.Dat as VLTestDate,
        v.VLDetectable as EnhancedCounseling,
        CASE 
            WHEN pt.HIVLoad IS NOT NULL 
                AND CAST(REPLACE(pt.HIVLoad, '<', '') AS UNSIGNED) >= 1000
                AND v.VLDetectable IS NOT NULL 
                AND v.VLDetectable > 0 THEN 'Received'
            WHEN pt.HIVLoad IS NOT NULL 
                AND CAST(REPLACE(pt.HIVLoad, '<', '') AS UNSIGNED) >= 1000 THEN 'Not_Received'
            ELSE 'Not_Eligible'
        END as CounselingStatus
    FROM tblcimain p 
    JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID
    LEFT JOIN tblcvmain v ON p.ClinicID = v.ClinicID 
        AND v.DatVisit >= pt.Dat
        AND v.VLDetectable IS NOT NULL
        AND v.VLDetectable > 0
    WHERE 
        pt.HIVLoad IS NOT NULL
        AND pt.Dat BETWEEN @StartDate AND @EndDate
        AND CAST(REPLACE(pt.HIVLoad, '<', '') AS UNSIGNED) >= 1000
)

SELECT
    '13a. Percentage of PLHIV receiving ART with VL ≥1000 copies/mL who received enhanced adherence counselling' AS Indicator,
    IFNULL(SUM(CASE WHEN CounselingStatus = 'Received' THEN 1 ELSE 0 END), 0) AS Received_Counseling,
    IFNULL(SUM(CASE WHEN CounselingStatus IN ('Received', 'Not_Received') THEN 1 ELSE 0 END), 0) AS Eligible_Patients,
    IFNULL(COUNT(*), 0) AS Total_High_VL,
    CASE 
        WHEN SUM(CASE WHEN CounselingStatus IN ('Received', 'Not_Received') THEN 1 ELSE 0 END) > 0 
        THEN ROUND((SUM(CASE WHEN CounselingStatus = 'Received' THEN 1 ELSE 0 END) * 100.0 / SUM(CASE WHEN CounselingStatus IN ('Received', 'Not_Received') THEN 1 ELSE 0 END)), 2)
        ELSE 0 
    END AS Percentage,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Male' AND CounselingStatus = 'Received' THEN 1 ELSE 0 END), 0) AS Male_0_14_Received,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Female' AND CounselingStatus = 'Received' THEN 1 ELSE 0 END), 0) AS Female_0_14_Received,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' AND CounselingStatus = 'Received' THEN 1 ELSE 0 END), 0) AS Male_over_14_Received,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' AND CounselingStatus = 'Received' THEN 1 ELSE 0 END), 0) AS Female_over_14_Received
FROM tblenhanced_adherence;

-- =====================================================
-- CQI: 13C VL SUPPRESSION AFTER COUNSELING
-- Generated: 2025-10-17T07:41:43.523Z
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
-- Indicator 13c: Percentage of PLHIV receiving ART with viral load ≥1000 copies/mL who achieved viral suppression after enhanced adherence counselling
-- ===================================================================

WITH tblvl_suppression_after_counseling AS (
    -- Adults with VL suppression after enhanced counseling
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        pt1.HIVLoad as InitialViralLoad,
        pt1.Dat as InitialVLDate,
        v1.VLDetectable as CounselingReceived,
        pt2.HIVLoad as FollowupViralLoad,
        pt2.Dat as FollowupVLDate,
        DATEDIFF(pt2.Dat, v1.DatVisit) as DaysToFollowup,
        CASE 
            WHEN pt1.HIVLoad IS NOT NULL 
                AND CAST(REPLACE(pt1.HIVLoad, '<', '') AS UNSIGNED) >= 1000
                AND v1.VLDetectable IS NOT NULL 
                AND v1.VLDetectable > 0
                AND pt2.HIVLoad IS NOT NULL
                AND pt2.Dat BETWEEN v1.DatVisit AND DATE_ADD(v1.DatVisit, INTERVAL 6 MONTH)
                AND CAST(REPLACE(pt2.HIVLoad, '<', '') AS UNSIGNED) < 1000 THEN 'Suppressed'
            WHEN pt1.HIVLoad IS NOT NULL 
                AND CAST(REPLACE(pt1.HIVLoad, '<', '') AS UNSIGNED) >= 1000
                AND v1.VLDetectable IS NOT NULL 
                AND v1.VLDetectable > 0
                AND pt2.HIVLoad IS NOT NULL
                AND pt2.Dat BETWEEN v1.DatVisit AND DATE_ADD(v1.DatVisit, INTERVAL 6 MONTH) THEN 'Not_Suppressed'
            WHEN pt1.HIVLoad IS NOT NULL 
                AND CAST(REPLACE(pt1.HIVLoad, '<', '') AS UNSIGNED) >= 1000
                AND v1.VLDetectable IS NOT NULL 
                AND v1.VLDetectable > 0 THEN 'No_Followup'
            ELSE 'Not_Eligible'
        END as SuppressionStatus
    FROM tblaimain p 
    JOIN tblpatienttest pt1 ON p.ClinicID = pt1.ClinicID
    JOIN tblavmain v1 ON p.ClinicID = v1.ClinicID 
        AND v1.DatVisit >= pt1.Dat
        AND v1.VLDetectable IS NOT NULL
        AND v1.VLDetectable > 0
    LEFT JOIN tblpatienttest pt2 ON p.ClinicID = pt2.ClinicID 
        AND pt2.Dat > v1.DatVisit
        AND pt2.Dat BETWEEN v1.DatVisit AND DATE_ADD(v1.DatVisit, INTERVAL 6 MONTH)
    WHERE 
        pt1.HIVLoad IS NOT NULL
        AND pt1.Dat BETWEEN @StartDate AND @EndDate
        AND CAST(REPLACE(pt1.HIVLoad, '<', '') AS UNSIGNED) >= 1000
    
    UNION ALL
    
    -- Children with VL suppression after enhanced counseling
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        pt1.HIVLoad as InitialViralLoad,
        pt1.Dat as InitialVLDate,
        v1.VLDetectable as CounselingReceived,
        pt2.HIVLoad as FollowupViralLoad,
        pt2.Dat as FollowupVLDate,
        DATEDIFF(pt2.Dat, v1.DatVisit) as DaysToFollowup,
        CASE 
            WHEN pt1.HIVLoad IS NOT NULL 
                AND CAST(REPLACE(pt1.HIVLoad, '<', '') AS UNSIGNED) >= 1000
                AND v1.VLDetectable IS NOT NULL 
                AND v1.VLDetectable > 0
                AND pt2.HIVLoad IS NOT NULL
                AND pt2.Dat BETWEEN v1.DatVisit AND DATE_ADD(v1.DatVisit, INTERVAL 6 MONTH)
                AND CAST(REPLACE(pt2.HIVLoad, '<', '') AS UNSIGNED) < 1000 THEN 'Suppressed'
            WHEN pt1.HIVLoad IS NOT NULL 
                AND CAST(REPLACE(pt1.HIVLoad, '<', '') AS UNSIGNED) >= 1000
                AND v1.VLDetectable IS NOT NULL 
                AND v1.VLDetectable > 0
                AND pt2.HIVLoad IS NOT NULL
                AND pt2.Dat BETWEEN v1.DatVisit AND DATE_ADD(v1.DatVisit, INTERVAL 6 MONTH) THEN 'Not_Suppressed'
            WHEN pt1.HIVLoad IS NOT NULL 
                AND CAST(REPLACE(pt1.HIVLoad, '<', '') AS UNSIGNED) >= 1000
                AND v1.VLDetectable IS NOT NULL 
                AND v1.VLDetectable > 0 THEN 'No_Followup'
            ELSE 'Not_Eligible'
        END as SuppressionStatus
    FROM tblcimain p 
    JOIN tblpatienttest pt1 ON p.ClinicID = pt1.ClinicID
    JOIN tblcvmain v1 ON p.ClinicID = v1.ClinicID 
        AND v1.DatVisit >= pt1.Dat
        AND v1.VLDetectable IS NOT NULL
        AND v1.VLDetectable > 0
    LEFT JOIN tblpatienttest pt2 ON p.ClinicID = pt2.ClinicID 
        AND pt2.Dat > v1.DatVisit
        AND pt2.Dat BETWEEN v1.DatVisit AND DATE_ADD(v1.DatVisit, INTERVAL 6 MONTH)
    WHERE 
        pt1.HIVLoad IS NOT NULL
        AND pt1.Dat BETWEEN @StartDate AND @EndDate
        AND CAST(REPLACE(pt1.HIVLoad, '<', '') AS UNSIGNED) >= 1000
)

SELECT
    '13c. Percentage of PLHIV with VL ≥1000 copies/mL who achieved viral suppression after enhanced adherence counselling' AS Indicator,
    IFNULL(SUM(CASE WHEN SuppressionStatus = 'Suppressed' THEN 1 ELSE 0 END), 0) AS Achieved_Suppression,
    IFNULL(SUM(CASE WHEN SuppressionStatus IN ('Suppressed', 'Not_Suppressed') THEN 1 ELSE 0 END), 0) AS With_Followup_VL,
    IFNULL(SUM(CASE WHEN SuppressionStatus IN ('Suppressed', 'Not_Suppressed', 'No_Followup') THEN 1 ELSE 0 END), 0) AS Eligible_Patients,
    IFNULL(COUNT(*), 0) AS Total_High_VL_Counseled,
    CASE 
        WHEN SUM(CASE WHEN SuppressionStatus IN ('Suppressed', 'Not_Suppressed') THEN 1 ELSE 0 END) > 0 
        THEN ROUND((SUM(CASE WHEN SuppressionStatus = 'Suppressed' THEN 1 ELSE 0 END) * 100.0 / SUM(CASE WHEN SuppressionStatus IN ('Suppressed', 'Not_Suppressed') THEN 1 ELSE 0 END)), 2)
        ELSE 0 
    END AS Percentage_Of_Followup,
    CASE 
        WHEN SUM(CASE WHEN SuppressionStatus IN ('Suppressed', 'Not_Suppressed', 'No_Followup') THEN 1 ELSE 0 END) > 0 
        THEN ROUND((SUM(CASE WHEN SuppressionStatus = 'Suppressed' THEN 1 ELSE 0 END) * 100.0 / SUM(CASE WHEN SuppressionStatus IN ('Suppressed', 'Not_Suppressed', 'No_Followup') THEN 1 ELSE 0 END)), 2)
        ELSE 0 
    END AS Percentage_Of_Eligible,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Male' AND SuppressionStatus = 'Suppressed' THEN 1 ELSE 0 END), 0) AS Male_0_14_Suppressed,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Female' AND SuppressionStatus = 'Suppressed' THEN 1 ELSE 0 END), 0) AS Female_0_14_Suppressed,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' AND SuppressionStatus = 'Suppressed' THEN 1 ELSE 0 END), 0) AS Male_over_14_Suppressed,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' AND SuppressionStatus = 'Suppressed' THEN 1 ELSE 0 END), 0) AS Female_over_14_Suppressed
FROM tblvl_suppression_after_counseling;

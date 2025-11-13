-- =====================================================
-- CQI: 14A FIRST LINE TO SECOND LINE
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
-- Indicator 14a: Percentage of PLHIV receiving first line ART with two consecutive documented viral load test results ≥1000 copies/mL switching to second line
-- ===================================================================

WITH tblfirst_to_second_line AS (
    -- Adults switching from first line to second line
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaART as ARTStartDate,
        pt1.HIVLoad as FirstVL,
        pt1.Dat as FirstVLDate,
        pt2.HIVLoad as SecondVL,
        pt2.Dat as SecondVLDate,
        ard.DrugName as CurrentRegimen,
        ard.Da as RegimenStartDate,
        CASE 
            WHEN pt1.HIVLoad IS NOT NULL 
                AND pt2.HIVLoad IS NOT NULL
                AND CAST(REPLACE(pt1.HIVLoad, '<', '') AS UNSIGNED) >= 1000
                AND CAST(REPLACE(pt2.HIVLoad, '<', '') AS UNSIGNED) >= 1000
                AND pt2.Dat > pt1.Dat
                AND DATEDIFF(pt2.Dat, pt1.Dat) BETWEEN 30 AND 180  -- Within 3-6 months
                AND ard.DrugName LIKE '%2nd%'  -- Second line regimen
                AND ard.Da >= pt2.Dat THEN 'Switched'
            WHEN pt1.HIVLoad IS NOT NULL 
                AND pt2.HIVLoad IS NOT NULL
                AND CAST(REPLACE(pt1.HIVLoad, '<', '') AS UNSIGNED) >= 1000
                AND CAST(REPLACE(pt2.HIVLoad, '<', '') AS UNSIGNED) >= 1000
                AND pt2.Dat > pt1.Dat
                AND DATEDIFF(pt2.Dat, pt1.Dat) BETWEEN 30 AND 180 THEN 'Not_Switched'
            ELSE 'Not_Eligible'
        END as SwitchStatus
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    JOIN tblpatienttest pt1 ON p.ClinicID = pt1.ClinicID
    JOIN tblpatienttest pt2 ON p.ClinicID = pt2.ClinicID
        AND pt2.Dat > pt1.Dat
        AND DATEDIFF(pt2.Dat, pt1.Dat) BETWEEN 30 AND 180
    LEFT JOIN tblavarvdrug ard ON p.ClinicID = ard.Vid
        AND ard.Da >= pt2.Dat
        AND ard.DrugName LIKE '%2nd%'
    WHERE 
        pt1.HIVLoad IS NOT NULL
        AND pt2.HIVLoad IS NOT NULL
        AND pt1.Dat BETWEEN @StartDate AND @EndDate
        AND CAST(REPLACE(pt1.HIVLoad, '<', '') AS UNSIGNED) >= 1000
        AND CAST(REPLACE(pt2.HIVLoad, '<', '') AS UNSIGNED) >= 1000
    
    UNION ALL
    
    -- Children switching from first line to second line
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        art.DaArt as ARTStartDate,
        pt1.HIVLoad as FirstVL,
        pt1.Dat as FirstVLDate,
        pt2.HIVLoad as SecondVL,
        pt2.Dat as SecondVLDate,
        crd.DrugName as CurrentRegimen,
        crd.Da as RegimenStartDate,
        CASE 
            WHEN pt1.HIVLoad IS NOT NULL 
                AND pt2.HIVLoad IS NOT NULL
                AND CAST(REPLACE(pt1.HIVLoad, '<', '') AS UNSIGNED) >= 1000
                AND CAST(REPLACE(pt2.HIVLoad, '<', '') AS UNSIGNED) >= 1000
                AND pt2.Dat > pt1.Dat
                AND DATEDIFF(pt2.Dat, pt1.Dat) BETWEEN 30 AND 180  -- Within 3-6 months
                AND crd.DrugName LIKE '%2nd%'  -- Second line regimen
                AND crd.Da >= pt2.Dat THEN 'Switched'
            WHEN pt1.HIVLoad IS NOT NULL 
                AND pt2.HIVLoad IS NOT NULL
                AND CAST(REPLACE(pt1.HIVLoad, '<', '') AS UNSIGNED) >= 1000
                AND CAST(REPLACE(pt2.HIVLoad, '<', '') AS UNSIGNED) >= 1000
                AND pt2.Dat > pt1.Dat
                AND DATEDIFF(pt2.Dat, pt1.Dat) BETWEEN 30 AND 180 THEN 'Not_Switched'
            ELSE 'Not_Eligible'
        END as SwitchStatus
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = p.ClinicID
    JOIN tblpatienttest pt1 ON p.ClinicID = pt1.ClinicID
    JOIN tblpatienttest pt2 ON p.ClinicID = pt2.ClinicID
        AND pt2.Dat > pt1.Dat
        AND DATEDIFF(pt2.Dat, pt1.Dat) BETWEEN 30 AND 180
    LEFT JOIN tblcvarvdrug crd ON p.ClinicID = crd.Vid
        AND crd.Da >= pt2.Dat
        AND crd.DrugName LIKE '%2nd%'
    WHERE 
        pt1.HIVLoad IS NOT NULL
        AND pt2.HIVLoad IS NOT NULL
        AND pt1.Dat BETWEEN @StartDate AND @EndDate
        AND CAST(REPLACE(pt1.HIVLoad, '<', '') AS UNSIGNED) >= 1000
        AND CAST(REPLACE(pt2.HIVLoad, '<', '') AS UNSIGNED) >= 1000
)

SELECT
    '14a. Percentage of PLHIV receiving first line ART with two consecutive VL ≥1000 copies/mL switching to second line' AS Indicator,
    IFNULL(SUM(CASE WHEN SwitchStatus = 'Switched' THEN 1 ELSE 0 END), 0) AS Switched_To_Second_Line,
    IFNULL(SUM(CASE WHEN SwitchStatus IN ('Switched', 'Not_Switched') THEN 1 ELSE 0 END), 0) AS Eligible_Patients,
    IFNULL(COUNT(*), 0) AS Total_With_Consecutive_High_VL,
    CASE 
        WHEN SUM(CASE WHEN SwitchStatus IN ('Switched', 'Not_Switched') THEN 1 ELSE 0 END) > 0 
        THEN ROUND((SUM(CASE WHEN SwitchStatus = 'Switched' THEN 1 ELSE 0 END) * 100.0 / SUM(CASE WHEN SwitchStatus IN ('Switched', 'Not_Switched') THEN 1 ELSE 0 END)), 2)
        ELSE 0 
    END AS Percentage,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Male' AND SwitchStatus = 'Switched' THEN 1 ELSE 0 END), 0) AS Male_0_14_Switched,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Female' AND SwitchStatus = 'Switched' THEN 1 ELSE 0 END), 0) AS Female_0_14_Switched,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' AND SwitchStatus = 'Switched' THEN 1 ELSE 0 END), 0) AS Male_over_14_Switched,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' AND SwitchStatus = 'Switched' THEN 1 ELSE 0 END), 0) AS Female_over_14_Switched
FROM tblfirst_to_second_line;

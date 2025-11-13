-- =====================================================
-- CQI: 8A COTRIMOXAZOLE PROPHYLAXIS
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
-- Indicator 8a: Percentage of patients with CD4 count less than 350 receiving prophylaxis with Cotrimoxazole
-- ===================================================================

WITH tblcotrimoxazole AS (
    -- Adults with CD4 < 350 receiving Cotrimoxazole
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        pt.CD4 as LatestCD4,
        pt.Dat as CD4TestDate,
        CASE 
            WHEN CAST(pt.CD4 AS UNSIGNED) < 350 THEN 'CD4_Low'
            ELSE 'CD4_High'
        END as CD4Status,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM tblavarvdrug ard
                JOIN tblavmain v ON ard.Vid = v.Vid
                WHERE v.ClinicID = p.ClinicID 
                AND v.DatVisit >= pt.Dat
                AND v.DatVisit = (
                    SELECT MAX(v2.DatVisit) 
                    FROM tblavmain v2 
                    WHERE v2.ClinicID = p.ClinicID 
                    AND v2.DatVisit >= pt.Dat
                )
                AND ard.DrugName LIKE '%CTX%' 
                AND ard.Status IN (0, 2)
            ) THEN 'Yes'
            ELSE 'No'
        END as ReceivingCotrimoxazole
    FROM tblaimain p 
    JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID
    WHERE 
        pt.CD4 IS NOT NULL 
        AND pt.Dat BETWEEN @StartDate AND @EndDate
        AND CAST(pt.CD4 AS UNSIGNED) < 350
    
    UNION ALL
    
    -- Children with CD4 < 350 receiving Cotrimoxazole
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        pt.CD4 as LatestCD4,
        pt.Dat as CD4TestDate,
        CASE 
            WHEN CAST(pt.CD4 AS UNSIGNED) < 350 THEN 'CD4_Low'
            ELSE 'CD4_High'
        END as CD4Status,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM tblcvarvdrug crd
                JOIN tblcvmain v ON crd.Vid = v.Vid
                WHERE v.ClinicID = p.ClinicID 
                AND v.DatVisit >= pt.Dat
                AND v.DatVisit = (
                    SELECT MAX(v2.DatVisit) 
                    FROM tblcvmain v2 
                    WHERE v2.ClinicID = p.ClinicID 
                    AND v2.DatVisit >= pt.Dat
                )
                AND crd.DrugName LIKE '%CTX%' 
                AND crd.Status IN (0, 2)
            ) THEN 'Yes'
            ELSE 'No'
        END as ReceivingCotrimoxazole
    FROM tblcimain p 
    JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID
    WHERE 
        pt.CD4 IS NOT NULL 
        AND pt.Dat BETWEEN @StartDate AND @EndDate
        AND CAST(pt.CD4 AS UNSIGNED) < 350
)

SELECT
    '8a. Percentage of patients with CD4 < 350 receiving Cotrimoxazole prophylaxis' AS Indicator,
    IFNULL(SUM(CASE WHEN ReceivingCotrimoxazole = 'Yes' THEN 1 ELSE 0 END), 0) AS Receiving_Cotrimoxazole,
    IFNULL(COUNT(*), 0) AS Total_CD4_Low_350,
    CASE 
        WHEN COUNT(*) > 0 
        THEN ROUND((SUM(CASE WHEN ReceivingCotrimoxazole = 'Yes' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2)
        ELSE 0 
    END AS Percentage,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Male' AND ReceivingCotrimoxazole = 'Yes' THEN 1 ELSE 0 END), 0) AS Male_0_14_Receiving,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Female' AND ReceivingCotrimoxazole = 'Yes' THEN 1 ELSE 0 END), 0) AS Female_0_14_Receiving,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' AND ReceivingCotrimoxazole = 'Yes' THEN 1 ELSE 0 END), 0) AS Male_over_14_Receiving,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' AND ReceivingCotrimoxazole = 'Yes' THEN 1 ELSE 0 END), 0) AS Female_over_14_Receiving
FROM tblcotrimoxazole;
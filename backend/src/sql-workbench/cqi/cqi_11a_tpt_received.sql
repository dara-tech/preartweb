-- =====================================================
-- CQI: 11A TPT RECEIVED
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
-- Indicator 11a: Percentage of ART patients received TPT (cumulative including those who completed TPT)
-- ===================================================================

WITH tbltpt_received AS (
    -- Adults who received TPT
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        tpt.DrugName as TPTDrug,
        tpt.Da as TPTStartDate,
        tpt.Status as TPTStatus,
        CASE 
            WHEN tpt.DrugName IS NOT NULL THEN 'Received'
            ELSE 'Not_Received'
        END as TPTReceivedStatus
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    LEFT JOIN tblavmain v ON p.ClinicID = v.ClinicID 
    LEFT JOIN tblavtptdrug tpt ON v.vid = tpt.Vid
    WHERE 
        art.DaArt <= @EndDate
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
        AND tpt.DrugName != 'B6'
    
    UNION ALL
    
    -- Children who received TPT
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        tpt.DrugName as TPTDrug,
        tpt.Da as TPTStartDate,
        tpt.Status as TPTStatus,
        CASE 
            WHEN tpt.DrugName IS NOT NULL THEN 'Received'
            ELSE 'Not_Received'
        END as TPTReceivedStatus
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = art.ClinicID
    LEFT JOIN tblcvmain v ON p.ClinicID = v.ClinicID 
    LEFT JOIN tblcvtptdrug tpt ON v.vid = tpt.Vid
    WHERE 
        art.DaArt <= @EndDate
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
        AND tpt.DrugName != 'B6'
)

SELECT
    '11a. Percentage of ART patients received TPT (cumulative)' AS Indicator,
    IFNULL(SUM(CASE WHEN TPTReceivedStatus = 'Received' THEN 1 ELSE 0 END), 0) AS TPT_Received,
    IFNULL(COUNT(*), 0) AS Total_ART_Patients,
    CASE 
        WHEN COUNT(*) > 0 
        THEN ROUND((SUM(CASE WHEN TPTReceivedStatus = 'Received' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2)
        ELSE 0 
    END AS Percentage,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Male' AND TPTReceivedStatus = 'Received' THEN 1 ELSE 0 END), 0) AS Male_0_14_TPT_Received,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Female' AND TPTReceivedStatus = 'Received' THEN 1 ELSE 0 END), 0) AS Female_0_14_TPT_Received,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' AND TPTReceivedStatus = 'Received' THEN 1 ELSE 0 END), 0) AS Male_over_14_TPT_Received,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' AND TPTReceivedStatus = 'Received' THEN 1 ELSE 0 END), 0) AS Female_over_14_TPT_Received
FROM tbltpt_received;
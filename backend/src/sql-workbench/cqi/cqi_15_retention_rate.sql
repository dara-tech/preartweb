-- =====================================================
-- CQI: 15 RETENTION RATE
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
-- Indicator 15: Retention rate (quarterly, annually)
-- ===================================================================

WITH tblretention_rate AS (
    -- Adults retention calculation
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        art.DaArt as ARTStartDate,
        ps.Da as ExitDate,
        ps.Status as ExitStatus,
        CASE 
            WHEN ps.Status IS NULL THEN 'Retained'
            WHEN ps.Status = 0 THEN 'Lost_to_Followup'
            WHEN ps.Status = 1 THEN 'Dead'
            WHEN ps.Status = 3 THEN 'Transferred_Out'
            ELSE 'Other'
        END as RetentionStatus
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    LEFT JOIN tblavpatientstatus ps ON p.ClinicID = ps.ClinicID
    WHERE 
        art.DaArt <= @EndDate
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
        AND (ps.Da IS NULL OR ps.Da > @StartDate)
    
    UNION ALL
    
    -- Children retention calculation
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        art.DaArt as ARTStartDate,
        ps.Da as ExitDate,
        ps.Status as ExitStatus,
        CASE 
            WHEN ps.Status IS NULL THEN 'Retained'
            WHEN ps.Status = 0 THEN 'Lost_to_Followup'
            WHEN ps.Status = 1 THEN 'Dead'
            WHEN ps.Status = 3 THEN 'Transferred_Out'
            ELSE 'Other'
        END as RetentionStatus
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = art.ClinicID
    LEFT JOIN tblcvpatientstatus ps ON p.ClinicID = ps.ClinicID
    WHERE 
        art.DaArt <= @EndDate
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
        AND (ps.Da IS NULL OR ps.Da > @StartDate)
),

-- Calculate retention by time periods
tblretention_by_period AS (
    SELECT 
        type,
        Sex,
        ClinicID,
        ARTStartDate,
        RetentionStatus,
        CASE 
            WHEN ARTStartDate >= DATE_SUB(@StartDate, INTERVAL 3 MONTH) AND ARTStartDate < @StartDate THEN '3_Month_Cohort'
            WHEN ARTStartDate >= DATE_SUB(@StartDate, INTERVAL 6 MONTH) AND ARTStartDate < DATE_SUB(@StartDate, INTERVAL 3 MONTH) THEN '6_Month_Cohort'
            WHEN ARTStartDate >= DATE_SUB(@StartDate, INTERVAL 12 MONTH) AND ARTStartDate < DATE_SUB(@StartDate, INTERVAL 6 MONTH) THEN '12_Month_Cohort'
            WHEN ARTStartDate >= DATE_SUB(@StartDate, INTERVAL 24 MONTH) AND ARTStartDate < DATE_SUB(@StartDate, INTERVAL 12 MONTH) THEN '24_Month_Cohort'
            ELSE 'Other_Cohort'
        END as CohortPeriod
    FROM tblretention_rate
    WHERE ARTStartDate >= DATE_SUB(@StartDate, INTERVAL 24 MONTH)
)

SELECT
    '15. Retention rate (quarterly, annually)' AS Indicator,
    -- 3-month retention
    IFNULL(SUM(CASE WHEN CohortPeriod = '3_Month_Cohort' AND RetentionStatus = 'Retained' THEN 1 ELSE 0 END), 0) AS Retained_3_Month,
    IFNULL(SUM(CASE WHEN CohortPeriod = '3_Month_Cohort' THEN 1 ELSE 0 END), 0) AS Total_3_Month_Cohort,
    CASE 
        WHEN SUM(CASE WHEN CohortPeriod = '3_Month_Cohort' THEN 1 ELSE 0 END) > 0 
        THEN ROUND((SUM(CASE WHEN CohortPeriod = '3_Month_Cohort' AND RetentionStatus = 'Retained' THEN 1 ELSE 0 END) * 100.0 / SUM(CASE WHEN CohortPeriod = '3_Month_Cohort' THEN 1 ELSE 0 END)), 2)
        ELSE 0 
    END AS Retention_Rate_3_Month,
    
    -- 6-month retention
    IFNULL(SUM(CASE WHEN CohortPeriod = '6_Month_Cohort' AND RetentionStatus = 'Retained' THEN 1 ELSE 0 END), 0) AS Retained_6_Month,
    IFNULL(SUM(CASE WHEN CohortPeriod = '6_Month_Cohort' THEN 1 ELSE 0 END), 0) AS Total_6_Month_Cohort,
    CASE 
        WHEN SUM(CASE WHEN CohortPeriod = '6_Month_Cohort' THEN 1 ELSE 0 END) > 0 
        THEN ROUND((SUM(CASE WHEN CohortPeriod = '6_Month_Cohort' AND RetentionStatus = 'Retained' THEN 1 ELSE 0 END) * 100.0 / SUM(CASE WHEN CohortPeriod = '6_Month_Cohort' THEN 1 ELSE 0 END)), 2)
        ELSE 0 
    END AS Retention_Rate_6_Month,
    
    -- 12-month retention
    IFNULL(SUM(CASE WHEN CohortPeriod = '12_Month_Cohort' AND RetentionStatus = 'Retained' THEN 1 ELSE 0 END), 0) AS Retained_12_Month,
    IFNULL(SUM(CASE WHEN CohortPeriod = '12_Month_Cohort' THEN 1 ELSE 0 END), 0) AS Total_12_Month_Cohort,
    CASE 
        WHEN SUM(CASE WHEN CohortPeriod = '12_Month_Cohort' THEN 1 ELSE 0 END) > 0 
        THEN ROUND((SUM(CASE WHEN CohortPeriod = '12_Month_Cohort' AND RetentionStatus = 'Retained' THEN 1 ELSE 0 END) * 100.0 / SUM(CASE WHEN CohortPeriod = '12_Month_Cohort' THEN 1 ELSE 0 END)), 2)
        ELSE 0 
    END AS Retention_Rate_12_Month,
    
    -- 24-month retention
    IFNULL(SUM(CASE WHEN CohortPeriod = '24_Month_Cohort' AND RetentionStatus = 'Retained' THEN 1 ELSE 0 END), 0) AS Retained_24_Month,
    IFNULL(SUM(CASE WHEN CohortPeriod = '24_Month_Cohort' THEN 1 ELSE 0 END), 0) AS Total_24_Month_Cohort,
    CASE 
        WHEN SUM(CASE WHEN CohortPeriod = '24_Month_Cohort' THEN 1 ELSE 0 END) > 0 
        THEN ROUND((SUM(CASE WHEN CohortPeriod = '24_Month_Cohort' AND RetentionStatus = 'Retained' THEN 1 ELSE 0 END) * 100.0 / SUM(CASE WHEN CohortPeriod = '24_Month_Cohort' THEN 1 ELSE 0 END)), 2)
        ELSE 0 
    END AS Retention_Rate_24_Month,
    
    -- Overall retention
    IFNULL(SUM(CASE WHEN RetentionStatus = 'Retained' THEN 1 ELSE 0 END), 0) AS Total_Retained,
    IFNULL(COUNT(*), 0) AS Total_ART_Patients,
    CASE 
        WHEN COUNT(*) > 0 
        THEN ROUND((SUM(CASE WHEN RetentionStatus = 'Retained' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2)
        ELSE 0 
    END AS Overall_Retention_Rate,
    
    -- Disaggregated by sex and age
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Male' AND RetentionStatus = 'Retained' THEN 1 ELSE 0 END), 0) AS Male_0_14_Retained,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Female' AND RetentionStatus = 'Retained' THEN 1 ELSE 0 END), 0) AS Female_0_14_Retained,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' AND RetentionStatus = 'Retained' THEN 1 ELSE 0 END), 0) AS Male_over_14_Retained,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' AND RetentionStatus = 'Retained' THEN 1 ELSE 0 END), 0) AS Female_over_14_Retained
FROM tblretention_by_period;

-- =====================================================
-- CQI (Continuous Quality Improvement) Indicators - Workbench SQL
-- Generated: 2025-10-17T07:41:43.502Z
-- 
-- This file contains all CQI mortality and retention indicators with parameters
-- Ready to use in MySQL Workbench, phpMyAdmin, or any SQL workbench
-- =====================================================

-- =====================================================
-- PARAMETER SETUP (matching service configuration)
-- =====================================================
-- Set these parameters before running the queries
-- These match the parameters used in the ART Web CQI service

-- Date parameters (Quarterly period)
SET @StartDate = '2025-01-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-03-31';               -- End date (YYYY-MM-DD) - Q1 2025
SET @PreviousEndDate = '2024-12-31';       -- Previous period end date
SET @reportingPeriod = 'Q1 2025';          -- Reporting period description

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
-- DATABASE INFORMATION
-- =====================================================
-- This analysis uses the following main tables:
-- - tblaimain: Adult patient data
-- - tblcimain: Child patient data  
-- - tblaart: Adult ART data
-- - tblcart: Child ART data
-- - tblavpatientstatus: Adult patient status data
-- - tblcvpatientstatus: Child patient status data
-- - tblavmain: Adult visit data
-- - tblcvmain: Child visit data

-- =====================================================
-- CQI INDICATOR QUERIES
-- =====================================================

-- =====================================================
-- CQI INDICATOR 1: 10A TLD NEW INITIATION
-- File: 10a_tld_new_initiation.sql
-- =====================================================

-- =====================================================
-- CQI: 10A TLD NEW INITIATION
-- Generated: 2025-10-17T07:41:43.510Z
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
-- Indicator 10a: Percentage of patients newly initiating ART with TLD as 1st line regimen
-- ===================================================================

WITH tbltld_new_initiation AS (
    -- Adults newly initiating with TLD
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaART as ARTStartDate,
        ard.DrugName,
        CASE 
            WHEN ard.DrugName LIKE '%TLD%' OR ard.DrugName LIKE '%DTG%' THEN 'TLD'
            ELSE 'Non-TLD'
        END as RegimenType
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    JOIN tblavmain v ON p.ClinicID = v.ClinicID AND v.DatVisit = art.DaArt
    JOIN tblavarvdrug ard ON v.Vid = ard.Vid
    WHERE 
        p.DaART BETWEEN @StartDate AND @EndDate
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
        AND ard.Status = 0  -- Start
    
    UNION ALL
    
    -- Children newly initiating with TLD
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaART as ARTStartDate,
        crd.DrugName,
        CASE 
            WHEN crd.DrugName LIKE '%TLD%' OR crd.DrugName LIKE '%DTG%' THEN 'TLD'
            ELSE 'Non-TLD'
        END as RegimenType
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = p.ClinicID
    JOIN tblcvmain v ON p.ClinicID = v.ClinicID AND v.DatVisit = art.DaArt
    JOIN tblcvarvdrug crd ON v.Vid = crd.Vid
    WHERE 
        p.DaART BETWEEN @StartDate AND @EndDate
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
        AND crd.Status = 0  -- Start
)

SELECT
    '10a. Percentage of patients newly initiating ART with TLD as 1st line regimen' AS Indicator,
    IFNULL(SUM(CASE WHEN RegimenType = 'TLD' THEN 1 ELSE 0 END), 0) AS TLD_New_Initiation,
    IFNULL(COUNT(*), 0) AS Total_New_Initiation,
    CASE 
        WHEN COUNT(*) > 0 
        THEN ROUND((SUM(CASE WHEN RegimenType = 'TLD' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2)
        ELSE 0 
    END AS Percentage,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Male' AND RegimenType = 'TLD' THEN 1 ELSE 0 END), 0) AS Male_0_14_TLD,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Female' AND RegimenType = 'TLD' THEN 1 ELSE 0 END), 0) AS Female_0_14_TLD,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' AND RegimenType = 'TLD' THEN 1 ELSE 0 END), 0) AS Male_over_14_TLD,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' AND RegimenType = 'TLD' THEN 1 ELSE 0 END), 0) AS Female_over_14_TLD
FROM tbltld_new_initiation;


-- =====================================================

-- =====================================================
-- CQI INDICATOR 2: 10B TLD CUMULATIVE
-- File: 10b_tld_cumulative.sql
-- =====================================================

-- =====================================================
-- CQI: 10B TLD CUMULATIVE
-- Generated: 2025-10-17T07:41:43.510Z
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
-- Indicator 10b: Percentage of ART patients using TLD as 1st line regimen (cumulative)
-- ===================================================================

WITH tbltld_cumulative AS (
    -- Adults currently using TLD
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        ard.DrugName,
        ard.Da as DrugStartDate,
        ard.Status as DrugStatus,
        CASE 
            WHEN ard.DrugName LIKE '%TLD%' OR ard.DrugName LIKE '%DTG%' THEN 'TLD'
            ELSE 'Non-TLD'
        END as RegimenType
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    JOIN tblavmain v ON p.ClinicID = v.ClinicID
    JOIN tblavarvdrug ard ON v.Vid = ard.Vid
    WHERE 
        v.DatVisit BETWEEN @StartDate AND @EndDate
        AND ard.Status IN (0, 2)  -- Start or Continue
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
    
    UNION ALL
    
    -- Children currently using TLD
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        crd.DrugName,
        crd.Da as DrugStartDate,
        crd.Status as DrugStatus,
        CASE 
            WHEN crd.DrugName LIKE '%TLD%' OR crd.DrugName LIKE '%DTG%' THEN 'TLD'
            ELSE 'Non-TLD'
        END as RegimenType
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = p.ClinicID
    JOIN tblcvmain v ON p.ClinicID = v.ClinicID
    JOIN tblcvarvdrug crd ON v.Vid = crd.Vid
    WHERE 
        v.DatVisit BETWEEN @StartDate AND @EndDate
        AND crd.Status IN (0, 2)  -- Start or Continue
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
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
    '10b. Percentage of ART patients using TLD as 1st line regimen (cumulative)' AS Indicator,
    IFNULL(COUNT(DISTINCT CASE WHEN RegimenType = 'TLD' THEN t.ClinicID END), 0) AS TLD_Cumulative,
    IFNULL(COUNT(DISTINCT t.ClinicID), 0) AS Total_ART_Patients,
    CASE 
        WHEN COUNT(DISTINCT t.ClinicID) > 0 
        THEN ROUND((COUNT(DISTINCT CASE WHEN RegimenType = 'TLD' THEN t.ClinicID END) * 100.0 / COUNT(DISTINCT t.ClinicID)), 2)
        ELSE 0 
    END AS Percentage,
    IFNULL(SUM(CASE WHEN tc.type = 'Child' AND tc.Sex = 'Male' AND tc.RegimenType = 'TLD' THEN 1 ELSE 0 END), 0) AS Male_0_14_TLD,
    IFNULL(SUM(CASE WHEN tc.type = 'Child' AND tc.Sex = 'Female' AND tc.RegimenType = 'TLD' THEN 1 ELSE 0 END), 0) AS Female_0_14_TLD,
    IFNULL(SUM(CASE WHEN tc.type = 'Adult' AND tc.Sex = 'Male' AND tc.RegimenType = 'TLD' THEN 1 ELSE 0 END), 0) AS Male_over_14_TLD,
    IFNULL(SUM(CASE WHEN tc.type = 'Adult' AND tc.Sex = 'Female' AND tc.RegimenType = 'TLD' THEN 1 ELSE 0 END), 0) AS Female_over_14_TLD
FROM tbltotal_art t
LEFT JOIN tbltld_cumulative tc ON t.ClinicID = tc.ClinicID AND t.type = tc.type;


-- =====================================================

-- =====================================================
-- CQI INDICATOR 3: 11A TPT RECEIVED
-- File: 11a_tpt_received.sql
-- =====================================================

-- =====================================================
-- CQI: 11A TPT RECEIVED
-- Generated: 2025-10-17T07:41:43.510Z
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

-- =====================================================

-- =====================================================
-- CQI INDICATOR 4: 11B TPT COMPLETED
-- File: 11b_tpt_completed.sql
-- =====================================================

-- =====================================================
-- CQI: 11B TPT COMPLETED
-- Generated: 2025-10-17T07:41:43.510Z
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
-- Indicator 11b: Percentage of ART patients completed the TPT course (cumulative)
-- ===================================================================

WITH tbltpt_completed AS (
    -- Get TPT start and stop data for adults
    WITH tbltptstart_adult AS (
        SELECT 
            p.ClinicID,
            v.DatVisit as dateStart,
            tpt.DrugName as Tptdrugname,
            ROW_NUMBER() OVER(PARTITION BY p.ClinicID ORDER BY v.DatVisit ASC) as id
        FROM tblaimain p 
        JOIN tblaart art ON p.ClinicID = art.ClinicID
        JOIN tblavmain v ON p.ClinicID = v.ClinicID 
        JOIN tblavtptdrug tpt ON v.vid = tpt.Vid
        WHERE 
            art.DaArt <= @EndDate
            AND (p.OffIn IS NULL OR p.OffIn <> 1)
            AND tpt.Status = 0 
            AND tpt.DrugName != 'B6'
            AND v.DatVisit <= @EndDate
    ),
    tbltptstop_adult AS (
        SELECT 
            p.ClinicID,
            tpt.Da as Datestop,
            ROW_NUMBER() OVER(PARTITION BY p.ClinicID ORDER BY tpt.Da DESC) as id
        FROM tblaimain p 
        JOIN tblaart art ON p.ClinicID = art.ClinicID
        JOIN tblavmain v ON p.ClinicID = v.ClinicID 
        JOIN tblavtptdrug tpt ON v.vid = tpt.Vid
        WHERE 
            art.DaArt <= @EndDate
            AND (p.OffIn IS NULL OR p.OffIn <> 1)
            AND tpt.Status = 1 
            AND tpt.DrugName != 'B6'
            AND tpt.Da <= @EndDate
    ),
    tbltptstart_child AS (
        SELECT 
            p.ClinicID,
            v.DatVisit as dateStart,
            tpt.DrugName as Tptdrugname,
            ROW_NUMBER() OVER(PARTITION BY p.ClinicID ORDER BY v.DatVisit ASC) as id
        FROM tblcimain p 
        JOIN tblcart art ON p.ClinicID = art.ClinicID
        JOIN tblcvmain v ON p.ClinicID = v.ClinicID 
        JOIN tblcvtptdrug tpt ON v.vid = tpt.Vid
        WHERE 
            art.DaArt <= @EndDate
            AND (p.OffIn IS NULL OR p.OffIn <> 1)
            AND tpt.Status = 0 
            AND tpt.DrugName != 'B6'
            AND v.DatVisit <= @EndDate
    ),
    tbltptstop_child AS (
        SELECT 
            p.ClinicID,
            tpt.Da as Datestop,
            ROW_NUMBER() OVER(PARTITION BY p.ClinicID ORDER BY tpt.Da DESC) as id
        FROM tblcimain p 
        JOIN tblcart art ON p.ClinicID = art.ClinicID
        JOIN tblcvmain v ON p.ClinicID = v.ClinicID 
        JOIN tblcvtptdrug tpt ON v.vid = tpt.Vid
        WHERE 
            art.DaArt <= @EndDate
            AND (p.OffIn IS NULL OR p.OffIn <> 1)
            AND tpt.Status = 1 
            AND tpt.DrugName != 'B6'
            AND tpt.Da <= @EndDate
    )
    
    -- Adults TPT completion data
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        s.dateStart,
        s.Tptdrugname,
        st.Datestop,
        DATEDIFF(st.Datestop, s.dateStart) / 30 as duration,
        CASE 
            WHEN LEFT(s.Tptdrugname, 1) = '3' AND (DATEDIFF(st.Datestop, s.dateStart) / 30) >= 2.50 THEN 'TPT Complete'
            WHEN LEFT(s.Tptdrugname, 1) = '6' AND (DATEDIFF(st.Datestop, s.dateStart) / 30) >= 5.50 THEN 'TPT Complete'
            WHEN s.Tptdrugname IS NOT NULL THEN 'Not complete'
            ELSE 'Not Start'
        END as tptstatus
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    LEFT JOIN (SELECT * FROM tbltptstart_adult WHERE id = 1) s ON p.ClinicID = s.ClinicID
    LEFT JOIN (SELECT * FROM tbltptstop_adult WHERE id = 1) st ON p.ClinicID = st.ClinicID
    WHERE 
        art.DaArt <= @EndDate
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
    
    UNION ALL
    
    -- Children TPT completion data
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        s.dateStart,
        s.Tptdrugname,
        st.Datestop,
        DATEDIFF(st.Datestop, s.dateStart) / 30 as duration,
        CASE 
            WHEN LEFT(s.Tptdrugname, 1) = '3' AND (DATEDIFF(st.Datestop, s.dateStart) / 30) >= 2.50 THEN 'TPT Complete'
            WHEN LEFT(s.Tptdrugname, 1) = '6' AND (DATEDIFF(st.Datestop, s.dateStart) / 30) >= 5.50 THEN 'TPT Complete'
            WHEN s.Tptdrugname IS NOT NULL THEN 'Not complete'
            ELSE 'Not Start'
        END as tptstatus
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = art.ClinicID
    LEFT JOIN (SELECT * FROM tbltptstart_child WHERE id = 1) s ON p.ClinicID = s.ClinicID
    LEFT JOIN (SELECT * FROM tbltptstop_child WHERE id = 1) st ON p.ClinicID = st.ClinicID
    WHERE 
        art.DaArt <= @EndDate
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
)

SELECT
    '11b. Percentage of ART patients completed the TPT course (cumulative)' AS Indicator,
    IFNULL(SUM(CASE WHEN tptstatus = 'TPT Complete' THEN 1 ELSE 0 END), 0) AS TPT_Completed,
    IFNULL(SUM(CASE WHEN tptstatus IN ('TPT Complete', 'Not complete') THEN 1 ELSE 0 END), 0) AS TPT_Started,
    IFNULL(COUNT(*), 0) AS Total_ART_Patients,
    CASE 
        WHEN SUM(CASE WHEN tptstatus IN ('TPT Complete', 'Not complete') THEN 1 ELSE 0 END) > 0 
        THEN ROUND((SUM(CASE WHEN tptstatus = 'TPT Complete' THEN 1 ELSE 0 END) * 100.0 / SUM(CASE WHEN tptstatus IN ('TPT Complete', 'Not complete') THEN 1 ELSE 0 END)), 2)
        ELSE 0 
    END AS Percentage_Of_Started,
    CASE 
        WHEN COUNT(*) > 0 
        THEN ROUND((SUM(CASE WHEN tptstatus = 'TPT Complete' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2)
        ELSE 0 
    END AS Percentage_Of_Total,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Male' AND tptstatus = 'TPT Complete' THEN 1 ELSE 0 END), 0) AS Male_0_14_TPT_Completed,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Female' AND tptstatus = 'TPT Complete' THEN 1 ELSE 0 END), 0) AS Female_0_14_TPT_Completed,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' AND tptstatus = 'TPT Complete' THEN 1 ELSE 0 END), 0) AS Male_over_14_TPT_Completed,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' AND tptstatus = 'TPT Complete' THEN 1 ELSE 0 END), 0) AS Female_over_14_TPT_Completed
FROM tbltpt_completed;

-- =====================================================

-- =====================================================
-- CQI INDICATOR 5: 12A VL TESTING COVERAGE
-- File: 12a_vl_testing_coverage.sql
-- =====================================================

-- =====================================================
-- CQI: 12A VL TESTING COVERAGE
-- Generated: 2025-10-17T07:41:43.511Z
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
-- Indicator 12a: Percentage of people receiving antiretroviral therapy receiving a viral load test in the past 12 months
-- (the coverage of viral load testing)
-- ===================================================================

WITH tblvl_coverage AS (
    -- Adults with VL testing in past 12 months
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        pt.HIVLoad as ViralLoad,
        pt.Dat as VLTestDate,
        CASE 
            WHEN pt.HIVLoad IS NOT NULL AND pt.Dat >= DATE_SUB(@EndDate, INTERVAL 12 MONTH) THEN 'Tested'
            ELSE 'Not_Tested'
        END as VLStatus
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    LEFT JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID 
        AND pt.HIVLoad IS NOT NULL 
        AND pt.Dat >= DATE_SUB(@EndDate, INTERVAL 12 MONTH)
    WHERE 
        art.DaArt <= @EndDate
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
    
    UNION ALL
    
    -- Children with VL testing in past 12 months
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        pt.HIVLoad as ViralLoad,
        pt.Dat as VLTestDate,
        CASE 
            WHEN pt.HIVLoad IS NOT NULL AND pt.Dat >= DATE_SUB(@EndDate, INTERVAL 12 MONTH) THEN 'Tested'
            ELSE 'Not_Tested'
        END as VLStatus
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = p.ClinicID
    LEFT JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID 
        AND pt.HIVLoad IS NOT NULL 
        AND pt.Dat >= DATE_SUB(@EndDate, INTERVAL 12 MONTH)
    WHERE 
        art.DaArt <= @EndDate
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
)

SELECT
    '12a. Percentage of ART patients receiving VL test in past 12 months' AS Indicator,
    IFNULL(SUM(CASE WHEN VLStatus = 'Tested' THEN 1 ELSE 0 END), 0) AS VL_Tested_12M,
    IFNULL(COUNT(*), 0) AS Total_ART_Patients,
    CASE 
        WHEN COUNT(*) > 0 
        THEN ROUND((SUM(CASE WHEN VLStatus = 'Tested' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2)
        ELSE 0 
    END AS Percentage,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Male' AND VLStatus = 'Tested' THEN 1 ELSE 0 END), 0) AS Male_0_14_Tested,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Female' AND VLStatus = 'Tested' THEN 1 ELSE 0 END), 0) AS Female_0_14_Tested,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' AND VLStatus = 'Tested' THEN 1 ELSE 0 END), 0) AS Male_over_14_Tested,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' AND VLStatus = 'Tested' THEN 1 ELSE 0 END), 0) AS Female_over_14_Tested
FROM tblvl_coverage;


-- =====================================================

-- =====================================================
-- CQI INDICATOR 6: 12B VL MONITORED SIX MONTHS
-- File: 12b_vl_monitored_six_months.sql
-- =====================================================

-- =====================================================
-- CQI: 12B VL MONITORED SIX MONTHS
-- Generated: 2025-10-17T07:41:43.511Z
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


-- =====================================================

-- =====================================================
-- CQI INDICATOR 7: 12C VL SUPPRESSION 12 MONTHS
-- File: 12c_vl_suppression_12_months.sql
-- =====================================================

-- =====================================================
-- CQI: 12C VL SUPPRESSION 12 MONTHS
-- Generated: 2025-10-17T07:41:43.511Z
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


-- =====================================================

-- =====================================================
-- CQI INDICATOR 8: 12D VL SUPPRESSION OVERALL
-- File: 12d_vl_suppression_overall.sql
-- =====================================================

-- =====================================================
-- CQI: 12D VL SUPPRESSION OVERALL
-- Generated: 2025-10-17T07:41:43.512Z
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


-- =====================================================

-- =====================================================
-- CQI INDICATOR 9: 12E VL RESULTS 10 DAYS
-- File: 12e_vl_results_10_days.sql
-- =====================================================

-- =====================================================
-- CQI: 12E VL RESULTS 10 DAYS
-- Generated: 2025-10-17T07:41:43.512Z
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
-- Indicator 12e: Percentage of viral load test results received at sites within 10 days of sample taken
-- (Note: WHO within one month)
-- ===================================================================

WITH tblvl_turnaround AS (
    -- Adults with VL test turnaround time
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        pt.HIVLoad as ViralLoad,
        pt.DaCollect as SampleDate,
        pt.DaArrival as ResultReceiveDate,
        DATEDIFF(pt.DaArrival, pt.DaCollect) as TurnaroundDays,
        CASE 
            WHEN pt.DaCollect IS NOT NULL AND pt.DaArrival IS NOT NULL
                AND DATEDIFF(pt.DaArrival, pt.DaCollect) <= 10 THEN 'Within_10_Days'
            WHEN pt.DaCollect IS NOT NULL AND pt.DaArrival IS NOT NULL THEN 'Over_10_Days'
            ELSE 'Missing_Dates'
        END as TurnaroundStatus
    FROM tblaimain p 
    JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID
    WHERE 
        pt.HIVLoad IS NOT NULL
        AND pt.Dat BETWEEN @StartDate AND @EndDate
        AND pt.DaCollect IS NOT NULL
        AND pt.DaArrival IS NOT NULL
    
    UNION ALL
    
    -- Children with VL test turnaround time
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        pt.HIVLoad as ViralLoad,
        pt.DaCollect as SampleDate,
        pt.DaArrival as ResultReceiveDate,
        DATEDIFF(pt.DaArrival, pt.DaCollect) as TurnaroundDays,
        CASE 
            WHEN pt.DaCollect IS NOT NULL AND pt.DaArrival IS NOT NULL
                AND DATEDIFF(pt.DaArrival, pt.DaCollect) <= 10 THEN 'Within_10_Days'
            WHEN pt.DaCollect IS NOT NULL AND pt.DaArrival IS NOT NULL THEN 'Over_10_Days'
            ELSE 'Missing_Dates'
        END as TurnaroundStatus
    FROM tblcimain p 
    JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID
    WHERE 
        pt.HIVLoad IS NOT NULL
        AND pt.Dat BETWEEN @StartDate AND @EndDate
        AND pt.DaCollect IS NOT NULL
        AND pt.DaArrival IS NOT NULL
)

SELECT
    '12e. Percentage of VL test results received within 10 days of sample taken' AS Indicator,
    IFNULL(SUM(CASE WHEN TurnaroundStatus = 'Within_10_Days' THEN 1 ELSE 0 END), 0) AS Within_10_Days,
    IFNULL(SUM(CASE WHEN TurnaroundStatus IN ('Within_10_Days', 'Over_10_Days') THEN 1 ELSE 0 END), 0) AS Total_With_Dates,
    IFNULL(COUNT(*), 0) AS Total_VL_Tests,
    CASE 
        WHEN SUM(CASE WHEN TurnaroundStatus IN ('Within_10_Days', 'Over_10_Days') THEN 1 ELSE 0 END) > 0 
        THEN ROUND((SUM(CASE WHEN TurnaroundStatus = 'Within_10_Days' THEN 1 ELSE 0 END) * 100.0 / SUM(CASE WHEN TurnaroundStatus IN ('Within_10_Days', 'Over_10_Days') THEN 1 ELSE 0 END)), 2)
        ELSE 0 
    END AS Percentage,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Male' AND TurnaroundStatus = 'Within_10_Days' THEN 1 ELSE 0 END), 0) AS Male_0_14_Within_10_Days,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Female' AND TurnaroundStatus = 'Within_10_Days' THEN 1 ELSE 0 END), 0) AS Female_0_14_Within_10_Days,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' AND TurnaroundStatus = 'Within_10_Days' THEN 1 ELSE 0 END), 0) AS Male_over_14_Within_10_Days,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' AND TurnaroundStatus = 'Within_10_Days' THEN 1 ELSE 0 END), 0) AS Female_over_14_Within_10_Days
FROM tblvl_turnaround;


-- =====================================================

-- =====================================================
-- CQI INDICATOR 10: 13A ENHANCED ADHERENCE COUNSELING
-- File: 13a_enhanced_adherence_counseling.sql
-- =====================================================

-- =====================================================
-- CQI: 13A ENHANCED ADHERENCE COUNSELING
-- Generated: 2025-10-17T07:41:43.512Z
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


-- =====================================================

-- =====================================================
-- CQI INDICATOR 11: 13B FOLLOWUP VL AFTER COUNSELING
-- File: 13b_followup_vl_after_counseling.sql
-- =====================================================

-- =====================================================
-- CQI: 13B FOLLOWUP VL AFTER COUNSELING
-- Generated: 2025-10-17T07:41:43.512Z
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
-- Indicator 13b: Percentage of PLHIV receiving ART with viral load ≥1000 copies/mL who received a follow-up viral load test within six months after enhance adherence counselling
-- ===================================================================

WITH tblfollowup_vl AS (
    -- Adults with follow-up VL after enhanced counseling
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
                AND pt2.Dat BETWEEN v1.DatVisit AND DATE_ADD(v1.DatVisit, INTERVAL 6 MONTH) THEN 'Followup_Received'
            WHEN pt1.HIVLoad IS NOT NULL 
                AND CAST(REPLACE(pt1.HIVLoad, '<', '') AS UNSIGNED) >= 1000
                AND v1.VLDetectable IS NOT NULL 
                AND v1.VLDetectable > 0 THEN 'No_Followup'
            ELSE 'Not_Eligible'
        END as FollowupStatus
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
    
    -- Children with follow-up VL after enhanced counseling
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
                AND pt2.Dat BETWEEN v1.DatVisit AND DATE_ADD(v1.DatVisit, INTERVAL 6 MONTH) THEN 'Followup_Received'
            WHEN pt1.HIVLoad IS NOT NULL 
                AND CAST(REPLACE(pt1.HIVLoad, '<', '') AS UNSIGNED) >= 1000
                AND v1.VLDetectable IS NOT NULL 
                AND v1.VLDetectable > 0 THEN 'No_Followup'
            ELSE 'Not_Eligible'
        END as FollowupStatus
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
    '13b. Percentage of PLHIV with VL ≥1000 copies/mL who received follow-up VL test within 6 months after enhanced adherence counselling' AS Indicator,
    IFNULL(SUM(CASE WHEN FollowupStatus = 'Followup_Received' THEN 1 ELSE 0 END), 0) AS Followup_Received,
    IFNULL(SUM(CASE WHEN FollowupStatus IN ('Followup_Received', 'No_Followup') THEN 1 ELSE 0 END), 0) AS Eligible_Patients,
    IFNULL(COUNT(*), 0) AS Total_High_VL_Counseled,
    CASE 
        WHEN SUM(CASE WHEN FollowupStatus IN ('Followup_Received', 'No_Followup') THEN 1 ELSE 0 END) > 0 
        THEN ROUND((SUM(CASE WHEN FollowupStatus = 'Followup_Received' THEN 1 ELSE 0 END) * 100.0 / SUM(CASE WHEN FollowupStatus IN ('Followup_Received', 'No_Followup') THEN 1 ELSE 0 END)), 2)
        ELSE 0 
    END AS Percentage,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Male' AND FollowupStatus = 'Followup_Received' THEN 1 ELSE 0 END), 0) AS Male_0_14_Followup,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Female' AND FollowupStatus = 'Followup_Received' THEN 1 ELSE 0 END), 0) AS Female_0_14_Followup,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' AND FollowupStatus = 'Followup_Received' THEN 1 ELSE 0 END), 0) AS Male_over_14_Followup,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' AND FollowupStatus = 'Followup_Received' THEN 1 ELSE 0 END), 0) AS Female_over_14_Followup
FROM tblfollowup_vl;


-- =====================================================

-- =====================================================
-- CQI INDICATOR 12: 13C VL SUPPRESSION AFTER COUNSELING
-- File: 13c_vl_suppression_after_counseling.sql
-- =====================================================

-- =====================================================
-- CQI: 13C VL SUPPRESSION AFTER COUNSELING
-- Generated: 2025-10-17T07:41:43.513Z
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


-- =====================================================

-- =====================================================
-- CQI INDICATOR 13: 14A FIRST LINE TO SECOND LINE
-- File: 14a_first_line_to_second_line.sql
-- =====================================================

-- =====================================================
-- CQI: 14A FIRST LINE TO SECOND LINE
-- Generated: 2025-10-17T07:41:43.513Z
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


-- =====================================================

-- =====================================================
-- CQI INDICATOR 14: 14B SECOND LINE TO THIRD LINE
-- File: 14b_second_line_to_third_line.sql
-- =====================================================

-- =====================================================
-- CQI: 14B SECOND LINE TO THIRD LINE
-- Generated: 2025-10-17T07:41:43.513Z
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
-- Indicator 14b: Percentage of PLHIV receiving second line ART with two consecutive documented viral load test results ≥1000 copies/mL switching to third-line ART regimen
-- ===================================================================

WITH tblsecond_to_third_line AS (
    -- Adults switching from second line to third line
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
                AND ard.DrugName LIKE '%3rd%'  -- Third line regimen
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
        AND ard.DrugName LIKE '%3rd%'
    WHERE 
        pt1.HIVLoad IS NOT NULL
        AND pt2.HIVLoad IS NOT NULL
        AND pt1.Dat BETWEEN @StartDate AND @EndDate
        AND CAST(REPLACE(pt1.HIVLoad, '<', '') AS UNSIGNED) >= 1000
        AND CAST(REPLACE(pt2.HIVLoad, '<', '') AS UNSIGNED) >= 1000
        AND EXISTS (
            SELECT 1 FROM tblavarvdrug ard2 
            WHERE ard2.Vid = p.ClinicID 
            AND ard2.DrugName LIKE '%2nd%'
            AND ard2.Da <= pt1.Dat
        )
    
    UNION ALL
    
    -- Children switching from second line to third line
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
                AND crd.DrugName LIKE '%3rd%'  -- Third line regimen
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
        AND crd.DrugName LIKE '%3rd%'
    WHERE 
        pt1.HIVLoad IS NOT NULL
        AND pt2.HIVLoad IS NOT NULL
        AND pt1.Dat BETWEEN @StartDate AND @EndDate
        AND CAST(REPLACE(pt1.HIVLoad, '<', '') AS UNSIGNED) >= 1000
        AND CAST(REPLACE(pt2.HIVLoad, '<', '') AS UNSIGNED) >= 1000
        AND EXISTS (
            SELECT 1 FROM tblcvarvdrug crd2 
            WHERE crd2.Vid = p.ClinicID 
            AND crd2.DrugName LIKE '%2nd%'
            AND crd2.Da <= pt1.Dat
        )
)

SELECT
    '14b. Percentage of PLHIV receiving second line ART with two consecutive VL ≥1000 copies/mL switching to third line' AS Indicator,
    IFNULL(SUM(CASE WHEN SwitchStatus = 'Switched' THEN 1 ELSE 0 END), 0) AS Switched_To_Third_Line,
    IFNULL(SUM(CASE WHEN SwitchStatus IN ('Switched', 'Not_Switched') THEN 1 ELSE 0 END), 0) AS Eligible_Patients,
    IFNULL(COUNT(*), 0) AS Total_Second_Line_With_Consecutive_High_VL,
    CASE 
        WHEN SUM(CASE WHEN SwitchStatus IN ('Switched', 'Not_Switched') THEN 1 ELSE 0 END) > 0 
        THEN ROUND((SUM(CASE WHEN SwitchStatus = 'Switched' THEN 1 ELSE 0 END) * 100.0 / SUM(CASE WHEN SwitchStatus IN ('Switched', 'Not_Switched') THEN 1 ELSE 0 END)), 2)
        ELSE 0 
    END AS Percentage,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Male' AND SwitchStatus = 'Switched' THEN 1 ELSE 0 END), 0) AS Male_0_14_Switched,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Female' AND SwitchStatus = 'Switched' THEN 1 ELSE 0 END), 0) AS Female_0_14_Switched,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' AND SwitchStatus = 'Switched' THEN 1 ELSE 0 END), 0) AS Male_over_14_Switched,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' AND SwitchStatus = 'Switched' THEN 1 ELSE 0 END), 0) AS Female_over_14_Switched
FROM tblsecond_to_third_line;


-- =====================================================

-- =====================================================
-- CQI INDICATOR 15: 15 RETENTION RATE
-- File: 15_retention_rate.sql
-- =====================================================

-- =====================================================
-- CQI: 15 RETENTION RATE
-- Generated: 2025-10-17T07:41:43.513Z
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


-- =====================================================

-- =====================================================
-- CQI INDICATOR 16: 1 PERCENTAGE DIED
-- File: 1_percentage_died.sql
-- =====================================================

-- =====================================================
-- CQI: 1 PERCENTAGE DIED
-- Generated: 2025-10-17T07:41:43.514Z
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
-- Indicator 1: Percentage of ART patients who died
-- Combines Indicator 8.1 (Dead) and Indicator 10 (Active ART) to calculate percentage
-- ===================================================================

WITH tbldead AS (
    -- Dead patients (from Indicator 8.1)
    SELECT 
        'Adult' as type,
        IF(main.Sex=0, 'Female', 'Male') as Sex,
        main.ClinicID
    FROM tblaimain main 
    JOIN tblavpatientstatus s ON main.ClinicID = s.ClinicID 
    WHERE s.Da BETWEEN @StartDate AND @EndDate AND s.Status = @dead_code
    
    UNION ALL
    
    SELECT 
        'Child' as type,
        IF(main.Sex=0, 'Female', 'Male') as Sex,
        main.ClinicID
    FROM tblcimain main 
    JOIN tblcvpatientstatus s ON main.ClinicID = s.ClinicID 
    WHERE s.Da BETWEEN @StartDate AND @EndDate AND s.Status = @dead_code
),

tblactive AS (
    -- Active ART patients (using proper Indicator 10 logic)
    SELECT 
        i.clinicid, 
        i.typepatients, 
        i.Sex
    FROM (
        SELECT 
            clinicid,
            DatVisit,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblavmain 
        WHERE DatVisit <= @EndDate
        
        UNION ALL 
        
        SELECT 
            clinicid,
            DatVisit,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblcvmain 
        WHERE DatVisit <= @EndDate
    ) v
    LEFT JOIN (
        SELECT 
            ClinicID,
            "15+" AS typepatients,
            Sex,
            OffIn 
        FROM tblaimain 
        WHERE DafirstVisit <= @EndDate
        
        UNION ALL 
        
        SELECT 
            ClinicID,
            "≤14" AS typepatients,
            Sex,
            OffIn 
        FROM tblcimain 
        WHERE DafirstVisit <= @EndDate
    ) i ON i.clinicid = v.clinicid
    LEFT JOIN (
        SELECT clinicid FROM tblaart WHERE DaArt <= @EndDate
        UNION ALL
        SELECT clinicid FROM tblcart WHERE DaArt <= @EndDate
    ) a ON a.clinicid = v.clinicid
    LEFT JOIN (
        SELECT clinicid, status FROM tblavpatientstatus WHERE da <= @EndDate
        UNION ALL
        SELECT clinicid, status FROM tblcvpatientstatus WHERE da <= @EndDate
    ) e ON v.clinicid = e.clinicid
    WHERE v.id = 1 AND e.status IS NULL AND a.clinicid IS NOT NULL
)

SELECT
    '1. Percentage of ART patients who died' AS Indicator,
    CAST(IFNULL(dead_stats.Deaths, 0) AS UNSIGNED) AS Deaths,
    CAST(IFNULL(dead_stats.Deaths, 0) AS UNSIGNED) AS TOTAL,
    CAST(IFNULL(active_stats.Total_ART, 0) AS UNSIGNED) AS Total_ART,
    CAST(CASE 
        WHEN active_stats.Total_ART > 0 
        THEN ROUND((dead_stats.Deaths * 100.0 / active_stats.Total_ART), 2)
        ELSE 0.00 
    END AS DECIMAL(5,2)) AS Percentage,
    CAST(IFNULL(dead_stats.Male_0_14, 0) AS UNSIGNED) AS Male_0_14,
    CAST(IFNULL(dead_stats.Male_0_14, 0) AS UNSIGNED) AS Male_0_14_Deaths,
    CAST(IFNULL(dead_stats.Female_0_14, 0) AS UNSIGNED) AS Female_0_14,
    CAST(IFNULL(dead_stats.Female_0_14, 0) AS UNSIGNED) AS Female_0_14_Deaths,
    CAST(IFNULL(dead_stats.Male_over_14, 0) AS UNSIGNED) AS Male_over_14,
    CAST(IFNULL(dead_stats.Male_over_14, 0) AS UNSIGNED) AS Male_over_14_Deaths,
    CAST(IFNULL(dead_stats.Female_over_14, 0) AS UNSIGNED) AS Female_over_14,
    CAST(IFNULL(dead_stats.Female_over_14, 0) AS UNSIGNED) AS Female_over_14_Deaths
FROM (
    SELECT 
        COUNT(DISTINCT ClinicID) AS Deaths,
        SUM(CASE WHEN type = 'Child' AND Sex = 'Male' THEN 1 ELSE 0 END) AS Male_0_14,
        SUM(CASE WHEN type = 'Child' AND Sex = 'Female' THEN 1 ELSE 0 END) AS Female_0_14,
        SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' THEN 1 ELSE 0 END) AS Male_over_14,
        SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' THEN 1 ELSE 0 END) AS Female_over_14
    FROM tbldead
) dead_stats
CROSS JOIN (
    SELECT 
        COUNT(DISTINCT ClinicID) AS Total_ART
    FROM tblactive
) active_stats;


-- =====================================================

-- =====================================================
-- CQI INDICATOR 17: 2 PERCENTAGE LOST TO FOLLOWUP
-- File: 2_percentage_lost_to_followup.sql
-- =====================================================

-- =====================================================
-- CQI: 2 PERCENTAGE LOST TO FOLLOWUP
-- Generated: 2025-10-17T07:41:43.514Z
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
-- Indicator 2: Percentage of ART patients who were lost to follow-up
-- Combines Indicator 8.2 (Lost to follow-up) and active ART patients to calculate percentage
-- ===================================================================

WITH tblost AS (
    -- Lost to follow-up patients (from Indicator 8.2)
    SELECT 
        'Adult' as type,
        IF(main.Sex=0, 'Female', 'Male') as Sex,
        main.ClinicID
    FROM tblaimain main 
    JOIN tblavpatientstatus s ON main.ClinicID = s.ClinicID 
    WHERE s.Da BETWEEN @StartDate AND @EndDate AND s.Status = @lost_code
    
    UNION ALL
    
    SELECT 
        'Child' as type,
        IF(main.Sex=0, 'Female', 'Male') as Sex,
        main.ClinicID
    FROM tblcimain main 
    JOIN tblcvpatientstatus s ON main.ClinicID = s.ClinicID 
    WHERE s.Da BETWEEN @StartDate AND @EndDate AND s.Status = @lost_code
),

tblactive AS (
    -- Active ART patients (using proper Indicator 10 logic)
    SELECT 
        i.clinicid, 
        i.typepatients, 
        i.Sex
    FROM (
        SELECT 
            clinicid,
            DatVisit,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblavmain 
        WHERE DatVisit <= @EndDate
        
        UNION ALL 
        
        SELECT 
            clinicid,
            DatVisit,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblcvmain 
        WHERE DatVisit <= @EndDate
    ) v
    LEFT JOIN (
        SELECT 
            ClinicID,
            "15+" AS typepatients,
            Sex,
            OffIn 
        FROM tblaimain 
        WHERE DafirstVisit <= @EndDate
        
        UNION ALL 
        
        SELECT 
            ClinicID,
            "≤14" AS typepatients,
            Sex,
            OffIn 
        FROM tblcimain 
        WHERE DafirstVisit <= @EndDate
    ) i ON i.clinicid = v.clinicid
    LEFT JOIN (
        SELECT clinicid FROM tblaart WHERE DaArt <= @EndDate
        UNION ALL
        SELECT clinicid FROM tblcart WHERE DaArt <= @EndDate
    ) a ON a.clinicid = v.clinicid
    LEFT JOIN (
        SELECT clinicid, status FROM tblavpatientstatus WHERE da <= @EndDate
        UNION ALL
        SELECT clinicid, status FROM tblcvpatientstatus WHERE da <= @EndDate
    ) e ON v.clinicid = e.clinicid
    WHERE v.id = 1 AND e.status IS NULL AND a.clinicid IS NOT NULL
)

SELECT
    '2. Percentage of ART patients who were lost to follow-up' AS Indicator,
    CAST(IFNULL(lost_stats.Lost_to_Followup, 0) AS UNSIGNED) AS Lost_to_Followup,
    CAST(IFNULL(lost_stats.Lost_to_Followup, 0) AS UNSIGNED) AS TOTAL,
    CAST(IFNULL(active_stats.Total_ART, 0) AS UNSIGNED) AS Total_ART,
    CAST(CASE 
        WHEN active_stats.Total_ART > 0 
        THEN ROUND((lost_stats.Lost_to_Followup * 100.0 / active_stats.Total_ART), 2)
        ELSE 0.00 
    END AS DECIMAL(5,2)) AS Percentage,
    CAST(IFNULL(lost_stats.Male_0_14, 0) AS UNSIGNED) AS Male_0_14,
    CAST(IFNULL(lost_stats.Male_0_14, 0) AS UNSIGNED) AS Male_0_14_Lost,
    CAST(IFNULL(lost_stats.Female_0_14, 0) AS UNSIGNED) AS Female_0_14,
    CAST(IFNULL(lost_stats.Female_0_14, 0) AS UNSIGNED) AS Female_0_14_Lost,
    CAST(IFNULL(lost_stats.Male_over_14, 0) AS UNSIGNED) AS Male_over_14,
    CAST(IFNULL(lost_stats.Male_over_14, 0) AS UNSIGNED) AS Male_over_14_Lost,
    CAST(IFNULL(lost_stats.Female_over_14, 0) AS UNSIGNED) AS Female_over_14,
    CAST(IFNULL(lost_stats.Female_over_14, 0) AS UNSIGNED) AS Female_over_14_Lost
FROM (
    SELECT 
        COUNT(DISTINCT ClinicID) AS Lost_to_Followup,
        SUM(CASE WHEN type = 'Child' AND Sex = 'Male' THEN 1 ELSE 0 END) AS Male_0_14,
        SUM(CASE WHEN type = 'Child' AND Sex = 'Female' THEN 1 ELSE 0 END) AS Female_0_14,
        SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' THEN 1 ELSE 0 END) AS Male_over_14,
        SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' THEN 1 ELSE 0 END) AS Female_over_14
    FROM tblost
) lost_stats
CROSS JOIN (
    SELECT 
        COUNT(DISTINCT ClinicID) AS Total_ART
    FROM tblactive
) active_stats;

-- =====================================================

-- =====================================================
-- CQI INDICATOR 18: 3 REENGAGED WITHIN 28 DAYS
-- File: 3_reengaged_within_28_days.sql
-- =====================================================

-- =====================================================
-- CQI: 3 REENGAGED WITHIN 28 DAYS
-- Generated: 2025-10-17T07:41:43.514Z
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
-- Indicator 3: Percentage reengaged within 28 days
SELECT
    'Indicator 3: Percentage reengaged within 28 days' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_0_14_Reengaged,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_0_14_Reengaged,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_over_14_Reengaged,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_over_14_Reengaged
FROM (
    SELECT 'Adult' as type, IF(main.Sex=0, 'Female', 'Male') as Sex FROM tblaimain main JOIN tblavpatientstatus s ON main.ClinicID = s.ClinicID WHERE s.Da BETWEEN @StartDate AND @EndDate AND s.Status = @transfer_in_code
    UNION ALL
    SELECT 'Child' as type, IF(main.Sex=0, 'Female', 'Male') as Sex FROM tblcimain main JOIN tblcvpatientstatus s ON main.ClinicID = s.ClinicID WHERE s.Da BETWEEN @StartDate AND @EndDate AND s.Status = @transfer_in_code
) AS PatientList;

-- =====================================================

-- =====================================================
-- CQI INDICATOR 19: 4 REENGAGED OVER 28 DAYS
-- File: 4_reengaged_over_28_days.sql
-- =====================================================

-- =====================================================
-- CQI: 4 REENGAGED OVER 28 DAYS
-- Generated: 2025-10-17T07:41:43.514Z
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
-- Indicator 4: Percentage reengaged after 28+ days
SELECT
    'Indicator 4: Percentage reengaged after 28+ days' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_0_14_Reengaged,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_0_14_Reengaged,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_over_14_Reengaged,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_over_14_Reengaged
FROM (
    SELECT 'Adult' as type, IF(main.Sex=0, 'Female', 'Male') as Sex FROM tblaimain main JOIN tblavpatientstatus s ON main.ClinicID = s.ClinicID WHERE s.Da BETWEEN @StartDate AND @EndDate AND s.Status = @transfer_in_code
    UNION ALL
    SELECT 'Child' as type, IF(main.Sex=0, 'Female', 'Male') as Sex FROM tblcimain main JOIN tblcvpatientstatus s ON main.ClinicID = s.ClinicID WHERE s.Da BETWEEN @StartDate AND @EndDate AND s.Status = @transfer_in_code
) AS PatientList;

-- =====================================================

-- =====================================================
-- CQI INDICATOR 20: 5.7.1 MORTALITY INDICATORS
-- File: 5.7.1_mortality_indicators.sql
-- =====================================================

-- =====================================================
-- CQI: 5.7.1 MORTALITY INDICATORS
-- Generated: 2025-10-17T07:41:43.515Z
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
-- 5.7.1 Mortality indicators and re-engage into care indicators
-- ===================================================================

-- Indicator 1: Percentage of ART patients who died
WITH tblmortality AS (
    -- Adults who died
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        ps.Da as DeathDate,
        ps.Cause as DeathCause
    FROM tblaimain p 
    JOIN tblavpatientstatus ps ON p.ClinicID = ps.ClinicID
    WHERE 
        ps.Status = 1  -- Dead
        AND ps.Da BETWEEN @StartDate AND @EndDate
    
    UNION ALL
    
    -- Children who died
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        ps.Da as DeathDate,
        ps.Cause as DeathCause
    FROM tblcimain p 
    JOIN tblcvpatientstatus ps ON p.ClinicID = ps.ClinicID
    WHERE 
        ps.Status = 1  -- Dead
        AND ps.Da BETWEEN @StartDate AND @EndDate
),

-- Total active ART patients for denominator
tbltotalart AS (
    -- Adults on ART
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaART
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
        p.ClinicID,
        p.DaART
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = p.ClinicID
    WHERE 
        art.DaArt <= @EndDate
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
)

SELECT
    '1. Percentage of ART patients who died' AS Indicator,
    IFNULL(COUNT(DISTINCT m.ClinicID), 0) AS Deaths,
    IFNULL(COUNT(DISTINCT t.ClinicID), 0) AS Total_ART,
    CASE 
        WHEN COUNT(DISTINCT t.ClinicID) > 0 
        THEN ROUND((COUNT(DISTINCT m.ClinicID) * 100.0 / COUNT(DISTINCT t.ClinicID)), 2)
        ELSE 0 
    END AS Percentage,
    IFNULL(SUM(CASE WHEN m.type = 'Child' AND m.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_0_14_Deaths,
    IFNULL(SUM(CASE WHEN m.type = 'Child' AND m.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_0_14_Deaths,
    IFNULL(SUM(CASE WHEN m.type = 'Adult' AND m.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_over_14_Deaths,
    IFNULL(SUM(CASE WHEN m.type = 'Adult' AND m.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_over_14_Deaths
FROM tblmortality m
RIGHT JOIN tbltotalart t ON m.ClinicID = t.ClinicID AND m.type = t.type;


-- =====================================================

-- =====================================================
-- CQI INDICATOR 21: 5A LATE VISITS BEYOND BUFFER
-- File: 5a_late_visits_beyond_buffer.sql
-- =====================================================

-- =====================================================
-- CQI: 5A LATE VISITS BEYOND BUFFER
-- Generated: 2025-10-17T07:41:43.515Z
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
-- Indicator 5a: Percentage of late visits beyond ARV supply buffer date
-- ===================================================================

WITH tbllatevisitsbeyond AS (
    -- Adults with late visits beyond buffer
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        v.DatVisit,
        v.DaApp,
        DATEDIFF(v.DatVisit, v.DaApp) as DaysLate,
        CASE 
            WHEN DATEDIFF(v.DatVisit, v.DaApp) > 30 THEN 'Beyond Buffer'
            ELSE 'Within Buffer'
        END as VisitStatus
    FROM tblaimain p 
    JOIN tblavmain v ON p.ClinicID = v.ClinicID
    WHERE 
        v.DatVisit BETWEEN @StartDate AND @EndDate
        AND v.TypeVisit = 3  -- Late visit
        AND DATEDIFF(v.DatVisit, v.DaApp) > 30  -- Beyond 30-day buffer
    
    UNION ALL
    
    -- Children with late visits beyond buffer
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        v.DatVisit,
        v.DaApp,
        DATEDIFF(v.DatVisit, v.DaApp) as DaysLate,
        CASE 
            WHEN DATEDIFF(v.DatVisit, v.DaApp) > 30 THEN 'Beyond Buffer'
            ELSE 'Within Buffer'
        END as VisitStatus
    FROM tblcimain p 
    JOIN tblcvmain v ON p.ClinicID = v.ClinicID
    WHERE 
        v.DatVisit BETWEEN @StartDate AND @EndDate
        AND v.TypeVisit = 3  -- Late visit
        AND DATEDIFF(v.DatVisit, v.DaApp) > 30  -- Beyond 30-day buffer
),

-- Total visits for denominator
tbltotalvisits AS (
    -- Adult visits
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        v.DatVisit,
        v.DaApp
    FROM tblaimain p 
    JOIN tblavmain v ON p.ClinicID = v.ClinicID
    WHERE 
        v.DatVisit BETWEEN @StartDate AND @EndDate
    
    UNION ALL
    
    -- Child visits
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        v.DatVisit,
        v.DaApp
    FROM tblcimain p 
    JOIN tblcvmain v ON p.ClinicID = v.ClinicID
    WHERE 
        v.DatVisit BETWEEN @StartDate AND @EndDate
)

SELECT
    '5a. Percentage of late visits beyond ARV supply buffer date' AS Indicator,
    IFNULL(COUNT(DISTINCT l.ClinicID), 0) AS Late_Visits_Beyond_Buffer,
    IFNULL(COUNT(DISTINCT t.ClinicID), 0) AS Total_Visits,
    CASE 
        WHEN COUNT(DISTINCT t.ClinicID) > 0 
        THEN ROUND((COUNT(DISTINCT l.ClinicID) * 100.0 / COUNT(DISTINCT t.ClinicID)), 2)
        ELSE 0 
    END AS Percentage,
    IFNULL(SUM(CASE WHEN l.type = 'Child' AND l.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_0_14_Late,
    IFNULL(SUM(CASE WHEN l.type = 'Child' AND l.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_0_14_Late,
    IFNULL(SUM(CASE WHEN l.type = 'Adult' AND l.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_over_14_Late,
    IFNULL(SUM(CASE WHEN l.type = 'Adult' AND l.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_over_14_Late
FROM tbllatevisitsbeyond l
RIGHT JOIN tbltotalvisits t ON l.ClinicID = t.ClinicID AND l.type = t.type;


-- =====================================================

-- =====================================================
-- CQI INDICATOR 22: 5B LATE VISITS WITHIN BUFFER
-- File: 5b_late_visits_within_buffer.sql
-- =====================================================

-- =====================================================
-- CQI: 5B LATE VISITS WITHIN BUFFER
-- Generated: 2025-10-17T07:41:43.515Z
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
-- Indicator 5b: Percentage of late visits within ARV supply buffer date
-- ===================================================================

WITH tbllatevisitswithin AS (
    -- Adults with late visits within buffer
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        v.DatVisit,
        v.DaApp,
        DATEDIFF(v.DatVisit, v.DaApp) as DaysLate,
        CASE 
            WHEN DATEDIFF(v.DatVisit, v.DaApp) <= 30 THEN 'Within Buffer'
            ELSE 'Beyond Buffer'
        END as VisitStatus
    FROM tblaimain p 
    JOIN tblavmain v ON p.ClinicID = v.ClinicID
    WHERE 
        v.DatVisit BETWEEN @StartDate AND @EndDate
        AND v.TypeVisit = 3  -- Late visit
        AND DATEDIFF(v.DatVisit, v.DaApp) <= 30  -- Within 30-day buffer
        AND DATEDIFF(v.DatVisit, v.DaApp) > 0  -- Actually late
    
    UNION ALL
    
    -- Children with late visits within buffer
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        v.DatVisit,
        v.DaApp,
        DATEDIFF(v.DatVisit, v.DaApp) as DaysLate,
        CASE 
            WHEN DATEDIFF(v.DatVisit, v.DaApp) <= 30 THEN 'Within Buffer'
            ELSE 'Beyond Buffer'
        END as VisitStatus
    FROM tblcimain p 
    JOIN tblcvmain v ON p.ClinicID = v.ClinicID
    WHERE 
        v.DatVisit BETWEEN @StartDate AND @EndDate
        AND v.TypeVisit = 3  -- Late visit
        AND DATEDIFF(v.DatVisit, v.DaApp) <= 30  -- Within 30-day buffer
        AND DATEDIFF(v.DatVisit, v.DaApp) > 0  -- Actually late
),

-- Total visits for denominator
tbltotalvisits AS (
    -- Adult visits
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        v.DatVisit,
        v.DaApp
    FROM tblaimain p 
    JOIN tblavmain v ON p.ClinicID = v.ClinicID
    WHERE 
        v.DatVisit BETWEEN @StartDate AND @EndDate
    
    UNION ALL
    
    -- Child visits
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        v.DatVisit,
        v.DaApp
    FROM tblcimain p 
    JOIN tblcvmain v ON p.ClinicID = v.ClinicID
    WHERE 
        v.DatVisit BETWEEN @StartDate AND @EndDate
)

SELECT
    '5b. Percentage of late visits within ARV supply buffer date' AS Indicator,
    IFNULL(COUNT(DISTINCT l.ClinicID), 0) AS Late_Visits_Within_Buffer,
    IFNULL(COUNT(DISTINCT t.ClinicID), 0) AS Total_Visits,
    CASE 
        WHEN COUNT(DISTINCT t.ClinicID) > 0 
        THEN ROUND((COUNT(DISTINCT l.ClinicID) * 100.0 / COUNT(DISTINCT t.ClinicID)), 2)
        ELSE 0 
    END AS Percentage,
    IFNULL(SUM(CASE WHEN l.type = 'Child' AND l.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_0_14_Late,
    IFNULL(SUM(CASE WHEN l.type = 'Child' AND l.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_0_14_Late,
    IFNULL(SUM(CASE WHEN l.type = 'Adult' AND l.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_over_14_Late,
    IFNULL(SUM(CASE WHEN l.type = 'Adult' AND l.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_over_14_Late
FROM tbllatevisitswithin l
RIGHT JOIN tbltotalvisits t ON l.ClinicID = t.ClinicID AND l.type = t.type;


-- =====================================================

-- =====================================================
-- CQI INDICATOR 23: 5C VISITS ON SCHEDULE
-- File: 5c_visits_on_schedule.sql
-- =====================================================

-- =====================================================
-- CQI: 5C VISITS ON SCHEDULE
-- Generated: 2025-10-17T07:41:43.516Z
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
-- Indicator 5c: Percentage of visits on schedule among ART patients
-- ===================================================================

WITH tblonschedulevisits AS (
    -- Adults with on-schedule visits
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        v.DatVisit,
        v.DaApp,
        v.TypeVisit
    FROM tblaimain p 
    JOIN tblavmain v ON p.ClinicID = v.ClinicID
    WHERE 
        v.DatVisit BETWEEN @StartDate AND @EndDate
        AND v.TypeVisit = 2  -- On schedule visit
    
    UNION ALL
    
    -- Children with on-schedule visits
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        v.DatVisit,
        v.DaApp,
        v.TypeVisit
    FROM tblcimain p 
    JOIN tblcvmain v ON p.ClinicID = v.ClinicID
    WHERE 
        v.DatVisit BETWEEN @StartDate AND @EndDate
        AND v.TypeVisit = 2  -- On schedule visit
),

-- Total visits for denominator
tbltotalvisits AS (
    -- Adult visits
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        v.DatVisit,
        v.DaApp,
        v.TypeVisit
    FROM tblaimain p 
    JOIN tblavmain v ON p.ClinicID = v.ClinicID
    WHERE 
        v.DatVisit BETWEEN @StartDate AND @EndDate
    
    UNION ALL
    
    -- Child visits
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        v.DatVisit,
        v.DaApp,
        v.TypeVisit
    FROM tblcimain p 
    JOIN tblcvmain v ON p.ClinicID = v.ClinicID
    WHERE 
        v.DatVisit BETWEEN @StartDate AND @EndDate
)

SELECT
    '5c. Percentage of visits on schedule among ART patients' AS Indicator,
    IFNULL(COUNT(DISTINCT o.ClinicID), 0) AS On_Schedule_Visits,
    IFNULL(COUNT(DISTINCT t.ClinicID), 0) AS Total_Visits,
    CASE 
        WHEN COUNT(DISTINCT t.ClinicID) > 0 
        THEN ROUND((COUNT(DISTINCT o.ClinicID) * 100.0 / COUNT(DISTINCT t.ClinicID)), 2)
        ELSE 0 
    END AS Percentage,
    IFNULL(SUM(CASE WHEN o.type = 'Child' AND o.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_0_14_OnSchedule,
    IFNULL(SUM(CASE WHEN o.type = 'Child' AND o.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_0_14_OnSchedule,
    IFNULL(SUM(CASE WHEN o.type = 'Adult' AND o.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_over_14_OnSchedule,
    IFNULL(SUM(CASE WHEN o.type = 'Adult' AND o.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_over_14_OnSchedule
FROM tblonschedulevisits o
RIGHT JOIN tbltotalvisits t ON o.ClinicID = t.ClinicID AND o.type = t.type;


-- =====================================================

-- =====================================================
-- CQI INDICATOR 24: 5D EARLY VISITS
-- File: 5d_early_visits.sql
-- =====================================================

-- =====================================================
-- CQI: 5D EARLY VISITS
-- Generated: 2025-10-17T07:41:43.516Z
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
-- Indicator 5d: Percentage of early visits among ART patients
-- ===================================================================

WITH tblearlyvisits AS (
    -- Adults with early visits
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        v.DatVisit,
        v.DaApp,
        v.TypeVisit,
        DATEDIFF(v.DaApp, v.DatVisit) as DaysEarly
    FROM tblaimain p 
    JOIN tblavmain v ON p.ClinicID = v.ClinicID
    WHERE 
        v.DatVisit BETWEEN @StartDate AND @EndDate
        AND v.TypeVisit = 1  -- Early visit
    
    UNION ALL
    
    -- Children with early visits
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        v.DatVisit,
        v.DaApp,
        v.TypeVisit,
        DATEDIFF(v.DaApp, v.DatVisit) as DaysEarly
    FROM tblcimain p 
    JOIN tblcvmain v ON p.ClinicID = v.ClinicID
    WHERE 
        v.DatVisit BETWEEN @StartDate AND @EndDate
        AND v.TypeVisit = 1  -- Early visit
),

-- Total visits for denominator
tbltotalvisits AS (
    -- Adult visits
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        v.DatVisit,
        v.DaApp,
        v.TypeVisit
    FROM tblaimain p 
    JOIN tblavmain v ON p.ClinicID = v.ClinicID
    WHERE 
        v.DatVisit BETWEEN @StartDate AND @EndDate
    
    UNION ALL
    
    -- Child visits
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        v.DatVisit,
        v.DaApp,
        v.TypeVisit
    FROM tblcimain p 
    JOIN tblcvmain v ON p.ClinicID = v.ClinicID
    WHERE 
        v.DatVisit BETWEEN @StartDate AND @EndDate
)

SELECT
    '5d. Percentage of early visits among ART patients' AS Indicator,
    IFNULL(COUNT(DISTINCT e.ClinicID), 0) AS Early_Visits,
    IFNULL(COUNT(DISTINCT t.ClinicID), 0) AS Total_Visits,
    CASE 
        WHEN COUNT(DISTINCT t.ClinicID) > 0 
        THEN ROUND((COUNT(DISTINCT e.ClinicID) * 100.0 / COUNT(DISTINCT t.ClinicID)), 2)
        ELSE 0 
    END AS Percentage,
    IFNULL(SUM(CASE WHEN e.type = 'Child' AND e.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_0_14_Early,
    IFNULL(SUM(CASE WHEN e.type = 'Child' AND e.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_0_14_Early,
    IFNULL(SUM(CASE WHEN e.type = 'Adult' AND e.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_over_14_Early,
    IFNULL(SUM(CASE WHEN e.type = 'Adult' AND e.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_over_14_Early
FROM tblearlyvisits e
RIGHT JOIN tbltotalvisits t ON e.ClinicID = t.ClinicID AND e.type = t.type;


-- =====================================================

-- =====================================================
-- CQI INDICATOR 25: 6 SAME DAY ART INITIATION
-- File: 6_same_day_art_initiation.sql
-- =====================================================

-- =====================================================
-- CQI: 6 SAME DAY ART INITIATION
-- Generated: 2025-10-17T07:41:43.516Z
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
-- Indicator 6: Percentage of patients newly initiating ART on same-day as diagnosed date
-- (disaggregate: 0 day, 1-7 days, >7 days)
-- ===================================================================

WITH tblsame_day_art AS (
    -- Adults with same-day ART initiation
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaHIV as DiagnosisDate,
        p.DaART as ARTStartDate,
        DATEDIFF(p.DaART, p.DaHIV) as DaysBetween,
        CASE 
            WHEN DATEDIFF(p.DaART, p.DaHIV) = 0 THEN '0 day'
            WHEN DATEDIFF(p.DaART, p.DaHIV) BETWEEN 1 AND 7 THEN '1-7 days'
            WHEN DATEDIFF(p.DaART, p.DaHIV) > 7 THEN '>7 days'
            ELSE 'Unknown'
        END as TimeToART
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    WHERE 
        art.DaArt BETWEEN @StartDate AND @EndDate
        AND p.DaHIV IS NOT NULL
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
    
    UNION ALL
    
    -- Children with same-day ART initiation
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaTest as DiagnosisDate,
        p.DaART as ARTStartDate,
        DATEDIFF(p.DaART, p.DaTest) as DaysBetween,
        CASE 
            WHEN DATEDIFF(p.DaART, p.DaTest) = 0 THEN '0 day'
            WHEN DATEDIFF(p.DaART, p.DaTest) BETWEEN 1 AND 7 THEN '1-7 days'
            WHEN DATEDIFF(p.DaART, p.DaTest) > 7 THEN '>7 days'
            ELSE 'Unknown'
        END as TimeToART
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = p.ClinicID
    WHERE 
        art.DaArt BETWEEN @StartDate AND @EndDate
        AND p.DaTest IS NOT NULL
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
),

-- Total newly initiated patients
tbltotal_initiated AS (
    SELECT 
        type,
        Sex,
        ClinicID,
        TimeToART
    FROM tblsame_day_art
)

SELECT
    '6. Percentage of patients newly initiating ART on same-day as diagnosed date' AS Indicator,
    IFNULL(SUM(CASE WHEN TimeToART = '0 day' THEN 1 ELSE 0 END), 0) AS Same_Day_Initiation,
    IFNULL(SUM(CASE WHEN TimeToART = '1-7 days' THEN 1 ELSE 0 END), 0) AS Initiation_1_7_Days,
    IFNULL(SUM(CASE WHEN TimeToART = '>7 days' THEN 1 ELSE 0 END), 0) AS Initiation_Over_7_Days,
    IFNULL(COUNT(*), 0) AS Total_Newly_Initiated,
    CASE 
        WHEN COUNT(*) > 0 
        THEN ROUND((SUM(CASE WHEN TimeToART = '0 day' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2)
        ELSE 0 
    END AS Percentage_Same_Day,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Male' AND TimeToART = '0 day' THEN 1 ELSE 0 END), 0) AS Male_0_14_Same_Day,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Female' AND TimeToART = '0 day' THEN 1 ELSE 0 END), 0) AS Female_0_14_Same_Day,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' AND TimeToART = '0 day' THEN 1 ELSE 0 END), 0) AS Male_over_14_Same_Day,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' AND TimeToART = '0 day' THEN 1 ELSE 0 END), 0) AS Female_over_14_Same_Day
FROM tbltotal_initiated;


-- =====================================================

-- =====================================================
-- CQI INDICATOR 26: 7 BASELINE CD4 BEFORE ART
-- File: 7_baseline_cd4_before_art.sql
-- =====================================================

-- =====================================================
-- CQI: 7 BASELINE CD4 BEFORE ART
-- Generated: 2025-10-17T07:41:43.516Z
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
-- Indicator 7: Percentage of HIV infected patients who received a baseline CD4 count before starting ART
-- ===================================================================

WITH tblbaseline_cd4 AS (
    -- Adults with baseline CD4 before ART
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaART as ARTStartDate,
        pt.CD4 as BaselineCD4,
        pt.Dat as CD4TestDate,
        CASE 
            WHEN pt.CD4 IS NOT NULL AND pt.Dat <= p.DaART THEN 'Yes'
            ELSE 'No'
        END as HasBaselineCD4
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    LEFT JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID 
        AND pt.CD4 IS NOT NULL 
        AND pt.Dat <= art.DaArt
    WHERE 
        p.DaART BETWEEN @StartDate AND @EndDate
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
    
    UNION ALL
    
    -- Children with baseline CD4 before ART
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaART as ARTStartDate,
        pt.CD4 as BaselineCD4,
        pt.Dat as CD4TestDate,
        CASE 
            WHEN pt.CD4 IS NOT NULL AND pt.Dat <= p.DaART THEN 'Yes'
            ELSE 'No'
        END as HasBaselineCD4
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = p.ClinicID
    LEFT JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID 
        AND pt.CD4 IS NOT NULL 
        AND pt.Dat <= art.DaArt
    WHERE 
        p.DaART BETWEEN @StartDate AND @EndDate
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
)

SELECT
    '7. Percentage of HIV infected patients who received a baseline CD4 count before starting ART' AS Indicator,
    IFNULL(SUM(CASE WHEN HasBaselineCD4 = 'Yes' THEN 1 ELSE 0 END), 0) AS With_Baseline_CD4,
    IFNULL(COUNT(*), 0) AS Total_Newly_Initiated,
    CASE 
        WHEN COUNT(*) > 0 
        THEN ROUND((SUM(CASE WHEN HasBaselineCD4 = 'Yes' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2)
        ELSE 0 
    END AS Percentage,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Male' AND HasBaselineCD4 = 'Yes' THEN 1 ELSE 0 END), 0) AS Male_0_14_With_CD4,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Female' AND HasBaselineCD4 = 'Yes' THEN 1 ELSE 0 END), 0) AS Female_0_14_With_CD4,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' AND HasBaselineCD4 = 'Yes' THEN 1 ELSE 0 END), 0) AS Male_over_14_With_CD4,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' AND HasBaselineCD4 = 'Yes' THEN 1 ELSE 0 END), 0) AS Female_over_14_With_CD4
FROM tblbaseline_cd4;


-- =====================================================

-- =====================================================
-- CQI INDICATOR 27: 8A COTRIMOXAZOLE PROPHYLAXIS
-- File: 8a_cotrimoxazole_prophylaxis.sql
-- =====================================================

-- =====================================================
-- CQI: 8A COTRIMOXAZOLE PROPHYLAXIS
-- Generated: 2025-10-17T07:41:43.517Z
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

-- =====================================================

-- =====================================================
-- CQI INDICATOR 28: 8B FLUCONAZOLE PROPHYLAXIS
-- File: 8b_fluconazole_prophylaxis.sql
-- =====================================================

-- =====================================================
-- CQI: 8B FLUCONAZOLE PROPHYLAXIS
-- Generated: 2025-10-17T07:41:43.517Z
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
-- Indicator 8b: Percentage of patients with CD4 counts less than 100 c/mm3 receiving prophylaxis with Fluconazole
-- ===================================================================

WITH tblfluconazole AS (
    -- Adults with CD4 < 100 receiving Fluconazole
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        pt.CD4 as LatestCD4,
        pt.Dat as CD4TestDate,
        CASE 
            WHEN CAST(pt.CD4 AS UNSIGNED) < 100 THEN 'CD4_Low'
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
                AND ard.DrugName LIKE '%FLU%' 
                AND ard.Status IN (0, 2)
            ) THEN 'Yes'
            ELSE 'No'
        END as ReceivingFluconazole
    FROM tblaimain p 
    JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID
    WHERE 
        pt.CD4 IS NOT NULL 
        AND pt.Dat BETWEEN @StartDate AND @EndDate
        AND CAST(pt.CD4 AS UNSIGNED) < 100
    
    UNION ALL
    
    -- Children with CD4 < 100 receiving Fluconazole
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        pt.CD4 as LatestCD4,
        pt.Dat as CD4TestDate,
        CASE 
            WHEN CAST(pt.CD4 AS UNSIGNED) < 100 THEN 'CD4_Low'
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
                AND crd.DrugName LIKE '%FLU%' 
                AND crd.Status IN (0, 2)
            ) THEN 'Yes'
            ELSE 'No'
        END as ReceivingFluconazole
    FROM tblcimain p 
    JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID
    WHERE 
        pt.CD4 IS NOT NULL 
        AND pt.Dat BETWEEN @StartDate AND @EndDate
        AND CAST(pt.CD4 AS UNSIGNED) < 100
)

SELECT
    '8b. Percentage of patients with CD4 < 100 receiving Fluconazole prophylaxis' AS Indicator,
    IFNULL(SUM(CASE WHEN ReceivingFluconazole = 'Yes' THEN 1 ELSE 0 END), 0) AS Receiving_Fluconazole,
    IFNULL(COUNT(*), 0) AS Total_CD4_Low_100,
    CASE 
        WHEN COUNT(*) > 0 
        THEN ROUND((SUM(CASE WHEN ReceivingFluconazole = 'Yes' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2)
        ELSE 0 
    END AS Percentage,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Male' AND ReceivingFluconazole = 'Yes' THEN 1 ELSE 0 END), 0) AS Male_0_14_Receiving,
    IFNULL(SUM(CASE WHEN type = 'Child' AND Sex = 'Female' AND ReceivingFluconazole = 'Yes' THEN 1 ELSE 0 END), 0) AS Female_0_14_Receiving,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' AND ReceivingFluconazole = 'Yes' THEN 1 ELSE 0 END), 0) AS Male_over_14_Receiving,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' AND ReceivingFluconazole = 'Yes' THEN 1 ELSE 0 END), 0) AS Female_over_14_Receiving
FROM tblfluconazole;

-- =====================================================

-- =====================================================
-- CQI INDICATOR 29: 9 MMD 3 MONTHS
-- File: 9_mmd_3_months.sql
-- =====================================================

-- =====================================================
-- CQI: 9 MMD 3 MONTHS
-- Generated: 2025-10-17T07:41:43.518Z
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


-- =====================================================

-- =====================================================
-- CQI SUMMARY QUERY
-- =====================================================
-- This query provides a summary of all CQI indicators

SELECT 
    '1. Percentage of ART patients who died' as indicator_name,
    'Mortality & Re-engagement' as category,
    'Shows the percentage of ART patients who died during the reporting period' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '2. Percentage of ART patients who were lost to follow-up' as indicator_name,
    'Mortality & Re-engagement' as category,
    'Shows the percentage of ART patients who were lost to follow-up during the reporting period' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '3. Percentage reengaged within 28 days' as indicator_name,
    'Mortality & Re-engagement' as category,
    'Shows the percentage of patients who reengaged in care within 28 days' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '4. Percentage reengaged over 28 days' as indicator_name,
    'Mortality & Re-engagement' as category,
    'Shows the percentage of patients who reengaged in care after 28 days' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '5a. Late visits beyond buffer' as indicator_name,
    'Visit Status' as category,
    'Shows the percentage of late visits beyond ARV supply buffer date' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '5b. Late visits within buffer' as indicator_name,
    'Visit Status' as category,
    'Shows the percentage of late visits within ARV supply buffer date' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '5c. Visits on schedule' as indicator_name,
    'Visit Status' as category,
    'Shows the percentage of visits on schedule among ART patients' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '5d. Early visits' as indicator_name,
    'Visit Status' as category,
    'Shows the percentage of early visits among ART patients' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '6. Same day ART initiation' as indicator_name,
    'Treatment & Prevention' as category,
    'Shows the percentage of patients newly initiating ART on same-day as diagnosed date' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '7. Baseline CD4 before ART' as indicator_name,
    'Treatment & Prevention' as category,
    'Shows the percentage of HIV infected patients who received a baseline CD4 count before starting ART' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '8a. Cotrimoxazole prophylaxis' as indicator_name,
    'Treatment & Prevention' as category,
    'Shows the percentage of patients with CD4 count less than 350 receiving prophylaxis with Cotrimoxazole' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '8b. Fluconazole prophylaxis' as indicator_name,
    'Treatment & Prevention' as category,
    'Shows the percentage of patients with CD4 counts less than 100 c/mm3 receiving prophylaxis with Fluconazole' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '9. MMD 3 months' as indicator_name,
    'Treatment & Prevention' as category,
    'Shows the percentage of ART patients have received MMD ≥ 3 months' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '10a. TLD new initiation' as indicator_name,
    'Treatment & Prevention' as category,
    'Shows the percentage of patients newly initiating ART with TLD as 1st line regimen' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '10b. TLD cumulative' as indicator_name,
    'Treatment & Prevention' as category,
    'Shows the percentage of patients currently on TLD regimen' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '11a. TPT received' as indicator_name,
    'Treatment & Prevention' as category,
    'Shows the percentage of patients who received TPT' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '11b. TPT completed' as indicator_name,
    'Treatment & Prevention' as category,
    'Shows the percentage of patients who completed TPT' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '12a. VL testing coverage' as indicator_name,
    'Viral Load' as category,
    'Shows the percentage of patients with viral load testing coverage' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '12b. VL monitored six months' as indicator_name,
    'Viral Load' as category,
    'Shows the percentage of patients with viral load monitoring in six months' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '12c. VL suppression 12 months' as indicator_name,
    'Viral Load' as category,
    'Shows the percentage of patients with viral load suppression at 12 months' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '12d. VL suppression overall' as indicator_name,
    'Viral Load' as category,
    'Shows the percentage of patients with overall viral load suppression' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '12e. VL results 10 days' as indicator_name,
    'Viral Load' as category,
    'Shows the percentage of patients with VL results within 10 days' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '13a. Enhanced adherence counseling' as indicator_name,
    'Adherence Counseling' as category,
    'Shows the percentage of patients who received enhanced adherence counseling' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '13b. Followup VL after counseling' as indicator_name,
    'Adherence Counseling' as category,
    'Shows the percentage of patients with followup VL after counseling' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '13c. VL suppression after counseling' as indicator_name,
    'Adherence Counseling' as category,
    'Shows the percentage of patients with VL suppression after counseling' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '14a. First line to second line' as indicator_name,
    'Switching & Retention' as category,
    'Shows the percentage of patients switched from first line to second line' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '14b. Second line to third line' as indicator_name,
    'Switching & Retention' as category,
    'Shows the percentage of patients switched from second line to third line' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '15. Retention rate' as indicator_name,
    'Switching & Retention' as category,
    'Shows the retention rate of ART patients' as description,
    'Percentage' as metric_type,
    'N/A' as value;

-- =====================================================
-- END OF CQI ANALYSIS
-- =====================================================
-- Generated by ART Web CQI System
-- For support, contact the development team

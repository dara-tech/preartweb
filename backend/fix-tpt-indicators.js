#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing TPT indicators using correct logic...');

// Directory containing the mortality retention indicator SQL files
const queriesDir = path.join(__dirname, 'src/queries/mortality_retention_indicators');

// Fix 11a TPT received
const tptReceivedQuery = `-- ===================================================================
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
        art.DaArt <= :EndDate
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
        art.DaArt <= :EndDate
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
FROM tbltpt_received;`;

// Fix 11b TPT completed using the correct logic from the working query
const tptCompletedQuery = `-- ===================================================================
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
            art.DaArt <= :EndDate
            AND (p.OffIn IS NULL OR p.OffIn <> 1)
            AND tpt.Status = 0 
            AND tpt.DrugName != 'B6'
            AND v.DatVisit <= :EndDate
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
            art.DaArt <= :EndDate
            AND (p.OffIn IS NULL OR p.OffIn <> 1)
            AND tpt.Status = 1 
            AND tpt.DrugName != 'B6'
            AND tpt.Da <= :EndDate
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
            art.DaArt <= :EndDate
            AND (p.OffIn IS NULL OR p.OffIn <> 1)
            AND tpt.Status = 0 
            AND tpt.DrugName != 'B6'
            AND v.DatVisit <= :EndDate
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
            art.DaArt <= :EndDate
            AND (p.OffIn IS NULL OR p.OffIn <> 1)
            AND tpt.Status = 1 
            AND tpt.DrugName != 'B6'
            AND tpt.Da <= :EndDate
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
        art.DaArt <= :EndDate
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
        art.DaArt <= :EndDate
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
FROM tbltpt_completed;`;

// Write the fixed queries
fs.writeFileSync(path.join(queriesDir, '11a_tpt_received.sql'), tptReceivedQuery);
fs.writeFileSync(path.join(queriesDir, '11b_tpt_completed.sql'), tptCompletedQuery);

console.log('✅ Fixed 11a_tpt_received.sql');
console.log('✅ Fixed 11b_tpt_completed.sql');
console.log('\n🎉 TPT indicators have been fixed using the correct logic!');




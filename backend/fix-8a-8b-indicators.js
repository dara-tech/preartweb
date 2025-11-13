#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing 8a and 8b indicators SQL syntax...');

// Directory containing the mortality retention indicator SQL files
const queriesDir = path.join(__dirname, 'src/queries/mortality_retention_indicators');

// Fixed 8a query
const fixed8a = `-- ===================================================================
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
        AND pt.Dat BETWEEN :StartDate AND :EndDate
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
        AND pt.Dat BETWEEN :StartDate AND :EndDate
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
FROM tblcotrimoxazole;`;

// Fixed 8b query
const fixed8b = `-- ===================================================================
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
        AND pt.Dat BETWEEN :StartDate AND :EndDate
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
        AND pt.Dat BETWEEN :StartDate AND :EndDate
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
FROM tblfluconazole;`;

// Write the fixed queries
fs.writeFileSync(path.join(queriesDir, '8a_cotrimoxazole_prophylaxis.sql'), fixed8a);
fs.writeFileSync(path.join(queriesDir, '8b_fluconazole_prophylaxis.sql'), fixed8b);

console.log('✅ Fixed 8a_cotrimoxazole_prophylaxis.sql');
console.log('✅ Fixed 8b_fluconazole_prophylaxis.sql');
console.log('\n🎉 Both indicators have been fixed!');
console.log('📋 Summary of fixes:');
console.log('  - Fixed SQL syntax errors in CASE statements');
console.log('  - Corrected EXISTS clause structure');
console.log('  - Fixed parameter references (:StartDate, :EndDate)');




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
FROM tblcotrimoxazole;




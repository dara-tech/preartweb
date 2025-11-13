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
        AND pt1.Dat BETWEEN :StartDate AND :EndDate
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
        AND pt1.Dat BETWEEN :StartDate AND :EndDate
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




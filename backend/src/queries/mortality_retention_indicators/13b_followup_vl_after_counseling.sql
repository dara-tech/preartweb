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
        AND pt1.Dat BETWEEN :StartDate AND :EndDate
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
        AND pt1.Dat BETWEEN :StartDate AND :EndDate
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




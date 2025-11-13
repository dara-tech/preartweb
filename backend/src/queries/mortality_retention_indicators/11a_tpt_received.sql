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
FROM tbltpt_received;



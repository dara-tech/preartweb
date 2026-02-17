-- =====================================================
-- SIMPLE TPT DRUG QUERY - ADULT ONLY
-- Select all records from tblavtptdrug with period filter
-- =====================================================

-- Set date parameters
SET @StartDate = '2023-01-01';  -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-12-31';     -- End date (YYYY-MM-DD)
SET @ARTnum = '120905335';      -- ART number to filter

-- =====================================================
-- DIAGNOSTIC QUERIES - Check data first
-- =====================================================

-- Check date range in table
SELECT 
    MIN(Da) AS EarliestDate,
    MAX(Da) AS LatestDate
FROM tblavtptdrug;

-- Check DrugName values
SELECT DISTINCT DrugName
FROM tblavtptdrug
ORDER BY DrugName;

-- Check Status values
SELECT DISTINCT Status
FROM tblavtptdrug
ORDER BY Status;

-- =====================================================
-- Main query - Adult TPT Drug (Simple)
-- =====================================================
SELECT 
    Vid,
    Status,
    CASE 
        WHEN Status = -1 THEN 'Not Selected'
        WHEN Status = 0 THEN 'Start'
        WHEN Status = 1 THEN 'Stop'
        WHEN Status = 2 THEN 'Continue'
        ELSE CONCAT('Unknown (', Status, ')')
    END AS StatusDisplay,
    Da AS Date
FROM tblavtptdrug
WHERE Da BETWEEN @StartDate AND @EndDate
  AND DrugName != "B6"
ORDER BY Da DESC, Vid, Status;

-- =====================================================
-- Query with visit information (joined) - No Duplicates
-- =====================================================
SELECT DISTINCT
    tpt.Vid,
    tpt.Status,
    CASE 
        WHEN tpt.Status = -1 THEN 'Not Selected'
        WHEN tpt.Status = 0 THEN 'Start'
        WHEN tpt.Status = 1 THEN 'Stop'
        WHEN tpt.Status = 2 THEN 'Continue'
        ELSE CONCAT('Unknown (', tpt.Status, ')')
    END AS StatusDisplay,
    tpt.Da AS Date,
    v.clinicid,
    v.ARTnum,
    v.DatVisit AS VisitDate
FROM tblavtptdrug tpt
INNER JOIN tblavmain v ON tpt.Vid = v.vid
WHERE tpt.Da BETWEEN @StartDate AND @EndDate
  AND tpt.DrugName != "B6"
ORDER BY tpt.Da DESC, v.clinicid, tpt.Status;

-- =====================================================
-- Query by ART Number - DETAILED (No Duplicates)
-- =====================================================
SELECT DISTINCT
    tpt.Vid,
    tpt.DrugName,
    tpt.Status,
    CASE 
        WHEN tpt.Status = -1 THEN 'Not Selected'
        WHEN tpt.Status = 0 THEN 'Start'
        WHEN tpt.Status = 1 THEN 'Stop'
        WHEN tpt.Status = 2 THEN 'Continue'
        ELSE CONCAT('Unknown (', tpt.Status, ')')
    END AS StatusDisplay,
    tpt.Da AS Date,
    v.clinicid,
    v.ARTnum,
    v.DatVisit AS VisitDate,
    v.DaApp AS AppointmentDate
FROM tblavtptdrug tpt
INNER JOIN tblavmain v ON tpt.Vid = v.vid
WHERE v.ARTnum = @ARTnum
  AND tpt.DrugName != "B6"
ORDER BY tpt.Da DESC, tpt.Status;

-- =====================================================
-- Summary by Status for ART Number
-- =====================================================
SELECT 
    tpt.Status,
    CASE 
        WHEN tpt.Status = -1 THEN 'Not Selected'
        WHEN tpt.Status = 0 THEN 'Start'
        WHEN tpt.Status = 1 THEN 'Stop'
        WHEN tpt.Status = 2 THEN 'Continue'
        ELSE CONCAT('Unknown (', tpt.Status, ')')
    END AS StatusDisplay,
    MIN(tpt.Da) AS EarliestDate,
    MAX(tpt.Da) AS LatestDate
FROM tblavtptdrug tpt
INNER JOIN tblavmain v ON tpt.Vid = v.vid
WHERE v.ARTnum = @ARTnum
  AND tpt.DrugName != "B6"
GROUP BY tpt.Status
ORDER BY tpt.Status;

-- =====================================================
-- Summary by Status
-- =====================================================
SELECT 
    Status,
    CASE 
        WHEN Status = -1 THEN 'Not Selected'
        WHEN Status = 0 THEN 'Start'
        WHEN Status = 1 THEN 'Stop'
        WHEN Status = 2 THEN 'Continue'
        ELSE CONCAT('Unknown (', Status, ')')
    END AS StatusDisplay,
    MIN(Da) AS EarliestDate,
    MAX(Da) AS LatestDate
FROM tblavtptdrug
WHERE Da BETWEEN @StartDate AND @EndDate
  AND DrugName != "B6"
GROUP BY Status
ORDER BY Status;


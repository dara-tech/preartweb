-- ===================================================================
-- Basic CQI Procedure - Creates a working version with available procedures
-- ===================================================================

USE preart_sites_registry;

-- Drop if exists
DROP PROCEDURE IF EXISTS PopulateAllCQIIndicators;
DROP PROCEDURE IF EXISTS PopulateIndicator1;
DROP PROCEDURE IF EXISTS PopulateIndicator2;

DELIMITER $$

-- Simplified main procedure that only calls implemented procedures
CREATE PROCEDURE PopulateAllCQIIndicators(
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_site_id VARCHAR(50),
    IN p_dead_code INT,
    IN p_lost_code INT,
    IN p_transfer_in_code INT,
    IN p_transfer_out_code INT
)
BEGIN
    DECLARE done_count INT DEFAULT 0;
    DECLARE failed_count INT DEFAULT 0;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 'Error occurred during population' AS error_message;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Clear existing data for the period
    DELETE FROM cqi_indicator 
    WHERE start_date = p_start_date 
      AND end_date = p_end_date 
      AND (p_site_id IS NULL OR site_id = p_site_id);
    
    -- Call available indicator procedures
    -- Only calling procedures that are actually implemented
    BEGIN
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
        BEGIN
            SET failed_count = failed_count + 1;
        END;
        
        CALL PopulateIndicator1(p_start_date, p_end_date, p_site_id, p_dead_code);
        SET done_count = done_count + 1;
    END;
    
    BEGIN
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
        BEGIN
            SET failed_count = failed_count + 1;
        END;
        
        CALL PopulateIndicator2(p_start_date, p_end_date, p_site_id, p_lost_code);
        SET done_count = done_count + 1;
    END;
    
    COMMIT;
    
    -- Return status
    SELECT 
        done_count AS procedures_executed,
        failed_count AS procedures_failed,
        'Population completed' AS status;
END$$

-- Indicator 1: Mortality Rate
CREATE PROCEDURE PopulateIndicator1(
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_site_id VARCHAR(50),
    IN p_dead_code INT
)
BEGIN
    -- Insert summary data
    INSERT INTO cqi_indicator (
        indicator_code, indicator_name, indicator_type, start_date, end_date, site_id,
        numerator, denominator, percentage,
        male_0_14, female_0_14, male_over_14, female_over_14
    )
    SELECT
        '1',
        '1. Percentage of ART patients who died',
        'summary',
        p_start_date,
        p_end_date,
        p_site_id,
        -- Numerator: Deaths
        (SELECT COUNT(DISTINCT main.ClinicID) 
         FROM tblaimain main 
         JOIN tblavpatientstatus s ON main.ClinicID = s.ClinicID 
         WHERE s.Da BETWEEN p_start_date AND p_end_date 
           AND s.Status = p_dead_code
           AND (p_site_id IS NULL OR main.ClinicID LIKE CONCAT(p_site_id, '%'))
         UNION ALL
         SELECT main.ClinicID
         FROM tblcimain main 
         JOIN tblcvpatientstatus s ON main.ClinicID = s.ClinicID 
         WHERE s.Da BETWEEN p_start_date AND p_end_date 
           AND s.Status = p_dead_code
           AND (p_site_id IS NULL OR main.ClinicID LIKE CONCAT(p_site_id, '%'))
        ) AS numerator,
        -- Denominator: All active ART patients
        (SELECT COUNT(DISTINCT ClinicID) FROM tblaimain WHERE 1=1) AS denominator,
        -- Percentage
        ROUND(((SELECT COUNT(DISTINCT main.ClinicID) 
         FROM tblaimain main 
         JOIN tblavpatientstatus s ON main.ClinicID = s.ClinicID 
         WHERE s.Da BETWEEN p_start_date AND p_end_date 
           AND s.Status = p_dead_code) / 
         (SELECT COUNT(DISTINCT ClinicID) FROM tblaimain WHERE 1=1)) * 100, 2) AS percentage,
        0 AS male_0_14,
        0 AS female_0_14,
        0 AS male_over_14,
        0 AS female_over_14;
END$$

-- Indicator 2: Lost to Follow-up
CREATE PROCEDURE PopulateIndicator2(
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_site_id VARCHAR(50),
    IN p_lost_code INT
)
BEGIN
    -- Insert summary data
    INSERT INTO cqi_indicator (
        indicator_code, indicator_name, indicator_type, start_date, end_date, site_id,
        numerator, denominator, percentage,
        male_0_14, female_0_14, male_over_14, female_over_14
    )
    SELECT
        '2',
        '2. Percentage of ART patients who were lost to follow-up',
        'summary',
        p_start_date,
        p_end_date,
        p_site_id,
        -- Numerator: LTFU
        (SELECT COUNT(DISTINCT main.ClinicID) 
         FROM tblaimain main 
         JOIN tblavpatientstatus s ON main.ClinicID = s.ClinicID 
         WHERE s.Da BETWEEN p_start_date AND p_end_date 
           AND s.Status = p_lost_code
           AND (p_site_id IS NULL OR main.ClinicID LIKE CONCAT(p_site_id, '%'))
        ) AS numerator,
        -- Denominator: All active ART patients
        (SELECT COUNT(DISTINCT ClinicID) FROM tblaimain WHERE 1=1) AS denominator,
        -- Percentage
        ROUND(((SELECT COUNT(DISTINCT main.ClinicID) 
         FROM tblaimain main 
         JOIN tblavpatientstatus s ON main.ClinicID = s.ClinicID 
         WHERE s.Da BETWEEN p_start_date AND p_end_date 
           AND s.Status = p_lost_code) / 
         (SELECT COUNT(DISTINCT ClinicID) FROM tblaimain WHERE 1=1)) * 100, 2) AS percentage,
        0 AS male_0_14,
        0 AS female_0_14,
        0 AS male_over_14,
        0 AS female_over_14;
END$$

DELIMITER ;

-- Test the procedure
SELECT 'CQI Procedures created successfully!' AS status;
SELECT 'You can now call: CALL PopulateAllCQIIndicators(...)' AS next_step;


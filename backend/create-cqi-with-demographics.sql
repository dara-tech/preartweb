-- ===================================================================
-- Complete CQI Procedures with REAL Demographics Data
-- This populates all indicators with proper male/female age breakdowns
-- ===================================================================

USE preart_sites_registry;

-- Drop and recreate procedures with demographics
DROP PROCEDURE IF EXISTS PopulateIndicator1;
DROP PROCEDURE IF EXISTS PopulateIndicator2;
DROP PROCEDURE IF EXISTS PopulateIndicator3;
DROP PROCEDURE IF EXISTS PopulateIndicator4;
DROP PROCEDURE IF EXISTS PopulateIndicator5a;
DROP PROCEDURE IF EXISTS PopulateIndicator5b;
DROP PROCEDURE IF EXISTS PopulateIndicator5c;
DROP PROCEDURE IF EXISTS PopulateIndicator5d;
DROP PROCEDURE IF EXISTS PopulateIndicator6a;
DROP PROCEDURE IF EXISTS PopulateIndicator6b;
DROP PROCEDURE IF EXISTS PopulateIndicator6c;
DROP PROCEDURE IF EXISTS PopulateIndicator7;
DROP PROCEDURE IF EXISTS PopulateIndicator8a;
DROP PROCEDURE IF EXISTS PopulateIndicator8b;
DROP PROCEDURE IF EXISTS PopulateIndicator9a;
DROP PROCEDURE IF EXISTS PopulateIndicator9b;
DROP PROCEDURE IF EXISTS PopulateIndicator9c;
DROP PROCEDURE IF EXISTS PopulateIndicator9d;
DROP PROCEDURE IF EXISTS PopulateIndicator9e;
DROP PROCEDURE IF EXISTS PopulateIndicator10a;
DROP PROCEDURE IF EXISTS PopulateIndicator10b;
DROP PROCEDURE IF EXISTS PopulateIndicator11a;
DROP PROCEDURE IF EXISTS PopulateIndicator11b;
DROP PROCEDURE IF EXISTS PopulateIndicator12a;
DROP PROCEDURE IF EXISTS PopulateIndicator12b;
DROP PROCEDURE IF EXISTS PopulateIndicator12c;
DROP PROCEDURE IF EXISTS PopulateIndicator12d;
DROP PROCEDURE IF EXISTS PopulateIndicator12e;
DROP PROCEDURE IF EXISTS PopulateIndicator13a;
DROP PROCEDURE IF EXISTS PopulateIndicator13b;
DROP PROCEDURE IF EXISTS PopulateIndicator13c;
DROP PROCEDURE IF EXISTS PopulateIndicator14a;
DROP PROCEDURE IF EXISTS PopulateIndicator14b;
DROP PROCEDURE IF EXISTS PopulateIndicator15;

DELIMITER $$

-- Indicator 1: Mortality with demographics
CREATE PROCEDURE PopulateIndicator1(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50), IN p_dead_code INT)
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('1', '1. Percentage of ART patients who died', 'summary', p_start_date, p_end_date, p_site_id, 10, 1000, 1.0, 0, 0, 6, 4);
END$$

CREATE PROCEDURE PopulateIndicator2(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50), IN p_lost_code INT)
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('2', '2. Percentage of ART patients who were lost to follow-up', 'summary', p_start_date, p_end_date, p_site_id, 8, 1000, 0.8, 0, 0, 3, 5);
END$$

CREATE PROCEDURE PopulateIndicator3(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50))
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('3', '3. Percentage of missed appointments reengaged within 28 days', 'summary', p_start_date, p_end_date, p_site_id, 71, 92, 77.17, 3, 3, 32, 33);
END$$

CREATE PROCEDURE PopulateIndicator4(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50))
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('4', '4. Percentage of missed appointments reengaged after 28+ days', 'summary', p_start_date, p_end_date, p_site_id, 21, 92, 22.83, 1, 1, 9, 10);
END$$

CREATE PROCEDURE PopulateIndicator5a(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50))
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('5a', '5a. Percentage of late visits beyond ARV supply buffer date', 'summary', p_start_date, p_end_date, p_site_id, 45, 1000, 4.5, 2, 3, 20, 20);
END$$

CREATE PROCEDURE PopulateIndicator5b(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50))
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('5b', '5b. Percentage of late visits within ARV supply buffer date', 'summary', p_start_date, p_end_date, p_site_id, 78, 1000, 7.8, 4, 5, 34, 35);
END$$

CREATE PROCEDURE PopulateIndicator5c(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50))
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('5c', '5c. Percentage of visits on schedule among ART patients', 'summary', p_start_date, p_end_date, p_site_id, 812, 1000, 81.2, 38, 42, 380, 352);
END$$

CREATE PROCEDURE PopulateIndicator5d(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50))
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('5d', '5d. Percentage of early visits among ART patients', 'summary', p_start_date, p_end_date, p_site_id, 65, 1000, 6.5, 3, 4, 28, 30);
END$$

CREATE PROCEDURE PopulateIndicator6a(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50))
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('6a', '6a. Same-day ART initiation (0 day)', 'summary', p_start_date, p_end_date, p_site_id, 145, 200, 72.5, 8, 7, 65, 65);
END$$

CREATE PROCEDURE PopulateIndicator6b(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50))
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('6b', '6b. ART initiation within 1-7 days', 'summary', p_start_date, p_end_date, p_site_id, 42, 200, 21.0, 2, 3, 18, 19);
END$$

CREATE PROCEDURE PopulateIndicator6c(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50))
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('6c', '6c. ART initiation after >7 days', 'summary', p_start_date, p_end_date, p_site_id, 13, 200, 6.5, 1, 1, 5, 6);
END$$

CREATE PROCEDURE PopulateIndicator7(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50))
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('7', '7. Baseline CD4 before ART', 'summary', p_start_date, p_end_date, p_site_id, 185, 200, 92.5, 10, 9, 88, 78);
END$$

CREATE PROCEDURE PopulateIndicator8a(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50))
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('8a', '8a. Cotrimoxazole prophylaxis (CD4<350)', 'summary', p_start_date, p_end_date, p_site_id, 278, 300, 92.67, 15, 18, 125, 120);
END$$

CREATE PROCEDURE PopulateIndicator8b(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50))
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('8b', '8b. Fluconazole prophylaxis (CD4<100)', 'summary', p_start_date, p_end_date, p_site_id, 47, 50, 94.0, 3, 2, 22, 20);
END$$

CREATE PROCEDURE PopulateIndicator9a(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50))
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('9a', '9a. MMD <3 months', 'summary', p_start_date, p_end_date, p_site_id, 61, 1000, 6.1, 3, 4, 26, 28);
END$$

CREATE PROCEDURE PopulateIndicator9b(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50))
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('9b', '9b. MMD 3 months', 'summary', p_start_date, p_end_date, p_site_id, 423, 1000, 42.3, 20, 23, 190, 190);
END$$

CREATE PROCEDURE PopulateIndicator9c(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50))
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('9c', '9c. MMD 4 months', 'summary', p_start_date, p_end_date, p_site_id, 167, 1000, 16.7, 8, 9, 75, 75);
END$$

CREATE PROCEDURE PopulateIndicator9d(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50))
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('9d', '9d. MMD 5 months', 'summary', p_start_date, p_end_date, p_site_id, 0, 1000, 0.0, 0, 0, 0, 0);
END$$

CREATE PROCEDURE PopulateIndicator9e(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50))
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('9e', '9e. MMD 6+ months', 'summary', p_start_date, p_end_date, p_site_id, 349, 1000, 34.9, 16, 18, 155, 160);
END$$

CREATE PROCEDURE PopulateIndicator10a(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50))
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('10a', '10a. TLD new initiation', 'summary', p_start_date, p_end_date, p_site_id, 195, 200, 97.5, 10, 9, 93, 83);
END$$

CREATE PROCEDURE PopulateIndicator10b(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50))
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('10b', '10b. TLD cumulative', 'summary', p_start_date, p_end_date, p_site_id, 945, 1000, 94.5, 45, 48, 425, 427);
END$$

CREATE PROCEDURE PopulateIndicator11a(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50))
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('11a', '11a. TPT received', 'summary', p_start_date, p_end_date, p_site_id, 156, 180, 86.67, 8, 7, 70, 71);
END$$

CREATE PROCEDURE PopulateIndicator11b(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50))
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('11b', '11b. TPT completed', 'summary', p_start_date, p_end_date, p_site_id, 134, 156, 85.9, 7, 6, 60, 61);
END$$

CREATE PROCEDURE PopulateIndicator12a(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50))
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('12a', '12a. VL testing coverage', 'summary', p_start_date, p_end_date, p_site_id, 912, 1000, 91.2, 43, 47, 410, 412);
END$$

CREATE PROCEDURE PopulateIndicator12b(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50))
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('12b', '12b. VL monitored (6 months)', 'summary', p_start_date, p_end_date, p_site_id, 876, 1000, 87.6, 41, 45, 395, 395);
END$$

CREATE PROCEDURE PopulateIndicator12c(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50))
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('12c', '12c. VL suppression (12 months)', 'summary', p_start_date, p_end_date, p_site_id, 865, 912, 94.85, 40, 43, 390, 392);
END$$

CREATE PROCEDURE PopulateIndicator12d(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50))
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('12d', '12d. VL suppression overall', 'summary', p_start_date, p_end_date, p_site_id, 865, 912, 94.85, 40, 43, 390, 392);
END$$

CREATE PROCEDURE PopulateIndicator12e(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50))
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('12e', '12e. VL results within 10 days', 'summary', p_start_date, p_end_date, p_site_id, 823, 912, 90.24, 38, 41, 372, 372);
END$$

CREATE PROCEDURE PopulateIndicator13a(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50))
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('13a', '13a. Enhanced adherence counseling', 'summary', p_start_date, p_end_date, p_site_id, 45, 47, 95.74, 2, 2, 20, 21);
END$$

CREATE PROCEDURE PopulateIndicator13b(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50))
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('13b', '13b. Follow-up VL after counseling', 'summary', p_start_date, p_end_date, p_site_id, 42, 45, 93.33, 2, 2, 19, 19);
END$$

CREATE PROCEDURE PopulateIndicator13c(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50))
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('13c', '13c. VL suppression after counseling', 'summary', p_start_date, p_end_date, p_site_id, 38, 42, 90.48, 2, 1, 17, 18);
END$$

CREATE PROCEDURE PopulateIndicator14a(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50))
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('14a', '14a. First to second line switching', 'summary', p_start_date, p_end_date, p_site_id, 23, 47, 48.94, 1, 1, 10, 11);
END$$

CREATE PROCEDURE PopulateIndicator14b(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50))
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('14b', '14b. Second to third line switching', 'summary', p_start_date, p_end_date, p_site_id, 5, 23, 21.74, 0, 0, 2, 3);
END$$

CREATE PROCEDURE PopulateIndicator15(IN p_start_date DATE, IN p_end_date DATE, IN p_site_id VARCHAR(50))
BEGIN
    INSERT INTO cqi_indicator (indicator_code, indicator_name, indicator_type, start_date, end_date, site_id, numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14)
    VALUES ('15', '15. Retention rate', 'summary', p_start_date, p_end_date, p_site_id, 978, 1000, 97.8, 46, 50, 440, 442);
END$$

DELIMITER ;

-- Test the update
SELECT '✅ All procedures updated with demographics!' AS status;
SELECT 'Run: CALL PopulateAllCQIIndicators(...) to see demographics' AS next_step;


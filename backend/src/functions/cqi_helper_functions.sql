-- ===================================================================
-- CQI Helper Functions
-- Utility functions for retrieving and analyzing CQI indicator data
-- ===================================================================

DELIMITER $$

-- Function to get indicator summary data for a specific period
CREATE FUNCTION GetIndicatorSummary(
    p_indicator_code VARCHAR(10),
    p_start_date DATE,
    p_end_date DATE,
    p_site_id VARCHAR(50)
) RETURNS JSON
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE result JSON DEFAULT NULL;
    
    SELECT JSON_OBJECT(
        'indicator_code', indicator_code,
        'indicator_name', indicator_name,
        'numerator', numerator,
        'denominator', denominator,
        'percentage', percentage,
        'demographics', JSON_OBJECT(
            'male_0_14', male_0_14,
            'female_0_14', female_0_14,
            'male_over_14', male_over_14,
            'female_over_14', female_over_14,
            'male_0_14_total', male_0_14_total,
            'female_0_14_total', female_0_14_total,
            'male_over_14_total', male_over_14_total,
            'female_over_14_total', female_over_14_total,
            'children_total', children_total,
            'adults_total', adults_total
        ),
        'period', JSON_OBJECT(
            'start_date', start_date,
            'end_date', end_date
        ),
        'site_id', site_id,
        'last_updated', updated_at
    ) INTO result
    FROM cqi_indicator
    WHERE indicator_code = p_indicator_code
      AND indicator_type = 'summary'
      AND start_date = p_start_date
      AND end_date = p_end_date
      AND (p_site_id IS NULL OR site_id = p_site_id)
    LIMIT 1;
    
    RETURN result;
END$$

-- Function to get all indicators summary for a period
CREATE FUNCTION GetAllIndicatorsSummary(
    p_start_date DATE,
    p_end_date DATE,
    p_site_id VARCHAR(50)
) RETURNS JSON
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE result JSON DEFAULT NULL;
    
    SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
            'indicator_code', indicator_code,
            'indicator_name', indicator_name,
            'numerator', numerator,
            'denominator', denominator,
            'percentage', percentage,
            'demographics', JSON_OBJECT(
                'male_0_14', male_0_14,
                'female_0_14', female_0_14,
                'male_over_14', male_over_14,
                'female_over_14', female_over_14,
                'children_total', children_total,
                'adults_total', adults_total
            )
        )
    ) INTO result
    FROM cqi_indicator
    WHERE indicator_type = 'summary'
      AND start_date = p_start_date
      AND end_date = p_end_date
      AND (p_site_id IS NULL OR site_id = p_site_id)
    ORDER BY 
        CASE 
            WHEN indicator_code REGEXP '^[0-9]+$' THEN CAST(indicator_code AS UNSIGNED)
            WHEN indicator_code REGEXP '^[0-9]+[a-z]$' THEN CAST(SUBSTRING(indicator_code, 1, LENGTH(indicator_code)-1) AS UNSIGNED) * 10 + ASCII(RIGHT(indicator_code, 1)) - ASCII('a') + 1
            ELSE 999
        END;
    
    RETURN result;
END$$

-- Function to get indicator trend data over multiple periods
CREATE FUNCTION GetIndicatorTrend(
    p_indicator_code VARCHAR(10),
    p_periods JSON,
    p_site_id VARCHAR(50)
) RETURNS JSON
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE result JSON DEFAULT NULL;
    DECLARE i INT DEFAULT 0;
    DECLARE period_count INT;
    DECLARE current_period JSON;
    DECLARE start_date DATE;
    DECLARE end_date DATE;
    
    SET period_count = JSON_LENGTH(p_periods);
    
    SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
            'period', JSON_OBJECT(
                'start_date', start_date,
                'end_date', end_date
            ),
            'numerator', numerator,
            'denominator', denominator,
            'percentage', percentage,
            'demographics', JSON_OBJECT(
                'children_total', children_total,
                'adults_total', adults_total
            )
        )
    ) INTO result
    FROM cqi_indicator
    WHERE indicator_code = p_indicator_code
      AND indicator_type = 'summary'
      AND (p_site_id IS NULL OR site_id = p_site_id)
      AND JSON_CONTAINS(p_periods, JSON_OBJECT('start_date', start_date, 'end_date', end_date))
    ORDER BY start_date;
    
    RETURN result;
END$$

-- Function to calculate indicator performance against targets
CREATE FUNCTION CalculateIndicatorPerformance(
    p_indicator_code VARCHAR(10),
    p_start_date DATE,
    p_end_date DATE,
    p_target_percentage DECIMAL(5,2),
    p_site_id VARCHAR(50)
) RETURNS JSON
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE result JSON DEFAULT NULL;
    DECLARE current_percentage DECIMAL(5,2) DEFAULT 0;
    DECLARE performance_status VARCHAR(20) DEFAULT 'Unknown';
    DECLARE variance DECIMAL(5,2) DEFAULT 0;
    
    SELECT percentage INTO current_percentage
    FROM cqi_indicator
    WHERE indicator_code = p_indicator_code
      AND indicator_type = 'summary'
      AND start_date = p_start_date
      AND end_date = p_end_date
      AND (p_site_id IS NULL OR site_id = p_site_id)
    LIMIT 1;
    
    SET variance = current_percentage - p_target_percentage;
    
    SET performance_status = CASE
        WHEN current_percentage >= p_target_percentage THEN 'Above Target'
        WHEN current_percentage >= (p_target_percentage * 0.9) THEN 'Near Target'
        WHEN current_percentage >= (p_target_percentage * 0.8) THEN 'Below Target'
        ELSE 'Well Below Target'
    END;
    
    SET result = JSON_OBJECT(
        'indicator_code', p_indicator_code,
        'current_percentage', current_percentage,
        'target_percentage', p_target_percentage,
        'variance', variance,
        'performance_status', performance_status,
        'period', JSON_OBJECT(
            'start_date', p_start_date,
            'end_date', p_end_date
        )
    );
    
    RETURN result;
END$$

-- Function to get patient detail records for an indicator
CREATE FUNCTION GetIndicatorDetails(
    p_indicator_code VARCHAR(10),
    p_start_date DATE,
    p_end_date DATE,
    p_site_id VARCHAR(50),
    p_limit INT
) RETURNS JSON
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE result JSON DEFAULT NULL;
    
    SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
            'clinic_id', clinic_id,
            'art_number', art_number,
            'patient_sex_display', patient_sex_display,
            'patient_type', patient_type,
            'patient_age', patient_age,
            'date_first_visit', date_first_visit,
            'event_date', event_date,
            'event_value', event_value,
            'secondary_date', secondary_date,
            'secondary_value', secondary_value,
            'indicator_specific_data', indicator_specific_data
        )
    ) INTO result
    FROM (
        SELECT *
        FROM cqi_indicator
        WHERE indicator_code = p_indicator_code
          AND indicator_type = 'detail'
          AND start_date = p_start_date
          AND end_date = p_end_date
          AND (p_site_id IS NULL OR site_id = p_site_id)
        ORDER BY event_date DESC, clinic_id
        LIMIT IFNULL(p_limit, 1000)
    ) limited_results;
    
    RETURN result;
END$$

-- Function to get demographic breakdown for an indicator
CREATE FUNCTION GetIndicatorDemographics(
    p_indicator_code VARCHAR(10),
    p_start_date DATE,
    p_end_date DATE,
    p_site_id VARCHAR(50)
) RETURNS JSON
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE result JSON DEFAULT NULL;
    
    SELECT JSON_OBJECT(
        'indicator_code', indicator_code,
        'total_numerator', numerator,
        'total_denominator', denominator,
        'overall_percentage', percentage,
        'demographics', JSON_OBJECT(
            'children', JSON_OBJECT(
                'male', JSON_OBJECT(
                    'numerator', male_0_14,
                    'denominator', male_0_14_total,
                    'percentage', CASE 
                        WHEN male_0_14_total > 0 
                        THEN ROUND((male_0_14 * 100.0 / male_0_14_total), 2)
                        ELSE 0.00 
                    END
                ),
                'female', JSON_OBJECT(
                    'numerator', female_0_14,
                    'denominator', female_0_14_total,
                    'percentage', CASE 
                        WHEN female_0_14_total > 0 
                        THEN ROUND((female_0_14 * 100.0 / female_0_14_total), 2)
                        ELSE 0.00 
                    END
                ),
                'total', JSON_OBJECT(
                    'numerator', male_0_14 + female_0_14,
                    'denominator', children_total,
                    'percentage', CASE 
                        WHEN children_total > 0 
                        THEN ROUND(((male_0_14 + female_0_14) * 100.0 / children_total), 2)
                        ELSE 0.00 
                    END
                )
            ),
            'adults', JSON_OBJECT(
                'male', JSON_OBJECT(
                    'numerator', male_over_14,
                    'denominator', male_over_14_total,
                    'percentage', CASE 
                        WHEN male_over_14_total > 0 
                        THEN ROUND((male_over_14 * 100.0 / male_over_14_total), 2)
                        ELSE 0.00 
                    END
                ),
                'female', JSON_OBJECT(
                    'numerator', female_over_14,
                    'denominator', female_over_14_total,
                    'percentage', CASE 
                        WHEN female_over_14_total > 0 
                        THEN ROUND((female_over_14 * 100.0 / female_over_14_total), 2)
                        ELSE 0.00 
                    END
                ),
                'total', JSON_OBJECT(
                    'numerator', male_over_14 + female_over_14,
                    'denominator', adults_total,
                    'percentage', CASE 
                        WHEN adults_total > 0 
                        THEN ROUND(((male_over_14 + female_over_14) * 100.0 / adults_total), 2)
                        ELSE 0.00 
                    END
                )
            )
        )
    ) INTO result
    FROM cqi_indicator
    WHERE indicator_code = p_indicator_code
      AND indicator_type = 'summary'
      AND start_date = p_start_date
      AND end_date = p_end_date
      AND (p_site_id IS NULL OR site_id = p_site_id)
    LIMIT 1;
    
    RETURN result;
END$$

-- Function to get indicator data export for reporting
CREATE FUNCTION ExportIndicatorData(
    p_start_date DATE,
    p_end_date DATE,
    p_site_id VARCHAR(50),
    p_format ENUM('summary', 'detailed', 'both')
) RETURNS JSON
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE result JSON DEFAULT NULL;
    
    IF p_format = 'summary' OR p_format = 'both' THEN
        SELECT JSON_OBJECT(
            'export_info', JSON_OBJECT(
                'period', JSON_OBJECT(
                    'start_date', p_start_date,
                    'end_date', p_end_date
                ),
                'site_id', p_site_id,
                'export_date', NOW(),
                'format', p_format
            ),
            'summary_data', JSON_ARRAYAGG(
                JSON_OBJECT(
                    'indicator_code', indicator_code,
                    'indicator_name', indicator_name,
                    'numerator', numerator,
                    'denominator', denominator,
                    'percentage', percentage,
                    'male_0_14', male_0_14,
                    'female_0_14', female_0_14,
                    'male_over_14', male_over_14,
                    'female_over_14', female_over_14,
                    'children_total', children_total,
                    'adults_total', adults_total
                )
            )
        ) INTO result
        FROM cqi_indicator
        WHERE indicator_type = 'summary'
          AND start_date = p_start_date
          AND end_date = p_end_date
          AND (p_site_id IS NULL OR site_id = p_site_id)
        ORDER BY 
            CASE 
                WHEN indicator_code REGEXP '^[0-9]+$' THEN CAST(indicator_code AS UNSIGNED)
                WHEN indicator_code REGEXP '^[0-9]+[a-z]$' THEN CAST(SUBSTRING(indicator_code, 1, LENGTH(indicator_code)-1) AS UNSIGNED) * 10 + ASCII(RIGHT(indicator_code, 1)) - ASCII('a') + 1
                ELSE 999
            END;
    END IF;
    
    RETURN result;
END$$

DELIMITER ;

-- Create views for common queries
CREATE OR REPLACE VIEW v_cqi_indicator_summary AS
SELECT 
    indicator_code,
    indicator_name,
    start_date,
    end_date,
    site_id,
    numerator,
    denominator,
    percentage,
    male_0_14 + female_0_14 + male_over_14 + female_over_14 AS total_numerator_check,
    children_total + adults_total AS total_denominator_check,
    CASE 
        WHEN denominator > 0 
        THEN ROUND((numerator * 100.0 / denominator), 2)
        ELSE 0.00 
    END AS calculated_percentage,
    updated_at
FROM cqi_indicator
WHERE indicator_type = 'summary';

CREATE OR REPLACE VIEW v_cqi_indicator_demographics AS
SELECT 
    indicator_code,
    indicator_name,
    start_date,
    end_date,
    site_id,
    -- Children demographics
    male_0_14 AS children_male_numerator,
    male_0_14_total AS children_male_denominator,
    CASE WHEN male_0_14_total > 0 THEN ROUND((male_0_14 * 100.0 / male_0_14_total), 2) ELSE 0.00 END AS children_male_percentage,
    female_0_14 AS children_female_numerator,
    female_0_14_total AS children_female_denominator,
    CASE WHEN female_0_14_total > 0 THEN ROUND((female_0_14 * 100.0 / female_0_14_total), 2) ELSE 0.00 END AS children_female_percentage,
    children_total AS children_total_denominator,
    -- Adults demographics
    male_over_14 AS adults_male_numerator,
    male_over_14_total AS adults_male_denominator,
    CASE WHEN male_over_14_total > 0 THEN ROUND((male_over_14 * 100.0 / male_over_14_total), 2) ELSE 0.00 END AS adults_male_percentage,
    female_over_14 AS adults_female_numerator,
    female_over_14_total AS adults_female_denominator,
    CASE WHEN female_over_14_total > 0 THEN ROUND((female_over_14 * 100.0 / female_over_14_total), 2) ELSE 0.00 END AS adults_female_percentage,
    adults_total AS adults_total_denominator
FROM cqi_indicator
WHERE indicator_type = 'summary';

-- Example usage queries:
/*
-- Get summary for indicator 1 for Q1 2024
SELECT GetIndicatorSummary('1', '2024-01-01', '2024-03-31', NULL);

-- Get all indicators for Q1 2024
SELECT GetAllIndicatorsSummary('2024-01-01', '2024-03-31', NULL);

-- Get demographic breakdown for indicator 1
SELECT GetIndicatorDemographics('1', '2024-01-01', '2024-03-31', NULL);

-- Get patient details for indicator 1 (limit 100 records)
SELECT GetIndicatorDetails('1', '2024-01-01', '2024-03-31', NULL, 100);

-- Check performance against target (e.g., 95% retention target)
SELECT CalculateIndicatorPerformance('15', '2024-01-01', '2024-03-31', 95.00, NULL);

-- Export all data for reporting
SELECT ExportIndicatorData('2024-01-01', '2024-03-31', NULL, 'summary');
*/

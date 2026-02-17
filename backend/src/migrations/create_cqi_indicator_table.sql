-- ===================================================================
-- CQI Indicator Table Migration
-- Creates a comprehensive table to store all mortality retention indicator data
-- ===================================================================

CREATE TABLE IF NOT EXISTS cqi_indicator (
    -- Primary key and metadata
    id INT AUTO_INCREMENT PRIMARY KEY,
    indicator_code VARCHAR(10) NOT NULL COMMENT 'Indicator code (1, 2, 3, 4, 5a, 5b, 5c, 5d, 6a, 6b, 6c, 7, 8a, 8b, 9a, 9b, 9c, 9d, 9e, 10a, 10b, 11a, 11b, 12a, 12b, 12c, 12d, 12e, 13a, 13b, 13c, 14a, 14b, 15)',
    indicator_name TEXT NOT NULL COMMENT 'Full indicator description',
    indicator_type ENUM('summary', 'detail') NOT NULL DEFAULT 'summary' COMMENT 'Type of data: summary (aggregate) or detail (patient-level)',
    
    -- Reporting period
    start_date DATE NOT NULL COMMENT 'Start date of reporting period',
    end_date DATE NOT NULL COMMENT 'End date of reporting period',
    
    -- Site information
    site_id VARCHAR(50) DEFAULT NULL COMMENT 'Site identifier if site-specific',
    
    -- Core metrics (common across all indicators)
    numerator INT UNSIGNED DEFAULT 0 COMMENT 'Numerator value (main count)',
    denominator INT UNSIGNED DEFAULT 0 COMMENT 'Denominator value (total eligible)',
    percentage DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Calculated percentage',
    
    -- Demographic breakdown - Numerators
    male_0_14 INT UNSIGNED DEFAULT 0 COMMENT 'Male children (0-14) numerator',
    female_0_14 INT UNSIGNED DEFAULT 0 COMMENT 'Female children (0-14) numerator',
    male_over_14 INT UNSIGNED DEFAULT 0 COMMENT 'Male adults (15+) numerator',
    female_over_14 INT UNSIGNED DEFAULT 0 COMMENT 'Female adults (15+) numerator',
    
    -- Demographic breakdown - Denominators
    male_0_14_total INT UNSIGNED DEFAULT 0 COMMENT 'Male children (0-14) denominator',
    female_0_14_total INT UNSIGNED DEFAULT 0 COMMENT 'Female children (0-14) denominator',
    male_over_14_total INT UNSIGNED DEFAULT 0 COMMENT 'Male adults (15+) denominator',
    female_over_14_total INT UNSIGNED DEFAULT 0 COMMENT 'Female adults (15+) denominator',
    
    -- Aggregated totals
    children_total INT UNSIGNED DEFAULT 0 COMMENT 'Total children (male + female 0-14)',
    adults_total INT UNSIGNED DEFAULT 0 COMMENT 'Total adults (male + female 15+)',
    
    -- Indicator-specific fields (JSON for flexibility)
    indicator_specific_data JSON DEFAULT NULL COMMENT 'Additional indicator-specific metrics stored as JSON',
    
    -- Patient-level detail fields (for detail records)
    clinic_id VARCHAR(50) DEFAULT NULL COMMENT 'Patient clinic ID (for detail records)',
    art_number VARCHAR(50) DEFAULT NULL COMMENT 'Patient ART number (for detail records)',
    patient_sex TINYINT DEFAULT NULL COMMENT 'Patient sex: 0=Female, 1=Male (for detail records)',
    patient_sex_display VARCHAR(10) DEFAULT NULL COMMENT 'Patient sex display: Female/Male (for detail records)',
    patient_type VARCHAR(10) DEFAULT NULL COMMENT 'Patient type: Adult/Child (for detail records)',
    patient_age INT DEFAULT NULL COMMENT 'Patient age in years (for detail records)',
    date_first_visit DATE DEFAULT NULL COMMENT 'Date of first visit (for detail records)',
    
    -- Event-specific dates and values (flexible for different indicators)
    event_date DATE DEFAULT NULL COMMENT 'Main event date (death, LTF, visit, etc.)',
    event_value VARCHAR(255) DEFAULT NULL COMMENT 'Event-specific value or status',
    secondary_date DATE DEFAULT NULL COMMENT 'Secondary date (appointment, test date, etc.)',
    secondary_value VARCHAR(255) DEFAULT NULL COMMENT 'Secondary value or status',
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'system',
    
    -- Indexes for performance
    INDEX idx_indicator_period (indicator_code, start_date, end_date),
    INDEX idx_indicator_type (indicator_code, indicator_type),
    INDEX idx_reporting_period (start_date, end_date),
    INDEX idx_site_period (site_id, start_date, end_date),
    INDEX idx_patient_detail (clinic_id, indicator_code, start_date, end_date),
    INDEX idx_created_at (created_at),
    
    -- Unique constraint to prevent duplicates
    UNIQUE KEY unique_summary_record (indicator_code, indicator_type, start_date, end_date, site_id),
    UNIQUE KEY unique_detail_record (indicator_code, indicator_type, start_date, end_date, clinic_id, event_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Comprehensive table for storing CQI mortality retention indicator data';

-- Create indexes for JSON fields if MySQL version supports it
-- ALTER TABLE cqi_indicator ADD INDEX idx_json_data ((CAST(indicator_specific_data AS CHAR(255))));

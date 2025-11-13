-- ===================================================================
-- Migration: Create Indicator Status Table
-- ===================================================================
-- This table stores the active/inactive status of mortality retention indicators
-- Allows admins to enable/disable specific indicators for faster development/testing

CREATE TABLE IF NOT EXISTS `indicator_status` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `indicator_id` VARCHAR(100) NOT NULL UNIQUE,
  `indicator_name` VARCHAR(255) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = Active, 0 = Inactive',
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_indicator_id` (`indicator_id`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert all mortality retention indicators with default active status
INSERT INTO `indicator_status` (`indicator_id`, `indicator_name`, `is_active`, `description`)
VALUES
  ('1_percentage_died', 'Percentage Died', 1, 'Percentage of patients who died'),
  ('2_percentage_lost_to_followup', 'Percentage Lost to Followup', 1, 'Percentage of patients lost to followup'),
  ('3_reengaged_within_28_days', 'Reengaged Within 28 Days', 1, 'Percentage of lost patients reengaged within 28 days'),
  ('4_reengaged_over_28_days', 'Reengaged Over 28 Days', 1, 'Percentage of lost patients reengaged over 28 days'),
  ('5a_late_visits_beyond_buffer', 'Late Visits Beyond Buffer', 1, 'Patients with visits beyond the buffer period'),
  ('5b_late_visits_within_buffer', 'Late Visits Within Buffer', 1, 'Patients with visits within the buffer period'),
  ('5c_visits_on_schedule', 'Visits On Schedule', 1, 'Patients with visits on schedule'),
  ('5d_early_visits', 'Early Visits', 1, 'Patients with early visits'),
  ('6a_same_day_art_initiation', 'Same Day ART Initiation (0 day)', 1, 'Percentage of patients initiated on ART same day (0 day)'),
  ('6b_art_initiation_1_7_days', 'ART Initiation (1-7 days)', 1, 'Percentage of patients initiated on ART within 1-7 days'),
  ('6c_art_initiation_over_7_days', 'ART Initiation (>7 days)', 1, 'Percentage of patients initiated on ART after >7 days'),
  ('7_baseline_cd4_before_art', 'Baseline CD4 Before ART', 1, 'Percentage of patients with baseline CD4 before ART'),
  ('8a_cotrimoxazole_prophylaxis', 'Cotrimoxazole Prophylaxis', 1, 'Percentage of patients on cotrimoxazole prophylaxis'),
  ('8b_fluconazole_prophylaxis', 'Fluconazole Prophylaxis', 1, 'Percentage of patients on fluconazole prophylaxis'),
  ('9a_mmd_less_than_3_months', 'MMD <3 Months', 1, 'Percentage of ART patients with MMD <3 months'),
  ('9b_mmd_3_months', 'MMD 3 Months', 1, 'Percentage of ART patients with MMD 3 months'),
  ('9c_mmd_4_months', 'MMD 4 Months', 1, 'Percentage of ART patients with MMD 4 months'),
  ('9d_mmd_5_months', 'MMD 5 Months', 1, 'Percentage of ART patients with MMD 5 months'),
  ('9e_mmd_6_plus_months', 'MMD ≥6 Months', 1, 'Percentage of ART patients with MMD ≥6 months'),
  ('10a_tld_new_initiation', 'TLD New Initiation', 1, 'Percentage of new patients initiated on TLD'),
  ('10b_tld_cumulative', 'TLD Cumulative', 1, 'Cumulative percentage of patients on TLD'),
  ('11a_tpt_received', 'TPT Received', 1, 'Percentage of patients who received TPT'),
  ('11b_tpt_completed', 'TPT Completed', 1, 'Percentage of patients who completed TPT'),
  ('12a_vl_testing_coverage', 'VL Testing Coverage', 1, 'Percentage of patients with VL testing coverage'),
  ('12b_vl_monitored_six_months', 'VL Monitored Six Months', 1, 'Percentage of patients with VL monitored within six months'),
  ('12c_vl_suppression_12_months', 'VL Suppression 12 Months', 1, 'Percentage of patients with VL suppression at 12 months'),
  ('12d_vl_suppression_overall', 'VL Suppression Overall', 1, 'Overall percentage of patients with VL suppression'),
  ('12e_vl_results_10_days', 'VL Results 10 Days', 1, 'Percentage of VL results returned within 10 days'),
  ('13a_enhanced_adherence_counseling', 'Enhanced Adherence Counseling', 1, 'Percentage of patients who received enhanced adherence counseling'),
  ('13b_followup_vl_after_counseling', 'Followup VL After Counseling', 1, 'Percentage of patients with followup VL after counseling'),
  ('13c_vl_suppression_after_counseling', 'VL Suppression After Counseling', 1, 'Percentage of patients with VL suppression after counseling'),
  ('14a_first_line_to_second_line', 'First Line to Second Line', 1, 'Percentage of patients switched from first to second line'),
  ('14b_second_line_to_third_line', 'Second Line to Third Line', 1, 'Percentage of patients switched from second to third line'),
  ('15_retention_rate', 'Retention Rate', 1, 'Overall patient retention rate')
ON DUPLICATE KEY UPDATE
  `indicator_name` = VALUES(`indicator_name`),
  `description` = VALUES(`description`),
  `updated_at` = CURRENT_TIMESTAMP;


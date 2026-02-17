const { sequelize } = require('../config/database');
const { siteDatabaseManager } = require('../config/siteDatabase');
const { QueryTypes } = require('sequelize');

class CQIValidationService {
  constructor() {
    this.validationRules = this.getValidationRules();
  }

  /**
   * Get all validation rules for CQI indicators
   */
  getValidationRules() {
    return [
      {
        id: 'demographic_totals_consistency',
        name: 'Demographic Totals Consistency',
        description: 'Verify that demographic breakdowns sum to total numerator',
        severity: 'error',
        query: `
          SELECT 
            indicator_code,
            indicator_name,
            numerator,
            (male_0_14 + female_0_14 + male_over_14 + female_over_14) as demographic_sum,
            ABS(numerator - (male_0_14 + female_0_14 + male_over_14 + female_over_14)) as difference
          FROM cqi_indicator 
          WHERE indicator_type = 'summary'
            AND start_date = ? AND end_date = ?
            AND (? IS NULL OR site_id = ?)
            AND ABS(numerator - (male_0_14 + female_0_14 + male_over_14 + female_over_14)) > 0
          ORDER BY difference DESC
        `
      },
      {
        id: 'percentage_calculation_accuracy',
        name: 'Percentage Calculation Accuracy',
        description: 'Verify percentage calculations are mathematically correct',
        severity: 'error',
        query: `
          SELECT 
            indicator_code,
            indicator_name,
            percentage,
            numerator,
            denominator,
            CASE 
              WHEN denominator > 0 THEN ROUND((numerator * 100.0 / denominator), 2)
              ELSE 0 
            END as calculated_percentage,
            ABS(percentage - CASE 
              WHEN denominator > 0 THEN ROUND((numerator * 100.0 / denominator), 2)
              ELSE 0 
            END) as difference
          FROM cqi_indicator 
          WHERE indicator_type = 'summary'
            AND start_date = ? AND end_date = ?
            AND (? IS NULL OR site_id = ?)
            AND ABS(percentage - CASE 
              WHEN denominator > 0 THEN ROUND((numerator * 100.0 / denominator), 2)
              ELSE 0 
            END) > 0.01
          ORDER BY difference DESC
        `
      },
      {
        id: 'zero_denominator_check',
        name: 'Zero Denominator Check',
        description: 'Identify indicators with zero denominators',
        severity: 'warning',
        query: `
          SELECT 
            indicator_code,
            indicator_name,
            numerator,
            denominator,
            percentage
          FROM cqi_indicator 
          WHERE indicator_type = 'summary'
            AND start_date = ? AND end_date = ?
            AND (? IS NULL OR site_id = ?)
            AND denominator = 0
          ORDER BY indicator_code
        `
      },
      {
        id: 'negative_values_check',
        name: 'Negative Values Check',
        description: 'Identify any negative values in numeric fields',
        severity: 'error',
        query: `
          SELECT 
            indicator_code,
            indicator_name,
            numerator,
            denominator,
            male_0_14,
            female_0_14,
            male_over_14,
            female_over_14
          FROM cqi_indicator 
          WHERE indicator_type = 'summary'
            AND start_date = ? AND end_date = ?
            AND (? IS NULL OR site_id = ?)
            AND (numerator < 0 OR denominator < 0 OR male_0_14 < 0 OR female_0_14 < 0 
                 OR male_over_14 < 0 OR female_over_14 < 0)
          ORDER BY indicator_code
        `
      },
      {
        id: 'percentage_range_check',
        name: 'Percentage Range Check',
        description: 'Identify percentages outside valid range (0-100)',
        severity: 'error',
        query: `
          SELECT 
            indicator_code,
            indicator_name,
            percentage,
            numerator,
            denominator
          FROM cqi_indicator 
          WHERE indicator_type = 'summary'
            AND start_date = ? AND end_date = ?
            AND (? IS NULL OR site_id = ?)
            AND (percentage < 0 OR percentage > 100)
          ORDER BY percentage DESC
        `
      },
      {
        id: 'orphaned_detail_records',
        name: 'Orphaned Detail Records',
        description: 'Detail records without corresponding summary records',
        severity: 'warning',
        query: `
          SELECT DISTINCT 
            d.indicator_code,
            COUNT(*) as orphaned_count
          FROM cqi_indicator d
          WHERE d.indicator_type = 'detail'
            AND d.start_date = ? AND d.end_date = ?
            AND (? IS NULL OR d.site_id = ?)
            AND NOT EXISTS (
              SELECT 1 FROM cqi_indicator s 
              WHERE s.indicator_code = d.indicator_code
                AND s.indicator_type = 'summary'
                AND s.start_date = d.start_date
                AND s.end_date = d.end_date
                AND (s.site_id = d.site_id OR (s.site_id IS NULL AND d.site_id IS NULL))
            )
          GROUP BY d.indicator_code
          ORDER BY orphaned_count DESC
        `
      },
      {
        id: 'missing_demographic_totals',
        name: 'Missing Demographic Totals',
        description: 'Summary records missing demographic total fields',
        severity: 'warning',
        query: `
          SELECT 
            indicator_code,
            indicator_name,
            children_total,
            adults_total,
            male_0_14_total,
            female_0_14_total,
            male_over_14_total,
            female_over_14_total
          FROM cqi_indicator 
          WHERE indicator_type = 'summary'
            AND start_date = ? AND end_date = ?
            AND (? IS NULL OR site_id = ?)
            AND (children_total IS NULL OR adults_total IS NULL 
                 OR male_0_14_total IS NULL OR female_0_14_total IS NULL
                 OR male_over_14_total IS NULL OR female_over_14_total IS NULL)
          ORDER BY indicator_code
        `
      },
      {
        id: 'demographic_total_consistency',
        name: 'Demographic Total Consistency',
        description: 'Verify demographic totals are consistent',
        severity: 'warning',
        query: `
          SELECT 
            indicator_code,
            indicator_name,
            children_total,
            adults_total,
            male_0_14_total,
            female_0_14_total,
            male_over_14_total,
            female_over_14_total,
            (male_0_14_total + female_0_14_total) as calculated_children_total,
            (male_over_14_total + female_over_14_total) as calculated_adults_total
          FROM cqi_indicator 
          WHERE indicator_type = 'summary'
            AND start_date = ? AND end_date = ?
            AND (? IS NULL OR site_id = ?)
            AND (children_total != (male_0_14_total + female_0_14_total)
                 OR adults_total != (male_over_14_total + female_over_14_total))
          ORDER BY indicator_code
        `
      },
      {
        id: 'data_freshness_check',
        name: 'Data Freshness Check',
        description: 'Identify stale data that may need refreshing',
        severity: 'info',
        query: `
          SELECT 
            indicator_code,
            indicator_name,
            created_at,
            updated_at,
            DATEDIFF(NOW(), updated_at) as days_since_update
          FROM cqi_indicator 
          WHERE indicator_type = 'summary'
            AND start_date = ? AND end_date = ?
            AND (? IS NULL OR site_id = ?)
            AND DATEDIFF(NOW(), updated_at) > 7
          ORDER BY days_since_update DESC
        `
      },
      {
        id: 'duplicate_records_check',
        name: 'Duplicate Records Check',
        description: 'Identify potential duplicate records',
        severity: 'error',
        query: `
          SELECT 
            indicator_code,
            indicator_type,
            start_date,
            end_date,
            site_id,
            COUNT(*) as duplicate_count
          FROM cqi_indicator 
          WHERE start_date = ? AND end_date = ?
            AND (? IS NULL OR site_id = ?)
          GROUP BY indicator_code, indicator_type, start_date, end_date, site_id
          HAVING COUNT(*) > 1
          ORDER BY duplicate_count DESC
        `
      }
    ];
  }

  /**
   * Run all validation checks for a specific period
   */
  async runAllValidations(params) {
    const { startDate, endDate, siteId } = params;
    
    try {
      const db = siteId ? await siteDatabaseManager.getSiteConnection(siteId) : sequelize;
      const validationResults = {};
      let totalIssues = 0;
      let errorCount = 0;
      let warningCount = 0;
      let infoCount = 0;

      for (const rule of this.validationRules) {
        try {
          const results = await db.query(rule.query, {
            replacements: [startDate, endDate, siteId, siteId],
            type: QueryTypes.SELECT
          });

          validationResults[rule.id] = {
            rule: {
              id: rule.id,
              name: rule.name,
              description: rule.description,
              severity: rule.severity
            },
            issues: results,
            count: results.length,
            status: results.length === 0 ? 'PASS' : 'FAIL'
          };

          totalIssues += results.length;
          
          if (rule.severity === 'error') errorCount += results.length;
          else if (rule.severity === 'warning') warningCount += results.length;
          else if (rule.severity === 'info') infoCount += results.length;

        } catch (error) {
          console.error(`Error running validation rule ${rule.id}:`, error);
          validationResults[rule.id] = {
            rule: {
              id: rule.id,
              name: rule.name,
              description: rule.description,
              severity: rule.severity
            },
            issues: [],
            count: 0,
            status: 'ERROR',
            error: error.message
          };
        }
      }

      // Calculate overall status
      let overallStatus = 'HEALTHY';
      if (errorCount > 0) {
        overallStatus = 'CRITICAL';
      } else if (warningCount > 0) {
        overallStatus = 'WARNING';
      } else if (infoCount > 0) {
        overallStatus = 'INFO';
      }

      return {
        period: { startDate, endDate },
        siteId,
        overall_status: overallStatus,
        summary: {
          total_rules: this.validationRules.length,
          total_issues: totalIssues,
          error_count: errorCount,
          warning_count: warningCount,
          info_count: infoCount,
          passed_rules: this.validationRules.length - Object.values(validationResults).filter(r => r.status === 'FAIL').length
        },
        validation_results: validationResults,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error running CQI validations:', error);
      throw new Error(`Failed to run CQI validations: ${error.message}`);
    }
  }

  /**
   * Run a specific validation rule
   */
  async runValidationRule(ruleId, params) {
    const { startDate, endDate, siteId } = params;
    
    const rule = this.validationRules.find(r => r.id === ruleId);
    if (!rule) {
      throw new Error(`Validation rule '${ruleId}' not found`);
    }

    try {
      const db = siteId ? await siteDatabaseManager.getSiteConnection(siteId) : sequelize;
      
      const results = await db.query(rule.query, {
        replacements: [startDate, endDate, siteId, siteId],
        type: QueryTypes.SELECT
      });

      return {
        rule: {
          id: rule.id,
          name: rule.name,
          description: rule.description,
          severity: rule.severity
        },
        issues: results,
        count: results.length,
        status: results.length === 0 ? 'PASS' : 'FAIL',
        period: { startDate, endDate },
        siteId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error running validation rule ${ruleId}:`, error);
      throw new Error(`Failed to run validation rule: ${error.message}`);
    }
  }

  /**
   * Get data quality score
   */
  async getDataQualityScore(params) {
    const validationResults = await this.runAllValidations(params);
    
    const totalRules = validationResults.summary.total_rules;
    const passedRules = validationResults.summary.passed_rules;
    const errorCount = validationResults.summary.error_count;
    const warningCount = validationResults.summary.warning_count;
    
    // Calculate score based on passed rules and severity of issues
    let baseScore = (passedRules / totalRules) * 100;
    
    // Deduct points for errors and warnings
    const errorPenalty = Math.min(errorCount * 5, 30); // Max 30 points deduction for errors
    const warningPenalty = Math.min(warningCount * 2, 20); // Max 20 points deduction for warnings
    
    const finalScore = Math.max(0, baseScore - errorPenalty - warningPenalty);
    
    let grade;
    if (finalScore >= 95) grade = 'A+';
    else if (finalScore >= 90) grade = 'A';
    else if (finalScore >= 85) grade = 'B+';
    else if (finalScore >= 80) grade = 'B';
    else if (finalScore >= 75) grade = 'C+';
    else if (finalScore >= 70) grade = 'C';
    else if (finalScore >= 60) grade = 'D';
    else grade = 'F';

    return {
      score: Math.round(finalScore),
      grade,
      breakdown: {
        base_score: Math.round(baseScore),
        error_penalty: errorPenalty,
        warning_penalty: warningPenalty,
        passed_rules: passedRules,
        total_rules: totalRules
      },
      recommendations: this.generateRecommendations(validationResults),
      period: validationResults.period,
      siteId: validationResults.siteId,
      timestamp: validationResults.timestamp
    };
  }

  /**
   * Generate recommendations based on validation results
   */
  generateRecommendations(validationResults) {
    const recommendations = [];
    
    Object.values(validationResults.validation_results).forEach(result => {
      if (result.status === 'FAIL' && result.count > 0) {
        switch (result.rule.id) {
          case 'demographic_totals_consistency':
            recommendations.push({
              priority: 'high',
              category: 'data_integrity',
              message: `Fix ${result.count} indicators with inconsistent demographic totals`,
              action: 'Review data population logic for demographic breakdowns'
            });
            break;
          case 'percentage_calculation_accuracy':
            recommendations.push({
              priority: 'high',
              category: 'calculation_error',
              message: `Correct ${result.count} indicators with percentage calculation errors`,
              action: 'Verify percentage calculation formulas in stored procedures'
            });
            break;
          case 'zero_denominator_check':
            recommendations.push({
              priority: 'medium',
              category: 'data_completeness',
              message: `${result.count} indicators have zero denominators`,
              action: 'Review data availability for the selected period'
            });
            break;
          case 'negative_values_check':
            recommendations.push({
              priority: 'high',
              category: 'data_integrity',
              message: `Fix ${result.count} indicators with negative values`,
              action: 'Review data validation rules and source data quality'
            });
            break;
          case 'orphaned_detail_records':
            recommendations.push({
              priority: 'medium',
              category: 'data_consistency',
              message: `Clean up ${result.count} orphaned detail records`,
              action: 'Ensure summary records are created before detail records'
            });
            break;
          case 'data_freshness_check':
            recommendations.push({
              priority: 'low',
              category: 'data_freshness',
              message: `${result.count} indicators have stale data`,
              action: 'Consider refreshing data for better accuracy'
            });
            break;
        }
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Auto-fix certain validation issues
   */
  async autoFixIssues(params) {
    const { startDate, endDate, siteId, ruleIds = [] } = params;
    
    const fixableRules = ['percentage_calculation_accuracy', 'demographic_total_consistency'];
    const rulesToFix = ruleIds.length > 0 ? 
      ruleIds.filter(id => fixableRules.includes(id)) : 
      fixableRules;

    const results = [];
    
    try {
      const db = siteId ? await siteDatabaseManager.getSiteConnection(siteId) : sequelize;
      
      for (const ruleId of rulesToFix) {
        try {
          let fixQuery = '';
          let fixCount = 0;
          
          if (ruleId === 'percentage_calculation_accuracy') {
            fixQuery = `
              UPDATE cqi_indicator 
              SET percentage = CASE 
                WHEN denominator > 0 THEN ROUND((numerator * 100.0 / denominator), 2)
                ELSE 0 
              END,
              updated_at = NOW()
              WHERE indicator_type = 'summary'
                AND start_date = ? AND end_date = ?
                AND (? IS NULL OR site_id = ?)
                AND ABS(percentage - CASE 
                  WHEN denominator > 0 THEN ROUND((numerator * 100.0 / denominator), 2)
                  ELSE 0 
                END) > 0.01
            `;
            
            const result = await db.query(fixQuery, {
              replacements: [startDate, endDate, siteId, siteId],
              type: QueryTypes.UPDATE
            });
            
            fixCount = result[1]; // Number of affected rows
          }
          
          else if (ruleId === 'demographic_total_consistency') {
            fixQuery = `
              UPDATE cqi_indicator 
              SET children_total = (male_0_14_total + female_0_14_total),
                  adults_total = (male_over_14_total + female_over_14_total),
                  updated_at = NOW()
              WHERE indicator_type = 'summary'
                AND start_date = ? AND end_date = ?
                AND (? IS NULL OR site_id = ?)
                AND (children_total != (male_0_14_total + female_0_14_total)
                     OR adults_total != (male_over_14_total + female_over_14_total))
            `;
            
            const result = await db.query(fixQuery, {
              replacements: [startDate, endDate, siteId, siteId],
              type: QueryTypes.UPDATE
            });
            
            fixCount = result[1]; // Number of affected rows
          }
          
          results.push({
            rule_id: ruleId,
            status: 'success',
            fixed_count: fixCount,
            message: `Fixed ${fixCount} records for rule: ${ruleId}`
          });
          
        } catch (error) {
          console.error(`Error fixing rule ${ruleId}:`, error);
          results.push({
            rule_id: ruleId,
            status: 'error',
            fixed_count: 0,
            message: `Failed to fix rule: ${error.message}`
          });
        }
      }
      
      return {
        period: { startDate, endDate },
        siteId,
        fixed_rules: results,
        total_fixed: results.reduce((sum, r) => sum + r.fixed_count, 0),
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error auto-fixing issues:', error);
      throw new Error(`Failed to auto-fix issues: ${error.message}`);
    }
  }

  /**
   * Get validation summary for dashboard
   */
  async getValidationSummary(params) {
    const validationResults = await this.runAllValidations(params);
    const qualityScore = await this.getDataQualityScore(params);
    
    return {
      overall_status: validationResults.overall_status,
      quality_score: qualityScore.score,
      quality_grade: qualityScore.grade,
      summary: validationResults.summary,
      top_issues: Object.values(validationResults.validation_results)
        .filter(r => r.status === 'FAIL' && r.count > 0)
        .sort((a, b) => {
          const severityOrder = { error: 3, warning: 2, info: 1 };
          return severityOrder[b.rule.severity] - severityOrder[a.rule.severity] || b.count - a.count;
        })
        .slice(0, 5),
      recommendations: qualityScore.recommendations.slice(0, 3),
      period: validationResults.period,
      siteId: validationResults.siteId,
      timestamp: validationResults.timestamp
    };
  }
}

module.exports = new CQIValidationService();

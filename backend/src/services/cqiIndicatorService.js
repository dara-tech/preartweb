const { sequelize } = require('../config/database');
const { siteDatabaseManager } = require('../config/siteDatabase');
const { QueryTypes } = require('sequelize');

class CQIIndicatorService {
  constructor() {
    this.indicatorDefinitions = this.getIndicatorDefinitions();
  }

  /**
   * Get all available indicator definitions
   */
  getIndicatorDefinitions() {
    return [
      { code: '1', name: 'Percentage of ART patients who died', category: 'Mortality & Re-engagement' },
      { code: '2', name: 'Percentage of ART patients who were lost to follow-up', category: 'Mortality & Re-engagement' },
      { code: '3', name: 'Percentage of missed appointments reengaged within 28 days', category: 'Mortality & Re-engagement' },
      { code: '4', name: 'Percentage of missed appointments reengaged after 28+ days', category: 'Mortality & Re-engagement' },
      { code: '5a', name: 'Percentage of late visits beyond ARV supply buffer date', category: 'Visit Status' },
      { code: '5b', name: 'Percentage of late visits within ARV supply buffer date', category: 'Visit Status' },
      { code: '5c', name: 'Percentage of visits on schedule among ART patients', category: 'Visit Status' },
      { code: '5d', name: 'Percentage of early visits among ART patients', category: 'Visit Status' },
      { code: '6a', name: 'Percentage of patients newly initiating ART on same-day (0 day) as diagnosed date', category: 'Treatment & Prevention' },
      { code: '6b', name: 'Percentage of patients newly initiating ART within 1-7 days of diagnosed date', category: 'Treatment & Prevention' },
      { code: '6c', name: 'Percentage of patients newly initiating ART after >7 days of diagnosed date', category: 'Treatment & Prevention' },
      { code: '7', name: 'Percentage of HIV infected patients who received a baseline CD4 count before starting ART', category: 'Treatment & Prevention' },
      { code: '8a', name: 'Percentage of patients with CD4 < 350 receiving Cotrimoxazole prophylaxis', category: 'Treatment & Prevention' },
      { code: '8b', name: 'Percentage of patients with CD4 < 100 receiving Fluconazole prophylaxis', category: 'Treatment & Prevention' },
      { code: '9a', name: 'Percentage of ART patients with MMD <3 months', category: 'Multi-Month Dispensing' },
      { code: '9b', name: 'Percentage of ART patients with MMD 3 months', category: 'Multi-Month Dispensing' },
      { code: '9c', name: 'Percentage of ART patients with MMD 4 months', category: 'Multi-Month Dispensing' },
      { code: '9d', name: 'Percentage of ART patients with MMD 5 months', category: 'Multi-Month Dispensing' },
      { code: '9e', name: 'Percentage of ART patients with MMD 6+ months', category: 'Multi-Month Dispensing' },
      { code: '10a', name: 'Percentage of newly initiated patients on TLD', category: 'Treatment Optimization' },
      { code: '10b', name: 'Cumulative percentage of patients on TLD', category: 'Treatment Optimization' },
      { code: '11a', name: 'Percentage of eligible patients who received TPT', category: 'Treatment Optimization' },
      { code: '11b', name: 'Percentage of patients who completed TPT', category: 'Treatment Optimization' },
      { code: '12a', name: 'Percentage of patients with VL testing coverage', category: 'Viral Load Monitoring' },
      { code: '12b', name: 'Percentage of patients with VL monitored within 6 months', category: 'Viral Load Monitoring' },
      { code: '12c', name: 'Percentage of patients with VL suppression at 12 months', category: 'Viral Load Monitoring' },
      { code: '12d', name: 'Overall percentage of patients with VL suppression', category: 'Viral Load Monitoring' },
      { code: '12e', name: 'Percentage of VL results returned within 10 days', category: 'Viral Load Monitoring' },
      { code: '13a', name: 'Percentage of patients who received enhanced adherence counseling', category: 'Viral Load Monitoring' },
      { code: '13b', name: 'Percentage of patients with follow-up VL after counseling', category: 'Viral Load Monitoring' },
      { code: '13c', name: 'Percentage of patients with VL suppression after counseling', category: 'Viral Load Monitoring' },
      { code: '14a', name: 'Percentage of patients switched from first to second line', category: 'Treatment Switching' },
      { code: '14b', name: 'Percentage of patients switched from second to third line', category: 'Treatment Switching' },
      { code: '15', name: 'Retention rate', category: 'Retention' }
    ];
  }

  /**
   * Get list of available indicators
   */
  async getAvailableIndicators() {
    return this.indicatorDefinitions;
  }

  /**
   * Populate all CQI indicators for a specific period
   */
  async populateAllIndicators(params) {
    const { startDate, endDate, siteId, deadCode, lostCode, transferInCode, transferOutCode } = params;
    
    try {
      // Get database connection
      // Always use main database for cqi_indicator table, siteId is used as filter
      const db = sequelize;
      
      // Call the stored procedure to populate all indicators
      const query = `CALL PopulateAllCQIIndicators(?, ?, ?, ?, ?, ?, ?)`;
      
      await db.query(query, {
        replacements: [startDate, endDate, siteId, deadCode, lostCode, transferInCode, transferOutCode],
        type: QueryTypes.RAW
      });

      // Get count of populated records
      const countQuery = `
        SELECT 
          indicator_code,
          indicator_type,
          COUNT(*) as record_count
        FROM cqi_indicator 
        WHERE start_date = ? AND end_date = ? 
          AND (? IS NULL OR site_id = ?)
        GROUP BY indicator_code, indicator_type
        ORDER BY indicator_code, indicator_type
      `;

      const counts = await db.query(countQuery, {
        replacements: [startDate, endDate, siteId, siteId],
        type: QueryTypes.SELECT
      });

      return {
        message: 'All indicators populated successfully',
        period: { startDate, endDate },
        siteId,
        summary: counts,
        totalRecords: counts.reduce((sum, item) => sum + item.record_count, 0)
      };
    } catch (error) {
      console.error('Error populating CQI indicators:', error);
      throw new Error(`Failed to populate CQI indicators: ${error.message}`);
    }
  }

  /**
   * Get summary data for all indicators
   */
  async getAllIndicatorsSummary(params) {
    const { startDate, endDate, siteId } = params;
    
    try {
      // Always use main database for cqi_indicator table, siteId is used as filter
      const db = sequelize;
      
      const query = `
        SELECT 
          indicator_code,
          indicator_name,
          numerator,
          denominator,
          percentage,
          male_0_14,
          female_0_14,
          male_over_14,
          female_over_14,
          male_0_14_total,
          female_0_14_total,
          male_over_14_total,
          female_over_14_total,
          children_total,
          adults_total,
          updated_at
        FROM cqi_indicator
        WHERE indicator_type = 'summary'
          AND start_date = ?
          AND end_date = ?
          AND (? IS NULL OR site_id = ?)
        ORDER BY 
          CASE 
            WHEN indicator_code REGEXP '^[0-9]+$' THEN CAST(indicator_code AS UNSIGNED)
            WHEN indicator_code REGEXP '^[0-9]+[a-z]$' THEN CAST(SUBSTRING(indicator_code, 1, LENGTH(indicator_code)-1) AS UNSIGNED) * 10 + ASCII(RIGHT(indicator_code, 1)) - ASCII('a') + 1
            ELSE 999
          END
      `;

      const results = await db.query(query, {
        replacements: [startDate, endDate, siteId, siteId],
        type: QueryTypes.SELECT
      });

      return results.map(row => ({
        ...row,
        numerator: parseInt(row.numerator) || 0,
        denominator: parseInt(row.denominator) || 0,
        percentage: parseFloat(row.percentage) || 0,
        male_0_14: parseInt(row.male_0_14) || 0,
        female_0_14: parseInt(row.female_0_14) || 0,
        male_over_14: parseInt(row.male_over_14) || 0,
        female_over_14: parseInt(row.female_over_14) || 0,
        male_0_14_total: parseInt(row.male_0_14_total) || 0,
        female_0_14_total: parseInt(row.female_0_14_total) || 0,
        male_over_14_total: parseInt(row.male_over_14_total) || 0,
        female_over_14_total: parseInt(row.female_over_14_total) || 0,
        children_total: parseInt(row.children_total) || 0,
        adults_total: parseInt(row.adults_total) || 0
      }));
    } catch (error) {
      console.error('Error getting indicators summary:', error);
      throw new Error(`Failed to get indicators summary: ${error.message}`);
    }
  }

  /**
   * Get summary data for a specific indicator
   */
  async getIndicatorSummary(params) {
    const { indicatorCode, startDate, endDate, siteId } = params;
    
    try {
      // Always use main database for cqi_indicator table, siteId is used as filter
      const db = sequelize;
      
      const query = `
        SELECT 
          indicator_code,
          indicator_name,
          numerator,
          denominator,
          percentage,
          male_0_14,
          female_0_14,
          male_over_14,
          female_over_14,
          male_0_14_total,
          female_0_14_total,
          male_over_14_total,
          female_over_14_total,
          children_total,
          adults_total,
          indicator_specific_data,
          updated_at
        FROM cqi_indicator
        WHERE indicator_code = ?
          AND indicator_type = 'summary'
          AND start_date = ?
          AND end_date = ?
          AND (? IS NULL OR site_id = ?)
        LIMIT 1
      `;

      const results = await db.query(query, {
        replacements: [indicatorCode, startDate, endDate, siteId, siteId],
        type: QueryTypes.SELECT
      });

      if (results.length === 0) {
        return null;
      }

      const row = results[0];
      return {
        ...row,
        numerator: parseInt(row.numerator) || 0,
        denominator: parseInt(row.denominator) || 0,
        percentage: parseFloat(row.percentage) || 0,
        male_0_14: parseInt(row.male_0_14) || 0,
        female_0_14: parseInt(row.female_0_14) || 0,
        male_over_14: parseInt(row.male_over_14) || 0,
        female_over_14: parseInt(row.female_over_14) || 0,
        male_0_14_total: parseInt(row.male_0_14_total) || 0,
        female_0_14_total: parseInt(row.female_0_14_total) || 0,
        male_over_14_total: parseInt(row.male_over_14_total) || 0,
        female_over_14_total: parseInt(row.female_over_14_total) || 0,
        children_total: parseInt(row.children_total) || 0,
        adults_total: parseInt(row.adults_total) || 0,
        indicator_specific_data: row.indicator_specific_data ? JSON.parse(row.indicator_specific_data) : null
      };
    } catch (error) {
      console.error('Error getting indicator summary:', error);
      throw new Error(`Failed to get indicator summary: ${error.message}`);
    }
  }

  /**
   * Get patient-level detail data for a specific indicator (ON-THE-FLY from source tables)
   */
  async getIndicatorDetails(params) {
    const { indicatorCode, startDate, endDate, siteId, page, limit, search } = params;
    
    try {
      const db = sequelize;
      const offset = (page - 1) * limit;
      
      // Build search condition
      let searchCondition = '';
      let searchParams = [];
      if (search && search.trim()) {
        searchCondition = `AND (main.ClinicID LIKE ? OR art.ART LIKE ?)`;
        const searchTerm = `%${search.trim()}%`;
        searchParams = [searchTerm, searchTerm];
      }

      // Query based on indicator code
      let countQuery = '';
      let dataQuery = '';
      let replacements = [];

      // Indicator 1: Mortality (Deaths)
      if (indicatorCode === '1') {
        countQuery = `
          SELECT SUM(cnt) as total FROM (
            SELECT COUNT(DISTINCT main.ClinicID) as cnt
            FROM tblaimain main 
            JOIN tblavpatientstatus s ON main.ClinicID = s.ClinicID 
            WHERE s.Da BETWEEN ? AND ? 
              AND s.Status = 4
              AND (? IS NULL OR main.ClinicID LIKE CONCAT(?, '%'))
              ${searchCondition}
            UNION ALL
            SELECT COUNT(DISTINCT main.ClinicID) as cnt
            FROM tblcimain main 
            JOIN tblcvpatientstatus s ON main.ClinicID = s.ClinicID 
            WHERE s.Da BETWEEN ? AND ?
              AND s.Status = 4
              AND (? IS NULL OR main.ClinicID LIKE CONCAT(?, '%'))
              ${searchCondition}
          ) AS combined_count
        `;
        
        dataQuery = `
          SELECT 
            main.ClinicID as clinic_id,
            art.ART as art_number,
            main.Sex as patient_sex,
            IF(main.Sex=0, 'Female', 'Male') as patient_sex_display,
            'Adult' as patient_type,
            TIMESTAMPDIFF(YEAR, main.DaBirth, ?) as patient_age,
            main.DafirstVisit as date_first_visit,
            s.Da as event_date,
            'Death' as event_value
          FROM tblaimain main 
          LEFT JOIN tblaart art ON main.ClinicID = art.ClinicID
          JOIN tblavpatientstatus s ON main.ClinicID = s.ClinicID 
          WHERE s.Da BETWEEN ? AND ?
            AND s.Status = 4
            AND (? IS NULL OR main.ClinicID LIKE CONCAT(?, '%'))
            ${searchCondition}
          UNION ALL
          SELECT 
            main.ClinicID as clinic_id,
            art.ART as art_number,
            main.Sex as patient_sex,
            IF(main.Sex=0, 'Female', 'Male') as patient_sex_display,
            'Child' as patient_type,
            TIMESTAMPDIFF(YEAR, main.DaBirth, ?) as patient_age,
            main.DafirstVisit as date_first_visit,
            s.Da as event_date,
            'Death' as event_value
          FROM tblcimain main 
          LEFT JOIN tblcart art ON main.ClinicID = art.ClinicID
          JOIN tblcvpatientstatus s ON main.ClinicID = s.ClinicID 
          WHERE s.Da BETWEEN ? AND ?
            AND s.Status = 4
            AND (? IS NULL OR main.ClinicID LIKE CONCAT(?, '%'))
            ${searchCondition}
          ORDER BY event_date DESC
          LIMIT ? OFFSET ?
        `;
        
        replacements = [
          startDate, endDate, siteId, siteId, ...searchParams,
          startDate, endDate, siteId, siteId, ...searchParams,
          endDate, startDate, endDate, siteId, siteId, ...searchParams,
          endDate, startDate, endDate, siteId, siteId, ...searchParams,
          limit, offset
        ];
      }
      // Indicator 2: Lost to Follow-up
      else if (indicatorCode === '2') {
        countQuery = `
          SELECT COUNT(DISTINCT main.ClinicID) as total
          FROM tblaimain main 
          JOIN tblavpatientstatus s ON main.ClinicID = s.ClinicID 
          WHERE s.Da BETWEEN ? AND ?
            AND s.Status = 3
            AND (? IS NULL OR main.ClinicID LIKE CONCAT(?, '%'))
            ${searchCondition}
        `;
        
        dataQuery = `
          SELECT 
            main.ClinicID as clinic_id,
            art.ART as art_number,
            main.Sex as patient_sex,
            IF(main.Sex=0, 'Female', 'Male') as patient_sex_display,
            CASE 
              WHEN TIMESTAMPDIFF(YEAR, main.DaBirth, ?) <= 14 THEN 'Child'
              ELSE 'Adult'
            END as patient_type,
            TIMESTAMPDIFF(YEAR, main.DaBirth, ?) as patient_age,
            main.DafirstVisit as date_first_visit,
            s.Da as event_date,
            'Lost to Follow-up' as event_value
          FROM tblaimain main 
          LEFT JOIN tblaart art ON main.ClinicID = art.ClinicID
          JOIN tblavpatientstatus s ON main.ClinicID = s.ClinicID 
          WHERE s.Da BETWEEN ? AND ?
            AND s.Status = 3
            AND (? IS NULL OR main.ClinicID LIKE CONCAT(?, '%'))
            ${searchCondition}
          ORDER BY s.Da DESC
          LIMIT ? OFFSET ?
        `;
        
        replacements = [
          startDate, endDate, siteId, siteId, ...searchParams,
          endDate, endDate, startDate, endDate, siteId, siteId, ...searchParams,
          limit, offset
        ];
      }
      // For other indicators, return empty for now (can be extended)
      else {
        return {
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          }
        };
      }

      // Execute count query
      const countResult = await db.query(countQuery, {
        replacements: replacements.slice(0, replacements.length - 2), // Remove limit/offset
        type: QueryTypes.SELECT
      });

      const total = parseInt(countResult[0]?.total) || 0;

      // Execute data query
      const results = await db.query(dataQuery, {
        replacements,
        type: QueryTypes.SELECT
      });

      const data = results.map(row => ({
        ...row,
        patient_age: parseInt(row.patient_age) || null
      }));

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Error getting indicator details:', error);
      throw new Error(`Failed to get indicator details: ${error.message}`);
    }
  }

  /**
   * Get demographic breakdown for a specific indicator
   */
  async getIndicatorDemographics(params) {
    const { indicatorCode, startDate, endDate, siteId } = params;
    
    try {
      // Always use main database for cqi_indicator table, siteId is used as filter
      const db = sequelize;
      
      const query = `
        SELECT 
          indicator_code,
          indicator_name,
          numerator as total_numerator,
          denominator as total_denominator,
          percentage as overall_percentage,
          male_0_14,
          female_0_14,
          male_over_14,
          female_over_14,
          male_0_14_total,
          female_0_14_total,
          male_over_14_total,
          female_over_14_total,
          children_total,
          adults_total
        FROM cqi_indicator
        WHERE indicator_code = ?
          AND indicator_type = 'summary'
          AND start_date = ?
          AND end_date = ?
          AND (? IS NULL OR site_id = ?)
        LIMIT 1
      `;

      const results = await db.query(query, {
        replacements: [indicatorCode, startDate, endDate, siteId, siteId],
        type: QueryTypes.SELECT
      });

      if (results.length === 0) {
        return null;
      }

      const row = results[0];
      
      // Calculate demographic percentages
      const calculatePercentage = (numerator, denominator) => {
        return denominator > 0 ? parseFloat(((numerator * 100.0) / denominator).toFixed(2)) : 0;
      };

      return {
        indicator_code: row.indicator_code,
        indicator_name: row.indicator_name,
        total_numerator: parseInt(row.total_numerator) || 0,
        total_denominator: parseInt(row.total_denominator) || 0,
        overall_percentage: parseFloat(row.overall_percentage) || 0,
        demographics: {
          children: {
            male: {
              numerator: parseInt(row.male_0_14) || 0,
              denominator: parseInt(row.male_0_14_total) || 0,
              percentage: calculatePercentage(parseInt(row.male_0_14) || 0, parseInt(row.male_0_14_total) || 0)
            },
            female: {
              numerator: parseInt(row.female_0_14) || 0,
              denominator: parseInt(row.female_0_14_total) || 0,
              percentage: calculatePercentage(parseInt(row.female_0_14) || 0, parseInt(row.female_0_14_total) || 0)
            },
            total: {
              numerator: (parseInt(row.male_0_14) || 0) + (parseInt(row.female_0_14) || 0),
              denominator: parseInt(row.children_total) || 0,
              percentage: calculatePercentage(
                (parseInt(row.male_0_14) || 0) + (parseInt(row.female_0_14) || 0),
                parseInt(row.children_total) || 0
              )
            }
          },
          adults: {
            male: {
              numerator: parseInt(row.male_over_14) || 0,
              denominator: parseInt(row.male_over_14_total) || 0,
              percentage: calculatePercentage(parseInt(row.male_over_14) || 0, parseInt(row.male_over_14_total) || 0)
            },
            female: {
              numerator: parseInt(row.female_over_14) || 0,
              denominator: parseInt(row.female_over_14_total) || 0,
              percentage: calculatePercentage(parseInt(row.female_over_14) || 0, parseInt(row.female_over_14_total) || 0)
            },
            total: {
              numerator: (parseInt(row.male_over_14) || 0) + (parseInt(row.female_over_14) || 0),
              denominator: parseInt(row.adults_total) || 0,
              percentage: calculatePercentage(
                (parseInt(row.male_over_14) || 0) + (parseInt(row.female_over_14) || 0),
                parseInt(row.adults_total) || 0
              )
            }
          }
        }
      };
    } catch (error) {
      console.error('Error getting indicator demographics:', error);
      throw new Error(`Failed to get indicator demographics: ${error.message}`);
    }
  }

  /**
   * Get trend data for a specific indicator across multiple periods
   */
  async getIndicatorTrend(params) {
    const { indicatorCode, periods, siteId } = params;
    
    try {
      // Always use main database for cqi_indicator table, siteId is used as filter
      const db = sequelize;
      
      const periodConditions = periods.map(() => '(start_date = ? AND end_date = ?)').join(' OR ');
      const periodParams = periods.flatMap(p => [p.startDate, p.endDate]);
      
      const query = `
        SELECT 
          start_date,
          end_date,
          numerator,
          denominator,
          percentage,
          children_total,
          adults_total
        FROM cqi_indicator
        WHERE indicator_code = ?
          AND indicator_type = 'summary'
          AND (? IS NULL OR site_id = ?)
          AND (${periodConditions})
        ORDER BY start_date
      `;

      const results = await db.query(query, {
        replacements: [indicatorCode, siteId, siteId, ...periodParams],
        type: QueryTypes.SELECT
      });

      return results.map(row => ({
        period: {
          start_date: row.start_date,
          end_date: row.end_date
        },
        numerator: parseInt(row.numerator) || 0,
        denominator: parseInt(row.denominator) || 0,
        percentage: parseFloat(row.percentage) || 0,
        demographics: {
          children_total: parseInt(row.children_total) || 0,
          adults_total: parseInt(row.adults_total) || 0
        }
      }));
    } catch (error) {
      console.error('Error getting indicator trend:', error);
      throw new Error(`Failed to get indicator trend: ${error.message}`);
    }
  }

  /**
   * Calculate indicator performance against targets
   */
  async calculateIndicatorPerformance(params) {
    const { indicatorCode, startDate, endDate, targetPercentage, siteId } = params;
    
    try {
      const summary = await this.getIndicatorSummary({ indicatorCode, startDate, endDate, siteId });
      
      if (!summary) {
        throw new Error('Indicator data not found for the specified period');
      }

      const currentPercentage = summary.percentage;
      const variance = currentPercentage - targetPercentage;
      
      let performanceStatus;
      if (currentPercentage >= targetPercentage) {
        performanceStatus = 'Above Target';
      } else if (currentPercentage >= (targetPercentage * 0.9)) {
        performanceStatus = 'Near Target';
      } else if (currentPercentage >= (targetPercentage * 0.8)) {
        performanceStatus = 'Below Target';
      } else {
        performanceStatus = 'Well Below Target';
      }

      return {
        indicator_code: indicatorCode,
        indicator_name: summary.indicator_name,
        current_percentage: currentPercentage,
        target_percentage: targetPercentage,
        variance: parseFloat(variance.toFixed(2)),
        performance_status: performanceStatus,
        period: { startDate, endDate },
        numerator: summary.numerator,
        denominator: summary.denominator
      };
    } catch (error) {
      console.error('Error calculating indicator performance:', error);
      throw new Error(`Failed to calculate indicator performance: ${error.message}`);
    }
  }

  /**
   * Export indicator data for reporting
   */
  async exportIndicatorData(params) {
    const { startDate, endDate, siteId, format, indicatorCodes } = params;
    
    try {
      // Always use main database for cqi_indicator table, siteId is used as filter
      const db = sequelize;
      
      let indicatorFilter = '';
      let indicatorParams = [];
      if (indicatorCodes && indicatorCodes.length > 0) {
        indicatorFilter = `AND indicator_code IN (${indicatorCodes.map(() => '?').join(',')})`;
        indicatorParams = indicatorCodes;
      }

      if (format === 'summary' || format === 'both') {
        const summaryQuery = `
          SELECT 
            indicator_code,
            indicator_name,
            numerator,
            denominator,
            percentage,
            male_0_14,
            female_0_14,
            male_over_14,
            female_over_14,
            male_0_14_total,
            female_0_14_total,
            male_over_14_total,
            female_over_14_total,
            children_total,
            adults_total,
            updated_at
          FROM cqi_indicator
          WHERE indicator_type = 'summary'
            AND start_date = ?
            AND end_date = ?
            AND (? IS NULL OR site_id = ?)
            ${indicatorFilter}
          ORDER BY 
            CASE 
              WHEN indicator_code REGEXP '^[0-9]+$' THEN CAST(indicator_code AS UNSIGNED)
              WHEN indicator_code REGEXP '^[0-9]+[a-z]$' THEN CAST(SUBSTRING(indicator_code, 1, LENGTH(indicator_code)-1) AS UNSIGNED) * 10 + ASCII(RIGHT(indicator_code, 1)) - ASCII('a') + 1
              ELSE 999
            END
        `;

        const summaryResults = await db.query(summaryQuery, {
          replacements: [startDate, endDate, siteId, siteId, ...indicatorParams],
          type: QueryTypes.SELECT
        });

        return {
          export_info: {
            period: { startDate, endDate },
            siteId,
            format,
            indicators: indicatorCodes,
            export_date: new Date().toISOString()
          },
          summary_data: summaryResults.map(row => ({
            ...row,
            numerator: parseInt(row.numerator) || 0,
            denominator: parseInt(row.denominator) || 0,
            percentage: parseFloat(row.percentage) || 0,
            male_0_14: parseInt(row.male_0_14) || 0,
            female_0_14: parseInt(row.female_0_14) || 0,
            male_over_14: parseInt(row.male_over_14) || 0,
            female_over_14: parseInt(row.female_over_14) || 0,
            children_total: parseInt(row.children_total) || 0,
            adults_total: parseInt(row.adults_total) || 0
          }))
        };
      }

      // For detailed or both formats, would need additional implementation
      // This is a simplified version focusing on summary data
      return [];
    } catch (error) {
      console.error('Error exporting indicator data:', error);
      throw new Error(`Failed to export indicator data: ${error.message}`);
    }
  }

  /**
   * Get dashboard data with key metrics and trends
   */
  async getDashboardData(params) {
    const { startDate, endDate, siteId, compareWith } = params;
    
    try {
      // Get current period summary
      const currentData = await this.getAllIndicatorsSummary({ startDate, endDate, siteId });
      
      // Get comparison data if requested
      let comparisonData = null;
      if (compareWith) {
        // Calculate comparison period (same duration as current period)
        const currentStart = new Date(startDate);
        const currentEnd = new Date(endDate);
        const duration = currentEnd - currentStart;
        
        const compareEnd = new Date(compareWith);
        const compareStart = new Date(compareEnd.getTime() - duration);
        
        comparisonData = await this.getAllIndicatorsSummary({
          startDate: compareStart.toISOString().split('T')[0],
          endDate: compareEnd.toISOString().split('T')[0],
          siteId
        });
      }

      // Calculate key metrics
      const keyMetrics = this.calculateKeyMetrics(currentData, comparisonData);
      
      // Group indicators by category
      const categorizedData = this.categorizeIndicators(currentData);

      return {
        key_metrics: keyMetrics,
        current_period: {
          start_date: startDate,
          end_date: endDate,
          data: categorizedData
        },
        comparison_period: comparisonData ? {
          start_date: compareWith ? new Date(new Date(compareWith).getTime() - (new Date(endDate) - new Date(startDate))).toISOString().split('T')[0] : null,
          end_date: compareWith,
          data: this.categorizeIndicators(comparisonData)
        } : null,
        summary: {
          total_indicators: currentData.length,
          indicators_with_data: currentData.filter(i => i.denominator > 0).length,
          last_updated: currentData.length > 0 ? Math.max(...currentData.map(i => new Date(i.updated_at))) : null
        }
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw new Error(`Failed to get dashboard data: ${error.message}`);
    }
  }

  /**
   * Calculate key metrics from indicator data
   */
  calculateKeyMetrics(currentData, comparisonData) {
    const metrics = {};
    
    // Find key indicators
    const mortality = currentData.find(i => i.indicator_code === '1');
    const ltf = currentData.find(i => i.indicator_code === '2');
    const retention = currentData.find(i => i.indicator_code === '15');
    const vlSuppression = currentData.find(i => i.indicator_code === '12d');
    
    if (mortality) {
      metrics.mortality_rate = {
        current: mortality.percentage,
        previous: comparisonData ? comparisonData.find(i => i.indicator_code === '1')?.percentage : null,
        trend: comparisonData ? this.calculateTrend(mortality.percentage, comparisonData.find(i => i.indicator_code === '1')?.percentage) : null
      };
    }
    
    if (ltf) {
      metrics.ltf_rate = {
        current: ltf.percentage,
        previous: comparisonData ? comparisonData.find(i => i.indicator_code === '2')?.percentage : null,
        trend: comparisonData ? this.calculateTrend(ltf.percentage, comparisonData.find(i => i.indicator_code === '2')?.percentage) : null
      };
    }
    
    if (retention) {
      metrics.retention_rate = {
        current: retention.percentage,
        previous: comparisonData ? comparisonData.find(i => i.indicator_code === '15')?.percentage : null,
        trend: comparisonData ? this.calculateTrend(retention.percentage, comparisonData.find(i => i.indicator_code === '15')?.percentage) : null
      };
    }
    
    if (vlSuppression) {
      metrics.vl_suppression_rate = {
        current: vlSuppression.percentage,
        previous: comparisonData ? comparisonData.find(i => i.indicator_code === '12d')?.percentage : null,
        trend: comparisonData ? this.calculateTrend(vlSuppression.percentage, comparisonData.find(i => i.indicator_code === '12d')?.percentage) : null
      };
    }
    
    return metrics;
  }

  /**
   * Calculate trend between two values
   */
  calculateTrend(current, previous) {
    if (previous === null || previous === undefined) return null;
    
    const change = current - previous;
    const percentChange = previous !== 0 ? (change / previous) * 100 : 0;
    
    return {
      change: parseFloat(change.toFixed(2)),
      percent_change: parseFloat(percentChange.toFixed(2)),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    };
  }

  /**
   * Categorize indicators by their category
   */
  categorizeIndicators(data) {
    const categories = {};
    
    data.forEach(indicator => {
      const definition = this.indicatorDefinitions.find(d => d.code === indicator.indicator_code);
      const category = definition ? definition.category : 'Other';
      
      if (!categories[category]) {
        categories[category] = [];
      }
      
      categories[category].push(indicator);
    });
    
    return categories;
  }

  /**
   * Validate data quality and integrity
   */
  async validateDataQuality(params) {
    const { startDate, endDate, siteId } = params;
    
    try {
      // Always use main database for cqi_indicator table, siteId is used as filter
      const db = sequelize;
      
      const validationQueries = [
        {
          name: 'Missing demographic totals',
          query: `
            SELECT indicator_code, indicator_name
            FROM cqi_indicator 
            WHERE indicator_type = 'summary'
              AND start_date = ? AND end_date = ?
              AND (? IS NULL OR site_id = ?)
              AND (male_0_14 + female_0_14 + male_over_14 + female_over_14) != numerator
          `
        },
        {
          name: 'Percentage calculation errors',
          query: `
            SELECT indicator_code, indicator_name, percentage, numerator, denominator
            FROM cqi_indicator 
            WHERE indicator_type = 'summary'
              AND start_date = ? AND end_date = ?
              AND (? IS NULL OR site_id = ?)
              AND denominator > 0
              AND ABS(percentage - ROUND((numerator * 100.0 / denominator), 2)) > 0.01
          `
        },
        {
          name: 'Orphaned detail records',
          query: `
            SELECT DISTINCT d.indicator_code
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
          `
        }
      ];

      const validationResults = {};
      
      for (const validation of validationQueries) {
        const results = await db.query(validation.query, {
          replacements: [startDate, endDate, siteId, siteId],
          type: QueryTypes.SELECT
        });
        
        validationResults[validation.name] = {
          count: results.length,
          issues: results
        };
      }

      // Overall data completeness
      const completenessQuery = `
        SELECT 
          COUNT(*) as total_indicators,
          COUNT(CASE WHEN denominator > 0 THEN 1 END) as indicators_with_data,
          AVG(CASE WHEN denominator > 0 THEN percentage END) as avg_percentage
        FROM cqi_indicator
        WHERE indicator_type = 'summary'
          AND start_date = ? AND end_date = ?
          AND (? IS NULL OR site_id = ?)
      `;

      const completenessResult = await db.query(completenessQuery, {
        replacements: [startDate, endDate, siteId, siteId],
        type: QueryTypes.SELECT
      });

      return {
        period: { startDate, endDate },
        siteId,
        validation_results: validationResults,
        data_completeness: completenessResult[0],
        overall_status: Object.values(validationResults).every(v => v.count === 0) ? 'PASS' : 'ISSUES_FOUND',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error validating data quality:', error);
      throw new Error(`Failed to validate data quality: ${error.message}`);
    }
  }

  /**
   * Categorize indicators by their category
   */
  categorizeIndicators(data) {
    const categories = {};
    
    data.forEach(indicator => {
      const definition = this.indicatorDefinitions.find(d => d.code === indicator.indicator_code);
      const category = definition ? definition.category : 'Other';
      
      if (!categories[category]) {
        categories[category] = [];
      }
      
      categories[category].push(indicator);
    });
    
    return categories;
  }

  /**
   * Calculate key metrics from indicator data
   */
  calculateKeyMetrics(currentData, comparisonData) {
    const metrics = {};
    
    // Find key indicators
    const mortality = currentData.find(i => i.indicator_code === '1');
    const ltf = currentData.find(i => i.indicator_code === '2');
    const retention = currentData.find(i => i.indicator_code === '15');
    const vlSuppression = currentData.find(i => i.indicator_code === '12d');
    
    if (mortality) {
      metrics.mortality_rate = {
        current: mortality.percentage,
        previous: comparisonData ? comparisonData.find(i => i.indicator_code === '1')?.percentage : null,
        trend: comparisonData ? this.calculateTrend(mortality.percentage, comparisonData.find(i => i.indicator_code === '1')?.percentage) : null
      };
    }
    
    if (ltf) {
      metrics.ltf_rate = {
        current: ltf.percentage,
        previous: comparisonData ? comparisonData.find(i => i.indicator_code === '2')?.percentage : null,
        trend: comparisonData ? this.calculateTrend(ltf.percentage, comparisonData.find(i => i.indicator_code === '2')?.percentage) : null
      };
    }
    
    if (retention) {
      metrics.retention_rate = {
        current: retention.percentage,
        previous: comparisonData ? comparisonData.find(i => i.indicator_code === '15')?.percentage : null,
        trend: comparisonData ? this.calculateTrend(retention.percentage, comparisonData.find(i => i.indicator_code === '15')?.percentage) : null
      };
    }
    
    if (vlSuppression) {
      metrics.vl_suppression_rate = {
        current: vlSuppression.percentage,
        previous: comparisonData ? comparisonData.find(i => i.indicator_code === '12d')?.percentage : null,
        trend: comparisonData ? this.calculateTrend(vlSuppression.percentage, comparisonData.find(i => i.indicator_code === '12d')?.percentage) : null
      };
    }
    
    return metrics;
  }

  /**
   * Calculate trend between two values
   */
  calculateTrend(current, previous) {
    if (previous === null || previous === undefined) return null;
    
    const change = current - previous;
    const percentChange = previous !== 0 ? (change / previous) * 100 : 0;
    
    return {
      change: parseFloat(change.toFixed(2)),
      percent_change: parseFloat(percentChange.toFixed(2)),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    };
  }

  /**
   * Health check for the CQI system
   */
  async healthCheck() {
    try {
      // Check database connection
      await sequelize.authenticate();
      
      // Check if CQI table exists
      const tableQuery = `
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
          AND table_name = 'cqi_indicator'
      `;
      
      const tableResult = await sequelize.query(tableQuery, {
        type: QueryTypes.SELECT
      });
      
      const tableExists = tableResult[0].count > 0;
      
      // Get recent data count
      let recentDataCount = 0;
      if (tableExists) {
        const dataQuery = `
          SELECT COUNT(*) as count 
          FROM cqi_indicator 
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `;
        
        const dataResult = await sequelize.query(dataQuery, {
          type: QueryTypes.SELECT
        });
        
        recentDataCount = dataResult[0].count;
      }
      
      return {
        database_connection: 'OK',
        cqi_table_exists: tableExists,
        recent_data_count: recentDataCount,
        available_indicators: this.indicatorDefinitions.length,
        status: tableExists ? 'HEALTHY' : 'SETUP_REQUIRED'
      };
    } catch (error) {
      console.error('Health check failed:', error);
      throw new Error(`Health check failed: ${error.message}`);
    }
  }
}

module.exports = new CQIIndicatorService();

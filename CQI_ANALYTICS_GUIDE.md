# CQI Analytics Engine Guide

## Overview

The CQI (Continuous Quality Improvement) Analytics Engine is a comprehensive solution for pre-calculating and storing CQI indicator values to enable fast, frequent reporting. Instead of calculating indicators on-demand (which can take 5-10 seconds), the analytics engine pre-calculates and stores these values, allowing for sub-second response times.

## Architecture

### Components

1. **CQIIndicator Model** - Database model for storing pre-calculated values
2. **CQIAnalyticsEngine Service** - Core calculation and storage logic
3. **CQIQueryExecutor Service** - Executes SQL queries from mortality_retention_indicators folder
4. **Scheduler Service** - Automated periodic calculations
5. **CQI API Routes** - REST endpoints for data access
6. **Frontend CQI API** - Frontend service for accessing CQI data

### Database Schema

The `cqi_indicators` table stores pre-calculated CQI indicator values with the following structure:

- **Identification**: `indicator_id`, `site_code`, `period_type`, `period_year`, `period_quarter`, `period_month`
- **Values**: `total`, `numerator`, `denominator`, `percentage`, `male_0_14`, `female_0_14`, `male_over_14`, `female_over_14`
- **Metadata**: `calculation_status`, `calculation_started_at`, `calculation_completed_at`, `calculation_duration_ms`, `error_message`

See `backend/migrations/002_create_cqi_indicators.sql` for the complete schema.

## Features

### 1. Pre-calculation Storage
- Stores indicator values by period (quarterly, monthly, yearly)
- Tracks calculation status and performance metrics
- Maintains data freshness and versioning

### 2. Automated Scheduling
- **Quarterly calculations**: 1st day of each quarter at 2:30 AM
- **Health checks**: Every 6 hours
- **Cleanup**: Every Sunday at 4 AM

### 3. Fast Data Retrieval
- Sub-second response times for pre-calculated data
- Intelligent caching and fallback mechanisms
- Batch processing for multiple indicators

### 4. Monitoring & Health
- Real-time health check endpoints
- Performance metrics and error tracking
- Automated health checks

## Available CQI Indicators

The system supports 34+ CQI indicators from the `mortality_retention_indicators` folder:

- **Mortality & Retention**: 1, 2, 3, 4, 15
- **Visit Timing**: 5A, 5B, 5C, 5D
- **ART Initiation**: 6, 6A, 6B, 6C
- **Baseline & Prophylaxis**: 7, 8A, 8B
- **MMD**: 9, 9A, 9B, 9C, 9D, 9E
- **TLD**: 10A, 10B
- **TPT**: 11A, 11B
- **Viral Load**: 12A, 12B, 12C, 12D, 12E
- **Adherence Counseling**: 13A, 13B, 13C
- **Regimen Changes**: 14A, 14B

## API Endpoints

### CQI Summary
```http
GET /apiv1/cqi/summary
```
Returns system status, record counts, and success rates.

### Get CQI Data
```http
GET /apiv1/cqi/data?indicatorId=1&siteCode=2101&periodYear=2025&periodQuarter=2
```
Retrieves pre-calculated CQI indicator data with filters.

### Calculate Indicator
```http
POST /apiv1/cqi/calculate
Content-Type: application/json

{
  "indicatorId": "1",
  "siteCode": "2101",
  "period": {
    "periodType": "quarterly",
    "periodYear": 2025,
    "periodQuarter": 2,
    "startDate": "2025-04-01",
    "endDate": "2025-06-30",
    "previousEndDate": "2025-03-31"
  },
  "options": {
    "forceRefresh": false
  }
}
```

### Fast Indicators (Fallback)
```http
GET /apiv1/cqi/indicators/fast?indicatorId=1&siteCode=2101&periodYear=2025&periodQuarter=2
```
Returns pre-calculated data instantly, falls back to regular calculation if not available.

### Batch Calculate
```http
POST /apiv1/cqi/batch-calculate
Content-Type: application/json

{
  "requests": [
    {
      "indicatorId": "1",
      "siteCode": "2101",
      "period": { ... },
      "options": {}
    }
  ]
}
```

### Run Yearly Analytics
```http
POST /apiv1/cqi/run-yearly
Content-Type: application/json

{
  "year": 2025,
  "siteCode": "2101" // optional
}
```

### Health Check
```http
GET /apiv1/cqi/health
```
Returns system health status and performance metrics.

### Available Indicators
```http
GET /apiv1/cqi/indicators/available
```
Returns list of all available CQI indicators.

## Usage Examples

### 1. Calculate Single Indicator
```javascript
import cqiApi from '@/services/cqiApi';

const result = await cqiApi.calculateIndicator('1', '2101', {
  periodType: 'quarterly',
  periodYear: 2025,
  periodQuarter: 2,
  startDate: '2025-04-01',
  endDate: '2025-06-30',
  previousEndDate: '2025-03-31'
});
```

### 2. Get Fast Indicator Data
```javascript
const data = await cqiApi.getFastIndicatorData('1', '2101', 2025, 2);

if (data.success) {
  console.log('Fast data:', data.data);
} else {
  // Fallback to regular calculation
  console.log('No analytics data, use regular endpoint');
}
```

### 3. Batch Calculate Multiple Indicators
```javascript
const requests = [
  { indicatorId: '1', siteCode: '2101', period: period1 },
  { indicatorId: '12A', siteCode: '2101', period: period1 },
  { indicatorId: '1', siteCode: '2102', period: period1 }
];

const result = await cqiApi.batchCalculate(requests);
```

### 4. Calculate All Indicators for a Period
```javascript
const result = await cqiApi.calculateForPeriod('2101', 'quarterly', 2025, 2);
```

### 5. Get CQI Data with Filters
```javascript
const data = await cqiApi.getCQIData({
  indicatorId: '1',
  siteCode: '2101',
  periodType: 'quarterly',
  periodYear: 2025,
  periodQuarter: 2
});
```

## Performance Benefits

### Before CQI Analytics Engine
- **Response Time**: 5-10 seconds per indicator
- **Database Load**: High (complex queries on every request)
- **Scalability**: Limited by query complexity
- **User Experience**: Slow, frequent timeouts

### After CQI Analytics Engine
- **Response Time**: <100ms for pre-calculated data
- **Database Load**: Low (simple lookups)
- **Scalability**: High (can handle many concurrent users)
- **User Experience**: Fast, responsive interface

## Setup & Migration

### 1. Run Database Migration
```bash
mysql -u root -p preart_sites_registry < backend/migrations/002_create_cqi_indicators.sql
```

Or execute the SQL file in your MySQL client.

### 2. Verify Installation
```bash
curl http://localhost:3001/apiv1/cqi/health
```

### 3. Run Initial Calculations
```bash
curl -X POST http://localhost:3001/apiv1/cqi/run-yearly \
  -H "Content-Type: application/json" \
  -d '{"year": 2025}'
```

## Configuration

### Scheduler Configuration
The scheduler runs automatically when the server starts. CQI calculations are scheduled:
- **Quarterly**: 1st day of each quarter at 2:30 AM
- **Health checks**: Every 6 hours
- **Cleanup**: Every Sunday at 4 AM

To modify schedules, edit `backend/src/services/scheduler.js`.

## Monitoring

### Health Monitoring
```bash
# Check CQI health
curl http://localhost:3001/apiv1/cqi/health

# Get system summary
curl http://localhost:3001/apiv1/cqi/summary
```

### Database Queries
```sql
-- Check calculation status
SELECT indicator_id, site_code, calculation_status, error_message 
FROM cqi_indicators 
ORDER BY last_updated DESC 
LIMIT 10;

-- Check success rate
SELECT 
  calculation_status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM cqi_indicators), 2) as percentage
FROM cqi_indicators
GROUP BY calculation_status;
```

## Troubleshooting

### Common Issues

1. **Calculations Failing**
   - Check database connectivity
   - Verify site database configurations
   - Review error messages in `cqi_indicators` table
   - Check SQL file paths in `mortality_retention_indicators` folder

2. **Slow Performance**
   - Check if analytics data exists for requested period
   - Verify database indexes are created
   - Monitor calculation queue status

3. **Data Not Updating**
   - Check scheduler status
   - Verify cron jobs are running
   - Force refresh calculations if needed

### Debug Commands

```bash
# Force calculation for a specific indicator
curl -X POST http://localhost:3001/apiv1/cqi/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "indicatorId": "1",
    "siteCode": "2101",
    "period": {
      "periodType": "quarterly",
      "periodYear": 2025,
      "periodQuarter": 2,
      "startDate": "2025-04-01",
      "endDate": "2025-06-30",
      "previousEndDate": "2025-03-31"
    },
    "options": {
      "forceRefresh": true
    }
  }'
```

## Integration with Frontend

The frontend CQI API service (`frontend/src/services/cqiApi.js`) provides easy access to all CQI endpoints:

```javascript
import cqiApi from '@/services/cqiApi';

// Get health status
const health = await cqiApi.getCQIHealth();

// Get summary
const summary = await cqiApi.getCQISummary();

// Get fast indicator data
const data = await cqiApi.getFastIndicatorData('1', '2101', 2025, 2);

// Calculate indicator
const result = await cqiApi.calculateIndicator('1', '2101', period);
```

## Future Enhancements

1. **Real-time Updates**: WebSocket notifications for calculation completion
2. **Advanced Caching**: Redis integration for even faster access
3. **Data Export**: Bulk export of CQI analytics data
4. **Custom Periods**: Support for custom date ranges
5. **Performance Analytics**: Detailed performance metrics and optimization
6. **Dashboard**: Frontend dashboard for monitoring CQI analytics

## Support

For technical support or questions about the CQI Analytics Engine:
1. Check the health check endpoints for system status
2. Review server logs for error messages
3. Use the summary endpoints for diagnostics
4. Consult this documentation for configuration options





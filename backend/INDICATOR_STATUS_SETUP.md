# Indicator Status Management System

## Overview
This system allows admins to enable/disable specific mortality retention indicators for faster development and testing. When indicators are disabled, they are skipped during execution, significantly reducing execution time.

## Setup

### 1. Run Migration
Execute the migration script to create the `indicator_status` table:

```bash
cd backend
node scripts/run-indicator-status-migration.js
```

This will:
- Create the `indicator_status` table in the main database
- Populate it with all 29 mortality retention indicators
- Set all indicators to active by default

### 2. Verify Migration
Check that the table was created successfully:

```sql
USE preart_sites_registry;
SELECT COUNT(*) as total, 
       SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
       SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive
FROM indicator_status;
```

## API Endpoints

### Get All Indicators with Status
```
GET /apiv1/mortality-retention-indicators/admin/indicators
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "indicators": [
    {
      "id": "1_percentage_died",
      "name": "Percentage Died",
      "is_active": true,
      "description": "Percentage of patients who died"
    },
    ...
  ],
  "count": 29
}
```

### Update Single Indicator Status
```
PUT /apiv1/mortality-retention-indicators/admin/indicators/:indicatorId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "is_active": false
}
```

Response:
```json
{
  "success": true,
  "message": "Indicator 1_percentage_died deactivated",
  "data": {
    "success": true,
    "indicator_id": "1_percentage_died",
    "is_active": false
  }
}
```

### Bulk Update Indicator Statuses
```
PUT /apiv1/mortality-retention-indicators/admin/indicators/bulk-status
Authorization: Bearer <token>
Content-Type: application/json

{
  "indicators": [
    {
      "indicator_id": "1_percentage_died",
      "is_active": false
    },
    {
      "indicator_id": "2_percentage_lost_to_followup",
      "is_active": true
    }
  ]
}
```

Response:
```json
{
  "success": true,
  "message": "Updated 2 indicators",
  "results": [
    {
      "success": true,
      "indicator_id": "1_percentage_died",
      "is_active": false
    },
    {
      "success": true,
      "indicator_id": "2_percentage_lost_to_followup",
      "is_active": true
    }
  ]
}
```

## Usage

### Development/Testing
For faster development and testing, disable indicators that are not currently being worked on:

```bash
# Disable all indicators except the one you're testing
curl -X PUT http://localhost:3001/apiv1/mortality-retention-indicators/admin/indicators/3_reengaged_within_28_days/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"is_active": true}'

# Disable all others (example for bulk update)
```

### Production
In production, all indicators should be active:

```sql
UPDATE indicator_status SET is_active = 1;
```

## Performance Impact

When indicators are disabled:
- They are completely skipped during execution
- No database queries are executed for inactive indicators
- Execution time is significantly reduced

Example:
- **All 29 indicators active**: ~30-60 seconds
- **Only 3 indicators active**: ~3-6 seconds
- **Only 1 indicator active**: ~1-2 seconds

## Monitoring

The API response includes performance metrics:

```json
{
  "performance": {
    "executionTime": 1234.56,
    "successCount": 3,
    "errorCount": 0,
    "skippedCount": 26,
    "activeIndicatorsCount": 3,
    "totalIndicatorsCount": 29,
    "averageTimePerIndicator": 411.52
  }
}
```

## Database Schema

```sql
CREATE TABLE `indicator_status` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `indicator_id` VARCHAR(100) NOT NULL UNIQUE,
  `indicator_name` VARCHAR(255) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_indicator_id` (`indicator_id`),
  INDEX `idx_is_active` (`is_active`)
);
```

## Troubleshooting

### Indicators not being skipped
1. Verify the migration ran successfully
2. Check that `indicator_status` table exists
3. Verify indicator IDs match exactly (case-sensitive)
4. Check server logs for status loading errors

### Migration fails
1. Ensure database connection is working
2. Check that user has CREATE TABLE permissions
3. Verify database name is correct
4. Check for existing table conflicts

### Status not updating
1. Clear cache by restarting the server
2. Verify API endpoint is being called correctly
3. Check database for actual status changes
4. Verify authentication token is valid


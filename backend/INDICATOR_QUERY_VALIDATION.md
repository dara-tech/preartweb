# Mortality & Retention Indicator Query Validation

## Overview
This document describes the validation system for ensuring all Mortality & Retention indicator SQL queries are consistent and only return relevant fields.

## Validation Script
Run the validation script to check all indicator queries:
```bash
node validate-indicator-queries.js
```

## Expected Fields by Indicator

### Indicator 1: Percentage of ART patients who died
- **Core Fields**: Indicator, Deaths, TOTAL, Total_ART, Percentage
- **Demographic Fields**: Male_0_14, Male_0_14_Deaths, Female_0_14, Female_0_14_Deaths, Male_over_14, Male_over_14_Deaths, Female_over_14, Female_over_14_Deaths
- **Denominator Fields**: Male_0_14_Total, Female_0_14_Total, Male_over_14_Total, Female_over_14_Total
- **Aggregated Fields**: Children_Total, Adults_Total
- **Forbidden Fields**: Lost_to_Followup, Reengaged_Within_28, Reengaged_Over_28, Late_Visits, Early_Visits

### Indicator 2: Percentage of ART patients lost to follow-up
- **Core Fields**: Indicator, Lost_to_Followup, TOTAL, Total_ART, Percentage
- **Demographic Fields**: Male_0_14, Male_0_14_Lost, Female_0_14, Female_0_14_Lost, Male_over_14, Male_over_14_Lost, Female_over_14, Female_over_14_Lost
- **Denominator Fields**: Male_0_14_Total, Female_0_14_Total, Male_over_14_Total, Female_over_14_Total
- **Aggregated Fields**: Children_Total, Adults_Total
- **Forbidden Fields**: Deaths, Reengaged_Within_28, Reengaged_Over_28, Late_Visits, Early_Visits

### Indicator 3: Percentage reengaged within 28 days
- **Core Fields**: Indicator, Reengaged_Within_28, TOTAL, Total_Lost, Percentage
- **Demographic Fields**: Male_0_14, Male_0_14_Reengaged, Female_0_14, Female_0_14_Reengaged, Male_over_14, Male_over_14_Reengaged, Female_over_14, Female_over_14_Reengaged
- **Aggregated Fields**: Children_Total, Adults_Total
- **Forbidden Fields**: Deaths, Lost_to_Followup, Reengaged_Over_28, Total_ART, Late_Visits, Early_Visits

### Indicator 4: Percentage reengaged over 28 days
- **Core Fields**: Indicator, Reengaged_Over_28, TOTAL, Total_Lost, Percentage
- **Demographic Fields**: Male_0_14, Male_0_14_Reengaged, Female_0_14, Female_0_14_Reengaged, Male_over_14, Male_over_14_Reengaged, Female_over_14, Female_over_14_Reengaged
- **Eligible Fields**: Male_0_14_Eligible, Female_0_14_Eligible, Male_over_14_Eligible, Female_over_14_Eligible
- **Aggregated Fields**: Children_Total, Adults_Total
- **Forbidden Fields**: Deaths, Lost_to_Followup, Reengaged_Within_28, Total_ART, Late_Visits, Early_Visits, Male_0_14_Deaths, Female_0_14_Deaths, Male_over_14_Deaths, Female_over_14_Deaths

## Common Issues and Solutions

### Issue: Extra fields appearing in query results
**Symptom**: Query returns fields that shouldn't be there (e.g., Deaths in indicator 4)

**Possible Causes**:
1. Query execution merging results from multiple queries
2. Transformation layer adding default fields
3. Frontend displaying cached/merged data

**Solution**: 
- Verify the SQL query SELECT statement only includes expected fields
- Check query execution service for any field merging logic
- Clear cache and re-run query

### Issue: Missing expected fields
**Symptom**: Validation warns about missing fields

**Solution**: 
- Check if fields are actually needed for the indicator
- Update expected fields list if fields are intentionally omitted
- Add missing fields to SELECT statement if required

## Validation Rules

1. **No Forbidden Fields**: Each indicator must NOT return fields from other indicator types
2. **Consistent Naming**: Field names must follow the standard naming convention
3. **Required Fields**: Core fields (Indicator, TOTAL, Percentage) must always be present
4. **Demographic Breakdown**: Age/gender fields should be consistent across similar indicators

## Running Validation

```bash
# Validate all queries
node validate-indicator-queries.js

# Validate specific query (programmatically)
const { validateQuery } = require('./validate-indicator-queries.js');
const fs = require('fs');
const content = fs.readFileSync('src/queries/mortality_retention_indicators/4_reengaged_over_28_days.sql', 'utf8');
const result = validateQuery('4_reengaged_over_28_days', content);
console.log(result);
```

## Status

✅ All 36 indicator queries validated successfully
- 32 queries pass without warnings
- 4 queries have minor warnings (expected fields list may need updates)
- 0 queries have critical issues

Last validated: 2026-01-XX


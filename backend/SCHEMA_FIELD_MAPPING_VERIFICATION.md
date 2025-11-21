# Schema Field Mapping Verification

## Database Schema (snake_case)

### Core Fields
- `indicator_id` → Frontend: `Indicator` (from `indicator_name`)
- `total` → Frontend: `TOTAL`
- `percentage` → Frontend: `Percentage`
- `numerator` → Frontend: `numerator` (backward compatibility)
- `denominator` → Frontend: `denominator` (backward compatibility)

### Demographic Fields
- `male_0_14` → Frontend: `Male_0_14`
- `female_0_14` → Frontend: `Female_0_14`
- `male_over_14` → Frontend: `Male_over_14`
- `female_over_14` → Frontend: `Female_over_14`
- `children_total` → Frontend: `Children_Total`
- `adults_total` → Frontend: `Adults_Total`

### Denominator Fields
- `total_art` → Frontend: `Total_ART`
- `total_lost` → Frontend: `Total_Lost`
- `total_eligible` → Frontend: `Total_Eligible`
- `total_visits` → Frontend: `Total_Visits`
- `total_newly_initiated` → Frontend: `Total_Newly_Initiated`
- `eligible_patients` → Frontend: `Eligible_Patients`

### Numerator Fields
- `deaths` → Frontend: `Deaths`
- `lost_to_followup` → Frontend: `Lost_to_Followup`
- `reengaged_within_28` → Frontend: `Reengaged_Within_28`
- `reengaged_over_28` → Frontend: `Reengaged_Over_28`
- `late_visits_beyond_buffer` → Frontend: `Late_Visits_Beyond_Buffer`
- `late_visits_within_buffer` → Frontend: `Late_Visits_Within_Buffer`
- `visits_on_schedule` → Frontend: `Visits_On_Schedule`
- `early_visits` → Frontend: `Early_Visits`
- `same_day_initiation` → Frontend: `Same_Day_Initiation`
- `initiation_1_7_days` → Frontend: `Initiation_1_7_Days`
- `initiation_over_7_days` → Frontend: `Initiation_Over_7_Days`
- `with_baseline_cd4` → Frontend: `With_Baseline_CD4`
- `receiving_cotrimoxazole` → Frontend: `Receiving_Cotrimoxazole`
- `receiving_fluconazole` → Frontend: `Receiving_Fluconazole`
- `tpt_received` → Frontend: `TPT_Received`
- `tpt_completed` → Frontend: `TPT_Completed`
- `vl_tested_12m` → Frontend: `VL_Tested_12M`
- `vl_monitored_6m` → Frontend: `VL_Monitored_6M`
- `vl_suppressed_12m` → Frontend: `VL_Suppressed_12M`
- `vl_suppressed_overall` → Frontend: `VL_Suppressed_Overall`
- `within_10_days` → Frontend: `Within_10_Days`
- `received_counseling` → Frontend: `Received_Counseling`
- `followup_received` → Frontend: `Followup_Received`
- `achieved_suppression` → Frontend: `Achieved_Suppression`
- `switched_to_second_line` → Frontend: `Switched_To_Second_Line`
- `switched_to_third_line` → Frontend: `Switched_To_Third_Line`
- `total_retained` → Frontend: `Total_Retained`

### Demographic Total Fields
- `male_0_14_total` → Frontend: `Male_0_14_Total`
- `female_0_14_total` → Frontend: `Female_0_14_Total`
- `male_over_14_total` → Frontend: `Male_over_14_Total`
- `female_over_14_total` → Frontend: `Female_over_14_Total`

## Backend Transformation Mapping

### Location: `backend/src/routes/mortality-retention-indicators.js` (lines 254-322)

**Status**: ✅ CORRECT
- Maps all database fields (snake_case) to frontend format (PascalCase)
- Uses `Number()` conversion for all numeric fields
- Handles null/undefined with default 0

### Mapping Logic:
```javascript
// Database: record.deaths (snake_case)
// Frontend: indicator.Deaths (PascalCase)
Deaths: Number(record.deaths || 0)

// Database: record.total_art (snake_case)
// Frontend: indicator.Total_ART (PascalCase)
Total_ART: Number(record.total_art || 0)
```

## Frontend Field Usage

### Location: `frontend/src/pages/MortalityRetentionIndicators.jsx`

**Expected Fields** (PascalCase):
- `indicator.Deaths`
- `indicator.Lost_to_Followup`
- `indicator.Reengaged_Within_28`
- `indicator.Reengaged_Over_28`
- `indicator.Total_ART`
- `indicator.Total_Lost`
- `indicator.Male_0_14`
- `indicator.Female_0_14`
- `indicator.Children_Total`
- `indicator.Adults_Total`

## Verification Checklist

- [x] Database has all standardized fields (snake_case)
- [x] Backend query selects all fields (`SELECT *`)
- [x] Backend transformation maps all fields (snake_case → PascalCase)
- [x] Frontend receives all fields in PascalCase format
- [x] Field names match between backend output and frontend expectations

## Status: ✅ VERIFIED

All field mappings are correct and consistent across the entire stack.


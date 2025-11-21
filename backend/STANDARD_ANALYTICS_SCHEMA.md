# Standard Analytics Schema for All Indicators

**CRITICAL**: ALL indicators MUST return the EXACT SAME fields for analytics to work correctly.

## Standard Field Schema (ALL indicators must return these fields)

### Core Fields (Required - Always Present)
1. **Indicator** - Indicator name/description
2. **TOTAL** - Numerator value (always equals the main count)
3. **Percentage** - Calculated percentage
4. **Male_0_14** - Male patients 0-14 (numerator demographic)
5. **Female_0_14** - Female patients 0-14 (numerator demographic)
6. **Male_over_14** - Male patients over 14 (numerator demographic)
7. **Female_over_14** - Female patients over 14 (numerator demographic)
8. **Children_Total** - Total children (Male_0_14 + Female_0_14)
9. **Adults_Total** - Total adults (Male_over_14 + Female_over_14)

### Denominator Fields (Always Present - 0 if not applicable)
10. **Total_ART** - Total ART patients (denominator for indicators 1, 2, etc.)
11. **Total_Lost** - Total lost patients (denominator for indicators 3, 4)
12. **Total_Eligible** - Total eligible patients (denominator for various indicators)
13. **Total_Visits** - Total visits (denominator for visit indicators)
14. **Total_Newly_Initiated** - Total newly initiated (denominator for initiation indicators)
15. **Eligible_Patients** - Eligible patients (denominator for prophylaxis indicators)

### Numerator Fields (Always Present - 0 if not applicable)
16. **Deaths** - Deaths count (indicator 1)
17. **Lost_to_Followup** - Lost to follow-up count (indicator 2)
18. **Reengaged_Within_28** - Reengaged within 28 days (indicator 3)
19. **Reengaged_Over_28** - Reengaged over 28 days (indicator 4)
20. **Late_Visits_Beyond_Buffer** - Late visits beyond buffer (indicator 5a)
21. **Late_Visits_Within_Buffer** - Late visits within buffer (indicator 5b)
22. **Visits_On_Schedule** - Visits on schedule (indicator 5c)
23. **Early_Visits** - Early visits (indicator 5d)
24. **Same_Day_Initiation** - Same day initiation (indicator 6a)
25. **Initiation_1_7_Days** - Initiation 1-7 days (indicator 6b)
26. **Initiation_Over_7_Days** - Initiation over 7 days (indicator 6c)
27. **With_Baseline_CD4** - With baseline CD4 (indicator 7)
28. **Receiving_Cotrimoxazole** - Receiving Cotrimoxazole (indicator 8a)
29. **Receiving_Fluconazole** - Receiving Fluconazole (indicator 8b)
30. **TPT_Received** - TPT received (indicator 11a)
31. **TPT_Completed** - TPT completed (indicator 11b)
32. **VL_Tested_12M** - VL tested in 12 months (indicator 12a)
33. **VL_Monitored_6M** - VL monitored 6 months (indicator 12b)
34. **VL_Suppressed_12M** - VL suppressed 12 months (indicator 12c)
35. **VL_Suppressed_Overall** - VL suppressed overall (indicator 12d)
36. **Within_10_Days** - Results within 10 days (indicator 12e)
37. **Received_Counseling** - Received counseling (indicator 13a)
38. **Followup_Received** - Followup received (indicator 13b)
39. **Achieved_Suppression** - Achieved suppression (indicator 13c)
40. **Switched_To_Second_Line** - Switched to second line (indicator 14a)
41. **Switched_To_Third_Line** - Switched to third line (indicator 14b)
42. **Total_Retained** - Total retained (indicator 15)

### Demographic Total Fields (Always Present - 0 if not applicable)
43. **Male_0_14_Total** - Male 0-14 total (denominator demographic)
44. **Female_0_14_Total** - Female 0-14 total (denominator demographic)
45. **Male_over_14_Total** - Male over 14 total (denominator demographic)
46. **Female_over_14_Total** - Female over 14 total (denominator demographic)

## Implementation

The `mortalityRetentionIndicators.executeIndicator()` method will normalize all results to this standard schema, ensuring every indicator returns the same fields (with 0 for non-applicable fields).


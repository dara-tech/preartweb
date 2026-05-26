/**
 * NCHADS quarterly report indicator IDs (display numbers) → SQL file stems.
 * SQL filenames are unchanged; only report numbering follows NCHADS form.
 */
const NCHADS_INDICATOR_IDS = [
  '1', '2', '3', '4', '5', '5.1.1', '5.1.2', '5.1.3', '5.2', '5.3', '6', '7', '8',
  '9', '9.1', '9.2', '9.3', '10', '11',
  '11.1', '11.2', '11.3', '11.4', '11.5', '11.6', '11.7', '11.8'
];

/** No SQL file — value is 9.1 + 9.2 + 9.3 */
const COMPUTED_INDICATOR_IDS = new Set(['9']);
const LEFT_SERVICE_COMPONENT_IDS = ['9.1', '9.2', '9.3'];
const LEFT_SERVICE_SQL_STEMS = ['08.2_dead', '08.3_lost_to_followup', '08.4_transfer_out'];
const INDICATOR_9_LABEL = '9. Number of patients who left the service';

const INDICATOR_FILE_MAP = {
  '1': '01_active_art_previous',
  '2': '02_active_pre_art_previous',
  '3': '03_newly_enrolled',
  '4': '04_retested_positive',
  '5': '05_newly_initiated',
  '5.1.1': '05.1.1_art_same_day',
  '5.1.2': '05.1.2_art_1_7_days',
  '5.1.3': '05.1.3_art_over_7_days',
  '5.2': '05.2_art_with_tld',
  '5.3': '05.3_art_pregnant',
  '6': '06_transfer_in',
  '7': '07_lost_and_return',
  '8': '08_tpt_new_start',
  '9.1': '08.2_dead',
  '9.2': '08.3_lost_to_followup',
  '9.3': '08.4_transfer_out',
  '10': '09_active_pre_art',
  '11': '10_active_art_current',
  '11.1': '10.1_eligible_mmd',
  '11.2': '10.2_mmd',
  '11.3': '10.3_tld',
  '11.4': '10.4_tpt_start',
  '11.5': '10.5_tpt_complete',
  '11.6': '10.6_eligible_vl_test',
  '11.7': '10.7_vl_tested_12m',
  '11.8': '10.8_vl_suppression'
};

const INDICATOR_DETAIL_FILE_MAP = {
  '1': '01_active_art_previous_details',
  '2': '02_active_pre_art_previous_details',
  '3': '03_newly_enrolled_details',
  '4': '04_retested_positive_details',
  '5': '05_newly_initiated_details',
  '5.1.1': '05.1.1_art_same_day_details',
  '5.1.2': '05.1.2_art_1_7_days_details',
  '5.1.3': '05.1.3_art_over_7_days_details',
  '5.2': '05.2_art_with_tld_details',
  '5.3': '05.3_art_pregnant_details',
  '6': '06_transfer_in_details',
  '7': '07_lost_and_return_details',
  '8': '08_tpt_new_start_details',
  '9.1': '08.2_dead_details',
  '9.2': '08.3_lost_to_followup_details',
  '9.3': '08.4_transfer_out_details',
  '10': '09_active_pre_art_details',
  '11': '10_active_art_current_details',
  '11.1': '10.1_eligible_mmd_details',
  '11.2': '10.2_mmd_details',
  '11.3': '10.3_tld_details',
  '11.4': '10.4_tpt_start_details',
  '11.5': '10.5_tpt_complete_details',
  '11.6': '10.6_eligible_vl_test_details',
  '11.7': '10.7_vl_tested_12m_details',
  '11.8': '10.8_vl_suppression_details'
};

const INDICATOR_DISPLAY_NAMES = {
  '5.3': 'New ART patients who are pregnant',
  '8': 'Number of patients started TPT in this quarter',
  '9': 'Number of patients who left the service',
  '9.1': 'Dead',
  '9.2': 'Lost to follow up (LTFU)',
  '9.3': 'Transferred-out',
  '10': 'Active Pre-ART patients at end of this quarter',
  '11': 'Active ART patients at end of this quarter',
  '11.1': 'Eligible MMD',
  '11.2': 'MMD',
  '11.3': 'TLD',
  '11.4': 'TPT Start',
  '11.5': 'TPT Complete',
  '11.6': 'Eligible for VL test',
  '11.7': 'VL tested in 12M',
  '11.8': 'VL suppression'
};

function sumIndicatorRows(...rows) {
  const fields = ['TOTAL', 'Male_0_14', 'Female_0_14', 'Male_over_14', 'Female_over_14'];
  const data = { Indicator: INDICATOR_9_LABEL };
  for (const field of fields) {
    data[field] = rows.reduce((sum, row) => sum + Number(row?.[field] ?? 0), 0);
  }
  return data;
}

function isComputedIndicatorId(indicatorId) {
  return COMPUTED_INDICATOR_IDS.has(String(indicatorId));
}

function isIndicator9Row(row) {
  const label = row?.Indicator || '';
  return label.startsWith('9. Number of patients who left');
}

function findLeftServiceComponentRow(dataArray, componentId) {
  const prefixPatterns = {
    '9.1': [/^9\.1\./, /^8\.2\./],
    '9.2': [/^9\.2\./, /^8\.3\./],
    '9.3': [/^9\.3\./, /^8\.4\./]
  };
  return dataArray.find((row) => {
    const label = row?.Indicator || '';
    if (prefixPatterns[componentId].some((pattern) => pattern.test(label))) {
      return true;
    }
    if (componentId === '9.1' && label === 'Dead') return true;
    if (componentId === '9.2' && /LTFU|Lost to follow up/i.test(label)) return true;
    if (componentId === '9.3' && /Transfer/i.test(label)) return true;
    return false;
  });
}

function buildIndicator9FromComponents(...componentRows) {
  const rows = componentRows.filter(Boolean);
  if (rows.length === 0) return null;
  return sumIndicatorRows(...rows);
}

function buildIndicator9FromAnalyticsMap(indicatorsMap) {
  return buildIndicator9FromComponents(
    indicatorsMap['9.1'],
    indicatorsMap['9.2'],
    indicatorsMap['9.3']
  );
}

function injectIndicator9IntoSiteResults(results) {
  const byStem = Object.fromEntries(
    results
      .filter((row) => LEFT_SERVICE_SQL_STEMS.includes(row.indicatorId))
      .map((row) => [row.indicatorId, row.data])
  );
  const data = buildIndicator9FromComponents(
    byStem['08.2_dead'],
    byStem['08.3_lost_to_followup'],
    byStem['08.4_transfer_out']
  );
  if (!data) return results;
  if (results.some((row) => row.indicatorId === '9_left_service_total')) {
    return results;
  }
  return [
    ...results,
    {
      indicatorId: '9_left_service_total',
      data,
      success: true,
      executionTime: 0,
      computed: true
    }
  ];
}

function injectIndicator9IntoDataArray(dataArray) {
  if (!Array.isArray(dataArray) || dataArray.some(isIndicator9Row)) {
    return dataArray;
  }
  const data = buildIndicator9FromComponents(
    findLeftServiceComponentRow(dataArray, '9.1'),
    findLeftServiceComponentRow(dataArray, '9.2'),
    findLeftServiceComponentRow(dataArray, '9.3')
  );
  if (!data) return dataArray;
  return [...dataArray, data];
}

function injectIndicator9IntoAnalyticsMap(indicatorsMap) {
  if (!indicatorsMap || indicatorsMap['9']) {
    return indicatorsMap;
  }
  const data = buildIndicator9FromAnalyticsMap(indicatorsMap);
  if (data) {
    indicatorsMap['9'] = data;
  }
  return indicatorsMap;
}

module.exports = {
  NCHADS_INDICATOR_IDS,
  INDICATOR_FILE_MAP,
  INDICATOR_DETAIL_FILE_MAP,
  INDICATOR_DISPLAY_NAMES,
  COMPUTED_INDICATOR_IDS,
  LEFT_SERVICE_COMPONENT_IDS,
  LEFT_SERVICE_SQL_STEMS,
  INDICATOR_9_LABEL,
  isComputedIndicatorId,
  isIndicator9Row,
  buildIndicator9FromComponents,
  buildIndicator9FromAnalyticsMap,
  injectIndicator9IntoSiteResults,
  injectIndicator9IntoDataArray,
  injectIndicator9IntoAnalyticsMap
};

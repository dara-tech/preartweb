const fs = require('fs');
const path = require('path');
const { siteDatabaseManager } = require('../config/siteDatabase');

const PNTT_SCRIPTS_DIR = path.join(__dirname, '../queries/PNTT_AGGREGATE_SCRIPTS');
const PNTT_DETAIL_SCRIPTS_DIR = path.join(__dirname, '../queries/PNTT_DETAIL_SCRIPTS');

/** Default normalizer for PNTT aggregates that return Male, Female, Tsex */
function defaultPnttNormalizer(rows) {
  const r = rows && rows[0];
  if (!r) return [{ labelEn: '', labelKh: '', male: 0, female: 0, total: 0 }];
  const male = Number(r.Male ?? r.male ?? 0);
  const female = Number(r.Female ?? r.female ?? 0);
  const total = Number(r.Tsex ?? r.total ?? male + female);
  return [{ labelEn: '', labelKh: '', male, female, total }];
}

/**
 * Risk scripts return one row: R,R1,R2 (factor1), 1R,1R1,1R2 (factor2), ... 9R,9R1,9R2 (factor10).
 * Per schema (tblapntt): 0 = Yes (Ever), 1 = 6 months, 2 = No (Never).
 * We normalize to { ever, sixMonths, never } in that semantic order.
 */
function riskPnttNormalizer(rows) {
  const r = rows && rows[0];
  if (!r) return [];
  const keys = [
    ['R', 'R1', 'R2'],
    ['1R', '1R1', '1R2'],
    ['2R', '2R1', '2R2'],
    ['3R', '3R1', '3R2'],
    ['4R', '4R1', '4R2'],
    ['5R', '5R1', '5R2'],
    ['6R', '6R1', '6R2'],
    ['7R', '7R1', '7R2'],
    ['8R', '8R1', '8R2'],
    ['9R', '9R1', '9R2']
  ];
  const get = (key) => r[key] ?? r[key?.toLowerCase?.()] ?? 0;
  return keys.map(([everKey, sixMoKey, neverKey], i) => ({
    labelEn: `Risk factor ${i + 1}`,
    labelKh: '',
    ever: Number(get(everKey)),
    sixMonths: Number(get(sixMoKey)),
    never: Number(get(neverKey))
  }));
}

/** Build section label from script id (e.g. 11_PNTT_NEW_REG_aggregate -> "11 PNTT New Reg") */
function labelFromScriptId(scriptId) {
  return scriptId.replace(/_aggregate$/, '').replace(/_/g, ' ').trim();
}

class PnttReportService {
  constructor() {
    this.queries = new Map();
    this.detailQueries = new Map();
    this.sectionDefs = [];
    this.loadQueries();
    this.loadDetailQueries();
    this.buildSectionDefs();
  }

  loadQueries() {
    if (!fs.existsSync(PNTT_SCRIPTS_DIR)) return;
    const files = fs.readdirSync(PNTT_SCRIPTS_DIR).filter((f) => f.endsWith('.sql'));
    files.forEach((filename) => {
      const filePath = path.join(PNTT_SCRIPTS_DIR, filename);
      const content = fs.readFileSync(filePath, 'utf8');
      const scriptId = filename.replace('.sql', '');
      this.queries.set(scriptId, content);
    });
  }

  loadDetailQueries() {
    if (!fs.existsSync(PNTT_DETAIL_SCRIPTS_DIR)) return;
    const files = fs.readdirSync(PNTT_DETAIL_SCRIPTS_DIR).filter((f) => f.endsWith('.sql'));
    files.forEach((filename) => {
      const filePath = path.join(PNTT_DETAIL_SCRIPTS_DIR, filename);
      const content = fs.readFileSync(filePath, 'utf8');
      const scriptId = filename.replace('.sql', '');
      this.detailQueries.set(scriptId, content);
    });
  }

  buildSectionDefs() {
    const scriptIds = Array.from(this.queries.keys()).sort((a, b) => {
      const numA = parseFloat((a.match(/^[\d.]+/) || [a])[0]) || 0;
      const numB = parseFloat((b.match(/^[\d.]+/) || [b])[0]) || 0;
      if (numA !== numB) return numA - numB;
      return String(a).localeCompare(b);
    });
    let sectionNumber = 0;
    scriptIds.forEach((scriptId) => {
      sectionNumber += 1;
      const detailScriptId = scriptId.replace(/_aggregate$/, '_details');
      const hasDetail = this.detailQueries.has(detailScriptId);
      const isRisk = /RISK_aggregate$/.test(scriptId);
      this.sectionDefs.push({
        scriptId,
        detailScriptId: hasDetail ? detailScriptId : null,
        sectionNumber,
        sectionLabelEn: labelFromScriptId(scriptId),
        sectionLabelKh: '',
        normalizer: isRisk ? riskPnttNormalizer : defaultPnttNormalizer
      });
    });
  }

  processQuery(query, params) {
    const startDate = (params.startDate || '2025-01-01').replace(/'/g, "''");
    const endDate = (params.endDate || '2025-03-31').replace(/'/g, "''");
    const previousEndDate = params.previousEndDate ? `'${String(params.previousEndDate).replace(/'/g, "''")}'` : 'NULL';
    let single = query
      .replace(/SET\s+@StartDate\s*=\s*'[^']*';?\s*/gi, '')
      .replace(/SET\s+@EndDate\s*=\s*'[^']*';?\s*/gi, '')
      .replace(/SET\s+@PreviousEndDate\s*=\s*[^;]+;?\s*/gi, '');
    single = single.replace(/@StartDate/g, `'${startDate}'`).replace(/@EndDate/g, `'${endDate}'`).replace(/@PreviousEndDate/g, previousEndDate);
    return single.trim();
  }

  async runScript(siteCode, scriptId, params) {
    const query = this.queries.get(scriptId);
    if (!query) return { rows: [], error: `Script ${scriptId} not found` };
    const processed = this.processQuery(query, params);
    try {
      const rows = await siteDatabaseManager.executeSiteQuery(siteCode, processed);
      const list = Array.isArray(rows) ? rows : (rows && rows[0] ? [rows[0]] : []);
      return { rows: list, error: null };
    } catch (err) {
      return { rows: [], error: err.message };
    }
  }

  async runDetailScript(siteCode, scriptId, params) {
    const query = this.detailQueries.get(scriptId);
    if (!query) return { rows: [], error: `Detail script ${scriptId} not found` };
    const processed = this.processQuery(query, params);
    try {
      const rows = await siteDatabaseManager.executeSiteQuery(siteCode, processed);
      const list = Array.isArray(rows) ? rows : [];
      return { rows: list, error: null };
    } catch (err) {
      return { rows: [], error: err.message };
    }
  }

  async getReportData(siteCode, params) {
    const startDate = params.startDate || '2025-01-01';
    const endDate = params.endDate || '2025-03-31';
    const previousEndDate = params.previousEndDate || '2024-12-31';
    const fullParams = { startDate, endDate, previousEndDate };
    const sections = [];

    for (const def of this.sectionDefs) {
      try {
        const res = await this.runScript(siteCode, def.scriptId, fullParams);
        if (res.error) {
          sections.push({
            scriptId: def.scriptId,
            sectionNumber: def.sectionNumber,
            sectionLabelEn: def.sectionLabelEn,
            sectionLabelKh: def.sectionLabelKh,
            detailScriptId: def.detailScriptId || null,
            detailScriptIds: def.detailScriptIds || null,
            rows: [{ labelEn: 'Error', labelKh: 'កំហុស', male: 0, female: 0, total: 0, error: res.error }]
          });
          continue;
        }
        const rows = def.normalizer(res.rows);
        sections.push({
          scriptId: def.scriptId,
          sectionNumber: def.sectionNumber,
          sectionLabelEn: def.sectionLabelEn,
          sectionLabelKh: def.sectionLabelKh,
          detailScriptId: def.detailScriptId || null,
          detailScriptIds: def.detailScriptIds || null,
          rows: Array.isArray(rows) ? rows : []
        });
      } catch (err) {
        sections.push({
          scriptId: def.scriptId,
          sectionNumber: def.sectionNumber,
          sectionLabelEn: def.sectionLabelEn,
          sectionLabelKh: def.sectionLabelKh,
          detailScriptId: def.detailScriptId || null,
          detailScriptIds: def.detailScriptIds || null,
          rows: [{ labelEn: 'Error', labelKh: 'កំហុស', male: 0, female: 0, total: 0, error: err.message }]
        });
      }
    }

    return { success: true, data: sections };
  }
}

const pnttReportService = new PnttReportService();
module.exports = pnttReportService;

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'
import siteApi from '../services/siteApi'
import { pnttReportApi } from '../services/reportingApi'
import { useAuth } from '../contexts/AuthContext'
import { InfantDetailsModal } from '../components/modals'
import {
  ReportHeader,
  ReportConfiguration,
  generateAvailableYears,
  generateAvailableQuarters,
  getDateRangeForYearQuarter
} from '../components/indicators'

function getDetailScriptId(section) {
  return section.detailScriptId || null
}

/**
 * Risk factor index (0–9) → detail API column name.
 * tblapntt schema: 0 = Yes (Ever), 1 = 6 months, 2 = No (Never).
 */
const RISK_FACTOR_COLUMNS = ['SexHIV', 'Wsex', 'SexM', 'SexTran', 'Sex4', 'Drug', 'Pill', 'SexMoney', 'SexProvice', 'WOut']

function filterRiskDetailsByTimeframe(rows, factorIndex, timeframe) {
  if (!Array.isArray(rows) || factorIndex == null || !timeframe) return rows
  const col = RISK_FACTOR_COLUMNS[factorIndex]
  if (!col) return rows
  // Map UI timeframe -> underlying numeric code (0=ever, 1=sixMonths, 2=never)
  const value = timeframe === 'ever' ? 0 : timeframe === 'sixMonths' ? 1 : 2
  const colLower = col.toLowerCase()
  return rows.filter((r) => {
    const v = r[col] ?? r[colLower]
    return Number(v) === value
  })
}

/** Four report blocks: 1=Risk, 2=Index (11–13), 3=Partners (14–18), 4=Children (19–23) */
const PNTT_BLOCKS = [
  { titleKh: 'របាយការណ៍សរុបនៃការស្រាវជ្រាវរកកត្តាប្រឈមរបស់អ្នកជំងឺតម្រុយ', sectionNumbers: [1, 2] },
  { titleKh: 'របាយការណ៍សរុបនៃ អ្នកជំងឺតម្រុយ', sectionNumbers: [3, 4, 5] },
  { titleKh: 'របាយការណ៍សរុបនៃ ដៃគូរបស់អតិថិជន', sectionNumbers: null },
  { titleKh: 'របាយការណ៍សរុបនៃ កូនរបស់អតិថិជន', sectionNumbers: [] }
]
/** Risk factor 1–10: Khmer label for first section (កត្តាប្រឈម) */
const RISK_INDICATOR_KHMER = [
  'ធ្លាប់រួមភេទជាមួយបុគ្គលដែលគេដឹងថាមានផ្ទុកមេរោគអេដស៍',
  '(សម្រាប់បុរស) ធ្លាប់រួមភេទជាមួយស្ត្រី',
  '(សម្រាប់បុរស) ធ្លាប់រួមភេទជាមួយបុរស',
  '(សម្រាប់បុរស) ធ្លាប់រួមភេទជាមួយក្រុមប្លែងភេទ',
  'ធ្លាប់រួមភេទជាមួយមនុស្សលើសពី៤នាក់',
  'ធ្លាប់ចាក់ថ្នាំញៀន',
  'ធ្លាប់ប្រើម្ជុលស៊ីរាំងរួមគ្នា',
  'ទទួលបានប្រាក់សម្រាប់ការរួមភេទ',
  'បានផ្តល់ប្រាក់សម្រាប់ការរួមភេទ',
  'ធ្លាប់ធ្វើចំណាកស្រុកទៅរកការងារ (ក្នុង ឬក្រៅប្រទេស)'
]

/** Backend sectionNumber (1-based order) -> Khmer label for សូចនាករ column */
const PNTT_INDICATOR_KHMER = {
  1: 'កត្តាប្រឈម អ្នកចុះឈ្មោះថ្មី (១-១០)',
  2: 'កត្តាប្រឈម ករណីតាមដានបន្ត (១.១-១០.១)',
  3: 'ចំនួនអ្នកជំងឺតម្រុយ (>១៤ ឆ្នាំ) ក្នុងត្រីមាស',
  4: 'ចំនួនអ្នកជំងឺតម្រុយ ដែលបានផ្តល់សេវាតាមរកដៃគូ',
  5: 'ចំនួនអ្នកជំងឺតម្រុយ ដែលយល់ព្រមទទួលយកសេវាតាមរកដៃគូ',
  6: 'ចំនួនដៃគូដែលបានចុះបញ្ជី',
  7: 'ចំនួនដៃគូដែលបានជួបជូនព័ត៌មាន',
  8: 'ចំនួនដៃគូដែលបានធ្វើតេស្តរកមេរោគអេដស៍',
  9: 'ចំនួនដៃគូដែលបានធ្វើតេស្តរកមេរោគអេដស៍ហើយមានលទ្ធផលវិជ្ជមាន',
  10: 'ចំនួនដៃគូដែលមានលទ្ធផលវិជ្ជមានបានចុះឈ្មោះទទួលការព្យាបាល សរុប',
  12: 'ចំនួនដៃគូដែលបានធ្វើតេស្តរកមេរោគអេដស៍ហើយមានលទ្ធផលវិជ្ជមាន',
  14: 'ចំនួនដៃគូដែលមានលទ្ធផលវិជ្ជមានបានចុះឈ្មោះទទួលការព្យាបាល សរុប',
  11: 'ចំនួនកូនអតិថិជនតម្រុយ ដែលបានចុះបញ្ជី',
  12: 'ចំនួនកូន ដែលបានជួប/ជូនព័ត៌មាន',
  13: 'ចំនួនកូនដែលបានធ្វើតេស្តរកមេរោគអេដស៍',
  14: 'ចំនួនកូនដែលបានធ្វើតេស្ត ហើយមានលទ្ធផលវិជ្ជមាន',
  15: 'ចំនួនកូន ដែលមានលទ្ធផលវិជ្ជមាន បានចុះឈ្មោះទទួលការព្យាបាល'
}

function getIndicatorLabelKh(section) {
  const n = section.sectionNumber
  return PNTT_INDICATOR_KHMER[n] || section.sectionLabelKh || section.sectionLabelEn || '—'
}

function getSectionsForBlock(block, sections) {
  if (!sections || sections.length === 0) return []
  if (Array.isArray(block.sectionNumbers) && block.sectionNumbers.length === 0) return sections
  if (block.sectionNumbers) {
    const set = new Set(block.sectionNumbers)
    return sections.filter((s) => set.has(s.sectionNumber))
  }
  return sections.filter((s) => s.sectionNumber >= 6)
}

/** Display indicator number in report: 11, 12, 13 for sections 3,4,5 and 14+ for section 6+ */
function getDisplayIndicatorNumber(sectionNumber) {
  return sectionNumber + 8
}

/** Partners block (14–18): structure with sub-indicators.
 *  Uses scriptId as the primary lookup so backend sectionNumber changes (e.g. adding 11.1)
 *  do not break the mapping.
 */
const PARTNERS_STRUCTURE = [
  {
    displayNum: 14,
    labelKh: 'ចំនួនដៃគូដែលបានចុះបញ្ជី',
    newSec: 8,
    oldSec: 9,
    newScriptId: '14_PNTT_NEW_PART_REG_aggregate',
    oldScriptId: '14.1_PNTT_OLD_PART_REG_aggregate'
  },
  {
    displayNum: 15,
    labelKh: 'ចំនួនដៃគូដែលបានជួបជូនព័ត៌មាន',
    subRows: [
      {
        labelKh: 'ដោយអ្នកជំងឺ',
        newSec: 10,
        oldSec: 11,
        newScriptId: '15_PNTT_NEW_PART_REF_aggregate',
        oldScriptId: '15.1_PNTT_OLD_PART_REF_aggregate'
      },
      {
        labelKh: 'ដោយអ្នកផ្តល់សេវា',
        newSec: 16,
        oldSec: 17,
        newScriptId: '18_PNTT_NEW_PART_PROV_aggregate',
        oldScriptId: '18.1_PNTT_OLD_PART_PROV_aggregate'
      },
      {
        labelKh: 'ដោយមានលក្ខខណ្ឌ',
        newSec: 33,
        oldSec: 35,
        newScriptId: '21_PNTT_NEW_PART_CONT_aggregate',
        oldScriptId: '21.1_PNTT_OLD_PART_CONT_aggregate'
      },
      {
        labelKh: 'ដោយអ្នកជំងឺ និងអ្នកផ្តល់សេវា',
        newSec: 37,
        oldSec: 39,
        newScriptId: '22_PNTT_NEW_PART_DUAL_aggregate',
        oldScriptId: '22.1_PNTT_OLD_PART_DUAL_aggregate'
      }
    ]
  },
  {
    displayNum: 16,
    labelKh: 'ចំនួនដៃគូដែលបានធ្វើតេស្តរកមេរោគអេដស៍',
    subRows: [
      {
        labelKh: 'ដៃគូដែលបានធ្វើតេស្តតាម HTS',
        newSec: 12,
        oldSec: 13,
        newScriptId: '16_PNTT_NEW_PART_HTS_aggregate',
        oldScriptId: '16.1_PNTT_OLD_PART_HTS_aggregate'
      },
      {
        labelKh: 'ដៃគូដែលបានធ្វើតេស្តតាមរយៈ HIVST',
        newSec: 19,
        oldSec: 21,
        newScriptId: '19_PNTT_NEW_PART_HIVST_aggregate',
        oldScriptId: '19.1_PNTT_OLD_PART_HIVST_aggregate'
      }
    ]
  },
  {
    displayNum: 17,
    labelKh: 'ចំនួនដៃគូដែលបានធ្វើតេស្តរកមេរោគអេដស៍ ហើយមានលទ្ធផលវិជ្ជមាន',
    subRows: [
      {
        labelKh: 'ដៃគូដែលបានធ្វើតេស្តដំបូងតាម HTS',
        newSec: 14,
        oldSec: 15,
        newScriptId: '17_PNTT_NEW_PART_HTS_POS_aggregate',
        oldScriptId: '17.1_PNTT_OLD_PART_HTS_POS_aggregate'
      },
      {
        labelKh: 'ដៃគូដែលបានធ្វើតេស្តដំបូងតាមរយៈ HIVST',
        newSec: 25,
        oldSec: 31,
        newScriptId: '20_PNTT_NEW_PART_HIVST_POS_aggregate',
        oldScriptId: '20.1_PNTT_OLD_PART_HIVST_POS_aggregate'
      }
    ]
  },
  {
    displayNum: 18,
    labelKh: 'ចំនួនដៃគូដែលមានលទ្ធផលវិជ្ជមានបានចុះឈ្មោះទទួលការព្យាបាល សរុប',
    newSec: 41,
    oldSec: 43,
    newScriptId: '23_PNTT_NEW_PART_POS_REG_aggregate',
    oldScriptId: '23.1_PNTT_OLD_PART_POS_REG_aggregate'
  }
]

/** Children block (19–23): section numbers + scriptIds for lookup (scriptId fallback when API order differs). */
const CHILDREN_STRUCTURE = [
  { displayNum: 19, labelKh: 'ចំនួនកូនអតិថិជនតម្រុយ ដែលបានចុះបញ្ជី', newSec: 18, oldSec: 20, newScriptId: '19_PNTT_NEW_CHILD_REG_aggregate', oldScriptId: '19.1_PNTT_OLD_CHILD_REG_aggregate' },
  {
    displayNum: 20,
    labelKh: 'ចំនួនកូន ដែលបានជួប/ជូនព័ត៌មាន',
    subRows: [
      { labelKh: 'ដោយអ្នកជំងឺ', newSec: 22, oldSec: 26, newScriptId: '20 PNTT_NEW_CHILD_PROV_aggregate', oldScriptId: '20.1 . PNTT_OLD_CHILD_PROV_aggregate' },
      { labelKh: 'ដោយអ្នកផ្តល់សេវា', newSec: 23, oldSec: 30, newScriptId: '20_PNTT_NEW_CHILD_REF_aggregate', oldScriptId: '20.1_PNTT_OLD_CHILD_REF_aggregate' },
      { labelKh: 'ដោយមានលក្ខខណ្ឌ', newSec: 25, oldSec: 27, newScriptId: '20.PNTT_NEW_CHILD_CONT_aggregate', oldScriptId: '20.1 PNTT_OLD_CHILD_CONT_aggregate' },
      { labelKh: 'ដោយអ្នកជំងឺ និងអ្នកផ្តល់សេវា', newSec: 29, oldSec: 28, newScriptId: '20.1_PNTT_NEW_CHILD_DUAL_aggregate', oldScriptId: '20.1 PNTT_OLD_CHILD_DUAL_aggregate' }
    ]
  },
  {
    displayNum: 21,
    labelKh: 'ចំនួនកូនដែលបានធ្វើតេស្តរកមេរោគអេដស៍',
    subRows: [
      { labelKh: 'កូនដែលបានធ្វើតេស្តតាម HTS', newSec: 32, oldSec: 34, newScriptId: '21_PNTT_NEW_CHILD_TEST_aggregate', oldScriptId: '21.1_PNTT_OLD_CHILD_TEST_aggregate' },
      { labelKh: 'កូនដែលបានធ្វើតេស្តតាមរយៈ HIVST', newSec: 0, oldSec: 0 }
    ]
  },
  {
    displayNum: 22,
    labelKh: 'ចំនួនកូនដែលបានធ្វើតេស្ត ហើយមានលទ្ធផលវិជ្ជមាន',
    subRows: [
      { labelKh: 'កូនដែលបានធ្វើតេស្តដំបូងតាម HTS', newSec: 36, oldSec: 38, newScriptId: '22_PNTT_NEW_CHILD_POS_aggregate', oldScriptId: '22.1_PNTT_OLD_CHILD_POS_aggregate' },
      { labelKh: 'កូនដែលបានធ្វើតេស្តដំបូងតាមរយៈ HIVST', newSec: 0, oldSec: 0 }
    ]
  },
  { displayNum: 23, labelKh: 'ចំនួនកូន ដែលមានលទ្ធផលវិជ្ជមាន បានចុះឈ្មោះទទួលការព្យាបាល', newSec: 40, oldSec: 42, newScriptId: '23_PNTT_NEW_CHILD_POS_REG_aggregate', oldScriptId: '23.1_PNTT_OLD_CHILD_POS_REG_aggregate' }
]

/** Layout: 3 sections with Khmer titles, each table = Indicator (Khmer) | New registrants | Follow-up cases */
const MainReportTable = ({ sections, loading, onSectionCellClick, selectedSite }) => {
  if (loading) {
    return (
      <div className="border border-border p-10 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted border-t-primary mx-auto" />
        <p className="mt-3 text-sm text-muted-foreground">Loading PNTT report...</p>
      </div>
    )
  }
  if (!sections || sections.length === 0) {
    return (
      <div className="border border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">No data for the selected period.</p>
        <p className="mt-1 text-xs text-muted-foreground">Select a site and quarter above.</p>
      </div>
    )
  }

  /** First section (risk): columns កត្តាប្រឈម | អ្នកចុះឈ្មោះថ្មី (ធ្លាប់, ៦ខែ, មិនធ្លាប់) | ករណីតាមដានបន្ត (ធ្លាប់, ៦ខែ, មិនធ្លាប់) */
  const tableHeaderRisk = (
    <>
      <tr className="bg-blue-800 border-b border-muted">
        <th className="border-r border-muted px-3 py-2.5 text-left font-bold text-white w-[28%]" rowSpan={2}>
          កត្តាប្រឈម
        </th>
        <th className="border-r border-muted px-2 py-2.5 text-center font-bold text-white bg-blue-800" colSpan={3}>
          អ្នកចុះឈ្មោះថ្មី
        </th>
        <th className="border-r border-muted px-2 py-2.5 text-center font-bold text-white bg-blue-800" colSpan={3}>
          ករណីតាមដានបន្ត
        </th>
      </tr>
      <tr className="bg-blue-800 border-b border-muted">
        <th className="border-r border-muted px-2 py-2 text-center font-medium text-white w-[12%]">ធ្លាប់</th>
        <th className="border-r border-muted px-2 py-2 text-center font-medium text-white w-[12%]">៦ខែ</th>
        <th className="border-r border-muted px-2 py-2 text-center font-medium text-white w-[12%]">មិនធ្លាប់</th>
        <th className="border-r border-muted px-2 py-2 text-center font-medium text-white w-[12%]">ធ្លាប់</th>
        <th className="border-r border-muted px-2 py-2 text-center font-medium text-white w-[12%]">៦ខែ</th>
        <th className="border-r border-muted px-2 py-2 text-center font-medium text-white w-[12%]">មិនធ្លាប់</th>
      </tr>
    </>
  )

  /** Index block (sections 3–5): combine NEW + OLD scripts into New vs Follow-up columns. */
  const renderIndexSectionRows = () => {
    const list = sections || []
    const sectionByScriptId = Object.fromEntries(list.filter((s) => s.scriptId).map((s) => [s.scriptId, s]))

    const INDEX_STRUCTURE = [
      {
        displayNum: 11,
        labelKh: PNTT_INDICATOR_KHMER[3] || 'ចំនួនអ្នកជំងឺតម្រុយ (>១៤ ឆ្នាំ) ក្នុងត្រីមាស',
        newScriptId: '11_PNTT_NEW_REG_aggregate',
        oldScriptId: '11.1_PNTT_OLD_REG_aggregate'
      },
      {
        displayNum: 12,
        labelKh: PNTT_INDICATOR_KHMER[4] || 'ចំនួនអ្នកជំងឺតម្រុយ ដែលបានផ្តល់សេវាតាមរកដៃគូ',
        newScriptId: '12_PNTT_NEW_PNS_aggregate',
        oldScriptId: '12.1_PNTT_OLD_PNS_aggregate'
      },
      {
        displayNum: 13,
        labelKh: PNTT_INDICATOR_KHMER[5] || 'ចំនួនអ្នកជំងឺតម្រុយ ដែលយល់ព្រមទទួលយកសេវាតាមរកដៃគូ',
        newScriptId: '13_PNTT_NEW_AGREE_aggregate',
        oldScriptId: '13.1_PNTT_OLD_AGREE_aggregate'
      }
    ]

    return INDEX_STRUCTURE.map((item) => {
      const newSec = sectionByScriptId[item.newScriptId]
      const oldSec = item.oldScriptId ? sectionByScriptId[item.oldScriptId] : null
      const newR = newSec?.rows?.[0] || {}
      const oldR = oldSec?.rows?.[0] || {}

      const newMale = newR.male ?? 0
      const newFemale = newR.female ?? 0
      const newTotal = newR.total ?? (newMale + newFemale)
      const followupMale = oldR.male ?? 0
      const followupFemale = oldR.female ?? 0
      const followupTotal = oldR.total ?? (followupMale + followupFemale)

      const newScriptId = newSec ? getDetailScriptId(newSec) : null
      const oldScriptId = oldSec ? getDetailScriptId(oldSec) : null
      const isNewClickable = onSectionCellClick && newScriptId && selectedSite?.code
      const isFollowupClickable = onSectionCellClick && oldScriptId && selectedSite?.code
      const cellClickNew = (col) => (e) => {
        e.stopPropagation()
        if (isNewClickable && newSec) onSectionCellClick(newSec, newR, 0, col)
      }
      const cellClickFollowup = (col) => (e) => {
        e.stopPropagation()
        if (isFollowupClickable && oldSec) onSectionCellClick(oldSec, oldR, 0, col)
      }

      const labelKh = item.labelKh
      const isSubtotal = false

      return (
        <tr
          key={`index-${item.displayNum}`}
          className="hover:bg-muted/25 transition-colors print:bg-transparent"
        >
          <td className="border border-border px-3 py-2 text-foreground align-top w-[28%] break-words font-medium">
            <span className="block">{item.displayNum}. {labelKh}</span>
            {(newR.error || oldR.error) && (
              <div className="text-destructive text-xs mt-0.5">
                {newR.error || oldR.error}
              </div>
            )}
          </td>
          <td
            role={isNewClickable ? 'button' : undefined}
            tabIndex={isNewClickable ? 0 : undefined}
            onClick={isNewClickable ? cellClickNew('male') : undefined}
            onKeyDown={isNewClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellClickNew('male')(e) } } : undefined}
            className={`border border-border px-2 py-2 text-right tabular-nums text-lg underline ${newMale > 0 ? 'text-blue-600' : 'text-blue-600/60'} ${isNewClickable ? 'cursor-pointer hover:bg-muted/40' : ''}`}
          >
            {String(newMale).toLocaleString()}
          </td>
          <td
            role={isNewClickable ? 'button' : undefined}
            tabIndex={isNewClickable ? 0 : undefined}
            onClick={isNewClickable ? cellClickNew('female') : undefined}
            onKeyDown={isNewClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellClickNew('female')(e) } } : undefined}
            className={`border border-border px-2 py-2 text-right tabular-nums text-lg underline ${newFemale > 0 ? 'text-pink-600' : 'text-pink-600/60'} ${isNewClickable ? 'cursor-pointer hover:bg-muted/40' : ''}`}
          >
            {String(newFemale).toLocaleString()}
          </td>
          <td
            role={isNewClickable ? 'button' : undefined}
            tabIndex={isNewClickable ? 0 : undefined}
            onClick={isNewClickable ? cellClickNew('total') : undefined}
            onKeyDown={isNewClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellClickNew('total')(e) } } : undefined}
            className={`border border-border px-2 py-2 text-right tabular-nums text-lg text-foreground ${isSubtotal ? 'font-bold underline' : ''} ${isNewClickable ? 'cursor-pointer hover:bg-muted/40' : ''}`}
          >
            {String(newTotal).toLocaleString()}
          </td>
          <td
            role={isFollowupClickable ? 'button' : undefined}
            tabIndex={isFollowupClickable ? 0 : undefined}
            onClick={isFollowupClickable ? cellClickFollowup('male') : undefined}
            onKeyDown={isFollowupClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellClickFollowup('male')(e) } } : undefined}
            className={`border border-border px-2 py-2 text-right tabular-nums text-lg underline ${followupMale > 0 ? 'text-blue-600' : 'text-blue-600/60'} ${isFollowupClickable ? 'cursor-pointer hover:bg-muted/40' : ''}`}
          >
            {String(followupMale).toLocaleString()}
          </td>
          <td
            role={isFollowupClickable ? 'button' : undefined}
            tabIndex={isFollowupClickable ? 0 : undefined}
            onClick={isFollowupClickable ? cellClickFollowup('female') : undefined}
            onKeyDown={isFollowupClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellClickFollowup('female')(e) } } : undefined}
            className={`border border-border px-2 py-2 text-right tabular-nums text-lg underline ${followupFemale > 0 ? 'text-pink-600' : 'text-pink-600/60'} ${isFollowupClickable ? 'cursor-pointer hover:bg-muted/40' : ''}`}
          >
            {String(followupFemale).toLocaleString()}
          </td>
          <td
            role={isFollowupClickable ? 'button' : undefined}
            tabIndex={isFollowupClickable ? 0 : undefined}
            onClick={isFollowupClickable ? cellClickFollowup('total') : undefined}
            onKeyDown={isFollowupClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellClickFollowup('total')(e) } } : undefined}
            className={`border border-border px-2 py-2 text-right tabular-nums text-lg text-foreground ${isSubtotal ? 'font-bold underline' : ''} ${isFollowupClickable ? 'cursor-pointer hover:bg-muted/40' : ''}`}
          >
            {String(followupTotal).toLocaleString()}
          </td>
        </tr>
      )
    })
  }

  const tableHeader = (
    <>
      <tr className="bg-blue-800 border-b border-muted">
        <th className="border-r border-muted px-3 py-2.5 text-left font-bold text-white w-[28%] align-middle" rowSpan={2}>
          សូចនាករ
        </th>
        <th className="border-r border-muted px-2 py-2.5 text-center font-bold text-white bg-blue-800" colSpan={3}>
          អ្នកចុះឈ្មោះថ្មី
        </th>
        <th className="border-r border-muted px-2 py-2.5 text-center font-bold text-white bg-blue-800" colSpan={3}>
          ករណីតាមដានបន្ត
        </th>
      </tr>
      <tr className="bg-blue-800 border-b border-muted">
        <th className="border-r border-muted px-2 py-2 text-center font-medium text-white w-[12%]">ប្រុស</th>
        <th className="border-r border-muted px-2 py-2 text-center font-medium text-white w-[12%]">ស្រី</th>
        <th className="border-r border-muted px-2 py-2 text-center font-medium text-white w-[12%]">សរុប</th>
        <th className="border-r border-muted px-2 py-2 text-center font-medium text-white w-[12%]">ប្រុស</th>
        <th className="border-r border-muted px-2 py-2 text-center font-medium text-white w-[12%]">ស្រី</th>
        <th className="border-r border-muted px-2 py-2 text-center font-medium text-white w-[12%]">សរុប</th>
      </tr>
    </>
  )

  /** Partners block (section 3): សូចនាករ (rowSpan 2) | អ្នកចុះឈ្មោះថ្មី (ប្រុស ស្រី សរុប) | ករណីតាមដានបន្ត (ប្រុស ស្រី សរុប) */
  const tableHeaderPartners = (
    <>
      <tr className="bg-blue-800 border-b border-muted">
        <th className="border-r border-muted px-3 py-2.5 text-left font-bold text-white w-[40%] align-middle" rowSpan={2} colSpan={2}>
          សូចនាករ
        </th>
        <th className="border-r border-muted px-2 py-2.5 text-center font-bold text-white bg-blue-800" colSpan={3}>
          អ្នកចុះឈ្មោះថ្មី
        </th>
        <th className="border-r border-muted px-2 py-2.5 text-center font-bold text-white bg-blue-800" colSpan={3}>
          ករណីតាមដានបន្ត
        </th>
      </tr>
      <tr className="bg-blue-800 border-b border-muted">
        <th className="border-r border-muted px-2 py-2 text-center font-medium text-white w-[10%]">ប្រុស</th>
        <th className="border-r border-muted px-2 py-2 text-center font-medium text-white w-[10%]">ស្រី</th>
        <th className="border-r border-muted px-2 py-2 text-center font-medium text-white w-[10%]">សរុប</th>
        <th className="border-r border-muted px-2 py-2 text-center font-medium text-white w-[10%]">ប្រុស</th>
        <th className="border-r border-muted px-2 py-2 text-center font-medium text-white w-[10%]">ស្រី</th>
        <th className="border-r border-muted px-2 py-2 text-center font-medium text-white w-[10%]">សរុប</th>
      </tr>
    </>
  )

  /** First block: 10 risk rows from section 1 (new) + section 2 (follow-up). Cells clickable when detail script exists. */
  const renderRiskSectionRows = (blockSections) => {
    const sectionNew = blockSections[0]
    const sectionFollow = blockSections[1]
    const newRows = sectionNew?.rows ?? []
    const followRows = sectionFollow?.rows ?? []
    const n = Math.max(newRows.length, followRows.length, 10)
    const newScriptId = sectionNew ? getDetailScriptId(sectionNew) : null
    const followScriptId = sectionFollow ? getDetailScriptId(sectionFollow) : null
    const isNewClickable = onSectionCellClick && newScriptId && selectedSite?.code
    const isFollowClickable = onSectionCellClick && followScriptId && selectedSite?.code
    const cellClickNew = (col) => (e) => {
      e?.stopPropagation?.()
      if (isNewClickable && sectionNew) onSectionCellClick(sectionNew, newRows[col.rowIdx] || {}, col.rowIdx, col.column)
    }
    const cellClickFollow = (col) => (e) => {
      e?.stopPropagation?.()
      if (isFollowClickable && sectionFollow) onSectionCellClick(sectionFollow, followRows[col.rowIdx] || {}, col.rowIdx, col.column)
    }
    return Array.from({ length: n }, (_, i) => {
      const newRow = newRows[i] || {}
      const followRow = followRows[i] || {}
      const newEver = newRow.ever ?? 0
      const new6Months = newRow.sixMonths ?? 0
      const newNever = newRow.never ?? 0
      const followEver = followRow.ever ?? 0
      const follow6Months = followRow.sixMonths ?? 0
      const followNever = followRow.never ?? 0
      const labelKh = RISK_INDICATOR_KHMER[i] ?? `កត្តាប្រឈម ${i + 1}`
      const isZebra = i % 2 === 1
      const newEverCol = { rowIdx: i, column: 'ever' }
      const new6Col = { rowIdx: i, column: 'sixMonths' }
      const newNeverCol = { rowIdx: i, column: 'never' }
      return (
        <tr
          key={`risk-${i}`}
          className={`${isZebra ? 'bg-muted/20 ' : ''}print:bg-transparent hover:bg-muted/25 transition-colors`}
        >
          <td className="border border-border px-3 py-2 text-foreground align-top w-[28%] break-words font-medium">
            {i + 1}. {labelKh}
          </td>
          <td
            role={isNewClickable ? 'button' : undefined}
            tabIndex={isNewClickable ? 0 : undefined}
            onClick={isNewClickable ? cellClickNew(newEverCol) : undefined}
            onKeyDown={isNewClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellClickNew(newEverCol)(e) } } : undefined}
            className={`border border-border px-2 py-2 text-right tabular-nums text-lg underline ${newEver > 0 ? 'text-blue-600' : 'text-blue-600/60'} ${isNewClickable ? 'cursor-pointer hover:bg-muted/40' : ''}`}
          >
            {String(newEver).toLocaleString()}
          </td>
          <td
            role={isNewClickable ? 'button' : undefined}
            tabIndex={isNewClickable ? 0 : undefined}
            onClick={isNewClickable ? cellClickNew(new6Col) : undefined}
            onKeyDown={isNewClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellClickNew(new6Col)(e) } } : undefined}
            className={`border border-border px-2 py-2 text-right tabular-nums text-lg underline ${new6Months > 0 ? 'text-pink-600' : 'text-pink-600/60'} ${isNewClickable ? 'cursor-pointer hover:bg-muted/40' : ''}`}
          >
            {String(new6Months).toLocaleString()}
          </td>
          <td
            role={isNewClickable ? 'button' : undefined}
            tabIndex={isNewClickable ? 0 : undefined}
            onClick={isNewClickable ? cellClickNew(newNeverCol) : undefined}
            onKeyDown={isNewClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellClickNew(newNeverCol)(e) } } : undefined}
            className={`border border-border px-2 py-2 text-right tabular-nums text-lg text-foreground underline ${isNewClickable ? 'cursor-pointer hover:bg-muted/40' : ''}`}
          >
            {String(newNever).toLocaleString()}
          </td>
          <td
            role={isFollowClickable ? 'button' : undefined}
            tabIndex={isFollowClickable ? 0 : undefined}
            onClick={isFollowClickable ? cellClickFollow(newEverCol) : undefined}
            onKeyDown={isFollowClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellClickFollow(newEverCol)(e) } } : undefined}
            className={`border border-border px-2 py-2 text-right tabular-nums text-lg underline ${followEver > 0 ? 'text-blue-600' : 'text-blue-600/60'} ${isFollowClickable ? 'cursor-pointer hover:bg-muted/40' : ''}`}
          >
            {String(followEver).toLocaleString()}
          </td>
          <td
            role={isFollowClickable ? 'button' : undefined}
            tabIndex={isFollowClickable ? 0 : undefined}
            onClick={isFollowClickable ? cellClickFollow(new6Col) : undefined}
            onKeyDown={isFollowClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellClickFollow(new6Col)(e) } } : undefined}
            className={`border border-border px-2 py-2 text-right tabular-nums text-lg underline ${follow6Months > 0 ? 'text-pink-600' : 'text-pink-600/60'} ${isFollowClickable ? 'cursor-pointer hover:bg-muted/40' : ''}`}
          >
            {String(follow6Months).toLocaleString()}
          </td>
          <td
            role={isFollowClickable ? 'button' : undefined}
            tabIndex={isFollowClickable ? 0 : undefined}
            onClick={isFollowClickable ? cellClickFollow(newNeverCol) : undefined}
            onKeyDown={isFollowClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellClickFollow(newNeverCol)(e) } } : undefined}
            className={`border border-border px-2 py-2 text-right tabular-nums text-lg text-muted-foreground underline ${isFollowClickable ? 'cursor-pointer hover:bg-muted/40' : ''}`}
          >
            {String(followNever).toLocaleString()}
          </td>
        </tr>
      )
    })
  }

  /** Block 3 (Partners): indicators 14–18 with sub-indicators and សរុប rows */
  const renderPartnersSectionRows = () => {
    const sectionByNum = Object.fromEntries((sections || []).map((s) => [s.sectionNumber, s]))
    const sectionByScriptId = Object.fromEntries(
      (sections || [])
        .filter((s) => s.scriptId)
        .map((s) => [s.scriptId, s])
    )

    const getRowData = (newSec, oldSec, newScriptId, oldScriptId) => {
      const newS = (newScriptId ? sectionByScriptId[newScriptId] : null) ?? sectionByNum[newSec]
      const oldS = (oldScriptId ? sectionByScriptId[oldScriptId] : null) ?? sectionByNum[oldSec]
      const newR = newS?.rows?.[0] || {}
      const oldR = oldS?.rows?.[0] || {}
      return {
        newMale: newR.male ?? 0,
        newFemale: newR.female ?? 0,
        newTotal: newR.total ?? (newR.male ?? 0) + (newR.female ?? 0),
        followupMale: oldR.male ?? 0,
        followupFemale: oldR.female ?? 0,
        followupTotal: oldR.total ?? (oldR.male ?? 0) + (oldR.female ?? 0),
        newSection: newS,
        newRow: newR,
        oldSection: oldS,
        oldRow: oldR
      }
    }

    const renderDataRow = (key, mainLabel, subLabel, data, isSubtotal, isSubRow, firstColRowSpan, mergeFirstTwoCols) => {
      const newSec = data.newSection
      const oldSec = data.oldSection
      const newScriptId = newSec ? getDetailScriptId(newSec) : null
      const oldScriptId = oldSec ? getDetailScriptId(oldSec) : null
      const isNewClickable = onSectionCellClick && newScriptId && selectedSite?.code
      const isFollowupClickable = onSectionCellClick && oldScriptId && selectedSite?.code
      const cellClickNew = (col) => (e) => {
        e.stopPropagation()
        if (isNewClickable && newSec) onSectionCellClick(newSec, data.newRow, 0, col)
      }
      const cellClickFollowup = (col) => (e) => {
        e.stopPropagation()
        if (isFollowupClickable && oldSec) onSectionCellClick(oldSec, data.oldRow, 0, col)
      }
      const showFirstCol = firstColRowSpan !== 0
      return (
        <tr
          key={key}
          className={`${isSubtotal ? 'bg-muted font-semibold' : 'hover:bg-muted/25'} transition-colors print:bg-transparent`}
        >
          {showFirstCol && (
            <td
              rowSpan={firstColRowSpan ?? 1}
              colSpan={mergeFirstTwoCols ? 2 : 1}
              className={`border border-border px-3 py-2 text-foreground break-words align-middle ${mergeFirstTwoCols ? 'w-[40%]' : 'w-[22%]'} ${isSubtotal ? 'font-bold' : mainLabel ? 'font-medium' : ''}`}
            >
              {mainLabel}
            </td>
          )}
          {!mergeFirstTwoCols && (
            <td className={`border border-border px-3 py-2 text-foreground align-top w-[18%] break-words ${isSubtotal ? 'font-bold' : 'font-normal'}`}>
              {subLabel}
            </td>
          )}
          <td
            role={isNewClickable ? 'button' : undefined}
            tabIndex={isNewClickable ? 0 : undefined}
            onClick={isNewClickable ? cellClickNew('male') : undefined}
            onKeyDown={isNewClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellClickNew('male')(e) } } : undefined}
            className={`border border-border px-2 py-2 text-right tabular-nums text-lg underline ${data.newMale > 0 ? 'text-blue-600' : 'text-blue-600/60'} ${isNewClickable ? 'cursor-pointer hover:bg-muted/40' : ''} ${isSubtotal ? 'font-bold' : ''}`}
          >
            {String(data.newMale).toLocaleString()}
          </td>
          <td
            role={isNewClickable ? 'button' : undefined}
            tabIndex={isNewClickable ? 0 : undefined}
            onClick={isNewClickable ? cellClickNew('female') : undefined}
            onKeyDown={isNewClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellClickNew('female')(e) } } : undefined}
            className={`border border-border px-2 py-2 text-right tabular-nums text-lg underline ${data.newFemale > 0 ? 'text-pink-600' : 'text-pink-600/60'} ${isNewClickable ? 'cursor-pointer hover:bg-muted/40' : ''} ${isSubtotal ? 'font-bold' : ''}`}
          >
            {String(data.newFemale).toLocaleString()}
          </td>
          <td
            role={isNewClickable ? 'button' : undefined}
            tabIndex={isNewClickable ? 0 : undefined}
            onClick={isNewClickable ? cellClickNew('total') : undefined}
            onKeyDown={isNewClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellClickNew('total')(e) } } : undefined}
            className={`border border-border px-2 py-2 text-right tabular-nums text-lg text-foreground ${isSubtotal ? 'font-bold underline' : ''} ${isNewClickable ? 'cursor-pointer hover:bg-muted/40' : ''}`}
          >
            {String(data.newTotal).toLocaleString()}
          </td>
          <td
            role={isFollowupClickable ? 'button' : undefined}
            tabIndex={isFollowupClickable ? 0 : undefined}
            onClick={isFollowupClickable ? cellClickFollowup('male') : undefined}
            onKeyDown={isFollowupClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellClickFollowup('male')(e) } } : undefined}
            className={`border border-border px-2 py-2 text-right tabular-nums text-lg underline ${data.followupMale > 0 ? 'text-blue-600' : 'text-blue-600/60'} ${isFollowupClickable ? 'cursor-pointer hover:bg-muted/40' : ''} ${isSubtotal ? 'font-bold' : ''}`}
          >
            {String(data.followupMale).toLocaleString()}
          </td>
          <td
            role={isFollowupClickable ? 'button' : undefined}
            tabIndex={isFollowupClickable ? 0 : undefined}
            onClick={isFollowupClickable ? cellClickFollowup('female') : undefined}
            onKeyDown={isFollowupClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellClickFollowup('female')(e) } } : undefined}
            className={`border border-border px-2 py-2 text-right tabular-nums text-lg underline ${data.followupFemale > 0 ? 'text-pink-600' : 'text-pink-600/60'} ${isFollowupClickable ? 'cursor-pointer hover:bg-muted/40' : ''} ${isSubtotal ? 'font-bold' : ''}`}
          >
            {String(data.followupFemale).toLocaleString()}
          </td>
          <td
            role={isFollowupClickable ? 'button' : undefined}
            tabIndex={isFollowupClickable ? 0 : undefined}
            onClick={isFollowupClickable ? cellClickFollowup('total') : undefined}
            onKeyDown={isFollowupClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellClickFollowup('total')(e) } } : undefined}
            className={`border border-border px-2 py-2 text-right tabular-nums text-lg text-foreground ${isSubtotal ? 'font-bold underline' : ''} ${isFollowupClickable ? 'cursor-pointer hover:bg-muted/40' : ''}`}
          >
            {String(data.followupTotal).toLocaleString()}
          </td>
        </tr>
      )
    }

    const rows = []
    PARTNERS_STRUCTURE.forEach((item) => {
      if (item.subRows) {
        const subDatas = item.subRows.map((sub) =>
          getRowData(sub.newSec, sub.oldSec, sub.newScriptId, sub.oldScriptId)
        )
        const spanCount = item.subRows.length + 1
        item.subRows.forEach((sub, i) => {
          rows.push(renderDataRow(
            `p-${item.displayNum}-sub-${i}`,
            i === 0 ? `${item.displayNum}. ${item.labelKh}` : '',
            sub.labelKh,
            subDatas[i],
            false,
            true,
            i === 0 ? spanCount : 0,
            false
          ))
        })
        const totalNewMale = subDatas.reduce((s, d) => s + d.newMale, 0)
        const totalNewFemale = subDatas.reduce((s, d) => s + d.newFemale, 0)
        const totalFollowupMale = subDatas.reduce((s, d) => s + d.followupMale, 0)
        const totalFollowupFemale = subDatas.reduce((s, d) => s + d.followupFemale, 0)
        rows.push(renderDataRow(
          `p-${item.displayNum}-total`,
          '',
          'សរុប',
          {
            newMale: totalNewMale,
            newFemale: totalNewFemale,
            newTotal: totalNewMale + totalNewFemale,
            followupMale: totalFollowupMale,
            followupFemale: totalFollowupFemale,
            followupTotal: totalFollowupMale + totalFollowupFemale,
            newSection: null,
            newRow: {},
            oldSection: null,
            oldRow: {}
          },
          true,
          false,
          0,
          false
        ))
      } else {
        rows.push(renderDataRow(
          `p-${item.displayNum}`,
          `${item.displayNum}. ${item.labelKh}`,
          '',
          getRowData(item.newSec, item.oldSec, item.newScriptId, item.oldScriptId),
          false,
          false,
          1,
          true
        ))
      }
    })
    return rows
  }

  /** Block 4 (Children): indicators 19–23, same layout as Partners. Section 0 => zeros. Look up by section number or scriptId. */
  const renderChildrenSectionRows = () => {
    const list = sections || []
    const sectionByNum = Object.fromEntries(list.map((s) => [s.sectionNumber, s]))
    const sectionByScriptId = Object.fromEntries(list.filter((s) => s.scriptId).map((s) => [s.scriptId, s]))

    const getRowData = (newSec, oldSec, newScriptId, oldScriptId) => {
      if (newSec === 0 || oldSec === 0) {
        return { newMale: 0, newFemale: 0, newTotal: 0, followupMale: 0, followupFemale: 0, followupTotal: 0, newSection: null, newRow: {}, oldSection: null, oldRow: {} }
      }
      const newS = (newScriptId ? sectionByScriptId[newScriptId] : null) ?? sectionByNum[newSec]
      const oldS = (oldScriptId ? sectionByScriptId[oldScriptId] : null) ?? sectionByNum[oldSec]
      const newR = newS?.rows?.[0] || {}
      const oldR = oldS?.rows?.[0] || {}
      return {
        newMale: newR.male ?? 0,
        newFemale: newR.female ?? 0,
        newTotal: newR.total ?? (newR.male ?? 0) + (newR.female ?? 0),
        followupMale: oldR.male ?? 0,
        followupFemale: oldR.female ?? 0,
        followupTotal: oldR.total ?? (oldR.male ?? 0) + (oldR.female ?? 0),
        newSection: newS,
        newRow: newR,
        oldSection: oldS,
        oldRow: oldR
      }
    }

    const renderDataRow = (key, mainLabel, subLabel, data, isSubtotal, isSubRow, firstColRowSpan, mergeFirstTwoCols) => {
      const newSec = data.newSection
      const oldSec = data.oldSection
      const newScriptId = newSec ? getDetailScriptId(newSec) : null
      const oldScriptId = oldSec ? getDetailScriptId(oldSec) : null
      const isNewClickable = onSectionCellClick && newScriptId && selectedSite?.code
      const isFollowupClickable = onSectionCellClick && oldScriptId && selectedSite?.code
      const cellClickNew = (col) => (e) => {
        e.stopPropagation()
        if (isNewClickable && newSec) onSectionCellClick(newSec, data.newRow, 0, col)
      }
      const cellClickFollowup = (col) => (e) => {
        e.stopPropagation()
        if (isFollowupClickable && oldSec) onSectionCellClick(oldSec, data.oldRow, 0, col)
      }
      const showFirstCol = firstColRowSpan !== 0
      return (
        <tr key={key} className={`${isSubtotal ? 'bg-muted font-semibold' : 'hover:bg-muted/25'} transition-colors print:bg-transparent`}>
          {showFirstCol && (
            <td rowSpan={firstColRowSpan ?? 1} colSpan={mergeFirstTwoCols ? 2 : 1}
              className={`border border-border px-3 py-2 text-foreground break-words align-middle ${mergeFirstTwoCols ? 'w-[40%]' : 'w-[22%]'} ${isSubtotal ? 'font-bold' : mainLabel ? 'font-medium' : ''}`}>
              {mainLabel}
            </td>
          )}
          {!mergeFirstTwoCols && (
            <td className={`border border-border px-3 py-2 text-foreground align-top w-[18%] break-words ${isSubtotal ? 'font-bold' : 'font-normal'}`}>
              {subLabel}
            </td>
          )}
          <td role={isNewClickable ? 'button' : undefined} tabIndex={isNewClickable ? 0 : undefined} onClick={isNewClickable ? (e) => { e.stopPropagation(); cellClickNew('male')(e) } : undefined} onKeyDown={isNewClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellClickNew('male')(e) } } : undefined}
            className={`border border-border px-2 py-2 text-right tabular-nums text-lg underline ${data.newMale > 0 ? 'text-blue-600' : 'text-blue-600/60'} ${isNewClickable ? 'cursor-pointer hover:bg-muted/40' : ''} ${isSubtotal ? 'font-bold' : ''}`}>
            {String(data.newMale).toLocaleString()}
          </td>
          <td role={isNewClickable ? 'button' : undefined} tabIndex={isNewClickable ? 0 : undefined} onClick={isNewClickable ? (e) => { e.stopPropagation(); cellClickNew('female')(e) } : undefined} onKeyDown={isNewClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellClickNew('female')(e) } } : undefined}
            className={`border border-border px-2 py-2 text-right tabular-nums text-lg underline ${data.newFemale > 0 ? 'text-pink-600' : 'text-pink-600/60'} ${isNewClickable ? 'cursor-pointer hover:bg-muted/40' : ''} ${isSubtotal ? 'font-bold' : ''}`}>
            {String(data.newFemale).toLocaleString()}
          </td>
          <td role={isNewClickable ? 'button' : undefined} tabIndex={isNewClickable ? 0 : undefined} onClick={isNewClickable ? (e) => { e.stopPropagation(); cellClickNew('total')(e) } : undefined} onKeyDown={isNewClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellClickNew('total')(e) } } : undefined}
            className={`border border-border px-2 py-2 text-right tabular-nums text-lg text-foreground ${isSubtotal ? 'font-bold underline' : ''} ${isNewClickable ? 'cursor-pointer hover:bg-muted/40' : ''}`}>
            {String(data.newTotal).toLocaleString()}
          </td>
          <td role={isFollowupClickable ? 'button' : undefined} tabIndex={isFollowupClickable ? 0 : undefined} onClick={isFollowupClickable ? (e) => { e.stopPropagation(); cellClickFollowup('male')(e) } : undefined} onKeyDown={isFollowupClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellClickFollowup('male')(e) } } : undefined}
            className={`border border-border px-2 py-2 text-right tabular-nums text-lg underline ${data.followupMale > 0 ? 'text-blue-600' : 'text-blue-600/60'} ${isFollowupClickable ? 'cursor-pointer hover:bg-muted/40' : ''} ${isSubtotal ? 'font-bold' : ''}`}>
            {String(data.followupMale).toLocaleString()}
          </td>
          <td role={isFollowupClickable ? 'button' : undefined} tabIndex={isFollowupClickable ? 0 : undefined} onClick={isFollowupClickable ? (e) => { e.stopPropagation(); cellClickFollowup('female')(e) } : undefined} onKeyDown={isFollowupClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellClickFollowup('female')(e) } } : undefined}
            className={`border border-border px-2 py-2 text-right tabular-nums text-lg underline ${data.followupFemale > 0 ? 'text-pink-600' : 'text-pink-600/60'} ${isFollowupClickable ? 'cursor-pointer hover:bg-muted/40' : ''} ${isSubtotal ? 'font-bold' : ''}`}>
            {String(data.followupFemale).toLocaleString()}
          </td>
          <td role={isFollowupClickable ? 'button' : undefined} tabIndex={isFollowupClickable ? 0 : undefined} onClick={isFollowupClickable ? (e) => { e.stopPropagation(); cellClickFollowup('total')(e) } : undefined} onKeyDown={isFollowupClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellClickFollowup('total')(e) } } : undefined}
            className={`border border-border px-2 py-2 text-right tabular-nums text-lg text-foreground ${isSubtotal ? 'font-bold underline' : ''} ${isFollowupClickable ? 'cursor-pointer hover:bg-muted/40' : ''}`}>
            {String(data.followupTotal).toLocaleString()}
          </td>
        </tr>
      )
    }

    const rows = []
    CHILDREN_STRUCTURE.forEach((item) => {
      if (item.subRows) {
        const subDatas = item.subRows.map((sub) => getRowData(sub.newSec, sub.oldSec, sub.newScriptId, sub.oldScriptId))
        const hasTotalRow = !item.subRows.some((s) => s.labelKh === 'សរុប')
        const spanCount = item.subRows.length + (hasTotalRow ? 1 : 0)
        item.subRows.forEach((sub, i) => {
          rows.push(renderDataRow(`c-${item.displayNum}-sub-${i}`, i === 0 ? `${item.displayNum}. ${item.labelKh}` : '', sub.labelKh, subDatas[i], sub.labelKh === 'សរុប', true, i === 0 ? spanCount : 0, false))
        })
        if (hasTotalRow) {
          const totalNewMale = subDatas.reduce((s, d) => s + d.newMale, 0)
          const totalNewFemale = subDatas.reduce((s, d) => s + d.newFemale, 0)
          const totalFollowupMale = subDatas.reduce((s, d) => s + d.followupMale, 0)
          const totalFollowupFemale = subDatas.reduce((s, d) => s + d.followupFemale, 0)
          rows.push(renderDataRow(`c-${item.displayNum}-total`, '', 'សរុប', { newMale: totalNewMale, newFemale: totalNewFemale, newTotal: totalNewMale + totalNewFemale, followupMale: totalFollowupMale, followupFemale: totalFollowupFemale, followupTotal: totalFollowupMale + totalFollowupFemale, newSection: null, newRow: {}, oldSection: null, oldRow: {} }, true, false, 0, false))
        }
      } else {
        const data = getRowData(item.newSec, item.oldSec, item.newScriptId, item.oldScriptId)
        rows.push(renderDataRow(`c-${item.displayNum}`, `${item.displayNum}. ${item.labelKh}`, '', data, false, false, 1, true))
      }
    })
    return rows
  }

  const renderSectionRows = (blockSections) =>
    blockSections.map((section) => (
      <React.Fragment key={section.sectionNumber}>
        {section.rows.map((row, rowIdx) => {
          const isSubtotal = row.isSubtotal
          const detailScriptId = !isSubtotal ? getDetailScriptId(section) : null
          const isCellClickable = onSectionCellClick && detailScriptId && selectedSite?.code
          const cellClick = (col) => (e) => {
            e.stopPropagation()
            if (isCellClickable) onSectionCellClick(section, row, rowIdx, col)
          }
          const isZebra = !isSubtotal && (section.sectionNumber + rowIdx) % 2 === 1
          const newMale = row.newMale ?? row.male ?? 0
          const newFemale = row.newFemale ?? row.female ?? 0
          const newTotal = row.newTotal ?? row.total ?? 0
          const followupMale = row.followupMale ?? 0
          const followupFemale = row.followupFemale ?? 0
          const followupTotal = row.followupTotal ?? 0
          const labelKh = rowIdx === 0 ? getIndicatorLabelKh(section) : (row.labelKh || row.labelEn || '—')
          return (
            <tr
              key={`${section.sectionNumber}-${rowIdx}`}
              className={`${isSubtotal ? 'bg-muted font-semibold' : `${isZebra ? 'bg-muted/20 ' : ''}print:bg-transparent`} hover:bg-muted/25 transition-colors`}
            >
              <td className={`border border-border px-3 py-2 text-foreground align-top w-[28%] break-words ${rowIdx === 0 ? 'font-medium' : 'pl-6'}`}>
                <span className="block">{getDisplayIndicatorNumber(section.sectionNumber)}. {labelKh}</span>
                {rowIdx === 0 && row.error && <div className="text-destructive text-xs mt-0.5">{row.error}</div>}
              </td>
              <td
                role={isCellClickable ? 'button' : undefined}
                tabIndex={isCellClickable ? 0 : undefined}
                onClick={isCellClickable ? cellClick('male') : undefined}
                onKeyDown={isCellClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellClick('male')(e) } } : undefined}
                className={`border border-border px-2 py-2 text-right tabular-nums text-lg underline ${newMale > 0 ? 'text-blue-600' : 'text-blue-600/60'} ${isCellClickable ? 'cursor-pointer hover:bg-muted/40' : ''}`}
              >
                {String(newMale).toLocaleString()}
              </td>
              <td
                role={isCellClickable ? 'button' : undefined}
                tabIndex={isCellClickable ? 0 : undefined}
                onClick={isCellClickable ? cellClick('female') : undefined}
                onKeyDown={isCellClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellClick('female')(e) } } : undefined}
                className={`border border-border px-2 py-2 text-right tabular-nums text-lg underline ${newFemale > 0 ? 'text-pink-600' : 'text-pink-600/60'} ${isCellClickable ? 'cursor-pointer hover:bg-muted/40' : ''}`}
              >
                {String(newFemale).toLocaleString()}
              </td>
              <td
                role={isCellClickable ? 'button' : undefined}
                tabIndex={isCellClickable ? 0 : undefined}
                onClick={isCellClickable ? cellClick('total') : undefined}
                onKeyDown={isCellClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellClick('total')(e) } } : undefined}
                className={`border border-border px-2 py-2 text-right tabular-nums text-lg text-foreground ${isSubtotal ? 'font-bold underline' : ''} ${isCellClickable ? 'cursor-pointer hover:bg-muted/40' : ''}`}
              >
                {String(newTotal).toLocaleString()}
              </td>
              <td
                role={isCellClickable ? 'button' : undefined}
                tabIndex={isCellClickable ? 0 : undefined}
                onClick={isCellClickable ? cellClick('male') : undefined}
                onKeyDown={isCellClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellClick('male')(e) } } : undefined}
                className={`border border-border px-2 py-2 text-right tabular-nums text-lg underline ${followupMale > 0 ? 'text-blue-600' : 'text-blue-600/60'} ${isCellClickable ? 'cursor-pointer hover:bg-muted/40' : ''}`}
              >
                {String(followupMale).toLocaleString()}
              </td>
              <td
                role={isCellClickable ? 'button' : undefined}
                tabIndex={isCellClickable ? 0 : undefined}
                onClick={isCellClickable ? cellClick('female') : undefined}
                onKeyDown={isCellClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellClick('female')(e) } } : undefined}
                className={`border border-border px-2 py-2 text-right tabular-nums text-lg underline ${followupFemale > 0 ? 'text-pink-600' : 'text-pink-600/60'} ${isCellClickable ? 'cursor-pointer hover:bg-muted/40' : ''}`}
              >
                {String(followupFemale).toLocaleString()}
              </td>
              <td
                role={isCellClickable ? 'button' : undefined}
                tabIndex={isCellClickable ? 0 : undefined}
                onClick={isCellClickable ? cellClick('total') : undefined}
                onKeyDown={isCellClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellClick('total')(e) } } : undefined}
                className={`border border-border px-2 py-2 text-right tabular-nums text-lg text-foreground ${isSubtotal ? 'font-bold underline' : ''} ${isCellClickable ? 'cursor-pointer hover:bg-muted/40' : ''}`}
              >
                {String(followupTotal).toLocaleString()}
              </td>
            </tr>
          )
        })}
      </React.Fragment>
    ))

  return (
    <div className="space-y-4">
      {PNTT_BLOCKS.map((block, blockIdx) => {
        const blockSections = getSectionsForBlock(block, sections)
        if (blockSections.length === 0) return null
        const isRiskBlock = blockIdx === 0
        const isIndexBlock = blockIdx === 1
        const isPartnersBlock = blockIdx === 2
        const isChildrenBlock = blockIdx === 3
        const tbodyContent = isRiskBlock
          ? renderRiskSectionRows(blockSections)
          : isIndexBlock
            ? renderIndexSectionRows()
            : isPartnersBlock
            ? renderPartnersSectionRows()
            : isChildrenBlock
              ? renderChildrenSectionRows()
              : renderSectionRows(blockSections)
        return (
          <div key={blockIdx} className="space-y-2">
            <h2 className="text-center text-lg font-bold text-foreground py-2">
              {block.titleKh}
            </h2>
            <table className="w-full border-collapse border border-border text-sm" style={{ tableLayout: 'fixed' }}>
              <thead>{isRiskBlock ? tableHeaderRisk : (isPartnersBlock || isChildrenBlock) ? tableHeaderPartners : tableHeader}</thead>
              <tbody>{tbodyContent}</tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}

export default function ReportPNTTPage() {
  const { user } = useAuth()
  const isViewer = user?.role === 'viewer'
  const isSuperAdmin = user?.role === 'super_admin'

  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [detailTitle, setDetailTitle] = useState('')
  const [detailRecords, setDetailRecords] = useState([])
  const [detailSexFilter, setDetailSexFilter] = useState('all')
  const [detailResultFilter, setDetailResultFilter] = useState(null) // 'positive' | 'negative' | null
  const [detailRiskFactorIndex, setDetailRiskFactorIndex] = useState(null) // 0–9 when clicking risk block
  const [detailRiskTimeframe, setDetailRiskTimeframe] = useState(null) // 'ever' | 'sixMonths' | 'never'
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState(null)
  const [dateRange, setDateRange] = useState({
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    previousEndDate: '2024-12-31'
  })
  const [selectedYear, setSelectedYear] = useState(() => {
    const y = new Date().getFullYear()
    const m = new Date().getMonth()
    const q = Math.floor(m / 3) + 1
    return q === 1 ? y - 1 : y
  })
  const [selectedQuarter, setSelectedQuarter] = useState(() => {
    const m = new Date().getMonth()
    const q = Math.floor(m / 3) + 1
    return q === 1 ? 4 : q - 1
  })
  const [sites, setSites] = useState([])
  const [selectedSite, setSelectedSite] = useState(null)
  const [sitesLoading, setSitesLoading] = useState(false)

  const availableYears = generateAvailableYears()
  const availableQuarters = generateAvailableQuarters(selectedYear)

  const handleYearChange = (year) => {
    const newYear = parseInt(year, 10)
    setSelectedYear(newYear)
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth()
    const currentQuarter = Math.floor(currentMonth / 3) + 1
    const lastCompleted = currentQuarter === 1 ? 4 : currentQuarter - 1
    if (newYear === currentYear) {
      setSelectedQuarter(lastCompleted)
      setDateRange(getDateRangeForYearQuarter(newYear, lastCompleted))
    } else {
      setDateRange(getDateRangeForYearQuarter(newYear, selectedQuarter))
    }
  }

  const handleQuarterChange = (quarter) => {
    const q = parseInt(quarter, 10)
    setSelectedQuarter(q)
    setDateRange(getDateRangeForYearQuarter(selectedYear, q))
  }

  const loadSites = useCallback(async () => {
    try {
      setSitesLoading(true)
      const response = await siteApi.getAllSites()
      const data = response?.sites ?? response?.data ?? response
      const list = Array.isArray(data) ? data : []
      setSites(list)
      if (list.length > 0 && !selectedSite) setSelectedSite(list[0])
    } catch (err) {
      setSites([])
    } finally {
      setSitesLoading(false)
    }
  }, [])

  useEffect(() => { loadSites() }, [loadSites])
  useEffect(() => {
    setDateRange(getDateRangeForYearQuarter(selectedYear, selectedQuarter))
  }, [])

  const fetchReport = useCallback(async () => {
    if (!selectedSite?.code) {
      setSections([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const response = await pnttReportApi.getPnttReport({
        siteCode: selectedSite.code,
        ...dateRange
      })
      if (response && response.success) {
        const list = Array.isArray(response.data) ? response.data : []
        setSections(list)
      } else {
        setError(response?.error || response?.message || 'Failed to load PNTT report')
        setSections([])
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to load PNTT report')
      setSections([])
    } finally {
      setLoading(false)
    }
  }, [selectedSite, dateRange])

  useEffect(() => { fetchReport() }, [fetchReport])

  const handleSectionCellClick = useCallback(async (section, row, rowIdx, column) => {
    const scriptId = getDetailScriptId(section)
    if (!scriptId || !selectedSite?.code) return
    const title = section.sectionLabelEn
      ? `${section.sectionNumber}. ${section.sectionLabelEn}${row.labelEn ? ` — ${row.labelEn}` : ''}`
      : `${section.sectionNumber}. ${section.sectionLabelKh || 'Detail'}`
    setDetailTitle(title)
    // Risk block columns are 'ever' | 'sixMonths' | 'never' – not sex. Other blocks use 'male' | 'female' | 'total'.
    const isRiskTimeframe = column === 'ever' || column === 'sixMonths' || column === 'never'
    if (isRiskTimeframe) {
      setDetailSexFilter('all')
      setDetailRiskFactorIndex(rowIdx)
      setDetailRiskTimeframe(column)
    } else {
      setDetailSexFilter(column === 'total' ? 'all' : column)
      setDetailRiskFactorIndex(null)
      setDetailRiskTimeframe(null)
    }
    // When section is "Positive (+)" or "Negative (-)", filter detail list to match
    const labelEn = (section.sectionLabelEn || '') + (row.labelEn || '')
    const isPositiveSection = /positive\s*\(\s*\+\s*\)/i.test(labelEn)
    const isNegativeSection = /negative\s*\(\s*-\s*\)/i.test(labelEn)
    setDetailResultFilter(isPositiveSection ? 'positive' : isNegativeSection ? 'negative' : null)
    setShowDetailsModal(true)
    setDetailRecords([])
    setDetailsError(null)
    setDetailsLoading(true)
    try {
      const res = await pnttReportApi.getPnttReportDetails({
        siteCode: selectedSite.code,
        scriptId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        previousEndDate: dateRange.previousEndDate
      })
      if (res?.success && Array.isArray(res.data)) {
        const raw = res.data
        const filtered = isRiskTimeframe
          ? filterRiskDetailsByTimeframe(raw, rowIdx, column)
          : raw
        setDetailRecords(filtered)
      } else {
        setDetailsError(res?.error || 'Failed to load details')
      }
    } catch (err) {
      setDetailsError(err?.response?.data?.error || err?.message || 'Failed to load details')
      setDetailRecords([])
    } finally {
      setDetailsLoading(false)
    }
  }, [selectedSite, dateRange])

  const exportToCSV = useCallback(() => {
    const timestamp = new Date().toISOString().split('T')[0]
    const siteLabel = selectedSite ? `${selectedSite.code} - ${selectedSite.name || ''}` : 'All Sites'
    const reportTitle = `PNTT Report - ${siteLabel} - ${dateRange.startDate} to ${dateRange.endDate}`
    const header = ['Section', 'Section Label', 'Row', 'Male', 'Female', 'Total', 'Ever', 'Six Months', 'Never']
    const rows = [header]
    if (sections && sections.length > 0) {
      sections.forEach((section) => {
        const sectionLabel = section.sectionLabelEn || section.sectionLabelKh || ''
        ;(section.rows || []).forEach((row) => {
          const rowLabel = row.labelEn || row.labelKh || ''
          rows.push([
            String(section.sectionNumber ?? ''),
            sectionLabel,
            rowLabel,
            String(row.male ?? 0),
            String(row.female ?? 0),
            String(row.total ?? 0),
            String(row.ever ?? 0),
            String(row.sixMonths ?? 0),
            String(row.never ?? 0)
          ])
        })
      })
    }
    const csvContent = [reportTitle, `Generated: ${new Date().toLocaleString()}`, ''].concat(
      rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    ).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pntt-report-${timestamp}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }, [sections, selectedSite, dateRange])

  // Allow global viewer download button to trigger export
  useEffect(() => {
    if (!isViewer) return
    const handle = () => {
      exportToCSV()
    }
    window.addEventListener('viewer-download', handle)
    return () => {
      window.removeEventListener('viewer-download', handle)
    }
  }, [isViewer, exportToCSV])

  return (
    <div className="min-h-screen bg-background mx-auto lg:max-w-[300mm] px-4 sm:px-6 py-4 sm:py-6">
      <div className="space-y-4">
        <ReportConfiguration
          sites={sites}
          selectedSite={selectedSite}
          onSiteChange={setSelectedSite}
          sitesLoading={sitesLoading}
          selectedYear={selectedYear}
          selectedQuarter={selectedQuarter}
          onYearChange={handleYearChange}
          onQuarterChange={handleQuarterChange}
          availableYears={availableYears}
          availableQuarters={availableQuarters}
          onRefresh={() => { setError(null); fetchReport() }}
          onExport={exportToCSV}
          onPreview={() => {}}
          onPrint={() => window.print()}
          loading={loading}
          isSuperAdmin={isSuperAdmin}
          isViewer={isViewer}
        />

        <ReportHeader
          selectedSite={selectedSite}
          selectedYear={selectedYear}
          selectedQuarter={selectedQuarter}
          titleEn=" Report"
          titleKh="របាយការណ៍ PNTT"
        />

        {error && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
                <p className="text-destructive font-medium text-sm sm:text-base">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="bg-card border border-border overflow-hidden">
          <MainReportTable
            sections={sections}
            loading={loading}
            onSectionCellClick={handleSectionCellClick}
            selectedSite={selectedSite}
          />
        </div>

        <InfantDetailsModal
          key={showDetailsModal ? `detail-${detailSexFilter}-${detailResultFilter}-${detailRiskFactorIndex}-${detailRiskTimeframe}-${detailTitle}` : 'detail-closed'}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title={detailTitle}
          details={detailRecords}
          ageCategoryFilter={null}
          initialSexFilter={detailSexFilter}
          initialOutcomeStatusCode={null}
          initialResultFilter={detailResultFilter}
          loading={detailsLoading}
          error={detailsError}
        />
      </div>
    </div>
  )
}

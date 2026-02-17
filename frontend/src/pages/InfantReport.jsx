import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'
import siteApi from '../services/siteApi'
import { infantReportApi } from '../services/reportingApi'
import { useAuth } from '../contexts/AuthContext'
import { InfantDetailsModal } from '../components/modals'
import {
  ReportHeader,
  ReportConfiguration,
  generateAvailableYears,
  generateAvailableQuarters,
  getDateRangeForYearQuarter
} from '../components/indicators'

/** Resolve which detail script to run for this section/row */
function getDetailScriptId(section, rowIdx) {
  if (section.detailScriptIds && Array.isArray(section.detailScriptIds)) {
    return section.detailScriptIds[rowIdx] || null
  }
  return section.detailScriptId || null
}

/** Main report table: Category | Male (M) | Female (F) | Total — optional onCellClick(section, row, rowIdx, 'male'|'female'|'total') for detail */
const MainReportTable = ({ sections, loading, onSectionCellClick, dateRange, selectedSite }) => {
  if (loading) {
    return (
      <div className="border border-border p-10 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted border-t-primary mx-auto" />
        <p className="mt-3 text-sm text-muted-foreground">Loading infant report...</p>
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
  return (
    <table className="w-full border-collapse border border-border/50 text-sm" style={{ tableLayout: 'fixed' }}>
      <thead>
        <tr className="bg-blue-800 border-b border-muted">
          <th className="border-r border-muted px-3 py-2.5 text-left font-bold text-white w-[70%]" colSpan={2}>Category</th>
          <th className="border-r border-muted px-3 py-2.5 text-center font-bold text-white w-[10%]">Male (M)</th>
          <th className="border-r border-muted px-3 py-2.5 text-center font-bold text-white w-[10%]">Female (F)</th>
          <th className="px-3 py-2.5 text-center font-bold text-white w-[10%]">Total</th>
        </tr>
      </thead>
      <tbody>
        {sections.map((section, sectionIdx) => {
          const hasSubRows = section.rows.some((r) => r.labelKh || r.labelEn)
          const rowCount = section.rows.length
          return (
            <React.Fragment key={section.sectionNumber}>
              {section.rows.map((row, rowIdx) => {
                const isSubtotal = row.isSubtotal
                const isZebra = !isSubtotal && (sectionIdx + rowIdx) % 2 === 1
                const detailScriptId = !isSubtotal ? getDetailScriptId(section, rowIdx) : null
                const isCellClickable = onSectionCellClick && detailScriptId && selectedSite?.code
                const cellClick = (col) => (e) => {
                  e.stopPropagation()
                  if (isCellClickable) onSectionCellClick(section, row, rowIdx, col)
                }
                const cellBorder = 'border-r border-b border-border/50'
                return (
                  <tr
                    key={`${section.sectionNumber}-${rowIdx}`}
                    className={`${isSubtotal ? 'bg-muted font-semibold' : `${isZebra ? 'bg-muted/20 ' : ''}print:bg-transparent`} hover:bg-muted/25 transition-colors`}
                  >
                    {hasSubRows && rowIdx === 0 ? (
                      <td className={`${cellBorder} px-3 py-2 text-foreground align-top w-[50%] font-semibold break-words`} rowSpan={rowCount}>
                        <span className="block">{section.sectionNumber}. {section.sectionLabelKh}</span>
                        {section.sectionLabelEn ? <span className="block mt-0.5 text-muted-foreground font-normal break-words">({section.sectionLabelEn})</span> : null}
                      </td>
                    ) : null}
                    {!hasSubRows && rowIdx === 0 ? (
                      <td className={`${cellBorder} px-3 py-2 text-foreground align-top w-[70%] font-semibold break-words`} colSpan={2}>
                        <span className="block">{section.sectionNumber}. {section.sectionLabelEn || section.sectionLabelKh}</span>
                        {row.error && <div className="text-destructive text-xs mt-0.5">{row.error}</div>}
                      </td>
                    ) : null}
                    {hasSubRows ? (
                      <td className={`${cellBorder} px-2 py-2 text-foreground align-middle w-[20%] text-xs`}>
                        {row.labelKh && row.labelEn ? `${row.labelKh} (${row.labelEn})` : row.labelKh || row.labelEn || '—'}
                      </td>
                    ) : !hasSubRows && rowIdx === 0 ? null : null}
                    <td
                      role={isCellClickable ? 'button' : undefined}
                      tabIndex={isCellClickable ? 0 : undefined}
                      onClick={isCellClickable ? cellClick('male') : undefined}
                      onKeyDown={isCellClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellClick('male')() } } : undefined}
                      className={`${cellBorder} px-3 py-2 text-right tabular-nums text-lg underline ${(row.male ?? 0) > 0 ? 'text-blue-600' : 'text-blue-600/60'} ${isCellClickable ? 'cursor-pointer hover:bg-muted/40' : ''}`}
                    >
                      {String((row.male ?? 0)).toLocaleString()}
                    </td>
                    <td
                      role={isCellClickable ? 'button' : undefined}
                      tabIndex={isCellClickable ? 0 : undefined}
                      onClick={isCellClickable ? cellClick('female') : undefined}
                      onKeyDown={isCellClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellClick('female')() } } : undefined}
                      className={`${cellBorder} px-3 py-2 text-right tabular-nums text-lg underline ${(row.female ?? 0) > 0 ? 'text-pink-600' : 'text-pink-600/60'} ${isCellClickable ? 'cursor-pointer hover:bg-muted/40' : ''}`}
                    >
                      {String((row.female ?? 0)).toLocaleString()}
                    </td>
                    <td
                      role={isCellClickable ? 'button' : undefined}
                      tabIndex={isCellClickable ? 0 : undefined}
                      onClick={isCellClickable ? cellClick('total') : undefined}
                      onKeyDown={isCellClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cellClick('total')() } } : undefined}
                      className={`${cellBorder} border-r-0 px-3 py-2 text-right tabular-nums text-lg text-foreground ${isSubtotal ? 'font-bold underline' : ''} ${isCellClickable ? 'cursor-pointer hover:bg-muted/40' : ''}`}
                    >
                      {String((row.total ?? 0)).toLocaleString()}
                    </td>
                  </tr>
                )
              })}
            </React.Fragment>
          )
        })}
      </tbody>
    </table>
  )
}

const InfantReport = () => {
  const { user } = useAuth()
  const isViewer = user?.role === 'viewer'
  const isSuperAdmin = user?.role === 'super_admin'

  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [detailTitle, setDetailTitle] = useState('')
  const [detailRecords, setDetailRecords] = useState([])
  const [detailAgeFilter, setDetailAgeFilter] = useState(null) // '< 2 months' | '> 2 months' when section has one script but two age rows
  const [detailSexFilter, setDetailSexFilter] = useState('all') // 'all' | 'male' | 'female' — from which cell was clicked
  const [detailOutcomeStatusCode, setDetailOutcomeStatusCode] = useState(null) // section 18: numeric status (0,1,3,4,5) so modal shows same records as report cell
  const [detailResultFilter, setDetailResultFilter] = useState(null) // 'negative' | 'positive' for DNA PCR result rows
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
      const response = await infantReportApi.getInfantReport({
        siteCode: selectedSite.code,
        ...dateRange
      })
      if (response && response.success) {
        const list = Array.isArray(response.data) ? response.data : []
        setSections(list)
      } else {
        setError(response?.error || response?.message || 'Failed to load infant report')
        setSections([])
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to load infant report')
      setSections([])
    } finally {
      setLoading(false)
    }
  }, [selectedSite, dateRange])

  useEffect(() => { fetchReport() }, [fetchReport])

  /** Map row label to age_category value used in detail records (for sections with one script, two age rows) */
  const getAgeCategoryFilter = useCallback((row) => {
    if (!row) return null
    const en = (row.labelEn || '').toLowerCase()
    const kh = (row.labelKh || '').toLowerCase()
    if (en.includes('> 2') || en.includes('>2')) return '> 2 months'
    if (en.includes('≤ 2') || en.includes('<= 2') || kh.includes('≤ 2') || (en.includes('age') && en.includes('2 months') && !en.includes('>'))) return '< 2 months'
    return null
  }, [])

  /** Map row label to logical result category used in details (e.g. Negative vs Positive) */
  const getResultCategoryFilter = useCallback((row) => {
    if (!row) return null
    const en = (row.labelEn || '').toLowerCase()
    const kh = (row.labelKh || '').toLowerCase()
    if (en.includes('negative') || kh.includes('អវិជ្ជមាន')) return 'negative'
    if (en.includes('positive') || kh.includes('វិជ្ជមាន')) return 'positive'
    return null
  }, [])

  const handleSectionCellClick = useCallback(async (section, row, rowIdx, column) => {
    const scriptId = getDetailScriptId(section, rowIdx)
    if (!scriptId || !selectedSite?.code) return
    const title = section.sectionLabelEn
      ? `${section.sectionNumber}. ${section.sectionLabelEn}${row.labelEn ? ` — ${row.labelEn}` : ''}`
      : `${section.sectionNumber}. ${section.sectionLabelKh || 'Detail'}`
    setDetailTitle(title)
    setDetailAgeFilter(null)
    setDetailResultFilter(null)
    setDetailSexFilter(column === 'total' ? 'all' : column)
    // Section 18: use same status codes as report normalizer (statusOrder) so modal shows exact records from that cell
    const section18StatusOrder = [0, 1, 3, 4, 5]
    if (section.sectionNumber === 18 && !row.isSubtotal && rowIdx >= 0 && rowIdx < section18StatusOrder.length) {
      setDetailOutcomeStatusCode(section18StatusOrder[rowIdx])
    } else {
      setDetailOutcomeStatusCode(null)
    }
    setShowDetailsModal(true)
    setDetailRecords([])
    setDetailsError(null)
    setDetailsLoading(true)
    try {
      const res = await infantReportApi.getInfantReportDetails({
        siteCode: selectedSite.code,
        scriptId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        previousEndDate: dateRange.previousEndDate
      })
      if (res?.success && Array.isArray(res.data)) {
        setDetailRecords(res.data)
        if (section.detailScriptId && !section.detailScriptIds) {
          const ageFilter = getAgeCategoryFilter(row)
          if (ageFilter) setDetailAgeFilter(ageFilter)
          const resultFilter = getResultCategoryFilter(row)
          if (resultFilter) setDetailResultFilter(resultFilter)
        }
      } else {
        setDetailsError(res?.error || 'Failed to load details')
      }
    } catch (err) {
      setDetailsError(err?.response?.data?.error || err?.message || 'Failed to load details')
      setDetailRecords([])
    } finally {
      setDetailsLoading(false)
    }
  }, [selectedSite, dateRange, getAgeCategoryFilter, getResultCategoryFilter])

  const exportToCSV = useCallback(() => {
    const timestamp = new Date().toISOString().split('T')[0]
    const siteLabel = selectedSite ? `${selectedSite.code} - ${selectedSite.name || ''}` : 'All Sites'
    const reportTitle = `Infant Report - ${siteLabel} - ${dateRange.startDate} to ${dateRange.endDate}`
    const header = ['Section', 'Section Label', 'Category', 'Male', 'Female', 'Total']
    const rows = [header]
    if (sections && sections.length > 0) {
      sections.forEach((section) => {
        const sectionLabel = section.sectionLabelEn || section.sectionLabelKh || ''
        ;(section.rows || []).forEach((row) => {
          const category = row.labelEn || row.labelKh || ''
          rows.push([
            String(section.sectionNumber ?? ''),
            sectionLabel,
            category,
            String(row.male ?? 0),
            String(row.female ?? 0),
            String(row.total ?? 0)
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
    a.download = `infant-report-${timestamp}.csv`
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
        {/* Report Configuration Panel — same as IndicatorsReport */}
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

        {/* Report Header — dynamic title for Infant Report */}
        <ReportHeader
          selectedSite={selectedSite}
          selectedYear={selectedYear}
          selectedQuarter={selectedQuarter}
          titleEn="Infant Report"
          titleKh="របាយការណ៍កុមារប្រឈមអេដស៍"
        />

        {/* Error Message — same Card style as IndicatorsReport */}
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

        {/* Main Report Table — facility block is in ReportHeader; no duplicate */}
        <div className="bg-card border border-border overflow-hidden">
          <MainReportTable
            sections={sections}
            loading={loading}
            onSectionCellClick={handleSectionCellClick}
            dateRange={dateRange}
            selectedSite={selectedSite}
          />
        </div>

        <InfantDetailsModal
          key={showDetailsModal ? `detail-${detailSexFilter}-${detailOutcomeStatusCode}-${detailResultFilter}-${detailTitle}` : 'detail-closed'}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title={detailTitle}
          details={detailRecords}
          ageCategoryFilter={detailAgeFilter}
          initialSexFilter={detailSexFilter}
          initialOutcomeStatusCode={detailOutcomeStatusCode}
          initialResultFilter={detailResultFilter}
          loading={detailsLoading}
          error={detailsError}
        />
      </div>
    </div>
  )
}

export default InfantReport

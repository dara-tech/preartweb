import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui'
import { Download, AlertTriangle, Loader2, FileText, Users } from 'lucide-react'

// Helper to prefer child sex when present (PNTT children 19–23)
const getChildSexCode = (r) => {
  const sex = r.child_sex ?? r.Child_sex
  const display = String(r.child_sex_display ?? r.Child_sex_display ?? '').toLowerCase()
  if (sex !== undefined && sex !== null && sex !== '') {
    const n = Number(sex)
    if (!Number.isNaN(n)) return n
  }
  if (display === 'male') return 1
  if (display === 'female') return 0
  return null
}

// Helper to prefer partner sex when present (PNTT partners 14–18)
const getPartnerSexCode = (r) => {
  const sex = r.partner_sex ?? r.Partner_sex
  const display = String(r.partner_sex_display ?? r.Partner_sex_display ?? '').toLowerCase()
  if (sex !== undefined && sex !== null && sex !== '') {
    const n = Number(sex)
    if (!Number.isNaN(n)) return n
  }
  if (display === 'male') return 1
  if (display === 'female') return 0
  return null
}

// Support Index/Partner (PNTT) and Caregiver/Child (PNTT Children) and generic Sex/sex_display
const isMale = (r) => {
  const childSex = getChildSexCode(r)
  if (childSex !== null) {
    return childSex === 1
  }
  const partnerSex = getPartnerSexCode(r)
  if (partnerSex !== null) {
    return partnerSex === 1
  }
  return (
    Number(r.Sex) === 1 || Number(r.sex) === 1 || String(r.sex_display || '').toLowerCase() === 'male' ||
    Number(r.index_sex ?? r.Index_sex) === 1 || String((r.index_sex_display ?? r.Index_sex_display) || '').toLowerCase() === 'male' ||
    Number(r.caregiver_sex ?? r.Caregiver_sex) === 1 || String((r.caregiver_sex_display ?? r.Caregiver_sex_display) || '').toLowerCase() === 'male'
  )
}

const isFemale = (r) => {
  const childSex = getChildSexCode(r)
  if (childSex !== null) {
    return childSex === 0
  }
  const partnerSex = getPartnerSexCode(r)
  if (partnerSex !== null) {
    return partnerSex === 0
  }
  return (
    Number(r.Sex) === 0 || Number(r.sex) === 0 || String(r.sex_display || '').toLowerCase() === 'female' ||
    Number(r.index_sex ?? r.Index_sex) === 0 || String((r.index_sex_display ?? r.Index_sex_display) || '').toLowerCase() === 'female' ||
    Number(r.caregiver_sex ?? r.Caregiver_sex) === 0 || String((r.caregiver_sex_display ?? r.Caregiver_sex_display) || '').toLowerCase() === 'female'
  )
}

const formatCell = (value) => {
  if (value == null || value === '') return '—'
  if (typeof value === 'object' && value instanceof Date) return value.toISOString().split('T')[0]
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.split('T')[0]
  return String(value)
}

// Section 18 outcome labels (match report); detail API may use different text for same status code
const OUTCOME_LABEL_BY_STATUS = { 0: 'Died', 1: 'Lost', 3: 'Transferred Out', 4: 'HIV (-) Discharged', 5: 'HIV (+) receiving ART' }

const labelFromKey = (key) => {
  const map = {
    clinicid: 'Clinic ID',
    ClinicID: 'Clinic ID',
    Sex: 'Sex',
    sex_display: 'Sex',
    DaBirth: 'Date of Birth',
    DafirstVisit: 'First Visit',
    DatVisit: 'Dat Visit',
    DaStatus: 'Status Date',
    outcome_date: 'Outcome Date',
    Status: 'Status',
    status_display: 'Status',
    transfer_to_site: 'Transfer To Site',
    patient_type: 'Patient Type',
    age_days: 'Age (days)',
    age_category: 'Age Category',
    antibody_result: 'Result',
    Antibody_result: 'Result',
    antibody_display: 'Antibody Result',
    Antibody_display: 'Antibody Result',
    antibody_test_date: 'Antibody Test Date',
    TestDate: 'Test Date',
    dna_test_display: 'DNA Test',
    result_display: 'Result',
    age_at_test: 'Age at Test',
    other_dna: 'Other DNA'
  }
  return map[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim()
}

// Normalize age_category strings to the same buckets used in the main Infant report
const normalizeAgeCategory = (value) => {
  const v = String(value || '').toLowerCase().trim()
  if (!v) return null
  if (v.includes('> 2') || v.includes('>2')) return '> 2 months'
  if (
    v.includes('≤ 2') ||
    v.includes('<= 2') ||
    (v.includes('2') && v.includes('month') && !v.includes('>'))
  ) {
    return '< 2 months'
  }
  return null
}

// Normalize result / outcome fields so we can filter by \"negative\" / \"positive\" / \"pending\"
// Result/Result_display (DNA): 0 = Negative, 1 = Positive, null = Waiting/Pending. Antibody: 0 = Positive, 1 = Negative.
const getResultCategory = (row) => {
  const display = String(
    row.Result_display || row.result_display ||
    row.Antibody_display || row.antibody_display || ''
  ).toLowerCase().trim()
  const code = row.Result ?? row.result ?? row.Antibody_result ?? row.antibody_result
  const isAntibody = row.Antibody_result != null || row.antibody_result != null ||
    row.Antibody_display != null || row.antibody_display != null
  if (display.includes('negative')) return 'negative'
  if (display.includes('positive')) return 'positive'
  if (display.includes('waiting') || display.includes('pending')) return 'pending'
  if (isAntibody) {
    if (code === 0 || code === '0') return 'positive'
    if (code === 1 || code === '1') return 'negative'
  } else {
    if (code === 0 || code === '0') return 'negative'
    if (code === 1 || code === '1') return 'positive'
    if (code == null || code === '' || code === undefined) return 'pending'
  }
  return null
}

const rowHasResultField = (r) =>
  r.Result != null || r.result != null || r.Result_display || r.result_display ||
  r.Antibody_result != null || r.antibody_result != null || r.Antibody_display || r.antibody_display

const InfantDetailsModal = ({
  isOpen,
  onClose,
  title = 'Detail',
  details = [],
  ageCategoryFilter = null,
  initialSexFilter = 'all',
  initialOutcomeStatusCode = null,
  initialResultFilter = null,
  loading = false,
  error = null
}) => {
  const [sexFilter, setSexFilter] = useState(() =>
    initialSexFilter === 'male' || initialSexFilter === 'female' ? initialSexFilter : 'all'
  )

  useEffect(() => {
    if (isOpen) {
      const next = initialSexFilter === 'male' || initialSexFilter === 'female' ? initialSexFilter : 'all'
      setSexFilter(next)
    }
  }, [isOpen, initialSexFilter])

  // When the main report has one script but two age rows (<= 2 months, > 2 months),
  // we pass a logical ageCategoryFilter like '< 2 months' or '> 2 months'.
  // Here we normalize the backend age_category values so the modal shows
  // exactly the same age group as the clicked report cell.
  const afterAgeFilter =
    ageCategoryFilter && details.some((r) => r.age_category != null)
      ? details.filter((r) => normalizeAgeCategory(r.age_category) === ageCategoryFilter)
      : details

  const afterResultFilter =
    initialResultFilter && afterAgeFilter.some(rowHasResultField)
      ? afterAgeFilter.filter((r) => getResultCategory(r) === initialResultFilter)
      : afterAgeFilter

  const afterOutcomeFilter =
    initialOutcomeStatusCode != null && afterResultFilter.some((r) => r.Status != null || r.status != null)
      ? afterResultFilter.filter((r) => Number(r.Status) === initialOutcomeStatusCode || Number(r.status) === initialOutcomeStatusCode)
      : afterResultFilter
  const filteredDetails = sexFilter === 'male'
    ? afterOutcomeFilter.filter(isMale)
    : sexFilter === 'female'
      ? afterOutcomeFilter.filter(isFemale)
      : afterOutcomeFilter
  const rawKeys = filteredDetails.length > 0 ? Object.keys(filteredDetails[0]).filter((k) => typeof filteredDetails[0][k] !== 'object' || filteredDetails[0][k] instanceof Date) : []
  const columns = rawKeys.filter((k) => {
    if (rawKeys.includes('sex_display') && (k === 'Sex' || k === 'sex')) return false
    if (rawKeys.includes('status_display') && (k === 'Status' || k === 'status')) return false
    return true
  })

  const cellValue = (row, key) => {
    const statusCode = initialOutcomeStatusCode != null ? Number(row.Status ?? row.status) : null
    if ((key === 'status_display' || key === 'Status' || key === 'status') && statusCode in OUTCOME_LABEL_BY_STATUS) {
      return OUTCOME_LABEL_BY_STATUS[statusCode]
    }
    return row[key]
  }

  const exportCsv = () => {
    if (filteredDetails.length === 0) return
    const headers = columns.map((k) => labelFromKey(k))
    const rows = filteredDetails.map((r) => columns.map((k) => formatCell(cellValue(r, k))).join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `infant-detail-${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-3xl bg-card lg:max-w-5xl h-[95vh] max-h-[95vh] p-0 flex flex-col">
        <DialogHeader className="p-4 pb-3 border-b border-border flex-shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <div className="p-1.5 bg-primary rounded-md flex-shrink-0 mt-0.5">
                <FileText className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-base sm:text-xl font-semibold text-foreground leading-tight">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-base text-muted-foreground mt-1">
                  {loading
                    ? 'Loading...'
                    : `${filteredDetails.length.toLocaleString()} of ${afterOutcomeFilter.length.toLocaleString()} records${sexFilter !== 'all' ? ` (${sexFilter})` : ''}`}
                </DialogDescription>
              </div>
            </div>
          </div>
          {!loading && !error && afterOutcomeFilter.length > 0 && (
            <div className="flex flex-row items-center gap-3 mt-3 flex-wrap">
              <span className="text-sm text-muted-foreground">Show:</span>
              <div className="flex rounded-md border border-border overflow-hidden gap-0">
                <button
                  type="button"
                  onClick={() => setSexFilter('all')}
                  className={`px-3 py-2 text-sm ${sexFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 hover:bg-muted'}`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setSexFilter('male')}
                  className={`px-3 py-2 text-sm ${sexFilter === 'male' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 hover:bg-muted'}`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setSexFilter('female')}
                  className={`px-3 py-2 text-sm ${sexFilter === 'female' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 hover:bg-muted'}`}
                >
                  Female
                </button>
              </div>
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto">
            <div className="p-4">
              {error && (
                <div className="flex items-center gap-2 p-4 text-destructive bg-destructive/10 text-sm border border-destructive/30 rounded-md">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {loading && (
                <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span>Loading details...</span>
                </div>
              )}
              {!loading && !error && filteredDetails.length === 0 && (
                <div className="py-16 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No records found.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {afterOutcomeFilter.length === 0 ? 'No detail records for this selection.' : 'No records match the current filter.'}
                  </p>
                </div>
              )}
              {!loading && !error && filteredDetails.length > 0 && (
                <div className="border border-border overflow-hidden">
                  <div className="overflow-auto scrollbar-hide" style={{ maxHeight: 'calc(95vh - 300px)' }}>
                    <Table>
                      <TableHeader className="sticky top-0 bg-card z-10">
                        <TableRow className="border-b-2 border-border">
                          {columns.map((key, index) => (
                            <TableHead
                              key={key}
                              className={`text-xs px-2 py-3 whitespace-nowrap text-primary font-medium ${index < columns.length - 1 ? 'border-r border-border' : ''}`}
                            >
                              <span className="truncate max-w-[120px] block">{labelFromKey(key)}</span>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDetails.map((row, idx) => (
                          <TableRow key={idx} className="hover:bg-muted/50 border-b border-border">
                            {columns.map((key, colIndex) => (
                              <TableCell
                                key={key}
                                className={`text-xs px-2 py-2 max-w-[140px] ${colIndex < columns.length - 1 ? 'border-r border-border' : ''}`}
                              >
                                <span className="truncate block" title={formatCell(cellValue(row, key))}>
                                  {formatCell(cellValue(row, key))}
                                </span>
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-border flex-shrink-0">
          <Button type="button" variant="outline" size="sm" onClick={exportCsv} disabled={filteredDetails.length === 0}>
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default InfantDetailsModal

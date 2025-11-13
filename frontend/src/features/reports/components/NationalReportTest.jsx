import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import React, { useState, useEffect } from 'react'
// Removed nationalReportApi import - test file not in use

const NationalReportTest = () => {
  const [testResults, setTestResults] = useState({})
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    const results = {}

    try {
      // Test 1: Get Years
      console.log('Testing: Get Years')
      const yearsResponse = await nationalReportApi.getYears()
      results.years = {
        success: yearsResponse.success,
        data: yearsResponse.years?.length || 0,
        error: null
      }
    } catch (error) {
      results.years = {
        success: false,
        data: null,
        error: error.message
      }
    }

    try {
      // Test 2: Get Quarter Report
      console.log('Testing: Get Quarter Report')
      const quarterResponse = await nationalReportApi.getQuarterReport(2024, 1)
      results.quarter = {
        success: quarterResponse.success,
        data: quarterResponse.report ? 'Report data received' : 'No report data',
        error: null
      }
    } catch (error) {
      results.quarter = {
        success: false,
        data: null,
        error: error.message
      }
    }

    try {
      // Test 3: Get Date Range Report
      console.log('Testing: Get Date Range Report')
      const dateRangeResponse = await nationalReportApi.getDateRangeReport('2024-01-01', '2024-03-31')
      results.dateRange = {
        success: dateRangeResponse.success,
        data: dateRangeResponse.report ? 'Report data received' : 'No report data',
        error: null
      }
    } catch (error) {
      results.dateRange = {
        success: false,
        data: null,
        error: error.message
      }
    }

    try {
      // Test 4: Get Patient Details
      console.log('Testing: Get Patient Details')
      const patientDetailsResponse = await nationalReportApi.getPatientDetails('adult', '2024-01-01', '2024-03-31')
      results.patientDetails = {
        success: patientDetailsResponse.success,
        data: patientDetailsResponse.count || 0,
        error: null
      }
    } catch (error) {
      results.patientDetails = {
        success: false,
        data: null,
        error: error.message
      }
    }

    setTestResults(results)
    setLoading(false)
  }

  const getStatusBadge = (success) => {
    return success ? (
      <Badge className="bg-green-100 text-green-800">✓ Success</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">✗ Failed</Badge>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>National Report API Test</CardTitle>
        <Button onClick={runTests} disabled={loading}>
          {loading ? 'Running Tests...' : 'Run API Tests'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(testResults).map(([testName, result]) => (
            <div key={testName} className="p-4 border rounded-none">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold capitalize">{testName} Test</h3>
                {getStatusBadge(result.success)}
              </div>
              <div className="text-sm text-muted-foreground">
                <p><strong>Data:</strong> {result.data || 'N/A'}</p>
                {result.error && (
                  <p className="text-red-600"><strong>Error:</strong> {result.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default NationalReportTest

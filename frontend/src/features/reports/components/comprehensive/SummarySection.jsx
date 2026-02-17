import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import React from 'react'
import { 
  Users, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Activity, 
  Shield, 
  HeartHandshake,
  TrendingUp,
  BarChart3
} from "lucide-react"

const SummarySection = ({ summary }) => {
  // Helper function to format numbers
  const formatNumber = (num) => {
    return num ? num.toString() : "0"
  }

  return (
    <div className="space-y-6">
      {/* Grand Total */}
      <Card className="border-2">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <tbody>
                <tr className="bg-muted font-bold text-lg">
                  <td className="border border-border p-4 text-center">សរុបទូទៅ</td>
                  <td className="border border-border p-4 text-center text-foreground">
                    {formatNumber(summary.totalMale || 0)}
                  </td>
                  <td className="border border-border p-4 text-center text-foreground">
                    {formatNumber(summary.totalFemale || 0)}
                  </td>
                  <td className="border border-border p-4 text-center text-foreground">
                    {formatNumber(summary.totalPatients || 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Summary Statistics */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-center text-lg font-bold text-gray-800 flex items-center justify-center">
            <BarChart3 className="h-6 w-6 mr-2" />
            ស្ថិតិសរុបពេញលេញ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Patients */}
            <div className="text-center p-4 bg-blue-50 rounded-none">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">អ្នកជំងឺសរុប</p>
              <p className="text-2xl font-bold text-blue-600">{formatNumber(summary.totalPatients || 0)}</p>
            </div>

            {/* On ART */}
            <div className="text-center p-4 bg-green-50 rounded-none">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">នៅលើ ART</p>
              <p className="text-2xl font-bold text-green-600">{formatNumber(summary.totalOnART || 0)}</p>
            </div>

            {/* Pre-ART */}
            <div className="text-center p-4 bg-yellow-50 rounded-none">
              <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Pre-ART</p>
              <p className="text-2xl font-bold text-yellow-600">{formatNumber(summary.totalPreART || 0)}</p>
            </div>

            {/* Lost */}
            <div className="text-center p-4 bg-red-50 rounded-none">
              <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">បាត់បង់</p>
              <p className="text-2xl font-bold text-red-600">{formatNumber(summary.totalLost || 0)}</p>
            </div>

            {/* New Patients */}
            <div className="text-center p-4 bg-blue-50 rounded-none">
              <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">អ្នកជំងឺថ្មី</p>
              <p className="text-2xl font-bold text-blue-600">{formatNumber(summary.totalNewPatients || 0)}</p>
            </div>

            {/* Transferred */}
            <div className="text-center p-4 bg-purple-50 rounded-none">
              <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">ផ្ទេរ</p>
              <p className="text-2xl font-bold text-purple-600">{formatNumber(summary.totalTransferred || 0)}</p>
            </div>

            {/* Died */}
            <div className="text-center p-4 bg-gray-50 rounded-none">
              <XCircle className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">ស្លាប់</p>
              <p className="text-2xl font-bold text-gray-600">{formatNumber(summary.totalDied || 0)}</p>
            </div>

            {/* Gender Balance */}
            <div className="text-center p-4 bg-pink-50 rounded-none">
              <HeartHandshake className="h-8 w-8 text-pink-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">សមាមាត្រភេទ</p>
              <p className="text-lg font-bold text-pink-600">
                {formatNumber(summary.totalMale || 0)}ប្រុស / {formatNumber(summary.totalFemale || 0)}ស្រី
              </p>
            </div>
          </div>

          {/* Additional Statistics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {/* Treatment Coverage */}
            <div className="text-center p-4 viral-load-low rounded-none">
              <TrendingUp className="h-8 w-8 text-foreground mx-auto mb-2" />
              <p className="text-sm text-foreground mb-1">ការគ្របដណ្តប់ព្យាបាល</p>
              <p className="text-xl font-bold text-green-600">
                {summary.totalPatients > 0 
                  ? Math.round(((summary.totalOnART || 0) / summary.totalPatients) * 100) 
                  : 0}%
              </p>
            </div>

            {/* Retention Rate */}
            <div className="text-center p-4 status-active rounded-none">
              <CheckCircle className="h-8 w-8 text-foreground mx-auto mb-2" />
              <p className="text-sm text-foreground mb-1">អត្រាកាន់តែ</p>
              <p className="text-xl font-bold text-blue-600">
                {summary.totalPatients > 0 
                  ? Math.round(((summary.totalPatients - (summary.totalLost || 0)) / summary.totalPatients) * 100) 
                  : 0}%
              </p>
            </div>

            {/* New Patient Rate */}
            <div className="text-center p-4 status-warning rounded-none">
              <Activity className="h-8 w-8 text-foreground mx-auto mb-2" />
              <p className="text-sm text-foreground mb-1">អត្រាអ្នកជំងឺថ្មី</p>
              <p className="text-xl font-bold text-yellow-600">
                {summary.totalPatients > 0 
                  ? Math.round(((summary.totalNewPatients || 0) / summary.totalPatients) * 100) 
                  : 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SummarySection

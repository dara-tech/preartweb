import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import React from 'react'
import { Baby, Activity, AlertTriangle, CheckCircle, XCircle, Shield, Stethoscope, Pill } from "lucide-react"

const InfantPatientsSection = ({ infantData }) => {
  // Helper function to format numbers
  const formatNumber = (num) => {
    return num ? num.toString() : "0"
  }

  // Helper function to calculate total
  const calculateTotal = (male, female) => {
    return (male || 0) + (female || 0)
  }

  return (
    <Card className="border-2">
      <CardHeader className="bg-muted">
        <CardTitle className="text-xl font-bold text-foreground flex items-center">
          <Baby className="h-6 w-6 mr-2" />
          <span className="mr-2">អ្នកជំងឺទារក (០-៤ ឆ្នាំ)</span>
          <span className="text-sm font-normal text-muted-foreground">- ការវិភាគពេញលេញ</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-border p-3 text-left font-semibold">ប្រភេទ</th>
                <th className="border border-border p-3 text-center font-semibold">ប្រុស</th>
                <th className="border border-border p-3 text-center font-semibold">ស្រី</th>
                <th className="border border-border p-3 text-center font-semibold">សរុប</th>
              </tr>
            </thead>
            <tbody>
              {/* New Exposed Infants */}
              <tr>
                <td className="border border-border p-3 pl-8 font-semibold">ទារកឆ្លងថ្មី</td>
                <td className="border border-border p-3 text-center font-semibold text-blue-600">
                  {formatNumber(infantData.newExposedInfantMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-blue-600">
                  {formatNumber(infantData.newExposedInfantFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-blue-600">
                  {formatNumber(calculateTotal(infantData.newExposedInfantMale, infantData.newExposedInfantFemale))}
                </td>
              </tr>
              
              {/* Previous Infant Pre-ART */}
              <tr>
                <td className="border border-border p-3 pl-8">Pre-ART ទារកមុន</td>
                <td className="border border-border p-3 text-center font-semibold text-yellow-600">
                  {formatNumber(infantData.previousInfantPreARTMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-yellow-600">
                  {formatNumber(infantData.previousInfantPreARTFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-yellow-600">
                  {formatNumber(calculateTotal(infantData.previousInfantPreARTMale, infantData.previousInfantPreARTFemale))}
                </td>
              </tr>
              
              {/* Previous Infant ART */}
              <tr>
                <td className="border border-border p-3 pl-8">ទារក ART មុន</td>
                <td className="border border-border p-3 text-center font-semibold text-green-600">
                  {formatNumber(infantData.previousInfantARTMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-green-600">
                  {formatNumber(infantData.previousInfantARTFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-green-600">
                  {formatNumber(calculateTotal(infantData.previousInfantARTMale, infantData.previousInfantARTFemale))}
                </td>
              </tr>
              
              {/* Infant Start ART */}
              <tr>
                <td className="border border-border p-3 pl-8">ទារកចាប់ផ្តើម ART</td>
                <td className="border border-border p-3 text-center font-semibold text-green-600">
                  {formatNumber(infantData.infantStartARTMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-green-600">
                  {formatNumber(infantData.infantStartARTFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-green-600">
                  {formatNumber(calculateTotal(infantData.infantStartARTMale, infantData.infantStartARTFemale))}
                </td>
              </tr>
              
              {/* Infant Pre-ART Re-Test */}
              <tr>
                <td className="border border-border p-3 pl-8">ទារក Pre-ART ពិនិត្យឡើងវិញ</td>
                <td className="border border-border p-3 text-center font-semibold text-yellow-600">
                  {formatNumber(infantData.infantPreARTRetestMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-yellow-600">
                  {formatNumber(infantData.infantPreARTRetestFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-yellow-600">
                  {formatNumber(calculateTotal(infantData.infantPreARTRetestMale, infantData.infantPreARTRetestFemale))}
                </td>
              </tr>
              
              {/* Infant Transfer In */}
              <tr>
                <td className="border border-border p-3 pl-8">ទារកផ្ទេរចូល</td>
                <td className="border border-border p-3 text-center font-semibold text-blue-600">
                  {formatNumber(infantData.infantTransferInMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-blue-600">
                  {formatNumber(infantData.infantTransferInFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-blue-600">
                  {formatNumber(calculateTotal(infantData.infantTransferInMale, infantData.infantTransferInFemale))}
                </td>
              </tr>
              
              <tr className="bg-gray-100">
                <td className="border border-border p-3 pl-6 font-bold text-gray-700" colSpan="4">
                  ស្ថានភាពទារក
                </td>
              </tr>
              
              {/* Infant Lost - No ART */}
              <tr>
                <td className="border border-border p-3 pl-12">ទារកបាត់បង់ - គ្មាន ART</td>
                <td className="border border-border p-3 text-center font-semibold text-red-600">
                  {formatNumber(infantData.infantLostNoARTMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-red-600">
                  {formatNumber(infantData.infantLostNoARTFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-red-600">
                  {formatNumber(calculateTotal(infantData.infantLostNoARTMale, infantData.infantLostNoARTFemale))}
                </td>
              </tr>
              
              {/* Infant Lost - With ART */}
              <tr>
                <td className="border border-border p-3 pl-12">ទារកបាត់បង់ - មាន ART</td>
                <td className="border border-border p-3 text-center font-semibold text-red-600">
                  {formatNumber(infantData.infantLostWithARTMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-red-600">
                  {formatNumber(infantData.infantLostWithARTFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-red-600">
                  {formatNumber(calculateTotal(infantData.infantLostWithARTMale, infantData.infantLostWithARTFemale))}
                </td>
              </tr>
              
              {/* Infant Death - No ART */}
              <tr>
                <td className="border border-border p-3 pl-12">ទារកស្លាប់ - គ្មាន ART</td>
                <td className="border border-border p-3 text-center font-semibold text-gray-600">
                  {formatNumber(infantData.infantDeathNoARTMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-gray-600">
                  {formatNumber(infantData.infantDeathNoARTFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-gray-600">
                  {formatNumber(calculateTotal(infantData.infantDeathNoARTMale, infantData.infantDeathNoARTFemale))}
                </td>
              </tr>
              
              {/* Infant Death - With ART */}
              <tr>
                <td className="border border-border p-3 pl-12">ទារកស្លាប់ - មាន ART</td>
                <td className="border border-border p-3 text-center font-semibold text-gray-600">
                  {formatNumber(infantData.infantDeathWithARTMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-gray-600">
                  {formatNumber(infantData.infantDeathWithARTFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-gray-600">
                  {formatNumber(calculateTotal(infantData.infantDeathWithARTMale, infantData.infantDeathWithARTFemale))}
                </td>
              </tr>
              
              {/* Infant Test Negative */}
              <tr>
                <td className="border border-border p-3 pl-12">ទារកពិនិត្យអវិជ្ជមាន</td>
                <td className="border border-border p-3 text-center font-semibold text-purple-600">
                  {formatNumber(infantData.infantTestNegativeMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-purple-600">
                  {formatNumber(infantData.infantTestNegativeFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-purple-600">
                  {formatNumber(calculateTotal(infantData.infantTestNegativeMale, infantData.infantTestNegativeFemale))}
                </td>
              </tr>
              
              {/* Infant Transfer Out */}
              <tr>
                <td className="border border-border p-3 pl-12">ទារកផ្ទេរចេញ</td>
                <td className="border border-border p-3 text-center font-semibold text-blue-600">
                  {formatNumber(infantData.infantTransferOutMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-blue-600">
                  {formatNumber(infantData.infantTransferOutFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-blue-600">
                  {formatNumber(calculateTotal(infantData.infantTransferOutMale, infantData.infantTransferOutFemale))}
                </td>
              </tr>
              
              {/* Infant Subtotal */}
              <tr className="bg-purple-100 font-bold">
                <td className="border border-border p-3 pl-6">សរុបទារក</td>
                <td className="border border-border p-3 text-center text-purple-800">
                  {formatNumber(infantData.male || 0)}
                </td>
                <td className="border border-border p-3 text-center text-purple-800">
                  {formatNumber(infantData.female || 0)}
                </td>
                <td className="border border-border p-3 text-center text-purple-800">
                  {formatNumber(infantData.total || 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

export default InfantPatientsSection

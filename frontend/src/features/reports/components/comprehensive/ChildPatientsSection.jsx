import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import React from 'react'
import { Heart, Activity, AlertTriangle, CheckCircle, XCircle, Shield, Stethoscope, Pill } from "lucide-react"

const ChildPatientsSection = ({ childData }) => {
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
          <Heart className="h-6 w-6 mr-2" />
          <span className="mr-2">អ្នកជំងឺកុមារ (៥-១៤ ឆ្នាំ)</span>
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
              {/* New Child Patients */}
              <tr>
                <td className="border border-border p-3 pl-8 font-semibold">អ្នកជំងឺកុមារថ្មី</td>
                <td className="border border-border p-3 text-center font-semibold text-blue-600">
                  {formatNumber(childData.newChildMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-blue-600">
                  {formatNumber(childData.newChildFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-blue-600">
                  {formatNumber(calculateTotal(childData.newChildMale, childData.newChildFemale))}
                </td>
              </tr>
              
              {/* Previous Pre-ART Child */}
              <tr>
                <td className="border border-border p-3 pl-8">Pre-ART កុមារមុន</td>
                <td className="border border-border p-3 text-center font-semibold text-yellow-600">
                  {formatNumber(childData.previousPreARTChildMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-yellow-600">
                  {formatNumber(childData.previousPreARTChildFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-yellow-600">
                  {formatNumber(calculateTotal(childData.previousPreARTChildMale, childData.previousPreARTChildFemale))}
                </td>
              </tr>
              
              {/* Previous Child ART */}
              <tr>
                <td className="border border-border p-3 pl-8">កុមារ ART មុន</td>
                <td className="border border-border p-3 text-center font-semibold text-green-600">
                  {formatNumber(childData.previousChildARTMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-green-600">
                  {formatNumber(childData.previousChildARTFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-green-600">
                  {formatNumber(calculateTotal(childData.previousChildARTMale, childData.previousChildARTFemale))}
                </td>
              </tr>
              
              {/* Child Start ART */}
              <tr>
                <td className="border border-border p-3 pl-8">កុមារចាប់ផ្តើម ART</td>
                <td className="border border-border p-3 text-center font-semibold text-green-600">
                  {formatNumber(childData.childStartARTMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-green-600">
                  {formatNumber(childData.childStartARTFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-green-600">
                  {formatNumber(calculateTotal(childData.childStartARTMale, childData.childStartARTFemale))}
                </td>
              </tr>
              
              {/* Child Pre-ART Re-Test */}
              <tr>
                <td className="border border-border p-3 pl-8">កុមារ Pre-ART ពិនិត្យឡើងវិញ</td>
                <td className="border border-border p-3 text-center font-semibold text-yellow-600">
                  {formatNumber(childData.childPreARTRetestMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-yellow-600">
                  {formatNumber(childData.childPreARTRetestFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-yellow-600">
                  {formatNumber(calculateTotal(childData.childPreARTRetestMale, childData.childPreARTRetestFemale))}
                </td>
              </tr>
              
              {/* Child Transfer In */}
              <tr>
                <td className="border border-border p-3 pl-8">កុមារផ្ទេរចូល</td>
                <td className="border border-border p-3 text-center font-semibold text-blue-600">
                  {formatNumber(childData.childTransferInMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-blue-600">
                  {formatNumber(childData.childTransferInFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-blue-600">
                  {formatNumber(calculateTotal(childData.childTransferInMale, childData.childTransferInFemale))}
                </td>
              </tr>
              
              <tr className="bg-gray-100">
                <td className="border border-border p-3 pl-6 font-bold text-gray-700" colSpan="4">
                  ស្ថានភាពកុមារ
                </td>
              </tr>
              
              {/* Child Lost - No ART */}
              <tr>
                <td className="border border-border p-3 pl-12">កុមារបាត់បង់ - គ្មាន ART</td>
                <td className="border border-border p-3 text-center font-semibold text-red-600">
                  {formatNumber(childData.childLostNoARTMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-red-600">
                  {formatNumber(childData.childLostNoARTFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-red-600">
                  {formatNumber(calculateTotal(childData.childLostNoARTMale, childData.childLostNoARTFemale))}
                </td>
              </tr>
              
              {/* Child Lost - With ART */}
              <tr>
                <td className="border border-border p-3 pl-12">កុមារបាត់បង់ - មាន ART</td>
                <td className="border border-border p-3 text-center font-semibold text-red-600">
                  {formatNumber(childData.childLostWithARTMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-red-600">
                  {formatNumber(childData.childLostWithARTFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-red-600">
                  {formatNumber(calculateTotal(childData.childLostWithARTMale, childData.childLostWithARTFemale))}
                </td>
              </tr>
              
              {/* Child Death - No ART */}
              <tr>
                <td className="border border-border p-3 pl-12">កុមារស្លាប់ - គ្មាន ART</td>
                <td className="border border-border p-3 text-center font-semibold text-gray-600">
                  {formatNumber(childData.childDeathNoARTMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-gray-600">
                  {formatNumber(childData.childDeathNoARTFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-gray-600">
                  {formatNumber(calculateTotal(childData.childDeathNoARTMale, childData.childDeathNoARTFemale))}
                </td>
              </tr>
              
              {/* Child Death - With ART */}
              <tr>
                <td className="border border-border p-3 pl-12">កុមារស្លាប់ - មាន ART</td>
                <td className="border border-border p-3 text-center font-semibold text-gray-600">
                  {formatNumber(childData.childDeathWithARTMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-gray-600">
                  {formatNumber(childData.childDeathWithARTFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-gray-600">
                  {formatNumber(calculateTotal(childData.childDeathWithARTMale, childData.childDeathWithARTFemale))}
                </td>
              </tr>
              
              {/* Child Test Negative */}
              <tr>
                <td className="border border-border p-3 pl-12">កុមារពិនិត្យអវិជ្ជមាន</td>
                <td className="border border-border p-3 text-center font-semibold text-purple-600">
                  {formatNumber(childData.childTestNegativeMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-purple-600">
                  {formatNumber(childData.childTestNegativeFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-purple-600">
                  {formatNumber(calculateTotal(childData.childTestNegativeMale, childData.childTestNegativeFemale))}
                </td>
              </tr>
              
              {/* Child Transfer Out */}
              <tr>
                <td className="border border-border p-3 pl-12">កុមារផ្ទេរចេញ</td>
                <td className="border border-border p-3 text-center font-semibold text-blue-600">
                  {formatNumber(childData.childTransferOutMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-blue-600">
                  {formatNumber(childData.childTransferOutFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-blue-600">
                  {formatNumber(calculateTotal(childData.childTransferOutMale, childData.childTransferOutFemale))}
                </td>
              </tr>
              
              {/* Child Subtotal */}
              <tr className="bg-green-100 font-bold">
                <td className="border border-border p-3 pl-6">សរុបកុមារ</td>
                <td className="border border-border p-3 text-center text-green-800">
                  {formatNumber(childData.male || 0)}
                </td>
                <td className="border border-border p-3 text-center text-green-800">
                  {formatNumber(childData.female || 0)}
                </td>
                <td className="border border-border p-3 text-center text-green-800">
                  {formatNumber(childData.total || 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

export default ChildPatientsSection

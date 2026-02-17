import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import React from 'react'
import { User, Activity, AlertTriangle, CheckCircle, XCircle, Heart, Shield, Stethoscope, Pill } from "lucide-react"

const AdultPatientsSection = ({ adultData }) => {
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
          <User className="h-6 w-6 mr-2" />
          <span className="mr-2">អ្នកជំងឺពេញវ័យ (១៥+ ឆ្នាំ)</span>
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
              {/* New OI This Quarter */}
              <tr>
                <td className="border border-border p-3 pl-8 font-semibold">ជំងឺឆ្លងថ្មីនេះត្រីមាស</td>
                <td className="border border-border p-3 text-center font-semibold text-blue-600">
                  {formatNumber(adultData.newOIMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-blue-600">
                  {formatNumber(adultData.newOIFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-blue-600">
                  {formatNumber(calculateTotal(adultData.newOIMale, adultData.newOIFemale))}
                </td>
              </tr>
              
              {/* Previous Pre-ART */}
              <tr>
                <td className="border border-border p-3 pl-8">Pre-ART មុន</td>
                <td className="border border-border p-3 text-center font-semibold text-yellow-600">
                  {formatNumber(adultData.previousPreARTMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-yellow-600">
                  {formatNumber(adultData.previousPreARTFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-yellow-600">
                  {formatNumber(calculateTotal(adultData.previousPreARTMale, adultData.previousPreARTFemale))}
                </td>
              </tr>
              
              {/* New Lost & Return */}
              <tr>
                <td className="border border-border p-3 pl-8">បាត់បង់ និងត្រលប់មកវិញ</td>
                <td className="border border-border p-3 text-center font-semibold text-orange-600">
                  {formatNumber(adultData.newLostReturnMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-orange-600">
                  {formatNumber(adultData.newLostReturnFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-orange-600">
                  {formatNumber(calculateTotal(adultData.newLostReturnMale, adultData.newLostReturnFemale))}
                </td>
              </tr>
              
              {/* New Lost & Return ART */}
              <tr>
                <td className="border border-border p-3 pl-8">បាត់បង់ និងត្រលប់មកវិញ (ART)</td>
                <td className="border border-border p-3 text-center font-semibold text-green-600">
                  {formatNumber(adultData.newLostReturnARTMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-green-600">
                  {formatNumber(adultData.newLostReturnARTFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-green-600">
                  {formatNumber(calculateTotal(adultData.newLostReturnARTMale, adultData.newLostReturnARTFemale))}
                </td>
              </tr>
              
              {/* Previous Patient ART */}
              <tr>
                <td className="border border-border p-3 pl-8">អ្នកជំងឺ ART មុន</td>
                <td className="border border-border p-3 text-center font-semibold text-green-600">
                  {formatNumber(adultData.previousARTMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-green-600">
                  {formatNumber(adultData.previousARTFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-green-600">
                  {formatNumber(calculateTotal(adultData.previousARTMale, adultData.previousARTFemale))}
                </td>
              </tr>
              
              {/* Patient Start ART */}
              <tr>
                <td className="border border-border p-3 pl-8">អ្នកជំងឺចាប់ផ្តើម ART</td>
                <td className="border border-border p-3 text-center font-semibold text-green-600">
                  {formatNumber(adultData.startARTMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-green-600">
                  {formatNumber(adultData.startARTFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-green-600">
                  {formatNumber(calculateTotal(adultData.startARTMale, adultData.startARTFemale))}
                </td>
              </tr>
              
              {/* Pre-ART Count Re-Test */}
              <tr>
                <td className="border border-border p-3 pl-8">Pre-ART រាប់ពិនិត្យឡើងវិញ</td>
                <td className="border border-border p-3 text-center font-semibold text-yellow-600">
                  {formatNumber(adultData.retestMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-yellow-600">
                  {formatNumber(adultData.retestFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-yellow-600">
                  {formatNumber(calculateTotal(adultData.retestMale, adultData.retestFemale))}
                </td>
              </tr>
              
              {/* Patient Transfer In */}
              <tr>
                <td className="border border-border p-3 pl-8">អ្នកជំងឺផ្ទេរចូល</td>
                <td className="border border-border p-3 text-center font-semibold text-blue-600">
                  {formatNumber(adultData.transferInMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-blue-600">
                  {formatNumber(adultData.transferInFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-blue-600">
                  {formatNumber(calculateTotal(adultData.transferInMale, adultData.transferInFemale))}
                </td>
              </tr>
              
              <tr className="bg-gray-100">
                <td className="border border-border p-3 pl-6 font-bold text-gray-700" colSpan="4">
                  ស្ថានភាពអ្នកជំងឺ
                </td>
              </tr>
              
              {/* Lost - No ART */}
              <tr>
                <td className="border border-border p-3 pl-12">បាត់បង់ - គ្មាន ART</td>
                <td className="border border-border p-3 text-center font-semibold text-red-600">
                  {formatNumber(adultData.lostNoARTMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-red-600">
                  {formatNumber(adultData.lostNoARTFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-red-600">
                  {formatNumber(calculateTotal(adultData.lostNoARTMale, adultData.lostNoARTFemale))}
                </td>
              </tr>
              
              {/* Lost - With ART */}
              <tr>
                <td className="border border-border p-3 pl-12">បាត់បង់ - មាន ART</td>
                <td className="border border-border p-3 text-center font-semibold text-red-600">
                  {formatNumber(adultData.lostWithARTMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-red-600">
                  {formatNumber(adultData.lostWithARTFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-red-600">
                  {formatNumber(calculateTotal(adultData.lostWithARTMale, adultData.lostWithARTFemale))}
                </td>
              </tr>
              
              {/* Death - No ART */}
              <tr>
                <td className="border border-border p-3 pl-12">ស្លាប់ - គ្មាន ART</td>
                <td className="border border-border p-3 text-center font-semibold text-gray-600">
                  {formatNumber(adultData.deathNoARTMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-gray-600">
                  {formatNumber(adultData.deathNoARTFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-gray-600">
                  {formatNumber(calculateTotal(adultData.deathNoARTMale, adultData.deathNoARTFemale))}
                </td>
              </tr>
              
              {/* Death - With ART */}
              <tr>
                <td className="border border-border p-3 pl-12">ស្លាប់ - មាន ART</td>
                <td className="border border-border p-3 text-center font-semibold text-gray-600">
                  {formatNumber(adultData.deathWithARTMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-gray-600">
                  {formatNumber(adultData.deathWithARTFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-gray-600">
                  {formatNumber(calculateTotal(adultData.deathWithARTMale, adultData.deathWithARTFemale))}
                </td>
              </tr>
              
              {/* Test Negative */}
              <tr>
                <td className="border border-border p-3 pl-12">ពិនិត្យអវិជ្ជមាន</td>
                <td className="border border-border p-3 text-center font-semibold text-purple-600">
                  {formatNumber(adultData.testNegativeMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-purple-600">
                  {formatNumber(adultData.testNegativeFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-purple-600">
                  {formatNumber(calculateTotal(adultData.testNegativeMale, adultData.testNegativeFemale))}
                </td>
              </tr>
              
              {/* Transfer Out */}
              <tr>
                <td className="border border-border p-3 pl-12">ផ្ទេរចេញ</td>
                <td className="border border-border p-3 text-center font-semibold text-blue-600">
                  {formatNumber(adultData.transferOutMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-blue-600">
                  {formatNumber(adultData.transferOutFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-blue-600">
                  {formatNumber(calculateTotal(adultData.transferOutMale, adultData.transferOutFemale))}
                </td>
              </tr>
              
              <tr className="bg-gray-100">
                <td className="border border-border p-3 pl-6 font-bold text-gray-700" colSpan="4">
                  ការពិនិត្យ TB (Pre-ART)
                </td>
              </tr>
              
              {/* TB Screen - No Symptoms */}
              <tr>
                <td className="border border-border p-3 pl-12">ពិនិត្យ TB - គ្មានរោគសញ្ញា</td>
                <td className="border border-border p-3 text-center font-semibold text-green-600">
                  {formatNumber(adultData.tbScreenNoSymptomsMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-green-600">
                  {formatNumber(adultData.tbScreenNoSymptomsFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-green-600">
                  {formatNumber(calculateTotal(adultData.tbScreenNoSymptomsMale, adultData.tbScreenNoSymptomsFemale))}
                </td>
              </tr>
              
              {/* TB Screen - With Symptoms */}
              <tr>
                <td className="border border-border p-3 pl-12">ពិនិត្យ TB - មានរោគសញ្ញា</td>
                <td className="border border-border p-3 text-center font-semibold text-orange-600">
                  {formatNumber(adultData.tbScreenWithSymptomsMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-orange-600">
                  {formatNumber(adultData.tbScreenWithSymptomsFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-orange-600">
                  {formatNumber(calculateTotal(adultData.tbScreenWithSymptomsMale, adultData.tbScreenWithSymptomsFemale))}
                </td>
              </tr>
              
              <tr className="bg-gray-100">
                <td className="border border-border p-3 pl-6 font-bold text-gray-700" colSpan="4">
                  ការពារវិជ្ជមាន (Pre-ART)
                </td>
              </tr>
              
              {/* Positive Prevent */}
              <tr>
                <td className="border border-border p-3 pl-12">ការពារវិជ្ជមាន</td>
                <td className="border border-border p-3 text-center font-semibold text-purple-600">
                  {formatNumber(adultData.positivePreventMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-purple-600">
                  {formatNumber(adultData.positivePreventFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-purple-600">
                  {formatNumber(calculateTotal(adultData.positivePreventMale, adultData.positivePreventFemale))}
                </td>
              </tr>
              
              <tr className="bg-gray-100">
                <td className="border border-border p-3 pl-6 font-bold text-gray-700" colSpan="4">
                  ការរោចវិនិយោគ និងព្យាបាល TB (Pre-ART)
                </td>
              </tr>
              
              {/* Diagnose TB */}
              <tr>
                <td className="border border-border p-3 pl-12">រោចវិនិយោគ TB</td>
                <td className="border border-border p-3 text-center font-semibold text-red-600">
                  {formatNumber(adultData.diagnoseTBMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-red-600">
                  {formatNumber(adultData.diagnoseTBFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-red-600">
                  {formatNumber(calculateTotal(adultData.diagnoseTBMale, adultData.diagnoseTBFemale))}
                </td>
              </tr>
              
              {/* Treat TB */}
              <tr>
                <td className="border border-border p-3 pl-12">ព្យាបាល TB</td>
                <td className="border border-border p-3 text-center font-semibold text-green-600">
                  {formatNumber(adultData.treatTBMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-green-600">
                  {formatNumber(adultData.treatTBFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-green-600">
                  {formatNumber(calculateTotal(adultData.treatTBMale, adultData.treatTBFemale))}
                </td>
              </tr>
              
              <tr className="bg-gray-100">
                <td className="border border-border p-3 pl-6 font-bold text-gray-700" colSpan="4">
                  ថ្នាំការពារ (Pre-ART)
                </td>
              </tr>
              
              {/* Cotrimoxazole */}
              <tr>
                <td className="border border-border p-3 pl-12">Cotrimoxazole</td>
                <td className="border border-border p-3 text-center font-semibold text-blue-600">
                  {formatNumber(adultData.cotrimoxazoleMale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-blue-600">
                  {formatNumber(adultData.cotrimoxazoleFemale || 0)}
                </td>
                <td className="border border-border p-3 text-center font-semibold text-blue-600">
                  {formatNumber(calculateTotal(adultData.cotrimoxazoleMale, adultData.cotrimoxazoleFemale))}
                </td>
              </tr>
              
              <tr className="bg-gray-100">
                <td className="border border-border p-3 pl-6 font-bold text-gray-700" colSpan="4">
                  ស្ថានភាពមានផ្ទៃពោះ (Pre-ART)
                </td>
              </tr>
              
              {/* Pregnant - New */}
              <tr>
                <td className="border border-border p-3 pl-12">មានផ្ទៃពោះ - ថ្មី</td>
                <td className="border border-border p-3 text-center font-semibold text-pink-600" colSpan="3">
                  {formatNumber(adultData.pregnantNew || 0)}
                </td>
              </tr>
              
              {/* Pregnant - Follow-up */}
              <tr>
                <td className="border border-border p-3 pl-12">មានផ្ទៃពោះ - តាមដាន</td>
                <td className="border border-border p-3 text-center font-semibold text-pink-600" colSpan="3">
                  {formatNumber(adultData.pregnantFollowup || 0)}
                </td>
              </tr>
              
              {/* Pregnant - Not Pregnant */}
              <tr>
                <td className="border border-border p-3 pl-12">មានផ្ទៃពោះ - មិនមានផ្ទៃពោះ</td>
                <td className="border border-border p-3 text-center font-semibold text-pink-600" colSpan="3">
                  {formatNumber(adultData.pregnantNotPregnant || 0)}
                </td>
              </tr>
              
              {/* Pregnant - Pregnant */}
              <tr>
                <td className="border border-border p-3 pl-12">មានផ្ទៃពោះ - មានផ្ទៃពោះ</td>
                <td className="border border-border p-3 text-center font-semibold text-pink-600" colSpan="3">
                  {formatNumber(adultData.pregnantPregnant || 0)}
                </td>
              </tr>
              
              {/* Adult Subtotal */}
              <tr className="bg-blue-100 font-bold">
                <td className="border border-border p-3 pl-6">សរុបអ្នកជំងឺពេញវ័យ</td>
                <td className="border border-border p-3 text-center text-blue-800">
                  {formatNumber(adultData.male || 0)}
                </td>
                <td className="border border-border p-3 text-center text-blue-800">
                  {formatNumber(adultData.female || 0)}
                </td>
                <td className="border border-border p-3 text-center text-blue-800">
                  {formatNumber(adultData.total || 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

export default AdultPatientsSection

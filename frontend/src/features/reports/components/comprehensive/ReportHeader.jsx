import { Card, CardContent, CardHeader, CardTitle, Separator } from "@/components/ui";
import React from 'react'
import { MapPin, Calendar, Building } from "lucide-react"

const ReportHeader = ({ siteInfo, period }) => {
  // Helper function to get quarter text in Khmer
  const getQuarterTextKhmer = (quarter) => {
    const quarters = {
      1: "ត្រីមាសទី១ (មករា - មីនា)",
      2: "ត្រីមាសទី២ (មេសា - មិថុនា)", 
      3: "ត្រីមាសទី៣ (កក្កដា - កញ្ញា)",
      4: "ត្រីមាសទី៤ (តុលា - ធ្នូ)"
    }
    return quarters[quarter] || "ត្រីមាសទី១"
  }

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-800 mb-2">
            របាយការណ៍ជាតិ
          </h1>
          <h2 className="text-lg font-semibold text-gray-700">
            COMPREHENSIVE NATIONAL REPORT
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            ការព្យាបាល និងការថែទាំ HIV/AIDS - ការវិភាគពេញលេញ
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {/* Site Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-4">
          <div className="flex flex-col items-center p-3 bg-white rounded-none shadow-sm">
            <Building className="h-6 w-6 text-blue-600 mb-2" />
            <p className="text-sm text-gray-600">ឈ្មោះមន្ទីរពេទ្យ</p>
            <p className="font-semibold text-lg text-gray-800">{siteInfo?.SiteName || 'មិនមាន'}</p>
          </div>
          <div className="flex flex-col items-center p-3 bg-white rounded-none shadow-sm">
            <MapPin className="h-6 w-6 text-green-600 mb-2" />
            <p className="text-sm text-gray-600">ខេត្ត</p>
            <p className="font-semibold text-lg text-gray-800">{siteInfo?.Province || 'មិនមាន'}</p>
          </div>
          <div className="flex flex-col items-center p-3 bg-white rounded-none shadow-sm">
            <MapPin className="h-6 w-6 text-purple-600 mb-2" />
            <p className="text-sm text-gray-600">ស្រុក</p>
            <p className="font-semibold text-lg text-gray-800">{siteInfo?.District || 'មិនមាន'}</p>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* Reporting Period */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Calendar className="h-5 w-5 text-blue-600 mr-2" />
            <p className="text-sm text-gray-600">រយៈពេលរាយការណ៍</p>
          </div>
          <p className="font-semibold text-lg text-blue-800">
            {period.year ? `${getQuarterTextKhmer(period.quarter)} ${period.year}` : `${period.startDate} ដល់ ${period.endDate}`}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default ReportHeader

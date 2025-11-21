import { Card, CardContent, CardHeader, CardTitle, Button, Skeleton } from "@/components/ui";
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  UserPlus, 
  Users, 
  Baby, 
  RefreshCw, 
} from 'lucide-react'


function PatientList() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  // Simulate loading for demonstration
  const handleRefresh = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    setLoading(false)
  }

  // Simulate initial loading on component mount
  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 500))
      setLoading(false)
    }
    initialLoad()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimalistic Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Patient Management</h1>
              <p className="text-sm text-gray-500 mt-1">Select patient type to manage</p>
            </div>
            <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={loading}
                className="h-9"
            >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
            </Button>
          </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Patient Type Cards */}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border border-gray-200 shadow-none bg-white">
                <CardHeader className="text-center">
                  <Skeleton className="h-12 w-12 mx-auto rounded" />
                  <Skeleton className="h-6 w-32 mx-auto mt-4" />
                </CardHeader>
                <CardContent className="text-center">
                  <Skeleton className="h-4 w-48 mx-auto mb-4" />
                  <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
            ))}
                  </div>
                ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card 
              className="border border-gray-200 shadow-none bg-white hover:border-gray-300 transition-colors cursor-pointer" 
              onClick={() => navigate('/patients/adult')}
            >
              <CardHeader className="text-center pb-4">
                <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                  <Users className="h-8 w-8 text-blue-600" />
              </div>
                <CardTitle className="text-xl">Adult Patients</CardTitle>
            </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="text-sm text-gray-500 mb-6">Manage adult patients (15+ years)</p>
                <Button className="w-full h-9">
                <UserPlus className="w-4 h-4 mr-2" />
                Adult Form
              </Button>
            </CardContent>
          </Card>

            <Card 
              className="border border-gray-200 shadow-none bg-white hover:border-gray-300 transition-colors cursor-pointer" 
              onClick={() => navigate('/patients/child')}
            >
              <CardHeader className="text-center pb-4">
                <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Child Patients</CardTitle>
            </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="text-sm text-gray-500 mb-6">Manage child patients (2-14 years)</p>
                <Button className="w-full h-9" variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Child Form
              </Button>
            </CardContent>
          </Card>

            <Card 
              className="border border-gray-200 shadow-none bg-white hover:border-gray-300 transition-colors cursor-pointer" 
              onClick={() => navigate('/patients/infant')}
            >
              <CardHeader className="text-center pb-4">
                <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-purple-50 flex items-center justify-center">
                  <Baby className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Infant Patients</CardTitle>
            </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="text-sm text-gray-500 mb-6">Manage exposed infants (0-24 months)</p>
                <Button className="w-full h-9" variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Infant Form
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </div>
  )
}

export default PatientList
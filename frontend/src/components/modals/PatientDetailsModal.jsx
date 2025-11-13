import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Button, Input, Badge, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Checkbox } from "@/components/ui";
import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Download, 
  X, 
  User, 
  Users, 
  Baby,
  Calendar,
  FileText,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Clock,
  Eye,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
} from "lucide-react"
// Removed nationalReportApi import - using direct API calls
import LoadingSkeleton from '../common/LoadingSkeleton'

const PatientDetailsModal = ({ category, period, onClose }) => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [viewMode, setViewMode] = useState('table') // 'table' or 'card'
  const [sortField, setSortField] = useState('ClinicID')
  const [sortDirection, setSortDirection] = useState('asc')
  const [selectedPatients, setSelectedPatients] = useState([])
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const itemsPerPageOptions = [10, 20, 50, 100]

  useEffect(() => {
    loadPatientDetails()
  }, [category, period])

  const loadPatientDetails = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
      const token = localStorage.getItem('token')
      
      const response = await fetch(`${API_BASE_URL}/comprehensive-national-report/patient-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category,
          startDate: period.startDate,
          endDate: period.endDate
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setPatients(data.patients || [])
      setTotalCount(data.count || 0)
    } catch (error) {
      console.error('Error loading patient details:', error)
      setError('Failed to load patient details')
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter(patient => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      patient.ClinicID?.toLowerCase().includes(searchLower) ||
      patient.Type?.toLowerCase().includes(searchLower) ||
      patient.Sex?.toString().includes(searchLower) ||
      getGenderText(patient.Sex).toLowerCase().includes(searchLower)
    )
  })

  const sortedPatients = [...filteredPatients].sort((a, b) => {
    const aValue = a[sortField] || ''
    const bValue = b[sortField] || ''
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const totalPages = Math.ceil(sortedPatients.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPatients = sortedPatients.slice(startIndex, endIndex)

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleSelectPatient = (patientId) => {
    setSelectedPatients(prev => 
      prev.includes(patientId) 
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    )
  }

  const handleSelectAll = () => {
    if (selectedPatients.length === currentPatients.length) {
      setSelectedPatients([])
    } else {
      setSelectedPatients(currentPatients.map(p => p.ClinicID))
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'adult': return <User className="h-4 w-4" />
      case 'child': return <Users className="h-4 w-4" />
      case 'infant': return <Baby className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getCategoryTitle = (category) => {
    switch (category) {
      case 'adult': return 'Adult Patients'
      case 'child': return 'Child Patients'
      case 'infant': return 'Infant Patients'
      case 'new': return 'New Patients'
      case 'preart': return 'Pre-ART Patients'
      case 'onart': return 'Patients on ART'
      case 'lost': return 'Lost Patients'
      case 'transferred': return 'Transferred Patients'
      case 'died': return 'Deceased Patients'
      default: return 'Patient Details'
    }
  }

  const getGenderText = (sex) => {
    switch (sex) {
      case 1: return 'Male'
      case 2: return 'Female'
      default: return 'Unknown'
    }
  }

  const getGenderBadgeColor = (sex) => {
    switch (sex) {
      case 1: return 'bg-blue-100 text-blue-800'
      case 2: return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadge = (offIn) => {
    switch (offIn) {
      case 0: return <Badge className="status-active">Active</Badge>
      case 1: return <Badge className="status-warning">Pre-ART</Badge>
      case 2: return <Badge className="status-critical">Lost</Badge>
      case 3: return <Badge className="status-inactive">Transferred</Badge>
      case 4: return <Badge className="status-critical">Died</Badge>
      default: return <Badge variant="outline">Unknown</Badge>
    }
  }

  const exportPatientList = () => {
    const dataStr = JSON.stringify(currentPatients, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `${category}-patients-${period.startDate}-to-${period.endDate}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-7xl h-[95vh] max-h-[95vh] overflow-hidden p-0">
        <DialogHeader className="px-4 sm:px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-none shadow-lg">
                {getCategoryIcon(category)}
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 truncate">
                  {getCategoryTitle(category)}
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-base lg:text-lg text-gray-600">
                  {totalCount.toLocaleString()} patients found for the selected period
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Button
                onClick={loadPatientDetails}
                variant="outline"
                size="sm"
                disabled={loading}
                className="h-8 sm:h-9 px-2 sm:px-4"
              >
                <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${loading ? 'animate-spin' : ''} sm:mr-2`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            {/* Enhanced Search and Controls Bar */}
            <div className="bg-white border border-gray-200 rounded-none p-4 sm:p-6 shadow-sm">
              <div className="space-y-4">
                {/* Search Row */}
                <div className="w-full">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by Clinic ID, Type, or Gender..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10 sm:h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-none w-full"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          loadPatientDetails()
                        }
                      }}
                    />
                  </div>
                </div>
                
                {/* Controls Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="flex items-center space-x-3">
                    <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(parseInt(value))}>
                      <SelectTrigger className="w-20 h-10 border-gray-300 rounded-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {itemsPerPageOptions.map(option => (
                          <SelectItem key={option} value={option.toString()}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="flex items-center border border-gray-300 rounded-none overflow-hidden">
                      <Button
                        variant={viewMode === 'table' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('table')}
                        className="h-10 px-3 rounded-none border-0"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'card' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('card')}
                        className="h-10 px-3 rounded-none border-0"
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {selectedPatients.length > 0 && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>{selectedPatients.length} selected</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPatients([])}
                          className="h-8 px-2"
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                    
                    <Button 
                      onClick={exportPatientList} 
                      variant="outline" 
                      size="sm"
                      className="h-10 px-4"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Period Info Card */}
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-center text-blue-700">
                    <Calendar className="h-5 w-5 mr-3 flex-shrink-0" />
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <span className="font-semibold text-base sm:text-lg">Reporting Period:</span>
                      <span className="ml-0 sm:ml-3 text-sm sm:text-base font-medium">{period.startDate} to {period.endDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="status-active text-sm px-3 py-1">
                      {sortedPatients.length.toLocaleString()} Results
                    </Badge>
                    <Badge variant="outline" className="text-sm px-3 py-1">
                      {viewMode === 'table' ? 'Table View' : 'Card View'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Patient List */}
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-none"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded-none w-1/4"></div>
                            <div className="h-3 bg-muted rounded-none w-1/2"></div>
                          </div>
                          <div className="w-16 sm:w-20 h-6 bg-muted rounded-none"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : error ? (
                <Card className="status-critical">
                  <CardContent className="p-6 sm:p-8 text-center">
                    <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-foreground mx-auto mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Error Loading Patients</h3>
                    <p className="text-sm sm:text-base text-foreground mb-4">{error}</p>
                    <Button onClick={loadPatientDetails} variant="outline" className="border-border text-foreground hover:bg-accent">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              ) : currentPatients.length === 0 ? (
                <Card className="border-border bg-muted">
                  <CardContent className="p-6 sm:p-8 text-center">
                    <Users className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">No Patients Found</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      {searchTerm ? 'No patients match your search criteria.' : 'No patients found for this period.'}
                    </p>
                  </CardContent>
                </Card>
              ) : viewMode === 'table' ? (
                <Card className="border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted">
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedPatients.length === currentPatients.length && currentPatients.length > 0}
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-accent"
                            onClick={() => handleSort('ClinicID')}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Clinic ID</span>
                              {sortField === 'ClinicID' && (
                                sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-accent"
                            onClick={() => handleSort('Type')}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Type</span>
                              {sortField === 'Type' && (
                                sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-accent"
                            onClick={() => handleSort('Sex')}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Gender</span>
                              {sortField === 'Sex' && (
                                sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-accent"
                            onClick={() => handleSort('Age')}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Age</span>
                              {sortField === 'Age' && (
                                sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-accent"
                            onClick={() => handleSort('DaFirstVisit')}
                          >
                            <div className="flex items-center space-x-2">
                              <span>First Visit</span>
                              {sortField === 'DaFirstVisit' && (
                                sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-accent"
                            onClick={() => handleSort('OffIn')}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Status</span>
                              {sortField === 'OffIn' && (
                                sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead className="w-16">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentPatients.map((patient, index) => (
                          <TableRow key={index} className="hover:bg-accent">
                            <TableCell>
                              <Checkbox
                                checked={selectedPatients.includes(patient.ClinicID)}
                                onCheckedChange={() => handleSelectPatient(patient.ClinicID)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-none flex items-center justify-center text-white font-semibold text-sm">
                                  {patient.ClinicID ? patient.ClinicID.charAt(0) : '?'}
                                </div>
                                <span className="truncate">{patient.ClinicID || 'Unknown ID'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {patient.Type || category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{getGenderText(patient.Sex)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <span>{patient.Age || 'N/A'} years</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <span className="truncate">
                                  {patient.DaFirstVisit ? 
                                    new Date(patient.DaFirstVisit).toLocaleDateString() : 
                                    'N/A'
                                  }
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(patient.OffIn)}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              ) : (
                <div className="space-y-3">
                  {currentPatients.map((patient, index) => (
                    <Card 
                      key={index} 
                      className="hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-blue-300 cursor-pointer group"
                    >
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                          <div className="flex items-center space-x-4">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-none flex items-center justify-center text-white font-semibold text-base sm:text-lg shadow-lg">
                                {patient.ClinicID ? patient.ClinicID.charAt(0) : '?'}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-none flex items-center justify-center shadow-md">
                                {getCategoryIcon(category)}
                              </div>
                            </div>

                            {/* Patient Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                                  {patient.ClinicID || 'Unknown ID'}
                                </h3>
                                <Badge variant="outline" className="text-sm self-start">
                                  {patient.Type || category}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  <span className="font-medium truncate">{getGenderText(patient.Sex)}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  <span className="font-medium">{patient.Age || 'N/A'} years</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  <span className="font-medium truncate">
                                    {patient.DaFirstVisit ? 
                                      new Date(patient.DaFirstVisit).toLocaleDateString() : 
                                      'N/A'
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Status and Actions */}
                          <div className="flex items-center justify-between sm:justify-end space-x-4">
                            <div className="text-right">
                              {getStatusBadge(patient.OffIn)}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10"
                            >
                              <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <Card className="border-gray-200 bg-white shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="font-medium">
                        Showing {startIndex + 1} to {Math.min(endIndex, sortedPatients.length)} of {sortedPatients.length.toLocaleString()} patients
                      </span>
                      {selectedPatients.length > 0 && (
                        <span className="text-blue-600 font-medium">
                          ({selectedPatients.length} selected)
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="h-9 px-3"
                      >
                        First
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="h-9 w-9 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                          if (pageNum > totalPages) return null;
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="h-9 w-9 p-0 text-sm font-medium"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="h-9 w-9 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="h-9 px-3"
                      >
                        Last
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PatientDetailsModal

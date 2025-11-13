import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui";
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  UserPlus, 
  Users, 
  Baby, 
  Search, 
  Filter, 
  RefreshCw, 
  Plus,
  MapPin,
  Building2,
  Calendar,
  User,
  ChevronDown,
  SortAsc,
  SortDesc,
  MoreVertical,
  Eye,
  Edit,
  Download
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui'

function PatientList() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [filterGender, setFilterGender] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterAgeRange, setFilterAgeRange] = useState('all')
  const [filterDateRange, setFilterDateRange] = useState('all')
  const [filterReferral, setFilterReferral] = useState('all')
  const [filterSiteCode, setFilterSiteCode] = useState('all')
  const [itemsPerPage, setItemsPerPage] = useState(50)
  const [loading, setLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  // Count active filters
  const activeFiltersCount = [filterGender, filterStatus, filterAgeRange, filterDateRange, filterReferral, filterSiteCode].filter(f => f !== 'all').length + (searchTerm ? 1 : 0)

  // Clear all filters function
  const clearAllFilters = () => {
    setSearchTerm('')
    setFilterGender('all')
    setFilterStatus('all')
    setFilterAgeRange('all')
    setFilterDateRange('all')
    setFilterReferral('all')
    setFilterSiteCode('all')
  }

  // Simulate loading for demonstration
  const handleRefresh = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
    setLastRefresh(new Date())
  }

  // Simulate initial loading on component mount
  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true)
      // Simulate initial data loading
      await new Promise(resolve => setTimeout(resolve, 800))
      setLoading(false)
    }
    initialLoad()
  }, [])

  // Skeleton Components
  const CardSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="h-12 w-12 mx-auto bg-muted rounded-none animate-pulse" />
            <div className="h-6 bg-muted rounded-none w-24 mx-auto animate-pulse" />
          </CardHeader>
          <CardContent className="text-center">
            <div className="h-4 bg-muted rounded-none w-32 mx-auto mb-4 animate-pulse" />
            <div className="h-10 bg-muted rounded-none w-full animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section - Responsive */}
      <div className="flex flex-col space-y-4">
        {/* Top row - Title and primary actions */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-none sm:rounded-none shadow-lg">
              <Users className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-3xl font-bold text-foreground truncate">Patient Management</h1>
              <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Select patient type to manage</span>
              </div>
            </div>
          </div>
          
          {/* Primary actions - responsive */}
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="shadow-sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Mobile subtitle */}
        <div className="sm:hidden">
          <p className="text-sm text-muted-foreground mb-2">Select patient type to manage</p>
        </div>

        {/* Stats row - responsive */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium">
              {loading ? (
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-muted rounded-none animate-pulse" />
                  <span>Loading...</span>
                </div>
              ) : (
                '3 patient types'
              )}
            </Badge>
            {activeFiltersCount > 0 && (
              <Badge variant="destructive" className="px-2 py-1 text-xs">
                {activeFiltersCount} filters
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground hidden sm:block">
            {loading ? (
              <div className="flex items-center space-x-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Updating...</span>
              </div>
            ) : (
              `Last updated: ${lastRefresh.toLocaleTimeString()}`
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters - Mobile optimized */}
        <Card className="border-0 shadow-sm bg-card">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search patient types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-border focus:border-primary focus:ring-primary"
              />
            </div>
            
            {/* Filter Controls */}
            <div className="flex gap-2 sm:gap-3 items-center">
              {/* Desktop Filter Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="hidden sm:flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>

              {/* Mobile Filter Sheet */}
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="sm:hidden flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    {activeFiltersCount > 0 && (
                      <Badge variant="destructive" className="px-1.5 py-0.5 text-xs">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh]">
                  <SheetHeader>
                    <SheetTitle>Filter Patient Types</SheetTitle>
                    <SheetDescription>
                      Apply filters to narrow down the patient type selection
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="grid grid-cols-1 gap-4 mt-6 overflow-y-auto max-h-[60vh]">
                    {/* Mobile filter controls - single column */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Gender Focus</label>
                      <Select value={filterGender} onValueChange={setFilterGender}>
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="adult">Adult (15+ years)</SelectItem>
                          <SelectItem value="child">Child (2-14 years)</SelectItem>
                          <SelectItem value="infant">Infant (0-24 months)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Age Range</label>
                      <Select value={filterAgeRange} onValueChange={setFilterAgeRange}>
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Ages</SelectItem>
                          <SelectItem value="0-24months">0-24 months</SelectItem>
                          <SelectItem value="2-14years">2-14 years</SelectItem>
                          <SelectItem value="15+years">15+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Referral Status</label>
                      <Select value={filterReferral} onValueChange={setFilterReferral}>
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Referrals</SelectItem>
                          <SelectItem value="referred">Referred</SelectItem>
                          <SelectItem value="not_referred">Not Referred</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-6 pt-4 border-t">
                    <Button variant="outline" onClick={clearAllFilters} className="flex-1">
                      Clear All
                    </Button>
                    <Button onClick={() => setMobileFiltersOpen(false)} className="flex-1">
                      Apply Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              
              {/* Items per page selector */}
              <Select value={itemsPerPage ? itemsPerPage.toString() : "all"} onValueChange={(v) => setItemsPerPage(v === "all" ? null : parseInt(v))}>
                <SelectTrigger className="w-16 sm:w-20 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="250">250</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                  <SelectItem value="1000">1K</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Desktop Advanced Filters Panel */}
      {showFilters && (
        <Card className="border-0 shadow-sm bg-card">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {/* Gender Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Gender</label>
                <Select value={filterGender} onValueChange={setFilterGender}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="transferred">Transferred</SelectItem>
                    <SelectItem value="deceased">Deceased</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Site Code Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Site Code</label>
                <Select value={filterSiteCode} onValueChange={setFilterSiteCode}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sites</SelectItem>
                    <SelectItem value="site1">Site 1</SelectItem>
                    <SelectItem value="site2">Site 2</SelectItem>
                    <SelectItem value="site3">Site 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Age Range Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Age Range</label>
                <Select value={filterAgeRange} onValueChange={setFilterAgeRange}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ages</SelectItem>
                    <SelectItem value="0-24months">0-24 months</SelectItem>
                    <SelectItem value="2-14years">2-14 years</SelectItem>
                    <SelectItem value="15+years">15+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">First Visit</label>
                <Select value={filterDateRange} onValueChange={setFilterDateRange}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="1year">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Referral Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Referral Status</label>
                <Select value={filterReferral} onValueChange={setFilterReferral}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Referrals</SelectItem>
                    <SelectItem value="referred">Referred</SelectItem>
                    <SelectItem value="not_referred">Not Referred</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                {loading ? (
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-muted rounded-none animate-pulse" />
                    <span>Loading patient types...</span>
                  </div>
                ) : (
                  'Showing 3 patient types'
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  disabled={loading}
                >
                  Clear All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  disabled={loading}
                >
                  Close
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Patient Type Cards */}
      {loading ? (
        <CardSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/patients/adult')}>
            <CardHeader className="text-center">
              <Users className="h-12 w-12 mx-auto text-primary" />
              <CardTitle>Adult Patients</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">Manage adult patients (15+ years)</p>
              <Button className="w-full">
                <UserPlus className="w-4 h-4 mr-2" />
                Adult Form
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/patients/child')}>
            <CardHeader className="text-center">
              <Users className="h-12 w-12 mx-auto text-primary" />
              <CardTitle>Child Patients</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">Manage child patients (2-14 years)</p>
              <Button className="w-full" variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Child Form
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/patients/infant')}>
            <CardHeader className="text-center">
              <Baby className="h-12 w-12 mx-auto text-primary" />
              <CardTitle>Infant Patients</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">Manage exposed infants (0-24 months)</p>
              <Button className="w-full" variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Infant Form
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default PatientList
import { Button, Input, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Alert, AlertDescription, Skeleton } from '@/components/ui';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../../../../services/api";
import { useSite } from "../../../../contexts/SiteContext";

function ChildVisitList() {
  const navigate = useNavigate();
  const { selectedSite } = useSite();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalVisits, setTotalVisits] = useState(0);
  const [availableSites, setAvailableSites] = useState([]);
  const [userSelectedSite, setUserSelectedSite] = useState(null);
  const [nationalities, setNationalities] = useState([]);
  const [availableNationalities, setAvailableNationalities] = useState([]);
  
  // Filter states
  const [dateRange, setDateRange] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ageRange, setAgeRange] = useState('all');
  const [nationalityFilter, setNationalityFilter] = useState('all');

  // Load lookup data
  const loadLookupData = async () => {
    try {
      const nationalitiesRes = await api.get('/apiv1/lookups/nationalities');
      setNationalities(nationalitiesRes.data || []);
    } catch (error) {
      console.error('Error loading lookup data:', error);
    }
  }

  // Extract unique nationalities from visit data
  const updateAvailableNationalities = (visitData) => {
    const uniqueNationalities = [...new Set(visitData
      .map(visit => visit.nationality)
      .filter(nationality => nationality !== null && nationality !== undefined && nationality !== '' && nationality !== -1 && nationality !== 0)
    )].map(nationalityId => {
      const nationality = nationalities.find(n => n.id == nationalityId);
      return nationality ? { id: nationalityId, name: nationality.name } : { id: nationalityId, name: `Nationality ${nationalityId}` };
    }).sort((a, b) => a.name.localeCompare(b.name));
    
    setAvailableNationalities(uniqueNationalities);
  }

  // Load visits
  const loadVisits = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });
      
      if (searchTerm?.trim()) {
        params.append('search', searchTerm.trim());
      }
      
      if (userSelectedSite?.name) {
        params.append('site', userSelectedSite.name);
      }
      
      // Add filter parameters
      if (dateRange && dateRange !== 'all') {
        params.append('dateRange', dateRange);
      }
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (ageRange && ageRange !== 'all') {
        params.append('ageRange', ageRange);
      }
      if (nationalityFilter && nationalityFilter !== 'all') {
        params.append('nationality', nationalityFilter);
      }
      
      const response = await api.get(`/apiv1/visits/child?${params.toString()}`);
      const visitData = response.data.visits || [];
      setVisits(visitData);
      setTotalVisits(response.data.total || 0);
      
      // Update available nationalities based on current data
      updateAvailableNationalities(visitData);
    } catch (error) {
      setError('Error loading child visits');
      setVisits([]);
      setTotalVisits(0);
    } finally {
      setLoading(false);
    }
  };

  // Load sites
  const loadSites = async () => {
    try {
      const response = await api.get('/apiv1/lookups/sites-registry');
      setAvailableSites(response.data || []);
    } catch (error) {
      console.error('Error loading sites:', error);
    }
  };

  useEffect(() => {
    loadSites();
    loadLookupData();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(loadVisits, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, userSelectedSite, currentPage, itemsPerPage, dateRange, statusFilter, ageRange, nationalityFilter]);

  const handleSiteChange = (siteCode) => {
    if (siteCode === 'all') {
      setUserSelectedSite(null);
    } else {
      const site = availableSites.find(s => s.code === siteCode);
      setUserSelectedSite(site);
    }
  };

  const getStatusBadge = (visit) => {
    const status = visit.status || 'Active';
    const isActive = status === 'Active';
    return (
      <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getNationalityLabel = (nationality) => {
    if (nationality === null || nationality === undefined || nationality === '') return '';
    
    // Handle special case for 0 (Not Specified) - don't show this
    if (nationality === 0) return '';
    
    // Find nationality in loaded data
    const foundNationality = nationalities.find(nat => nat.id == nationality);
    if (foundNationality) {
      return foundNationality.name;
    }
    
    return `Nationality ${nationality}`;
  };

  const totalPages = Math.ceil(totalVisits / itemsPerPage);

    return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold text-foreground">Child Visits</h2>
          <Badge variant="outline">{totalVisits.toLocaleString()}</Badge>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadVisits} variant="outline" size="sm" disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button onClick={() => navigate('/visits/child/new')} size="sm">
            New Visit
          </Button>
        </div>
          </div>
          
      {/* Search and Site Filter */}
          <div className="flex gap-3">
        <div className="flex-1">
              <Input
            placeholder="Search child visits..."
                value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
            </div>
        <Select value={userSelectedSite?.code || 'all'} onValueChange={handleSiteChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Sites" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sites</SelectItem>
            {availableSites.map((site) => (
              <SelectItem key={site.code} value={site.code}>
                {site.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
          </div>

      {/* Standard Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Date Range Filter */}
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger>
            <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
            <SelectItem value="all">All Periods</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
            <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="dead">Dead</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
            <SelectItem value="transferred">Transferred Out</SelectItem>
                </SelectContent>
              </Select>

        {/* Age Range Filter */}
        <Select value={ageRange} onValueChange={setAgeRange}>
          <SelectTrigger>
            <SelectValue placeholder="Age Range" />
                </SelectTrigger>
                <SelectContent>
            <SelectItem value="all">All Ages</SelectItem>
            <SelectItem value="0-2">0-2 years</SelectItem>
            <SelectItem value="2-5">2-5 years</SelectItem>
            <SelectItem value="5-10">5-10 years</SelectItem>
            <SelectItem value="10-14">10-14 years</SelectItem>
                </SelectContent>
              </Select>

        {/* Nationality Filter */}
        <Select value={nationalityFilter} onValueChange={setNationalityFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Nationality" />
              </SelectTrigger>
              <SelectContent>
            <SelectItem value="all">All Nationalities</SelectItem>
            {availableNationalities.map((nationality) => (
              <SelectItem key={nationality.id} value={nationality.id.toString()}>
                {nationality.name}
              </SelectItem>
            ))}
              </SelectContent>
            </Select>

        {/* Clear Filters */}
        <Button 
          variant="outline" 
          onClick={() => {
            setDateRange('all');
            setStatusFilter('all');
            setAgeRange('all');
            setNationalityFilter('all');
          }}
          className="w-full"
        >
          Clear Filters
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Visit List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border rounded-none animate-pulse">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-10 h-10 rounded-none" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ))}
          </div>
      ) : visits.length === 0 ? (
        <div className="text-center py-12">
            <h3 className="text-lg font-medium text-foreground mb-2">No visits found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Try adjusting your search' : 'No child visits recorded yet'}
          </p>
          <Button onClick={() => navigate('/visits/child/new')}>
            Add First Visit
              </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {visits.map((visit, index) => (
            <div key={`${visit.visitId || visit.id}-${visit.site_code || visit.siteName || index}`} className="p-4 border rounded-none hover:bg-accent transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-sm font-medium text-foreground truncate">
                      Visit {visit.visitId || visit.id}
                    </h3>
                </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Site: {visit.siteName || 'N/A'}</span>
                    <span>Date: {formatDate(visit.visitDate)}</span>
                    <span className="font-medium text-foreground">Patient ID: {visit.patientId || 'N/A'}</span>
                    {visit.artNumber && <span>ART: {visit.artNumber}</span>}
                  </div>
                  <div className="flex items-center space-x-4 text-sm mt-1">
                    <span className={`px-2 py-1 rounded-none text-xs font-medium ${
                      visit.sex === 'Male' ? 'status-active' : 'status-warning'
                    }`}>
                      {visit.sex || 'Unknown'}
                    </span>
                    <span className={`px-2 py-1 rounded-none text-xs font-medium ${
                      visit.patientStatus === 'Active' ? 'status-active' :
                      visit.patientStatus === 'Dead' ? 'status-critical' :
                      visit.patientStatus === 'Lost' ? 'status-warning' :
                      visit.patientStatus === 'Transferred Out' ? 'status-inactive' :
                      'status-inactive'
                    }`}>
                      {visit.patientStatus || 'Unknown'}
                    </span>
                    {visit.hivViral && visit.hivViral !== '0' && (
                      <span className="px-2 py-1 rounded-none text-xs font-medium viral-load-high">
                        VL: {visit.hivViral}
                      </span>
                    )}
                    {visit.cd4 && (
                      <span className="px-2 py-1 rounded-none text-xs font-medium cd4-high">
                        CD4: {visit.cd4}
                      </span>
                    )}
                    {visit.nationality !== null && visit.nationality !== undefined && visit.nationality !== '' && visit.nationality !== -1 && visit.nationality !== 0 && getNationalityLabel(visit.nationality) && (
                      <span className="px-2 py-1 rounded-none text-xs font-medium cd4-low">
                        {getNationalityLabel(visit.nationality)}
                        </span>
                    )}
                      </div>
                  {visit.notes && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Notes: </span>
                      {visit.notes.length > 100 ? `${visit.notes.substring(0, 100)}...` : visit.notes}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/visits/child/${visit.id}`)}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/visits/child/${visit.id}/edit`)}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
                            </div>
                          )}

      {/* Simple Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
                        </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
                              </Button>
              </div>
            </div>
      )}
    </div>
  );
}

export default ChildVisitList;
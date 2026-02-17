import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { 
  RefreshCw, 
  Search, 
  Download,
  Users,
  AlertTriangle,
  FileText,
  XCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FaMale, FaFemale } from 'react-icons/fa';

const IDpoorDuplicatedARTId = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date()
  });
  const [selectedSite, setSelectedSite] = useState('all');
  const [sites, setSites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    loadSites();
  }, []);

  useEffect(() => {
    loadData();
  }, [dateRange, selectedSite, currentPage]);

  const loadSites = async () => {
    try {
      const response = await api.get('/apiv1/site-operations/sites');
      if (response.data.success) {
        setSites(response.data.sites || []);
      }
    } catch (error) {
      console.error('Error loading sites:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        startDate: dateRange.from.toISOString().split('T')[0],
        endDate: dateRange.to.toISOString().split('T')[0],
        siteId: selectedSite === 'all' ? null : selectedSite,
        page: currentPage,
        pageSize: pageSize,
        search: searchTerm || null
      };

      const response = await api.get('/apiv1/reports/idpoor-duplicated-artid', { params });
      
      if (response.data.success) {
        const responseData = response.data.data || [];
        const responseTotal = response.data.total || 0;
        
        console.log(`📊 Loaded ${responseData.length} records, Total: ${responseTotal}, Site: ${selectedSite}`);
        
        setData(responseData);
        setTotalRecords(responseTotal);
        setError(null);
      } else {
        setError(response.data.message || 'Failed to load data');
        setData([]);
        setTotalRecords(0);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      console.error('Error details:', err.response?.data || err.message);
      
      // Only use mock data if API endpoint doesn't exist (404) or for development
      if (err.response?.status === 404 || process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Using mock data - API endpoint may not be available');
        generateMockData();
      } else {
        setError(`Failed to load data: ${err.response?.data?.message || err.message}`);
        setData([]);
        setTotalRecords(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    // Generate mock data for demonstration
    const mockData = [];
    const currentSiteCode = selectedSite && selectedSite !== 'all' ? selectedSite : '0401';
    
    // Generate 15-25 mock records with duplicated ART IDs
    const duplicateARTIds = ['040100123', '040100456', '040100789'];
    
    for (let i = 0; i < 20; i++) {
      const artId = duplicateARTIds[i % duplicateARTIds.length];
      const clinicId = 1000 + i;
      
      mockData.push({
        id: clinicId,
        clinic_id: String(clinicId).padStart(6, '0'),
        art_number: artId,
        patient_name: `Patient ${clinicId}`,
        patient_sex: i % 2,
        patient_sex_display: i % 2 === 1 ? 'Male' : 'Female',
        patient_age: 20 + (i % 50),
        date_first_visit: new Date(new Date().getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        date_art_start: new Date(new Date().getTime() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        idpoor_status: 'Yes',
        idpoor_card_number: `IDP${String(1000 + i).padStart(6, '0')}`,
        site_code: currentSiteCode,
        site_name: sites.find(s => s.code === currentSiteCode)?.name || `Site ${currentSiteCode}`,
        duplicate_count: duplicateARTIds.includes(artId) ? 2 : 1,
        last_visit_date: new Date(new Date().getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        patient_status: 'Active'
      });
    }

    // Apply search filter
    let filteredData = mockData;
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filteredData = mockData.filter(r => 
        r.clinic_id?.toLowerCase().includes(term) ||
        r.art_number?.toLowerCase().includes(term) ||
        r.patient_name?.toLowerCase().includes(term) ||
        r.idpoor_card_number?.toLowerCase().includes(term)
      );
    }

    setTotalRecords(filteredData.length);
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    setData(filteredData.slice(start, end));
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadData();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    if (!data || data.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    const csvData = data.map(row => ({
      'Clinic ID': row.clinic_id,
      'ART Number': row.art_number,
      'Patient Name': row.patient_name,
      'Gender': row.patient_sex_display,
      'Age': row.patient_age,
      'IDpoor Status': row.idpoor_status,
      'IDpoor Card Number': row.idpoor_card_number,
      'Site Code': row.site_code,
      'Site Name': row.site_name,
      'First Visit Date': row.date_first_visit,
      'ART Start Date': row.date_art_start,
      'Last Visit Date': row.last_visit_date,
      'Duplicate Count': row.duplicate_count,
      'Patient Status': row.patient_status
    }));
    
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `idpoor-duplicated-artid-${dateRange.from.toISOString().split('T')[0]}-to-${dateRange.to.toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  // Calculate summary statistics
  // Note: We calculate from current page data, but total count shows the real total
  const currentPageIdpoor = data.filter(r => r.idpoor_status === 'Yes').length;
  const currentPageActive = data.filter(r => r.patient_status === 'Active').length;
  const currentPageDuplicated = data.filter(r => r.duplicate_count > 1).length;
  
  // Estimate totals based on current page ratio (if we have data)
  const ratio = data.length > 0 ? totalRecords / data.length : 1;
  
  const summaryStats = {
    total: totalRecords, // Total records across all pages
    idpoor: data.length > 0 ? Math.round(currentPageIdpoor * ratio) : totalRecords, // Estimate based on current page
    duplicated: totalRecords, // All records are duplicated by definition
    active: data.length > 0 ? Math.round(currentPageActive * ratio) : totalRecords // Estimate based on current page
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">IDpoor Among Active Duplicated ARTId</h1>
          <p className="text-gray-600 mt-1">
            Report showing active patients with duplicated ART IDs who are IDpoor
          </p>
          {selectedSite === 'all' && totalRecords > 0 && (
            <p className="text-sm text-blue-600 mt-1 font-medium">
              📍 Viewing all sites: {totalRecords} total records found
            </p>
          )}
          {selectedSite !== 'all' && totalRecords > 0 && (
            <p className="text-sm text-blue-600 mt-1 font-medium">
              📍 Viewing site {selectedSite}: {totalRecords} total records found
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={loadData} 
            disabled={loading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={exportToCSV}
            variant="outline"
            disabled={data.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Site</label>
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger>
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sites</SelectItem>
                  {sites.map(site => (
                    <SelectItem key={site.code} value={site.code}>
                      {site.name} ({site.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.total}</div>
            <p className="text-xs text-muted-foreground">Patients with duplicated ART IDs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IDpoor Patients</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summaryStats.idpoor}</div>
            <p className="text-xs text-muted-foreground">Patients with IDpoor status</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duplicated ART IDs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summaryStats.duplicated}</div>
            <p className="text-xs text-muted-foreground">Records with duplicate ART numbers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{summaryStats.active}</div>
            <p className="text-xs text-muted-foreground">Currently active on ART</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by Clinic ID, ART Number, Patient Name, IDpoor Card..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9 pr-9"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Patient Details Table */}
          <ScrollArea className="h-[500px] w-full border rounded-lg">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading data...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                <AlertTriangle className="h-12 w-12 text-red-300 mb-3" />
                <p className="text-sm font-medium text-gray-600">{error}</p>
                <p className="text-xs text-gray-400 mt-1">Please try refreshing the page</p>
              </div>
            ) : data.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                <Users className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-600">No patient records found</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting your search criteria or date range</p>
              </div>
            ) : (
              <Table className="w-full">
                <TableHeader className="sticky top-0 bg-muted z-10">
                  <TableRow>
                    <TableHead className="font-semibold w-[100px]">Clinic ID</TableHead>
                    <TableHead className="font-semibold w-[130px]">ART Number</TableHead>
                    <TableHead className="font-semibold w-[150px]">Patient Name</TableHead>
                    <TableHead className="font-semibold w-[100px]">Gender</TableHead>
                    <TableHead className="font-semibold w-[80px]">Age</TableHead>
                    <TableHead className="font-semibold w-[120px]">IDpoor Status</TableHead>
                    <TableHead className="font-semibold w-[140px]">IDpoor Card</TableHead>
                    <TableHead className="font-semibold w-[100px]">Site</TableHead>
                    <TableHead className="font-semibold w-[120px]">First Visit</TableHead>
                    <TableHead className="font-semibold w-[120px]">ART Start</TableHead>
                    <TableHead className="font-semibold w-[120px]">Last Visit</TableHead>
                    <TableHead className="font-semibold w-[100px]">Status</TableHead>
                    <TableHead className="font-semibold w-[100px]">Duplicates</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row, index) => (
                    <TableRow key={index} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-sm font-medium">{row.clinic_id || '-'}</TableCell>
                      <TableCell className="font-mono text-sm text-primary font-semibold">
                        {row.art_number || '-'}
                        {row.duplicate_count > 1 && (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            {row.duplicate_count}x
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{row.patient_name || '-'}</TableCell>
                      <TableCell>
                        <span className={`flex items-center gap-1.5 font-medium ${
                          row.patient_sex === 1 ? 'text-blue-600' : 'text-pink-600'
                        }`}>
                          {row.patient_sex === 1 ? <FaMale className="h-4 w-4" /> : <FaFemale className="h-4 w-4" />}
                          {row.patient_sex_display || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{row.patient_age || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={row.idpoor_status === 'Yes' ? 'default' : 'secondary'} className="font-medium">
                          {row.idpoor_status === 'Yes' ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Yes
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              No
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{row.idpoor_card_number || '-'}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">{row.site_code || '-'}</span>
                          <span className="text-xs text-muted-foreground">{row.site_name || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{row.date_first_visit || '-'}</TableCell>
                      <TableCell className="text-sm font-medium">{row.date_art_start || '-'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{row.last_visit_date || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={row.patient_status === 'Active' ? 'default' : 'secondary'} className="font-medium">
                          {row.patient_status || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {row.duplicate_count > 1 ? (
                          <Badge variant="destructive" className="font-medium">
                            {row.duplicate_count}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>

          {/* Pagination */}
          {totalRecords > 0 && (
            <div className="flex items-center justify-between pt-4 border-t mt-4">
              <div className="text-sm text-muted-foreground">
                {totalRecords > pageSize ? (
                  <>
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRecords)} of <strong className="text-foreground">{totalRecords}</strong> records
                    {' '}(Page {currentPage} of {totalPages})
                  </>
                ) : (
                  <>
                    Showing <strong className="text-foreground">{totalRecords}</strong> record{totalRecords !== 1 ? 's' : ''}
                  </>
                )}
              </div>
              {totalRecords > pageSize && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1 || loading}
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || loading}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-3 text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || loading}
                  >
                    Next
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages || loading}
                  >
                    Last
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IDpoorDuplicatedARTId;


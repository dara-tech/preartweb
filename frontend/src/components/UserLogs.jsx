import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Activity, Filter, RefreshCw, Download, Eye, Search, Calendar, User, Clock, ChevronLeft, ChevronRight, TrendingUp, Users, Shield, AlertTriangle, CheckCircle, XCircle, Globe, Smartphone, Monitor, BarChart3, PieChart, LineChart } from 'lucide-react';
import userLogsApi from '../services/userLogsApi';

const UserLogs = ({ users = [] }) => {
  // User logs state
  const [userLogs, setUserLogs] = useState([]);
  const [logStats, setLogStats] = useState(null);
  const [logsLoading, setLogsLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalLogs, setTotalLogs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(25);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);
  
  const [logFilters, setLogFilters] = useState({
    page: 1,
    limit: 25,
    userId: 'all',
    action: 'all',
    startDate: '',
    endDate: '',
    search: ''
  });

  // Advanced features state
  const [viewMode, setViewMode] = useState('table'); // table, grid, chart
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [timeRange, setTimeRange] = useState('7d'); // 1d, 7d, 30d, 90d, all
  const [deviceStats, setDeviceStats] = useState(null);
  const [locationStats, setLocationStats] = useState(null);

  useEffect(() => {
    fetchUserLogs();
    fetchLogStats();
  }, []);

  useEffect(() => {
    fetchUserLogs();
  }, [logFilters, currentPage, logsPerPage]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchUserLogs();
        fetchLogStats();
      }, 30000); // Refresh every 30 seconds
      setRefreshInterval(interval);
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefresh]);

  // Fetch user logs
  const fetchUserLogs = async () => {
    try {
      setLogsLoading(true);
      // Filter out "all" values and empty strings
      const filters = { 
        ...logFilters, 
        page: currentPage, 
        limit: logsPerPage,
        search: searchTerm 
      };
      if (filters.userId === 'all') filters.userId = '';
      if (filters.action === 'all') filters.action = '';
      
      const data = await userLogsApi.getUserLogs(filters);
      
      if (data.success) {
        // Process and normalize the logs data
        const processedLogs = data.data.logs.map(log => ({
          ...log,
          // Ensure timestamp is properly formatted
          timestamp: log.timestamp || log.created_at || log.date || new Date().toISOString(),
          // Backend already provides correct user structure, just ensure it exists
          user: log.user || {
            id: log.userId || 'unknown',
            username: 'Unknown',
            fullName: 'N/A',
            role: 'Unknown'
          },
          // Ensure other fields have proper fallbacks
          ipAddress: log.ipAddress || log.ip_address || log.ip || log.client_ip || '-',
          userAgent: log.userAgent || log.user_agent || log.user_agent_string || null,
          action: log.action || log.activity || 'unknown'
        }));
        
        setUserLogs(processedLogs);
        setTotalLogs(data.data.total || data.data.logs.length);
      }
    } catch (err) {
      console.error('Failed to fetch user logs:', err);
      setUserLogs([]);
      setTotalLogs(0);
    } finally {
      setLogsLoading(false);
    }
  };

  // Fetch user log statistics
  const fetchLogStats = async () => {
    try {
      const data = await userLogsApi.getUserLogStats({
        startDate: logFilters.startDate,
        endDate: logFilters.endDate
      });
      if (data.success) {
        setLogStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch log stats:', err);
    }
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle logs per page change
  const handleLogsPerPageChange = (value) => {
    setLogsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  // Handle log detail view
  const handleLogDetail = (log) => {
    setSelectedLog(log);
    setIsDetailDialogOpen(true);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchUserLogs();
    fetchLogStats();
  };

  // Handle export
  const handleExport = () => {
    const csvContent = [
      ['User', 'Action', 'Timestamp', 'IP Address', 'User Agent'],
      ...userLogs.map(log => [
        log.user?.username || 'Unknown',
        log.action,
        new Date(log.timestamp).toLocaleString(),
        log.ipAddress || '-',
        log.userAgent || '-'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Utility function to safely format dates
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Invalid Date';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleString();
    } catch (error) {
      console.error('Error formatting timestamp:', error, timestamp);
      return 'Invalid Date';
    }
  };

  // Advanced utility functions
  const getDeviceIcon = (userAgent) => {
    if (!userAgent) return <Monitor className="h-4 w-4" />;
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="h-4 w-4" />;
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return <Monitor className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const getBrowserInfo = (userAgent) => {
    if (!userAgent) return 'Unknown';
    const ua = userAgent.toLowerCase();
    if (ua.includes('chrome')) return 'Chrome';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('safari')) return 'Safari';
    if (ua.includes('edge')) return 'Edge';
    return 'Other';
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'N/A';
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const calculateStats = () => {
    if (!userLogs.length) return null;
    
    const totalUsers = userLogs.length;
    const activeUsers = userLogs.filter(log => log.status === 1).length;
    const loginUsers = userLogs.filter(log => log.action === 'login').length;
    const neverLoggedIn = userLogs.filter(log => log.action === 'never_logged_in').length;
    
    // Device stats
    const devices = userLogs.reduce((acc, log) => {
      const device = getBrowserInfo(log.userAgent);
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});
    
    // Location stats (simplified)
    const locations = userLogs.reduce((acc, log) => {
      const location = log.ipAddress || 'Unknown';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalUsers,
      activeUsers,
      loginUsers,
      neverLoggedIn,
      devices,
      locations
    };
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    const now = new Date();
    let startDate = '';
    
    switch (range) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = '';
    }
    
    setLogFilters(prev => ({
      ...prev,
      startDate: startDate ? startDate.toISOString().split('T')[0] : '',
      endDate: range === 'all' ? '' : now.toISOString().split('T')[0]
    }));
  };

  // Advanced sorting function
  const sortLogs = (logs) => {
    return [...logs].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'username':
          aValue = a.user?.username || a.username || '';
          bValue = b.user?.username || b.username || '';
          break;
        case 'loginCount':
          aValue = a.loginCount || 0;
          bValue = b.loginCount || 0;
          break;
        case 'role':
          aValue = a.user?.role || '';
          bValue = b.user?.role || '';
          break;
        case 'timestamp':
        default:
          aValue = new Date(a.timestamp || 0);
          bValue = new Date(b.timestamp || 0);
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Get sorted and filtered logs
  const getDisplayLogs = () => {
    let filteredLogs = userLogs;
    
    // Apply search filter
    if (searchTerm) {
      filteredLogs = filteredLogs.filter(log => {
        const username = log.user?.username || log.username || '';
        const fullName = log.user?.fullName || log.fullName || '';
        const searchLower = searchTerm.toLowerCase();
        return username.toLowerCase().includes(searchLower) || 
               fullName.toLowerCase().includes(searchLower);
      });
    }
    
    return sortLogs(filteredLogs);
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalLogs / logsPerPage);
  const startIndex = (currentPage - 1) * logsPerPage + 1;
  const endIndex = Math.min(currentPage * logsPerPage, totalLogs);

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Advanced Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            User Activity Analytics
          </h2>
          <p className="text-muted-foreground mt-1">Advanced monitoring and analysis of user activities</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={logsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${logsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={userLogs.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Clock className="h-4 w-4 mr-2" />
            {autoRefresh ? 'Auto ON' : 'Auto OFF'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Logged In</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.loginUsers}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Never Logged In</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.neverLoggedIn}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Advanced Filters & Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Time Range Quick Select */}
              <div className="space-y-2">
                <Label>Time Range</Label>
                <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1d">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="90d">Last 90 Days</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* View Mode */}
              <div className="space-y-2">
                <Label>View Mode</Label>
                <Select value={viewMode} onValueChange={setViewMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="table">Table View</SelectItem>
                    <SelectItem value="grid">Grid View</SelectItem>
                    <SelectItem value="chart">Chart View</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Options */}
              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="timestamp">Last Activity</SelectItem>
                    <SelectItem value="username">Username</SelectItem>
                    <SelectItem value="loginCount">Login Count</SelectItem>
                    <SelectItem value="role">Role</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <Label>Order</Label>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Log Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Search Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs by user, action, or table..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="log-user">User</Label>
                <Select 
                  value={logFilters.userId} 
                  onValueChange={(value) => setLogFilters({...logFilters, userId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.username} ({user.fullName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="log-action">Action</Label>
                <Select 
                  value={logFilters.action} 
                  onValueChange={(value) => setLogFilters({...logFilters, action: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="never_logged_in">Never Logged In</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={logFilters.startDate}
                  onChange={(e) => setLogFilters({...logFilters, startDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={logFilters.endDate}
                  onChange={(e) => setLogFilters({...logFilters, endDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="logs-per-page">Logs per Page</Label>
                <Select 
                  value={logsPerPage.toString()} 
                  onValueChange={handleLogsPerPageChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Log Statistics */}
      {logStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Login Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {logStats.loginStats?.slice(0, 7).map((stat, index) => (
                  <div key={`login-stat-${stat.date}-${index}`} className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{stat.date}</span>
                    <span className="font-medium">{stat.count} logins</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Most Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {logStats.activeUsers?.slice(0, 7).map((user, index) => (
                  <div key={`active-user-${user.user?.id || user.user?.username}-${index}`} className="flex justify-between">
                    <span className="text-sm">{user.user?.username}</span>
                    <span className="font-medium">{user.loginCount} logins</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Advanced User Logs Display */}
      <Tabs value={viewMode} onValueChange={setViewMode} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Table View
            </TabsTrigger>
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Grid View
            </TabsTrigger>
            <TabsTrigger value="chart" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>
          <div className="text-sm text-muted-foreground">
            Showing {startIndex}-{endIndex} of {totalLogs} logs
          </div>
        </div>

        <TabsContent value="table">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">User</TableHead>
                      <TableHead className="min-w-[120px]">Action</TableHead>
                      <TableHead className="min-w-[150px]">Last Activity</TableHead>
                      <TableHead className="min-w-[120px]">IP Address</TableHead>
                      <TableHead className="min-w-[100px]">Device</TableHead>
                      <TableHead className="min-w-[80px]">Logins</TableHead>
                      <TableHead className="min-w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logsLoading ? (
                      <TableRow>
                        <TableCell colSpan="7" className="text-center py-8">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-none h-6 w-6 border-b-2 border-primary"></div>
                            <span className="ml-2">Loading logs...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : userLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan="7" className="text-center py-8 text-muted-foreground">
                          No logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      getDisplayLogs().map((log, index) => (
                        <TableRow key={`log-${log.id}-${index}`} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-none bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium text-foreground">
                                  {log.user?.username || log.username || 'Unknown'}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {log.user?.fullName || log.fullName || log.user?.name || 'N/A'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {log.user?.role || 'Unknown Role'}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                log.action === 'login' ? 'default' : 
                                log.action === 'never_logged_in' ? 'destructive' : 
                                'primary'
                              }
                              className="flex items-center gap-1 w-fit"
                            >
                              {log.action === 'login' ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <XCircle className="h-3 w-3" />
                              )}
                              {log.action === 'never_logged_in' ? 'Never Logged In' : log.action}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                  {formatTimestamp(log.timestamp)}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {getTimeAgo(log.timestamp)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Globe className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm font-mono">
                                {log.ipAddress || '-'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getDeviceIcon(log.userAgent)}
                              <span className="text-xs text-muted-foreground">
                                {getBrowserInfo(log.userAgent)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-medium">
                                {log.loginCount || 0}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                times
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleLogDetail(log)}
                              title="View Details"
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {logsLoading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="animate-spin rounded-none h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3">Loading logs...</span>
              </div>
            ) : userLogs.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No logs found
              </div>
            ) : (
              getDisplayLogs().map((log, index) => (
                <Card key={`log-${log.id}-${index}`} className="">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-none bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            {log.user?.username || log.username || 'Unknown'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {log.user?.fullName || log.fullName || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={log.action === 'login' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {log.action === 'never_logged_in' ? 'Never Logged In' : log.action}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{formatTimestamp(log.timestamp)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono">{log.ipAddress || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(log.userAgent)}
                        <span className="text-muted-foreground">{getBrowserInfo(log.userAgent)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span>{log.loginCount || 0} logins</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLogDetail(log)}
                        className="w-full"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="chart">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Device Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.devices ? (
                  <div className="space-y-3">
                    {Object.entries(stats.devices).map(([device, count]) => (
                      <div key={device} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(device)}
                          <span className="text-sm font-medium">{device}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={(count / stats.totalUsers) * 100} 
                            className="w-20 h-2"
                          />
                          <span className="text-sm text-muted-foreground w-8 text-right">
                            {count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No device data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activity Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Users</span>
                    <span className="text-2xl font-bold">{stats?.totalUsers || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Users</span>
                    <span className="text-2xl font-bold text-green-600">{stats?.activeUsers || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Login Rate</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {stats ? Math.round((stats.loginUsers / stats.totalUsers) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Never Logged In</span>
                    <span className="text-2xl font-bold text-orange-600">{stats?.neverLoggedIn || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Log Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Log Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about this log entry
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">User</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-8 h-8 rounded-none flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{selectedLog.user?.username || 'Unknown'}</div>
                      <div className="text-sm text-muted-foreground">{selectedLog.user?.fullName || 'N/A'}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Action</Label>
                  <div className="mt-1">
                    <Badge 
                      variant={
                        selectedLog.action === 'login' ? 'default' : 
                        selectedLog.action === 'create' ? 'default' :
                        selectedLog.action === 'update' ? 'secondary' :
                        selectedLog.action === 'delete' ? 'destructive' :
                        selectedLog.action === 'view' ? 'outline' :
                        selectedLog.action === 'never_logged_in' ? 'destructive' : 
                        'outline`'
                      }
                    >
                      {selectedLog.action === 'never_logged_in' ? 'Never Logged In' : selectedLog.action}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedLog.status === 1 ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium">
                      {selectedLog.status === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Role</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-xs">
                      {selectedLog.user?.role || 'Unknown Role'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Timestamp</Label>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formatTimestamp(selectedLog.timestamp)}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">IP Address</Label>
                  <div className="flex items-center gap-1 mt-1">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-mono">{selectedLog.ipAddress || '-'}</span>
                  </div>
                </div>
              </div>
              
              {selectedLog.userAgent && (
                <div>
                  <Label className="text-sm font-medium">User Agent</Label>
                  <div className="mt-1 p-2 bg-muted rounded-none text-xs font-mono break-all">
                    {selectedLog.userAgent}
                  </div>
                </div>
              )}
              
              {selectedLog.details && (
                <div>
                  <Label className="text-sm font-medium">Additional Details</Label>
                  <div className="mt-1 p-2 bg-muted rounded-none text-sm">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(selectedLog.details, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserLogs;

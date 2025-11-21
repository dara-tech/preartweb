import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Tabs removed - using single view
import { 
  Database, 
  Play, 
  Save, 
  RefreshCw, 
  FileCode, 
  Search,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import mortalityRetentionApi from '@/services/mortalityRetentionApi';
import siteApi from '@/services/siteApi';
import { useSite } from '@/contexts/SiteContext';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const QueryEditorAdmin = () => {
  const { selectedSite } = useSite();
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [queryContent, setQueryContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [sites, setSites] = useState([]);
  const [selectedSiteCode, setSelectedSiteCode] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [executionResult, setExecutionResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [runningAll, setRunningAll] = useState(false);
  const [allResults, setAllResults] = useState([]);

  // Initialize dates to current quarter
  useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const quarter = Math.floor(currentMonth / 3);
    const quarterStartMonth = quarter * 3;
    const quarterEndMonth = quarterStartMonth + 2;
    
    const start = new Date(currentYear, quarterStartMonth, 1);
    const end = new Date(currentYear, quarterEndMonth + 1, 0);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, []);

  // Load queries list
  useEffect(() => {
    loadQueries();
    loadSites();
  }, []);

  // Set selected site from context
  useEffect(() => {
    if (selectedSite?.code) {
      setSelectedSiteCode(selectedSite.code);
    }
  }, [selectedSite]);

  const loadQueries = async () => {
    try {
      setLoading(true);
      const response = await mortalityRetentionApi.getAllQueries();
      if (response.success) {
        setQueries(response.queries || []);
      } else {
        toast.error('Failed to load queries');
      }
    } catch (error) {
      console.error('Error loading queries:', error);
      toast.error('Failed to load queries: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const loadSites = async () => {
    try {
      const response = await siteApi.getSites();
      if (response.success) {
        setSites(response.sites || []);
      }
    } catch (error) {
      console.error('Error loading sites:', error);
    }
  };

  const loadQuery = async (indicatorId) => {
    try {
      setLoading(true);
      const response = await mortalityRetentionApi.getQuery(indicatorId);
      if (response.success) {
        setSelectedQuery(response);
        setQueryContent(response.content);
        setOriginalContent(response.content);
        setHasChanges(false);
        setExecutionResult(null);
      } else {
        toast.error('Failed to load query');
      }
    } catch (error) {
      console.error('Error loading query:', error);
      toast.error('Failed to load query: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleQuerySelect = (indicatorId) => {
    if (hasChanges) {
      if (!window.confirm('You have unsaved changes. Do you want to discard them?')) {
        return;
      }
    }
    loadQuery(indicatorId);
  };

  const handleContentChange = (value) => {
    setQueryContent(value);
    setHasChanges(value !== originalContent);
  };

  const handleSave = async () => {
    if (!selectedQuery) return;

    try {
      setSaving(true);
      const response = await mortalityRetentionApi.updateQuery(selectedQuery.indicatorId, queryContent);
      if (response.success) {
        toast.success('Query saved successfully');
        setOriginalContent(queryContent);
        setHasChanges(false);
        // Reload query to get updated metadata
        await loadQuery(selectedQuery.indicatorId);
      } else {
        toast.error('Failed to save query');
      }
    } catch (error) {
      console.error('Error saving query:', error);
      toast.error('Failed to save query: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleExecute = async () => {
    if (!selectedQuery || !selectedSiteCode || !startDate || !endDate) {
      toast.error('Please select a site and provide start/end dates');
      return;
    }

    try {
      setExecuting(true);
      setExecutionResult(null);
      const response = await mortalityRetentionApi.executeQuery(selectedQuery.indicatorId, {
        siteCode: selectedSiteCode,
        startDate,
        endDate
      });
      if (response.success) {
        setExecutionResult(response);
        toast.success('Query executed successfully');
      } else {
        toast.error('Query execution failed');
        setExecutionResult({ error: response.error || 'Unknown error', message: response.message });
      }
    } catch (error) {
      console.error('Error executing query:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      toast.error('Failed to execute query: ' + errorMessage);
      setExecutionResult({ error: errorMessage, stack: error.response?.data?.stack });
    } finally {
      setExecuting(false);
    }
  };

  const handleExecuteAll = async () => {
    if (!selectedSiteCode || !startDate || !endDate) {
      toast.error('Please select a site and provide start/end dates');
      return;
    }

    try {
      setRunningAll(true);
      setAllResults([]);
      setExecutionResult(null);
      
      const results = [];
      let successCount = 0;
      let errorCount = 0;

      toast.info(`Starting execution of ${queries.length} indicators...`);

      for (const query of queries) {
        try {
          console.log(`Executing indicator: ${query.indicatorId}`);
          const response = await mortalityRetentionApi.executeQuery(query.indicatorId, {
            siteCode: selectedSiteCode,
            startDate,
            endDate
          });
          
          if (response.success) {
            results.push({
              indicatorId: query.indicatorId,
              indicatorName: query.name,
              success: true,
              data: response.data,
              executionTime: response.executionTime
            });
            successCount++;
          } else {
            results.push({
              indicatorId: query.indicatorId,
              indicatorName: query.name,
              success: false,
              error: response.error || 'Unknown error'
            });
            errorCount++;
          }
        } catch (error) {
          console.error(`Error executing ${query.indicatorId}:`, error);
          results.push({
            indicatorId: query.indicatorId,
            indicatorName: query.name,
            success: false,
            error: error.response?.data?.message || error.message || 'Unknown error'
          });
          errorCount++;
        }
      }

      setAllResults(results);
      toast.success(`Execution completed: ${successCount} successful, ${errorCount} failed`);
      
    } catch (error) {
      console.error('Error in execute all:', error);
      toast.error('Failed to execute all queries: ' + error.message);
    } finally {
      setRunningAll(false);
    }
  };

  const handleClearResults = () => {
    setExecutionResult(null);
    setAllResults([]);
  };

  const filteredQueries = queries.filter(q => 
    q.indicatorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Query Editor Admin
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage and execute Mortality & Retention indicator SQL queries
          </p>
        </div>
        <Button onClick={loadQueries} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Query List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5" />
              Queries ({queries.length})
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search queries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredQueries.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No queries found
                </p>
              ) : (
                filteredQueries.map((query) => (
                  <div
                    key={query.indicatorId}
                    onClick={() => handleQuerySelect(query.indicatorId)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedQuery?.indicatorId === query.indicatorId
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="font-medium text-sm">{query.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {query.indicatorId}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {(query.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Query Editor */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileCode className="h-5 w-5" />
                {selectedQuery ? selectedQuery.name : 'Select a Query'}
              </CardTitle>
              {selectedQuery && (
                <div className="flex gap-2">
                  {hasChanges && (
                    <Badge variant="outline" className="bg-yellow-500/10">
                      Unsaved changes
                    </Badge>
                  )}
                  <Button
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                    size="sm"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedQuery ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a query from the list to view and edit</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* SQL Query Editor */}
                <div className="space-y-2">
                  <Label>SQL Query</Label>
                  <textarea
                    value={queryContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="w-full h-[400px] font-mono text-sm p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    spellCheck={false}
                  />
                  <div className="text-xs text-muted-foreground">
                    {queryContent.length} characters
                  </div>
                </div>

                {/* Execute Parameters */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Execute Parameters</Label>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Site</Label>
                      <Select value={selectedSiteCode} onValueChange={setSelectedSiteCode}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a site" />
                        </SelectTrigger>
                        <SelectContent>
                          {sites.map((site) => (
                            <SelectItem key={site.code} value={site.code}>
                              {site.name} ({site.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Actions</Label>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleExecute}
                          disabled={executing || runningAll || !selectedQuery || !selectedSiteCode || !startDate || !endDate}
                          className="flex-1"
                        >
                          {executing ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4 mr-2" />
                          )}
                          Execute Selected
                        </Button>
                        <Button
                          onClick={handleExecuteAll}
                          disabled={executing || runningAll || !selectedSiteCode || !startDate || !endDate}
                          variant="outline"
                          className="flex-1"
                        >
                          {runningAll ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Database className="h-4 w-4 mr-2" />
                          )}
                          {runningAll ? 'Running All...' : 'Run All'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">
                      {allResults.length > 0 ? 'All Indicators Results' : 'Query Results'}
                    </Label>
                    {(executionResult || allResults.length > 0) && (
                      <Button
                        onClick={handleClearResults}
                        variant="outline"
                        size="sm"
                      >
                        Clear Results
                      </Button>
                    )}
                  </div>
                  {allResults.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-blue-600">
                        <Database className="h-5 w-5" />
                        <span className="font-semibold">All Indicators Executed</span>
                        <Badge variant="outline">
                          {allResults.filter(r => r.success).length} successful, {allResults.filter(r => !r.success).length} failed
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        {allResults.map((result, idx) => (
                          <div key={idx} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {result.success ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-600" />
                                )}
                                <span className="font-medium">{result.indicatorId}</span>
                                <span className="text-sm text-muted-foreground">{result.indicatorName}</span>
                              </div>
                              {result.success && result.executionTime && (
                                <Badge variant="outline">{result.executionTime}ms</Badge>
                              )}
                            </div>
                            
                            {result.success ? (
                              result.data && result.data.length > 0 ? (
                                <div className="text-sm text-muted-foreground mb-2">
                                  {result.data.length} row(s) returned
                                </div>
                              ) : (
                                <div className="text-sm text-muted-foreground">No data returned</div>
                              )
                            ) : (
                              <div className="text-sm text-red-600">{result.error}</div>
                            )}
                            
                            {result.success && result.data && result.data.length > 0 && (
                              <div className="border-2 border-gray-300 rounded-lg overflow-auto max-h-[300px] mt-2">
                                <table className="w-full border-collapse text-xs">
                                  <thead>
                                    <tr className="border-b-2 border-gray-300 bg-gray-50">
                                      {Object.keys(result.data[0]).map((key) => (
                                        <th key={key} className="font-mono font-bold border-r border-gray-300 px-2 py-1 text-left">
                                          {key}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {result.data.map((row, rowIdx) => (
                                      <tr key={rowIdx} className="border-b border-gray-200 hover:bg-gray-50">
                                        {Object.keys(result.data[0]).map((key) => (
                                          <td key={key} className="font-mono border-r border-gray-300 px-2 py-1">
                                            {row[key] !== null && row[key] !== undefined
                                              ? String(row[key])
                                              : <span className="text-gray-400 italic">NULL</span>}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : executionResult ? (
                    executionResult.error ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-destructive">
                          <XCircle className="h-5 w-5" />
                          <span className="font-semibold">Execution Error</span>
                        </div>
                        <div className="p-4 bg-destructive/10 rounded-lg">
                          <p className="font-medium">{executionResult.error}</p>
                          {executionResult.message && (
                            <p className="text-sm mt-2 text-muted-foreground">
                              {executionResult.message}
                            </p>
                          )}
                          {executionResult.stack && (
                            <pre className="text-xs mt-4 overflow-auto max-h-96 bg-background p-4 rounded">
                              {executionResult.stack}
                            </pre>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="font-semibold">Execution Successful</span>
                          {executionResult.executionTime && (
                            <Badge variant="outline">
                              {executionResult.executionTime}ms
                            </Badge>
                          )}
                        </div>
                        
                        {executionResult.data && executionResult.data.length > 0 ? (
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">
                              {executionResult.data.length} row(s) returned
                            </div>
                            <div className="border-2 border-gray-300 rounded-lg overflow-auto max-h-[500px]">
                              <Table className="border-collapse">
                                <TableHeader>
                                  <TableRow className="border-b-2 border-gray-300 bg-gray-50">
                                    {Object.keys(executionResult.data[0]).map((key) => (
                                      <TableHead key={key} className="font-mono text-xs font-bold border-r border-gray-300 px-3 py-2 text-left">
                                        {key}
                                      </TableHead>
                                    ))}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {executionResult.data.map((row, idx) => (
                                    <TableRow key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                                      {Object.keys(executionResult.data[0]).map((key) => (
                                        <TableCell key={key} className="font-mono text-xs border-r border-gray-300 px-3 py-2">
                                          {row[key] !== null && row[key] !== undefined
                                            ? String(row[key])
                                            : <span className="text-gray-400 italic">NULL</span>}
                                        </TableCell>
                                      ))}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-muted rounded-lg text-center text-muted-foreground">
                            No data returned
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Execute the query to see results here</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QueryEditorAdmin;


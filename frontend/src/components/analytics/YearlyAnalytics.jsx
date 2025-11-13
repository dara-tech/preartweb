import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Clock,
  Calendar,
  Database,
  Power,
  PowerOff,
} from 'lucide-react';
import { toast } from 'sonner';
import analyticsApi from '../../services/analyticsApi';
import RealTimeLogViewer from './RealTimeLogViewer';

// Helper function to check if current user is a viewer
const isViewerUser = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    // Decode JWT token (simple base64 decode of payload)
    const payload = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload));
    
    // Check if user role is 'viewer'
    return decodedPayload.role === 'viewer';
  } catch (error) {
    // If there's any error decoding, allow toasts to show
    return false;
  }
};

const YearlyAnalytics = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isRunning, setIsRunning] = useState(false);
  const [engineEnabled, setEngineEnabled] = useState(true);

  // Generate years from 2020 to current year + 1
  const availableYears = Array.from(
    { length: new Date().getFullYear() - 2019 }, 
    (_, i) => 2020 + i
  );

  const runYearlyAnalytics = async () => {
    setIsRunning(true);

    try {
      const data = await analyticsApi.runYearlyAnalytics(selectedYear);

      if (data.success) {
        // Don't show toasts for viewer users
        if (!isViewerUser()) {
          toast.success(`Yearly analytics completed for ${selectedYear}`);
        }
      } else {
        // Don't show toasts for viewer users
        if (!isViewerUser()) {
          toast.error('Analytics failed', {
            description: data.error || 'Failed to run yearly analytics'
          });
        }
      }
    } catch (error) {
      console.error('Yearly analytics error:', error);
      // Don't show toasts for viewer users
      if (!isViewerUser()) {
        toast.error('Analytics error', {
          description: `Failed to connect to analytics service: ${error.message}`
        });
      }
    } finally {
      setIsRunning(false);
    }
  };

  const toggleEngine = async (enable) => {
    try {
      const data = enable 
        ? await analyticsApi.enableAnalytics()
        : await analyticsApi.disableAnalytics();

      if (data.success) {
        setEngineEnabled(enable);
        // Don't show toasts for viewer users
        if (!isViewerUser()) {
          toast.success(data.message);
        }
      } else {
        // Don't show toasts for viewer users
        if (!isViewerUser()) {
          toast.error('Failed to toggle engine', {
            description: data.error
          });
        }
      }
    } catch (error) {
      console.error('Engine toggle error:', error);
      // Don't show toasts for viewer users
      if (!isViewerUser()) {
        toast.error('Engine toggle failed', {
          description: `Failed to connect to analytics service: ${error.message}`
        });
      }
    }
  };


  return (
    <div className="space-y-6">
      {/* Engine Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Analytics Engine Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant={engineEnabled ? "default" : "secondary"}>
                {engineEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {engineEnabled ? 'Analytics engine is running' : 'Analytics engine is stopped'}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => toggleEngine(true)}
                disabled={engineEnabled}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <Power className="h-4 w-4" />
                Enable
              </Button>
              <Button
                onClick={() => toggleEngine(false)}
                disabled={!engineEnabled}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <PowerOff className="h-4 w-4" />
                Disable
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Yearly Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Yearly Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Select Year</label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="pt-6">
              <Button
                onClick={runYearlyAnalytics}
                disabled={isRunning || !engineEnabled}
                className="flex items-center gap-2"
              >
                {isRunning ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Run Analytics
                  </>
                )}
              </Button>
            </div>
          </div>

          {!engineEnabled && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-none p-3">
              <p className="text-sm text-yellow-800">
                Analytics engine is disabled. Please enable it first to run yearly analytics.
              </p>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Real-Time Logs */}
      <RealTimeLogViewer />
    </div>
  );
};

export default YearlyAnalytics;

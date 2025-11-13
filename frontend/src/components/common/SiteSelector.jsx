import React, { useState, useEffect } from 'react';
import { useSiteSwitching } from '../../contexts/SiteSwitchingContext';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Loader2, Building2, CheckCircle, AlertCircle } from 'lucide-react';

const SiteSelector = ({ 
  onSiteChange, 
  showCurrentSite = true, 
  className = '' 
}) => {
  const {
    currentSite,
    availableSites,
    loading,
    error,
    switchToSite
  } = useSiteSwitching();

  const [selectedSite, setSelectedSite] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  // Update selected site when current site changes
  useEffect(() => {
    if (currentSite) {
      setSelectedSite(currentSite.code);
    }
  }, [currentSite]);

  const handleSiteChange = async (siteCode) => {
    if (!siteCode) return;

    setSelectedSite(siteCode);
    setIsValidating(true);
    setValidationResult(null);

    try {
      // Find the site info
      const site = availableSites.find(s => s.code === siteCode);
      if (!site) {
        throw new Error('Site not found');
      }

      // Switch to the site
      const result = await switchToSite(siteCode);
      
      if (result.success) {
        setValidationResult({ valid: true, message: `Switched to ${site.name}` });
        onSiteChange?.(result.site);
      } else {
        setValidationResult({ valid: false, message: result.error });
      }
    } catch (err) {
      setValidationResult({ valid: false, message: err.message });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSiteNameChange = async (siteName) => {
    if (!siteName) return;

    setIsValidating(true);
    setValidationResult(null);

    try {
      const result = await switchToSite(siteName);
      
      if (result.success) {
        setSelectedSite(result.site.code);
        setValidationResult({ valid: true, message: `Switched to ${result.site.name}` });
        onSiteChange?.(result.site);
      } else {
        setValidationResult({ valid: false, message: result.error });
      }
    } catch (err) {
      setValidationResult({ valid: false, message: err.message });
    } finally {
      setIsValidating(false);
    }
  };

  if (loading && availableSites.length === 0) {
    return (
      <div className="flex items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading sites...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-600">
        <AlertCircle className="h-4 w-4" />
        <span>Error loading sites: {error}</span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Current Site Display */}
      {showCurrentSite && currentSite && (
        <div className="flex items-center space-x-2 p-2 status-active rounded-none">
          <CheckCircle className="h-4 w-4 text-foreground" />
          <Building2 className="h-4 w-4 text-foreground" />
          <div>
            <span className="font-medium text-foreground">{currentSite.name}</span>
            <Badge variant="secondary" className="ml-2">
              {currentSite.code}
            </Badge>
          </div>
        </div>
      )}

      {/* Site Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Site</label>
        
        {/* Site Code Selection */}
        <Select 
          value={selectedSite} 
          onValueChange={handleSiteChange}
          disabled={isValidating}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a site..." />
          </SelectTrigger>
          <SelectContent>
            {availableSites.map((site) => (
              <SelectItem key={site.code} value={site.code}>
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>{site.name}</span>
                  <Badge variant="outline" className="ml-2">
                    {site.code}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Site Name Input (Alternative) */}
        <div className="text-xs text-gray-500">
          Or type site name: 
          <input
            type="text"
            placeholder="e.g., Maung Russey RH"
            className="ml-1 px-2 py-1 border rounded-none text-xs"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSiteNameChange(e.target.value);
              }
            }}
            disabled={isValidating}
          />
        </div>
      </div>

      {/* Validation Status */}
      {isValidating && (
        <div className="flex items-center space-x-2 text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Switching site...</span>
        </div>
      )}

      {validationResult && (
        <div className={`flex items-center space-x-2 text-sm ${
          validationResult.valid ? 'text-green-600' : 'text-red-600'
        }`}>
          {validationResult.valid ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span>{validationResult.message}</span>
        </div>
      )}

      {/* Site Statistics */}
      {currentSite && (
        <div className="text-xs text-gray-500 space-y-1">
          <div>Database: {currentSite.database}</div>
          {currentSite.province && (
            <div>Province: {currentSite.province}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SiteSelector;

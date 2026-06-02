import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SiteFilter = ({ 
  sites = [], 
  selectedSite, 
  onSiteChange, 
  disabled = false,
  showAllOption = true,
  className = ""
}) => {
  return (
    <Select 
      value={selectedSite?.code || 'cambodia'} 
      onValueChange={(value) => {
        if (value === 'all') {
          onSiteChange({ code: 'all', name: 'All Sites', level: 'registry' });
        } else if (value === 'cambodia') {
          onSiteChange({ code: 'cambodia', name: 'Cambodia', level: 'country' });
        } else {
          const site = sites.find(s => s.code === value);
          onSiteChange(site);
        }
      }}
      disabled={disabled}
    >
      <SelectTrigger className={`h-11 text-sm border border-border focus:border-primary focus:ring-ring ${className}`}>
        <SelectValue placeholder="Select site" />
      </SelectTrigger>
      <SelectContent className="max-h-60 overflow-y-auto scrollbar-hide border-border">
        {showAllOption && (
          <>
            <SelectItem value="cambodia">
              Cambodia
            </SelectItem>
            <SelectItem value="all">
              All Sites
            </SelectItem>
          </>
        )}
        {sites.map((site) => (
          <SelectItem key={site.code} value={site.code}>
            {site.fileName || site.file_name || site.code} - {site.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SiteFilter;

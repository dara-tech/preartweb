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
      value={selectedSite?.code || ''} 
      onValueChange={(value) => {
        if (value === 'all') {
          onSiteChange(null);
        } else {
          const site = sites.find(s => s.code === value);
          onSiteChange(site);
        }
      }}
      disabled={disabled}
    >
      <SelectTrigger className={`h-11 text-sm  border-gray-200 focus:border-slate-400 focus:ring-slate-400 ${className}`}>
        <SelectValue placeholder="Select site" />
      </SelectTrigger>
      <SelectContent className="max-h-60 overflow-y-auto scrollbar-hide">
        {showAllOption && (
          <SelectItem value="all">
            All Sites
          </SelectItem>
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

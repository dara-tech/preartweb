import React, { useState, useEffect } from 'react';
import siteApi from '../../services/siteApi';

const ReportHeader = ({ selectedSite, selectedYear, selectedQuarter }) => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load sites on component mount
  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      setLoading(true);
      const response = await siteApi.getAllSites();
      const sitesData = response.sites || response.data || response;
      setSites(sitesData || []);
    } catch (error) {
      console.error('Error loading sites:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get province name from site data
  const getProvinceName = (site) => {
    if (!site) return 'Unknown';
    
    // If site has province field, use it directly
    if (site.province) {
      return site.province;
    }
    
    // Fallback to site code parsing if province not available
    if (site.code) {
      const provinceCode = site.code.substring(0, 2);
      return `${provinceCode}. Unknown Province`;
    }
    
    return 'Unknown Province';
  };

  // Helper function to get operational district from site
  const getOperationalDistrict = (site) => {
    if (!site || !site.code) return 'Unknown';
    
    const districtCode = site.code.substring(0, 4);
    const siteName = site.name || '';
    
    // Extract district name from site name (usually the second part after province)
    const nameParts = siteName.split(' ');
    const districtName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : siteName;
    
    return `OD ${districtCode}. ${districtName}`;
  };

  // Helper function to get all provinces when "All Sites" is selected
  const getAllProvinces = () => {
    if (!sites || sites.length === 0) return 'No data available';
    
    const provinces = [...new Set(sites.map(site => getProvinceName(site)))];
    return provinces.join(', ');
  };

  // Helper function to get all operational districts when "All Sites" is selected
  const getAllOperationalDistricts = () => {
    if (!sites || sites.length === 0) return 'No data available';
    
    const districts = [...new Set(sites.map(site => getOperationalDistrict(site)))];
    return districts.join(', ');
  };

  if (loading) {
    return (
      <div className="bg-card shadow-sm p-6 mb-6">
        <div className="text-center">
          <div className="animate-spin rounded-none h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading site data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border shadow-sm p-6 mb-6">
      {/* Main Title */}
      <div className="text-center mb-1">
        <h1 className="text-2xl font-bold text-foreground mb-1">
          របាយការណ៍ស្តីពីការព្យាបាលអ្នកជំងឺអេដស៍ Quarterly Report on ART
        </h1>
      </div>

      {/* Report Parameters Table */}
      <div className="border border-border overflow-hidden">
        <table className="w-full">
          <tbody>
            <tr className="border-b border-border">
              <td className="px-4 py-3 font-semibold text-foreground border-r border-border w-1/4">
                Facility:
              </td>
              <td className="px-4 py-3 text-foreground border-r border-border w-1/4">
                {selectedSite ? selectedSite.name : 'All Facilities'}
              </td>
              <td className="px-4 py-3 font-semibold text-foreground border-r border-border w-1/4">
                 File Name:
              </td>
              <td className="px-4 py-3 text-foreground w-1/4">
                {selectedSite ? (selectedSite.fileName || selectedSite.file_name || selectedSite.code) : 'All Facilities'}
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="px-4 py-3 font-semibold text-foreground border-r border-border">
                Operational District:
              </td>
              <td className="px-4 py-3 text-foreground border-r border-border">
                {selectedSite ? getOperationalDistrict(selectedSite) : getAllOperationalDistricts()}
              </td>
              <td className="px-4 py-3 font-semibold text-foreground border-r border-border">
               Province:
              </td>
              <td className="px-4 py-3 text-foreground">
                {selectedSite ? getProvinceName(selectedSite) : getAllProvinces()}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-semibold text-foreground border-r border-border">
                Year:
              </td>
              <td className="px-4 py-3 text-foreground border-r border-border">
                {selectedYear}
              </td>
              <td className="px-4 py-3 font-semibold text-foreground border-r border-border">
                Quarter:
              </td>
              <td className="px-4 py-3 text-foreground">
                Quarter {selectedQuarter}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportHeader;

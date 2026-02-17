import React from 'react';

const ExactOldSystemLayout = ({ reportData, period }) => {
  const { report } = reportData || {};
  const { summary, adultChild, exposedInfant, siteInfo, activePatients, patientsLeftCare } = report || {};
  
  // Handle undefined period
  const safePeriod = period || { year: new Date().getFullYear(), quarter: 1 };

  // Helper function to format numbers
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return num.toString();
  };

  if (!report) {
    return <div className="p-4 text-center">Loading report...</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-white">
      {/* Report Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-center mb-4">
          របាយការណ៍ជាតិប្រចាំត្រីមាស (National Quarterly Report)
        </h1>
        
        {/* Facility Information - 3x2 Grid Layout */}
        <div className="mb-4">
          <table className="w-full border-collapse border border-border text-sm">
            <tbody>
              <tr>
                <td className="border border-border p-2 font-semibold w-1/3">ឈ្មោះមន្ទីរពេទ្យបង្អែក/គ្លីនីក (Facility)</td>
                <td className="border border-border p-2 w-1/3">{siteInfo?.SiteName || 'N/A'}</td>
                <td className="border border-border p-2 font-semibold w-1/3">លេខកូដ (Facility Code)</td>
                <td className="border border-border p-2 w-1/3">{siteInfo?.SiteCode || 'N/A'}</td>
              </tr>
              <tr>
                <td className="border border-border p-2 font-semibold">ឈ្មោះស្រុកប្រតិបត្តិ (Operational District)</td>
                <td className="border border-border p-2">{siteInfo?.OperationalDistrict || 'N/A'}</td>
                <td className="border border-border p-2 font-semibold">ខេត្ត-ក្រុង (Province)</td>
                <td className="border border-border p-2">{siteInfo?.Province || 'N/A'}</td>
              </tr>
              <tr>
                <td className="border border-border p-2 font-semibold">ឆ្នាំ(Year)</td>
                <td className="border border-border p-2">{safePeriod.year || 'N/A'}</td>
                <td className="border border-border p-2 font-semibold">ត្រីមាសទី (Quarter)</td>
                <td className="border border-border p-2">{safePeriod.quarter || 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Report Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border text-xs">
          {/* Table Header */}
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-border p-2 text-left font-bold">ប្រភេទ (Category)</th>
              <th className="border border-border p-2 text-center font-bold">អាយុ(Age)</th>
              <th className="border border-border p-2 text-center font-bold">ប្រុស(M)</th>
              <th className="border border-border p-2 text-center font-bold">ស្រី(F)</th>
              <th className="border border-border p-2 text-center font-bold">សរុប (Total)</th>
            </tr>
          </thead>
          
          <tbody>
            {/* Section 1: Active Patients at End of Preceding Quarter */}
            <tr className="bg-blue-50">
              <td className="p-2 font-bold" colSpan="5">
                ចំនួនអ្នកជំងឺសកម្មទាំងអស់ទទួលបានការព្យាបាលរហូតដល់ចុងត្រីមាសមុន (Number of All active patients at the end of preceding quarter)
              </td>
            </tr>
            
            {/* Pre-ART Patients */}
            <tr>
              <td className="border border-border p-2 pl-4">អ្នកជំងឺ Pre-ART</td>
              <td className="border border-border p-2 text-center">0-14</td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.activePreART014?.male || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.activePreART014?.female || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.activePreART014?.total || 0)}
              </td>
            </tr>
            <tr>
              <td className="border border-border p-2 pl-4"></td>
              <td className="border border-border p-2 text-center">&gt;14</td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.activePreART14Plus?.male || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.activePreART14Plus?.female || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.activePreART14Plus?.total || 0)}
              </td>
            </tr>
            
            {/* ART Patients */}
            <tr>
              <td className="border border-border p-2 pl-4">អ្នកជំងឺ ART</td>
              <td className="border border-border p-2 text-center">0-14</td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.activeART014?.male || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.activeART014?.female || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.activeART014?.total || 0)}
              </td>
            </tr>
            <tr>
              <td className="border border-border p-2 pl-4"></td>
              <td className="border border-border p-2 text-center">&gt;14</td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.activeART14Plus?.male || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.activeART14Plus?.female || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.activeART14Plus?.total || 0)}
              </td>
            </tr>
            
            {/* Total for Active Patients */}
            <tr className="bg-blue-100 font-bold">
              <td className="border border-border p-2 pl-2">សរុប</td>
              <td className="border border-border p-2 text-center">-</td>
              <td className="border border-border p-2 text-center">
                {formatNumber(
                  (adultChild?.activePreART014?.male || 0) +
                  (adultChild?.activePreART14Plus?.male || 0) +
                  (adultChild?.activeART014?.male || 0) +
                  (adultChild?.activeART14Plus?.male || 0)
                )}
              </td>
              <td className="border border-border p-2 text-center">
                {formatNumber(
                  (adultChild?.activePreART014?.female || 0) +
                  (adultChild?.activePreART14Plus?.female || 0) +
                  (adultChild?.activeART014?.female || 0) +
                  (adultChild?.activeART14Plus?.female || 0)
                )}
              </td>
              <td className="border border-border p-2 text-center">
                {formatNumber(
                  (adultChild?.activePreART014?.total || 0) +
                  (adultChild?.activePreART14Plus?.total || 0) +
                  (adultChild?.activeART014?.total || 0) +
                  (adultChild?.activeART14Plus?.total || 0)
                )}
              </td>
            </tr>

            {/* MPI-Style Active ART Patients - Previous Quarter */}
            <tr className="bg-green-50">
              <td className="p-2 font-bold" colSpan="5">
                ចំនួនអ្នកជំងឺ ART សកម្ម (MPI Style) - ត្រីមាសមុន (Active ART Patients - Previous Quarter)
              </td>
            </tr>
            <tr>
              <td className="border border-border p-2 pl-4">អ្នកជំងឺ ART ពេញវ័យ</td>
              <td className="border border-border p-2 text-center">&gt;14</td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.mpiActiveART?.previous?.adult?.male || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.mpiActiveART?.previous?.adult?.female || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.mpiActiveART?.previous?.adult?.total || 0)}
              </td>
            </tr>
            <tr>
              <td className="border border-border p-2 pl-4">អ្នកជំងឺ ART កុមារ</td>
              <td className="border border-border p-2 text-center">0-14</td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.mpiActiveART?.previous?.child?.male || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.mpiActiveART?.previous?.child?.female || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.mpiActiveART?.previous?.child?.total || 0)}
              </td>
            </tr>
            <tr className="bg-gray-100">
              <td className="border border-border p-2 font-bold" colSpan="2">សរុប (Total)</td>
              <td className="border border-border p-2 text-center font-bold">
                {formatNumber(adultChild?.mpiActiveART?.previous?.total?.male || 0)}
              </td>
              <td className="border border-border p-2 text-center font-bold">
                {formatNumber(adultChild?.mpiActiveART?.previous?.total?.female || 0)}
              </td>
              <td className="border border-border p-2 text-center font-bold">
                {formatNumber(adultChild?.mpiActiveART?.previous?.total?.total || 0)}
              </td>
            </tr>
            
            {/* MPI-Style Active ART Patients - Current Quarter */}
            <tr className="bg-green-50">
              <td className="p-2 font-bold" colSpan="5">
                ចំនួនអ្នកជំងឺ ART សកម្ម (MPI Style) - ត្រីមាសបច្ចុប្បន្ន (Active ART Patients - Current Quarter)
              </td>
            </tr>
            <tr>
              <td className="border border-border p-2 pl-4">អ្នកជំងឺ ART ពេញវ័យ</td>
              <td className="border border-border p-2 text-center">&gt;14</td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.mpiActiveART?.current?.adult?.male || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.mpiActiveART?.current?.adult?.female || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.mpiActiveART?.current?.adult?.total || 0)}
              </td>
            </tr>
            <tr>
              <td className="border border-border p-2 pl-4">អ្នកជំងឺ ART កុមារ</td>
              <td className="border border-border p-2 text-center">0-14</td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.mpiActiveART?.current?.child?.male || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.mpiActiveART?.current?.child?.female || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.mpiActiveART?.current?.child?.total || 0)}
              </td>
            </tr>
            <tr className="bg-gray-100">
              <td className="border border-border p-2 font-bold" colSpan="2">សរុប (Total)</td>
              <td className="border border-border p-2 text-center font-bold">
                {formatNumber(adultChild?.mpiActiveART?.current?.total?.male || 0)}
              </td>
              <td className="border border-border p-2 text-center font-bold">
                {formatNumber(adultChild?.mpiActiveART?.current?.total?.female || 0)}
              </td>
              <td className="border border-border p-2 text-center font-bold">
                {formatNumber(adultChild?.mpiActiveART?.current?.total?.total || 0)}
              </td>
            </tr>

            {/* Section 2: New Patients Registered */}
            <tr className="bg-green-50">
              <td className="p-2 font-bold" colSpan="5">
                ចំនួនអ្នកជំងឺថ្មីដែលបានចុះឈ្មោះទទួលព្យាបាលក្នុងត្រីមាសនេះ (Number of New patients registered during this quarter)
              </td>
            </tr>
            <tr>
              <td className="border border-border p-2 pl-4">ចុះឈ្មោះថ្មី</td>
              <td className="border border-border p-2 text-center">0-14</td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.newPatients014?.male || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.newPatients014?.female || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.newPatients014?.total || 0)}
              </td>
            </tr>
            <tr>
              <td className="border border-border p-2 pl-4"></td>
              <td className="border border-border p-2 text-center">&gt;14</td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.newPatients14Plus?.male || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.newPatients14Plus?.female || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.newPatients14Plus?.total || 0)}
              </td>
            </tr>
            <tr className="bg-green-100 font-bold">
              <td className="border border-border p-2 pl-2">សរុប</td>
              <td className="border border-border p-2 text-center">-</td>
              <td className="border border-border p-2 text-center">
                {formatNumber(
                  (adultChild?.newPatients014?.male || 0) +
                  (adultChild?.newPatients14Plus?.male || 0)
                )}
              </td>
              <td className="border border-border p-2 text-center">
                {formatNumber(
                  (adultChild?.newPatients014?.female || 0) +
                  (adultChild?.newPatients14Plus?.female || 0)
                )}
              </td>
              <td className="border border-border p-2 text-center">
                {formatNumber(
                  (adultChild?.newPatients014?.total || 0) +
                  (adultChild?.newPatients14Plus?.total || 0)
                )}
              </td>
            </tr>

            {/* Section 3: Pre-ART Re-tested */}
            <tr className="bg-yellow-50">
              <td className="p-2 font-bold" colSpan="5">
                ចំនួនអ្នកជំងឺPre-ARTដែលបានធ្វើតេស្តរកមេរោគអេដស៍សារឡើងវិញក្នុងត្រីមាសនេះ (Number Pre-ART patients Re-tested for HIV during this quarter)
              </td>
            </tr>
            <tr>
              <td className="border border-border p-2 pl-4">តេស្តឡើងវិញ</td>
              <td className="border border-border p-2 text-center">0-14</td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.retestPreART?.age014?.male || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.retestPreART?.age014?.female || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.retestPreART?.age014?.total || 0)}
              </td>
            </tr>
            <tr>
              <td className="border border-border p-2 pl-4"></td>
              <td className="border border-border p-2 text-center">&gt;14</td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.retestPreART?.age14Plus?.male || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.retestPreART?.age14Plus?.female || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.retestPreART?.age14Plus?.total || 0)}
              </td>
            </tr>
            <tr className="bg-yellow-100 font-bold">
              <td className="border border-border p-2 pl-2">សរុប</td>
              <td className="border border-border p-2 text-center">-</td>
              <td className="border border-border p-2 text-center">
                {formatNumber(
                  (adultChild?.retestPreART?.age014?.male || 0) +
                  (adultChild?.retestPreART?.age14Plus?.male || 0)
                )}
              </td>
              <td className="border border-border p-2 text-center">
                {formatNumber(
                  (adultChild?.retestPreART?.age014?.female || 0) +
                  (adultChild?.retestPreART?.age14Plus?.female || 0)
                )}
              </td>
              <td className="border border-border p-2 text-center">
                {formatNumber(
                  (adultChild?.retestPreART?.age014?.total || 0) +
                  (adultChild?.retestPreART?.age14Plus?.total || 0)
                )}
              </td>
            </tr>

            {/* Section 4: Lost Follow-up Patients Return */}
            <tr className="bg-orange-50">
              <td className="p-2 font-bold" colSpan="5">
                ចំនួនអ្នកជំងឺដែលបោះបង់សេវាហើយត្រឡប់មកវិញក្នុងត្រីមាសនេះ (Number of Lost follow up patients who return in this quarter)
              </td>
            </tr>
            <tr>
              <td className="border border-border p-2 pl-4">អ្នកជំងឺ Pre-ART</td>
              <td className="border border-border p-2 text-center">0-14</td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.lostReturnedPreART014?.male || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.lostReturnedPreART014?.female || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.lostReturnedPreART014?.total || 0)}
              </td>
            </tr>
            <tr>
              <td className="border border-border p-2 pl-4"></td>
              <td className="border border-border p-2 text-center">&gt;14</td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.lostReturnedPreART14Plus?.male || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.lostReturnedPreART14Plus?.female || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.lostReturnedPreART14Plus?.total || 0)}
              </td>
            </tr>
            <tr className="bg-orange-100 font-bold">
              <td className="border border-border p-2 pl-2">សរុប</td>
              <td className="border border-border p-2 text-center">-</td>
              <td className="border border-border p-2 text-center">
                {formatNumber(
                  (adultChild?.lostReturnedPreART014?.male || 0) +
                  (adultChild?.lostReturnedPreART14Plus?.male || 0)
                )}
              </td>
              <td className="border border-border p-2 text-center">
                {formatNumber(
                  (adultChild?.lostReturnedPreART014?.female || 0) +
                  (adultChild?.lostReturnedPreART14Plus?.female || 0)
                )}
              </td>
              <td className="border border-border p-2 text-center">
                {formatNumber(
                  (adultChild?.lostReturnedPreART014?.total || 0) +
                  (adultChild?.lostReturnedPreART14Plus?.total || 0)
                )}
              </td>
            </tr>

            {/* Section 5: New ARV Patients */}
            <tr className="bg-purple-50">
              <td className="p-2 font-bold" colSpan="5">
                ចំនួនអ្នកជំងឺចាប់ផ្តើមព្យាបាលដោយឱសថ ARV នៅក្នុងត្រីមាសនេះ (Number of Patients newly started ARV during this quarter)
              </td>
            </tr>
            <tr>
              <td className="border border-border p-2 pl-4">ចាប់ផ្តើម ARV</td>
              <td className="border border-border p-2 text-center">0-14</td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.newARV014?.male || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.newARV014?.female || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.newARV014?.total || 0)}
              </td>
            </tr>
            <tr>
              <td className="border border-border p-2 pl-4"></td>
              <td className="border border-border p-2 text-center">&gt;14</td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.newARV14Plus?.male || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.newARV14Plus?.female || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.newARV14Plus?.total || 0)}
              </td>
            </tr>
            <tr className="bg-purple-100 font-bold">
              <td className="border border-border p-2 pl-2">សរុប</td>
              <td className="border border-border p-2 text-center">-</td>
              <td className="border border-border p-2 text-center">
                {formatNumber(
                  (adultChild?.newARV014?.male || 0) +
                  (adultChild?.newARV14Plus?.male || 0)
                )}
              </td>
              <td className="border border-border p-2 text-center">
                {formatNumber(
                  (adultChild?.newARV014?.female || 0) +
                  (adultChild?.newARV14Plus?.female || 0)
                )}
              </td>
              <td className="border border-border p-2 text-center">
                {formatNumber(
                  (adultChild?.newARV014?.total || 0) +
                  (adultChild?.newARV14Plus?.total || 0)
                )}
              </td>
            </tr>

            {/* Section 6: Transferred In */}
            <tr className="bg-indigo-50">
              <td className="p-2 font-bold" colSpan="5">
                ចំនួនអ្នកជំងឺដែលបានបញ្ជូនចូល នៅក្នុងត្រីមាសនេះ (Number of Patients transferred in this quarter)
              </td>
            </tr>
            <tr>
              <td className="border border-border p-2 pl-4">ផ្ទេរចូល</td>
              <td className="border border-border p-2 text-center">0-14</td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.transferredIn014?.male || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.transferredIn014?.female || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.transferredIn014?.total || 0)}
              </td>
            </tr>
            <tr>
              <td className="border border-border p-2 pl-4"></td>
              <td className="border border-border p-2 text-center">&gt;14</td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.transferredIn14Plus?.male || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.transferredIn14Plus?.female || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(adultChild?.transferredIn14Plus?.total || 0)}
              </td>
            </tr>
            <tr className="bg-indigo-100 font-bold">
              <td className="border border-border p-2 pl-2">សរុប</td>
              <td className="border border-border p-2 text-center">-</td>
              <td className="border border-border p-2 text-center">
                {formatNumber(
                  (adultChild?.transferredIn014?.male || 0) +
                  (adultChild?.transferredIn14Plus?.male || 0)
                )}
              </td>
              <td className="border border-border p-2 text-center">
                {formatNumber(
                  (adultChild?.transferredIn014?.female || 0) +
                  (adultChild?.transferredIn14Plus?.female || 0)
                )}
              </td>
              <td className="border border-border p-2 text-center">
                {formatNumber(
                  (adultChild?.transferredIn014?.total || 0) +
                  (adultChild?.transferredIn14Plus?.total || 0)
                )}
              </td>
            </tr>

            {/* Section 7: Patients Left Care */}
            <tr className="bg-red-50">
              <td className="p-2 font-bold" colSpan="5">
                ចំនួនអ្នកជំងឺដែលចាកចេញពីការព្យាបាលក្នុងត្រីមាសនេះ (Number of Patients who left care during quarter)
              </td>
            </tr>
            
            {/* Negative re-test */}
            <tr>
              <td className="border border-border p-2 pl-4">លទ្ធផលធ្វើតេស្តឡើងវិញអវិជ្ជមាន</td>
              <td className="border border-border p-2 text-center">0-14</td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.negativeRetest?.age014?.male || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.negativeRetest?.age014?.female || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.negativeRetest?.age014?.total || 0)}
              </td>
            </tr>
            <tr>
              <td className="border border-border p-2 pl-4"></td>
              <td className="border border-border p-2 text-center">&gt;14</td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.negativeRetest?.age14Plus?.male || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.negativeRetest?.age14Plus?.female || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.negativeRetest?.age14Plus?.total || 0)}
              </td>
            </tr>
            
            {/* Transferred out */}
            <tr>
              <td className="border border-border p-2 pl-4">បញ្ជូនចេញ</td>
              <td className="border border-border p-2 text-center">0-14</td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.transferredOut?.age014?.male || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.transferredOut?.age014?.female || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.transferredOut?.age014?.total || 0)}
              </td>
            </tr>
            <tr>
              <td className="border border-border p-2 pl-4"></td>
              <td className="border border-border p-2 text-center">&gt;14</td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.transferredOut?.age14Plus?.male || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.transferredOut?.age14Plus?.female || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.transferredOut?.age14Plus?.total || 0)}
              </td>
            </tr>
            
            {/* Abandoned treatment */}
            <tr>
              <td className="border border-border p-2 pl-4">លះបង់ការព្យាបាល</td>
              <td className="border border-border p-2 text-center">Pre-ART</td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.abandonedTreatmentPreART?.age014?.male || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.abandonedTreatmentPreART?.age014?.female || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.abandonedTreatmentPreART?.age014?.total || 0)}
              </td>
            </tr>
            <tr>
              <td className="border border-border p-2 pl-4"></td>
              <td className="border border-border p-2 text-center">Pre-ART</td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.abandonedTreatmentPreART?.age14Plus?.male || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.abandonedTreatmentPreART?.age14Plus?.female || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.abandonedTreatmentPreART?.age14Plus?.total || 0)}
              </td>
            </tr>
            <tr>
              <td className="border border-border p-2 pl-4"></td>
              <td className="border border-border p-2 text-center">ART</td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.abandonedTreatmentART?.age014?.male || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.abandonedTreatmentART?.age014?.female || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.abandonedTreatmentART?.age014?.total || 0)}
              </td>
            </tr>
            <tr>
              <td className="border border-border p-2 pl-4"></td>
              <td className="border border-border p-2 text-center">ART</td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.abandonedTreatmentART?.age14Plus?.male || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.abandonedTreatmentART?.age14Plus?.female || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.abandonedTreatmentART?.age14Plus?.total || 0)}
              </td>
            </tr>
            
            {/* Died */}
            <tr>
              <td className="border border-border p-2 pl-4">ស្លាប់</td>
              <td className="border border-border p-2 text-center">Pre-ART</td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.diedPreART?.age014?.male || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.diedPreART?.age014?.female || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.diedPreART?.age014?.total || 0)}
              </td>
            </tr>
            <tr>
              <td className="border border-border p-2 pl-4"></td>
              <td className="border border-border p-2 text-center">Pre-ART</td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.diedPreART?.age14Plus?.male || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.diedPreART?.age14Plus?.female || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.diedPreART?.age14Plus?.total || 0)}
              </td>
            </tr>
            <tr>
              <td className="border border-border p-2 pl-4"></td>
              <td className="border border-border p-2 text-center">ART</td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.diedART?.age014?.male || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.diedART?.age014?.female || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.diedART?.age014?.total || 0)}
              </td>
            </tr>
            <tr>
              <td className="border border-border p-2 pl-4"></td>
              <td className="border border-border p-2 text-center">ART</td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.diedART?.age14Plus?.male || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.diedART?.age14Plus?.female || 0)}
              </td>
              <td className="border border-border p-2 text-center font-semibold">
                {formatNumber(patientsLeftCare?.diedART?.age14Plus?.total || 0)}
              </td>
            </tr>
            
            {/* Total for Patients Left Care */}
            <tr className="bg-red-100 font-bold">
              <td className="border border-border p-2 pl-2">សរុបអ្នកជំងឺដែលចាកចេញពីការព្យាបាលទាំងអស់ (Total patients who left care)</td>
              <td className="border border-border p-2 text-center">-</td>
              <td className="border border-border p-2 text-center">
                {formatNumber(
                  (patientsLeftCare?.negativeRetest?.age014?.male || 0) +
                  (patientsLeftCare?.negativeRetest?.age14Plus?.male || 0) +
                  (patientsLeftCare?.transferredOut?.age014?.male || 0) +
                  (patientsLeftCare?.transferredOut?.age14Plus?.male || 0) +
                  (patientsLeftCare?.abandonedTreatmentPreART?.age014?.male || 0) +
                  (patientsLeftCare?.abandonedTreatmentPreART?.age14Plus?.male || 0) +
                  (patientsLeftCare?.abandonedTreatmentART?.age014?.male || 0) +
                  (patientsLeftCare?.abandonedTreatmentART?.age14Plus?.male || 0) +
                  (patientsLeftCare?.diedPreART?.age014?.male || 0) +
                  (patientsLeftCare?.diedPreART?.age14Plus?.male || 0) +
                  (patientsLeftCare?.diedART?.age014?.male || 0) +
                  (patientsLeftCare?.diedART?.age14Plus?.male || 0)
                )}
              </td>
              <td className="border border-border p-2 text-center">
                {formatNumber(
                  (patientsLeftCare?.negativeRetest?.age014?.female || 0) +
                  (patientsLeftCare?.negativeRetest?.age14Plus?.female || 0) +
                  (patientsLeftCare?.transferredOut?.age014?.female || 0) +
                  (patientsLeftCare?.transferredOut?.age14Plus?.female || 0) +
                  (patientsLeftCare?.abandonedTreatmentPreART?.age014?.female || 0) +
                  (patientsLeftCare?.abandonedTreatmentPreART?.age14Plus?.female || 0) +
                  (patientsLeftCare?.abandonedTreatmentART?.age014?.female || 0) +
                  (patientsLeftCare?.abandonedTreatmentART?.age14Plus?.female || 0) +
                  (patientsLeftCare?.diedPreART?.age014?.female || 0) +
                  (patientsLeftCare?.diedPreART?.age14Plus?.female || 0) +
                  (patientsLeftCare?.diedART?.age014?.female || 0) +
                  (patientsLeftCare?.diedART?.age14Plus?.female || 0)
                )}
              </td>
              <td className="border border-border p-2 text-center">
                {formatNumber(
                  (patientsLeftCare?.negativeRetest?.age014?.total || 0) +
                  (patientsLeftCare?.negativeRetest?.age14Plus?.total || 0) +
                  (patientsLeftCare?.transferredOut?.age014?.total || 0) +
                  (patientsLeftCare?.transferredOut?.age14Plus?.total || 0) +
                  (patientsLeftCare?.abandonedTreatmentPreART?.age014?.total || 0) +
                  (patientsLeftCare?.abandonedTreatmentPreART?.age14Plus?.total || 0) +
                  (patientsLeftCare?.abandonedTreatmentART?.age014?.total || 0) +
                  (patientsLeftCare?.abandonedTreatmentART?.age14Plus?.total || 0) +
                  (patientsLeftCare?.diedPreART?.age014?.total || 0) +
                  (patientsLeftCare?.diedPreART?.age14Plus?.total || 0) +
                  (patientsLeftCare?.diedART?.age014?.total || 0) +
                  (patientsLeftCare?.diedART?.age14Plus?.total || 0)
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExactOldSystemLayout;
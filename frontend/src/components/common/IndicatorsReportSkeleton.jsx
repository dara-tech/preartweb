import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const IndicatorsReportSkeleton = () => {
  return (
    <div className="min-h-screen bg-background mx-auto lg:max-w-[300mm]">
      <div className="p-4 space-y-6">
        {/* Report Configuration Panel Skeleton */}
        <div className="bg-card border border-border rounded-none">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 sm:gap-4 lg:gap-6">
              {/* Health Facility Selection */}
              <div className="flex-1 min-w-0">
                <div className="space-y-1 sm:space-y-2">
                  <Skeleton className="h-10 sm:h-11 w-full rounded-none" />
                </div>
              </div>

              {/* Time Period */}
              <div className="flex-1 min-w-0">
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex gap-1 sm:gap-2">
                    <Skeleton className="h-10 sm:h-11 flex-1 rounded-none" />
                    <Skeleton className="h-10 sm:h-11 flex-1 rounded-none" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center sm:justify-end gap-1 sm:gap-2 self-stretch sm:self-end">
                <Skeleton className="h-10 sm:h-11 w-10 sm:w-11 rounded-none" />
                <Skeleton className="h-10 sm:h-11 w-10 sm:w-11 rounded-none" />
                <Skeleton className="h-10 sm:h-11 w-10 sm:w-11 rounded-none" />
                <Skeleton className="h-10 sm:h-11 w-10 sm:w-11 rounded-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Report Header Skeleton */}
        
        <div className="bg-card p-6 mb-6">
          {/* Main Title */}
          <div className="text-center mb-6">
            <Skeleton className="h-8 w-96 mx-auto mb-2" />
          </div>

          {/* Report Parameters Table Skeleton */}
          <div className="border border-border overflow-hidden">
            <table className="w-full">
              <tbody>
                <tr className="border-b border-border">
                  <td className="px-4 py-3 w-1/4">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-4 py-3 w-1/4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-3 w-1/4">
                    <Skeleton className="h-4 w-28" />
                  </td>
                  <td className="px-4 py-3 w-1/4">
                    <Skeleton className="h-4 w-20" />
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-36" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-28" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-12" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-16" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Main Indicators Table Skeleton */}
        <div className="space-y-4 sm:space-y-6">
        {/* Indicators Table Skeleton */}
        <div className="bg-card border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table Header Skeleton */}
              <thead className="bg-muted border-b-2 border-border">
                <tr>
                  <th className="px-4 py-4 text-center text-sm font-bold text-foreground border-r border-border">
                    <div className="h-4 bg-muted-foreground/20 rounded-none w-32 mx-auto animate-pulse"></div>
                  </th>
                  <th className="px-3 py-4 text-right text-sm font-bold text-foreground w-32 border-r border-border">
                    <div className="h-4 bg-muted-foreground/20 rounded-none w-12 ml-auto animate-pulse"></div>
                  </th>
                  <th className="px-3 py-4 text-right text-sm font-bold text-foreground w-24 border-r border-border">
                    <div className="h-4 bg-muted-foreground/20 rounded-none w-16 ml-auto animate-pulse"></div>
                  </th>
                  <th className="px-3 py-4 text-right text-sm font-bold text-foreground w-32 border-r border-border">
                    <div className="h-4 bg-muted-foreground/20 rounded-none w-16 ml-auto animate-pulse"></div>
                  </th>
                  <th className="px-3 py-4 text-right text-sm font-bold text-foreground w-24">
                    <div className="h-4 bg-muted-foreground/20 rounded-none w-16 ml-auto animate-pulse"></div>
                  </th>
                </tr>
              </thead>

              {/* Table Body Skeleton */}
              <tbody className="bg-card divide-y divide-border">
                {[...Array(5)].map((_, i) => (
                  <React.Fragment key={i}>
                    {/* Indicator Header Row Skeleton */}
                    <tr className="border-b border-border">
                      {/* Indicator Name - spans 3 rows */}
                      <td className="px-4 py-4 text-sm text-foreground align-middle text-left border-r border-border" rowSpan="3">
                        <div className="h-4 bg-muted-foreground/20 rounded-none w-48 mb-2 animate-pulse"></div>
                        <div className="h-3 bg-muted-foreground/20 rounded-none w-32 animate-pulse"></div>
                      </td>

                      {/* Age 0-14 */}
                      <td className="px-3 py-4 text-center text-sm font-medium text-muted-foreground bg-muted/50 border-r border-border">
                        <div className="h-4 bg-muted-foreground/20 rounded-none w-8 mx-auto animate-pulse"></div>
                      </td>

                      {/* Male 0-14 */}
                      <td className="px-3 py-4 text-right border-r border-border">
                        <div className="h-6 bg-muted-foreground/20 rounded-none w-12 ml-auto animate-pulse"></div>
                      </td>

                      {/* Female 0-14 */}
                      <td className="px-3 py-4 text-right border-r border-border">
                        <div className="h-6 bg-muted-foreground/20 rounded-none w-12 ml-auto animate-pulse"></div>
                      </td>

                      {/* Total 0-14 */}
                      <td className="px-3 py-4 text-right">
                        <div className="h-6 bg-muted-foreground/20 rounded-none w-12 ml-auto animate-pulse"></div>
                      </td>
                    </tr>

                    {/* 15+ Age Group Row Skeleton */}
                    <tr className="bg-muted border-b border-border">
                      <td className="px-3 py-3 text-center text-sm font-medium text-muted-foreground bg-muted/50 border-r border-border">
                        <div className="h-4 bg-muted-foreground/20 rounded-none w-8 mx-auto animate-pulse"></div>
                      </td>
                      <td className="px-3 py-3 text-right border-r border-border">
                        <div className="h-6 bg-muted-foreground/20 rounded-none w-16 ml-auto animate-pulse"></div>
                      </td>
                      <td className="px-3 py-3 text-right border-r border-border">
                        <div className="h-6 bg-muted-foreground/20 rounded-none w-16 ml-auto animate-pulse"></div>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="h-6 bg-muted-foreground/20 rounded-none w-16 ml-auto animate-pulse"></div>
                      </td>
                    </tr>

                    {/* Sub-Total Row Skeleton */}
                    <tr className="bg-muted border-b-2 border-border font-bold">
                      <td className="px-3 py-3 text-center text-sm font-bold text-muted-foreground bg-muted/50 border-r border-border">
                        <div className="h-4 bg-muted-foreground/20 rounded-none w-12 mx-auto animate-pulse"></div>
                      </td>
                      <td className="px-3 py-3 text-right border-r border-border">
                        <div className="h-6 bg-muted-foreground/20 rounded-none w-16 ml-auto animate-pulse"></div>
                      </td>
                      <td className="px-3 py-3 text-right border-r border-border">
                        <div className="h-6 bg-muted-foreground/20 rounded-none w-16 ml-auto animate-pulse"></div>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="h-7 bg-muted-foreground/20 rounded-none w-20 ml-auto animate-pulse"></div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Report Footer Skeleton */}
        <div className="bg-muted border border-border rounded-none p-4 sm:p-6 mt-6 sm:mt-8">
          <div className="text-right text-muted-foreground">
            <div className="h-4 bg-muted-foreground/20 rounded-none w-3/4 ml-auto animate-pulse"></div>
            <div className="h-3 bg-muted-foreground/20 rounded-none w-1/2 ml-auto mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default IndicatorsReportSkeleton;

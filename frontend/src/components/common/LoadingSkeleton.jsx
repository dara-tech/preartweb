import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Period Selector Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-10 w-full max-w-md" />
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-card rounded-md border border-border p-4 sm:p-6">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  <Skeleton className="h-4 w-4 rounded-md flex-shrink-0 mt-0.5" />
                  <Skeleton className="h-4 w-full max-w-32" />
                </div>
                <Skeleton className="h-4 w-4 rounded-md flex-shrink-0" />
              </div>

              {/* Main Metric */}
              <div className="mb-4">
                <Skeleton className="h-6 w-20 mb-1" />
                <Skeleton className="h-3 w-12" />
              </div>

              {/* Chart Area Skeleton */}
              <div className="h-48 w-full">
                <Skeleton className="h-full w-full rounded-md" />
              </div>

              {/* Status Badge */}
              <div className="mt-4">
                <Skeleton className="h-5 w-16 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  Activity, Users, Heart, TrendingUp, CheckCircle, TestTube, Target
} from 'lucide-react';

const ExecutiveSummary = ({ summaryStats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <Card className=" text-primary-foreground border-0">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-foreground/80 text-xs sm:text-sm font-medium">Active ART Patients</p>
              <p className="text-xl sm:text-3xl font-bold">{summaryStats.activePatients.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="text-xs sm:text-sm text-primary-foreground/80">Currently on treatment</span>
              </div>
            </div>
            <Users className="h-8 w-8 sm:h-12 sm:w-12 text-primary-foreground/60" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-success text-success-foreground border-0">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-success-foreground/80 text-xs sm:text-sm font-medium">Newly Enrolled</p>
              <p className="text-xl sm:text-3xl font-bold">{summaryStats.newEnrolled.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="text-xs sm:text-sm text-success-foreground/80">This quarter</span>
              </div>
            </div>
            <Heart className="h-8 w-8 sm:h-12 sm:w-12 text-success-foreground/60" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-secondary text-secondary-foreground border-0">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-foreground/80 text-xs sm:text-sm font-medium">Viral Suppressed</p>
              <p className="text-xl sm:text-3xl font-bold">{summaryStats.viralSuppressed.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="text-xs sm:text-sm text-secondary-foreground/80">VL &lt; 1000 copies/ml</span>
              </div>
            </div>
            <TestTube className="h-8 w-8 sm:h-12 sm:w-12 text-secondary-foreground/60" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-warning text-warning-foreground border-0">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-warning-foreground/80 text-xs sm:text-sm font-medium">TPT Completed</p>
              <p className="text-xl sm:text-3xl font-bold">{summaryStats.tptCompleted.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="text-xs sm:text-sm text-warning-foreground/80">TB prevention</span>
              </div>
            </div>
            <Activity className="h-8 w-8 sm:h-12 sm:w-12 text-warning-foreground/60" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExecutiveSummary;

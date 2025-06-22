import React from 'react';
import { Eye, Heart, Video, Users } from 'lucide-react';
import AnalyticsCard from './AnalyticsCard';
import AnalyticsChart from './AnalyticsChart';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Skeleton } from '@/components/ui/skeleton';

interface AnalyticsDashboardProps {
  userId?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ userId }) => {
  const { analytics, loading } = useAnalytics(userId);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 bg-gray-800" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64 bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4">
        <AnalyticsCard
          title="Total Videos"
          value={analytics.totalVideos}
          icon={Video}
          change="+12% from last month"
          changeType="positive"
        />
        <AnalyticsCard
          title="Total Likes"
          value={analytics.totalLikes}
          icon={Heart}
          change="+8% from last month"
          changeType="positive"
        />
        <AnalyticsCard
          title="Total Views"
          value={analytics.totalViews.toLocaleString()}
          icon={Eye}
          change="+15% from last month"
          changeType="positive"
        />
        <AnalyticsCard
          title="Followers"
          value={analytics.totalFollowers}
          icon={Users}
          change="+5% from last month"
          changeType="positive"
        />
      </div>

      {/* Charts */}
      <div className="space-y-4">
        <AnalyticsChart
          title="Video Uploads Over Time"
          data={analytics.videoGrowth}
          color="#843dff"
        />
        <AnalyticsChart
          title="Likes Growth"
          data={analytics.likesGrowth}
          color="#ef4444"
        />
        <AnalyticsChart
          title="Views Growth"
          data={analytics.viewsGrowth}
          color="#10b981"
        />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
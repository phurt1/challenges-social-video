import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ModerationPanel } from './ModerationPanel';
import { ContentFilter } from './ContentFilter';
import { ReportModal } from './ReportModal';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';
import { Shield, AlertTriangle, Users, Eye } from 'lucide-react';

interface ModerationStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  totalUsers: number;
  flaggedContent: number;
}

export const ModerationDashboard: React.FC = () => {
  const [stats, setStats] = useState<ModerationStats>({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    totalUsers: 0,
    flaggedContent: 0
  });
  const [showReportModal, setShowReportModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch reports stats
      const { data: reports } = await supabase
        .from('reports')
        .select('status');
      
      // Fetch users count
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      // Fetch videos count (flagged content)
      const { count: videosCount } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true });

      if (reports) {
        const pending = reports.filter(r => r.status === 'pending').length;
        const resolved = reports.filter(r => r.status === 'resolved').length;
        
        setStats({
          totalReports: reports.length,
          pendingReports: pending,
          resolvedReports: resolved,
          totalUsers: usersCount || 0,
          flaggedContent: Math.floor((videosCount || 0) * 0.05) // Simulate 5% flagged
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue' }: {
    title: string;
    value: number;
    icon: any;
    color?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <Icon className={`h-8 w-8 text-${color}-500`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Moderation Dashboard</h1>
        <Button onClick={() => setShowReportModal(true)}>
          <Shield className="w-4 h-4 mr-2" />
          Test Report
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Reports"
          value={stats.totalReports}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Pending Reports"
          value={stats.pendingReports}
          icon={Eye}
          color="yellow"
        />
        <StatCard
          title="Resolved Reports"
          value={stats.resolvedReports}
          icon={Shield}
          color="green"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="blue"
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="filters">Content Filters</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <ModerationPanel />
        </TabsContent>

        <TabsContent value="filters">
          <ContentFilter />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <span>Report Resolution Rate</span>
                  <Badge variant="secondary">
                    {stats.totalReports > 0 
                      ? Math.round((stats.resolvedReports / stats.totalReports) * 100)
                      : 0}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <span>Average Response Time</span>
                  <Badge variant="secondary">2.4 hours</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <span>Content Flagged Rate</span>
                  <Badge variant="secondary">
                    {stats.totalUsers > 0 
                      ? Math.round((stats.flaggedContent / stats.totalUsers) * 100)
                      : 0}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <span>Community Guidelines Violations</span>
                  <Badge variant="destructive">{stats.pendingReports}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportedUserId="test-user"
        reportType="user"
      />
    </div>
  );
};
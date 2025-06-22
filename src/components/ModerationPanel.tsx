import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { formatDistanceToNow } from 'date-fns';

interface Report {
  id: string;
  reason: string;
  description: string;
  status: string;
  created_at: string;
  reporter: { username: string; avatar_url: string };
  reported_user: { username: string; avatar_url: string };
  video?: { title: string; thumbnail_url: string };
}

export const ModerationPanel: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchReports();
  }, [activeTab]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          reporter:reporter_id(username, avatar_url),
          reported_user:reported_user_id(username, avatar_url),
          video:video_id(title, thumbnail_url)
        `)
        .eq('status', activeTab)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch reports',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ 
          status, 
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id 
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Report ${status} successfully`
      });
      fetchReports();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update report',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'reviewed': return 'bg-blue-500';
      case 'resolved': return 'bg-green-500';
      case 'dismissed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Content Moderation</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="text-center py-8">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No {activeTab} reports found
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{report.reason}</CardTitle>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={report.reporter.avatar_url} />
                            <AvatarFallback>
                              {report.reporter.username[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">@{report.reporter.username}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">reported</span>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={report.reported_user.avatar_url} />
                            <AvatarFallback>
                              {report.reported_user.username[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">@{report.reported_user.username}</span>
                        </div>
                      </div>
                      
                      {report.description && (
                        <p className="text-sm text-muted-foreground">
                          {report.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                        </span>
                        
                        {report.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateReportStatus(report.id, 'dismissed')}
                            >
                              Dismiss
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => updateReportStatus(report.id, 'resolved')}
                            >
                              Resolve
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
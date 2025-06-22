import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  totalVideos: number;
  totalLikes: number;
  totalViews: number;
  totalFollowers: number;
  videoGrowth: Array<{ name: string; value: number }>;
  likesGrowth: Array<{ name: string; value: number }>;
  viewsGrowth: Array<{ name: string; value: number }>;
}

export const useAnalytics = (userId?: string) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;
    fetchAnalytics();
  }, [userId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get total videos
      const { count: videoCount } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get total likes
      const { count: likesCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get total followers
      const { count: followersCount } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      // Mock data for charts (in real app, calculate from actual data)
      const mockGrowthData = [
        { name: 'Jan', value: Math.floor(Math.random() * 100) },
        { name: 'Feb', value: Math.floor(Math.random() * 100) },
        { name: 'Mar', value: Math.floor(Math.random() * 100) },
        { name: 'Apr', value: Math.floor(Math.random() * 100) },
        { name: 'May', value: Math.floor(Math.random() * 100) },
        { name: 'Jun', value: Math.floor(Math.random() * 100) }
      ];

      setAnalytics({
        totalVideos: videoCount || 0,
        totalLikes: likesCount || 0,
        totalViews: Math.floor(Math.random() * 10000), // Mock data
        totalFollowers: followersCount || 0,
        videoGrowth: mockGrowthData,
        likesGrowth: mockGrowthData.map(d => ({ ...d, value: d.value * 2 })),
        viewsGrowth: mockGrowthData.map(d => ({ ...d, value: d.value * 10 }))
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return { analytics, loading, refetch: fetchAnalytics };
};
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Eye, Check, X, AlertTriangle } from 'lucide-react';

interface FlaggedVideo {
  id: string;
  title: string;
  video_url: string;
  is_flagged: boolean;
  scan_flags: string[];
  scan_confidence: number;
  scan_reason: string;
  review_status: string;
  created_at: string;
  user_id: string;
}

const ContentModerationPanel: React.FC = () => {
  const [flaggedVideos, setFlaggedVideos] = useState<FlaggedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadFlaggedContent();
  }, []);

  const loadFlaggedContent = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('is_flagged', true)
        .eq('review_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFlaggedVideos(data || []);
    } catch (error) {
      console.error('Error loading flagged content:', error);
      toast({
        title: 'Error',
        description: 'Failed to load flagged content',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (videoId: string, action: 'approved' | 'rejected') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('videos')
        .update({
          review_status: action,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id
        })
        .eq('id', videoId);

      if (error) throw error;

      setFlaggedVideos(prev => prev.filter(v => v.id !== videoId));
      toast({
        title: 'Success',
        description: `Video ${action} successfully`
      });
    } catch (error) {
      console.error('Error reviewing content:', error);
      toast({
        title: 'Error',
        description: 'Failed to review content',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <div className="p-4">Loading flagged content...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <AlertTriangle className="h-6 w-6" />
        Content Moderation
      </h2>
      
      {flaggedVideos.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No flagged content to review</p>
          </CardContent>
        </Card>
      ) : (
        flaggedVideos.map((video) => (
          <Card key={video.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{video.title}</span>
                <Badge variant="destructive">Flagged</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  src={video.video_url}
                  controls
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="space-y-2">
                <p><strong>Reason:</strong> {video.scan_reason}</p>
                <p><strong>Confidence:</strong> {Math.round(video.scan_confidence * 100)}%</p>
                <div className="flex flex-wrap gap-1">
                  {video.scan_flags.map((flag, index) => (
                    <Badge key={index} variant="outline">
                      {flag.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleReview(video.id, 'approved')}
                  className="flex-1"
                  variant="default"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleReview(video.id, 'rejected')}
                  className="flex-1"
                  variant="destructive"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default ContentModerationPanel;
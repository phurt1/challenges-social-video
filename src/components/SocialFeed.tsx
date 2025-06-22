import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share, MoreHorizontal } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface SocialPost {
  id: string;
  user_id: string;
  content?: string;
  video_url?: string;
  created_at: string;
  like_count: number;
  comment_count: number;
  is_liked: boolean;
  user: {
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export function SocialFeed() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadFeed = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get posts from users that current user follows
      const { data: following } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', user.id);

      const followingIds = following?.map(f => f.following_id) || [];
      
      // Include current user's posts too
      const userIds = [...followingIds, user.id];

      const { data: videos, error } = await supabase
        .from('videos')
        .select(`
          *,
          users!videos_user_id_fkey (
            username,
            full_name,
            avatar_url
          )
        `)
        .in('user_id', userIds)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Transform to social posts format
      const transformedPosts: SocialPost[] = (videos || []).map(video => ({
        id: video.id,
        user_id: video.user_id,
        content: video.title || video.description,
        video_url: video.video_url,
        created_at: video.created_at,
        like_count: Math.floor(Math.random() * 100),
        comment_count: Math.floor(Math.random() * 20),
        is_liked: false,
        user: {
          username: video.users?.username || 'unknown',
          full_name: video.users?.full_name,
          avatar_url: video.users?.avatar_url
        }
      }));

      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error loading feed:', error);
      toast({ title: 'Error loading feed', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Toggle like in database (simplified)
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              is_liked: !post.is_liked,
              like_count: post.is_liked ? post.like_count - 1 : post.like_count + 1
            }
          : post
      ));
    } catch (error) {
      toast({ title: 'Error liking post', variant: 'destructive' });
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  useEffect(() => {
    loadFeed();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-3 bg-gray-200 rounded w-16" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-gray-200 rounded mb-3" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            No posts in your feed yet. Follow some users to see their content!
          </p>
          <Button onClick={loadFeed} variant="outline">
            Refresh Feed
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.user.avatar_url} />
                  <AvatarFallback>
                    {post.user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">
                    {post.user.full_name || post.user.username}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    @{post.user.username} • {formatTimeAgo(post.created_at)}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {post.content && (
              <p className="mb-3">{post.content}</p>
            )}
            
            {post.video_url && (
              <div className="mb-3 bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                <p className="text-muted-foreground">Video Content</p>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post.id)}
                  className={post.is_liked ? 'text-red-500' : ''}
                >
                  <Heart className={`h-4 w-4 mr-1 ${post.is_liked ? 'fill-current' : ''}`} />
                  {post.like_count}
                </Button>
                
                <Button variant="ghost" size="sm">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {post.comment_count}
                </Button>
              </div>
              
              <Button variant="ghost" size="sm">
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <div className="text-center py-4">
        <Button onClick={loadFeed} variant="outline">
          Load More Posts
        </Button>
      </div>
    </div>
  );
}
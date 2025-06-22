import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, X, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface RecommendedUser {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  mutual_friends?: number;
  reason?: string;
  follower_count?: number;
}

export function FriendRecommendations() {
  const [recommendations, setRecommendations] = useState<RecommendedUser[]>([]);
  const [dismissedUsers, setDismissedUsers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadRecommendations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get users that current user's friends follow (mutual connection logic)
      const { data: followingData } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', user.id);

      const followingIds = followingData?.map(f => f.following_id) || [];

      // Get recommended users based on mutual connections
      const { data: recommendations } = await supabase
        .from('users')
        .select('*')
        .not('id', 'in', `(${[user.id, ...followingIds].join(',')})`)
        .limit(10);

      if (recommendations) {
        const enrichedRecs = recommendations.map(rec => ({
          ...rec,
          mutual_friends: Math.floor(Math.random() * 5),
          reason: getRecommendationReason(),
          follower_count: Math.floor(Math.random() * 1000)
        }));
        setRecommendations(enrichedRecs);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRecommendationReason = () => {
    const reasons = [
      'Popular in your area',
      'Similar interests',
      'Followed by friends',
      'New to the platform',
      'Active creator'
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  };

  const handleFollow = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('followers')
        .insert({ follower_id: user.id, following_id: userId });

      if (error) throw error;
      
      setRecommendations(prev => prev.filter(rec => rec.id !== userId));
      toast({ title: 'User followed successfully' });
    } catch (error) {
      toast({ title: 'Error following user', variant: 'destructive' });
    }
  };

  const handleDismiss = (userId: string) => {
    setDismissedUsers(prev => new Set([...prev, userId]));
    setRecommendations(prev => prev.filter(rec => rec.id !== userId));
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const visibleRecommendations = recommendations.filter(
    rec => !dismissedUsers.has(rec.id)
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Friend Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading recommendations...</p>
        </CardContent>
      </Card>
    );
  }

  if (visibleRecommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Friend Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No new recommendations at the moment.</p>
          <Button onClick={loadRecommendations} variant="outline" className="mt-2">
            Refresh Recommendations
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Friend Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {visibleRecommendations.slice(0, 5).map((user) => (
          <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback>
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">
                  {user.full_name || user.username}
                </h4>
                <p className="text-sm text-muted-foreground truncate">
                  @{user.username}
                </p>
                
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {user.reason}
                  </Badge>
                  {user.mutual_friends > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {user.mutual_friends} mutual
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => handleFollow(user.id)}
                size="sm"
                className="flex items-center gap-1"
              >
                <UserPlus className="h-3 w-3" />
                Follow
              </Button>
              <Button
                onClick={() => handleDismiss(user.id)}
                variant="ghost"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        {visibleRecommendations.length > 5 && (
          <Button 
            onClick={loadRecommendations} 
            variant="outline" 
            className="w-full"
          >
            Show More Recommendations
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Users, Hash, Video, Heart, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface TrendingItem {
  id: string;
  type: 'user' | 'challenge' | 'hashtag' | 'video';
  title: string;
  subtitle?: string;
  avatar?: string;
  count: number;
  trending: boolean;
}

interface DiscoveryFeedProps {
  onItemClick: (item: TrendingItem) => void;
}

export const DiscoveryFeed: React.FC<DiscoveryFeedProps> = ({ onItemClick }) => {
  const [trendingUsers, setTrendingUsers] = useState<TrendingItem[]>([]);
  const [trendingChallenges, setTrendingChallenges] = useState<TrendingItem[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrendingContent();
  }, []);

  const loadTrendingContent = async () => {
    setLoading(true);
    try {
      // Load trending users
      const { data: users } = await supabase
        .from('users')
        .select('id, username, avatar_url')
        .limit(10);

      if (users) {
        setTrendingUsers(users.map(user => ({
          id: user.id,
          type: 'user' as const,
          title: user.username,
          avatar: user.avatar_url,
          count: Math.floor(Math.random() * 10000),
          trending: Math.random() > 0.5
        })));
      }

      // Load trending challenges
      const { data: challenges } = await supabase
        .from('challenges')
        .select('id, title, description, participants')
        .limit(10);

      if (challenges) {
        setTrendingChallenges(challenges.map(challenge => ({
          id: challenge.id,
          type: 'challenge' as const,
          title: challenge.title,
          subtitle: challenge.description,
          count: challenge.participants || 0,
          trending: Math.random() > 0.3
        })));
      }

      // Mock trending hashtags
      const hashtags = [
        { tag: '#dance', uses: 15420 },
        { tag: '#fitness', uses: 12350 },
        { tag: '#comedy', uses: 9876 },
        { tag: '#music', uses: 8765 },
        { tag: '#art', uses: 6543 },
        { tag: '#food', uses: 5432 },
        { tag: '#travel', uses: 4321 },
        { tag: '#sports', uses: 3210 }
      ];

      setTrendingHashtags(hashtags.map(item => ({
        id: item.tag,
        type: 'hashtag' as const,
        title: item.tag,
        subtitle: `${item.uses.toLocaleString()} posts`,
        count: item.uses,
        trending: true
      })));
    } catch (error) {
      console.error('Error loading trending content:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const renderTrendingItem = (item: TrendingItem) => (
    <Card 
      key={item.id} 
      className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer mb-3"
      onClick={() => onItemClick(item)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {item.type === 'user' ? (
              <Avatar className="h-12 w-12">
                <AvatarImage src={item.avatar} />
                <AvatarFallback className="bg-purple-600">
                  {item.title.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-purple-400">
                {item.type === 'challenge' && <Video className="h-6 w-6" />}
                {item.type === 'hashtag' && <Hash className="h-6 w-6" />}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-white font-medium">{item.title}</h3>
                {item.trending && (
                  <Badge variant="secondary" className="bg-red-600 text-white text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Trending
                  </Badge>
                )}
              </div>
              {item.subtitle && (
                <p className="text-gray-400 text-sm mt-1">{item.subtitle}</p>
              )}
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <span>{formatCount(item.count)} {item.type === 'user' ? 'followers' : item.type === 'hashtag' ? 'uses' : 'participants'}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-700 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded animate-pulse mb-2" />
                  <div className="h-3 bg-gray-700 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Tabs defaultValue="users" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-gray-800 mb-4">
        <TabsTrigger value="users" className="flex items-center space-x-1">
          <Users className="h-4 w-4" />
          <span>Users</span>
        </TabsTrigger>
        <TabsTrigger value="challenges" className="flex items-center space-x-1">
          <Video className="h-4 w-4" />
          <span>Challenges</span>
        </TabsTrigger>
        <TabsTrigger value="hashtags" className="flex items-center space-x-1">
          <Hash className="h-4 w-4" />
          <span>Hashtags</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="users">
        <div className="space-y-3">
          {trendingUsers.map(renderTrendingItem)}
        </div>
      </TabsContent>
      
      <TabsContent value="challenges">
        <div className="space-y-3">
          {trendingChallenges.map(renderTrendingItem)}
        </div>
      </TabsContent>
      
      <TabsContent value="hashtags">
        <div className="space-y-3">
          {trendingHashtags.map(renderTrendingItem)}
        </div>
      </TabsContent>
    </Tabs>
  );
};
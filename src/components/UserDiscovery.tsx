import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Users, TrendingUp } from 'lucide-react';
import { UserCard } from './UserCard';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  follower_count?: number;
  following_count?: number;
  video_count?: number;
  is_following?: boolean;
}

export function UserDiscovery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [trendingUsers, setTrendingUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      toast({ title: 'Error searching users', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSuggestedUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(5);

      if (error) throw error;
      setSuggestedUsers(data || []);
    } catch (error) {
      console.error('Error loading suggested users:', error);
    }
  };

  const loadTrendingUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setTrendingUsers(data || []);
    } catch (error) {
      console.error('Error loading trending users:', error);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('followers')
        .insert({ follower_id: user.id, following_id: userId });

      if (error) throw error;
      toast({ title: 'User followed successfully' });
    } catch (error) {
      toast({ title: 'Error following user', variant: 'destructive' });
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('followers')
        .delete()
        .match({ follower_id: user.id, following_id: userId });

      if (error) throw error;
      toast({ title: 'User unfollowed successfully' });
    } catch (error) {
      toast({ title: 'Error unfollowing user', variant: 'destructive' });
    }
  };

  useEffect(() => {
    loadSuggestedUsers();
    loadTrendingUsers();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {searchQuery && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <p>Searching...</p>
            ) : searchResults.length > 0 ? (
              searchResults.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onFollow={handleFollow}
                  onUnfollow={handleUnfollow}
                />
              ))
            ) : (
              <p className="text-muted-foreground">No users found</p>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="suggested" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="suggested" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Suggested
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suggested" className="space-y-3">
          {suggestedUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onFollow={handleFollow}
              onUnfollow={handleUnfollow}
            />
          ))}
        </TabsContent>

        <TabsContent value="trending" className="space-y-3">
          {trendingUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onFollow={handleFollow}
              onUnfollow={handleUnfollow}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
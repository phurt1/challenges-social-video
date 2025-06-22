import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserDiscovery } from '@/components/UserDiscovery';
import { FriendRecommendations } from '@/components/FriendRecommendations';
import { SocialFeed } from '@/components/SocialFeed';
import { Users, Search, Heart, Sparkles } from 'lucide-react';

export function Social() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Social</h1>
        <p className="text-muted-foreground">
          Discover new creators, connect with friends, and explore trending content
        </p>
      </div>

      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feed" className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Feed</span>
          </TabsTrigger>
          <TabsTrigger value="discover" className="flex items-center gap-1">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Discover</span>
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-1">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Suggested</span>
          </TabsTrigger>
          <TabsTrigger value="following" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Following</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="mt-6">
          <SocialFeed />
        </TabsContent>

        <TabsContent value="discover" className="mt-6">
          <UserDiscovery />
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          <FriendRecommendations />
        </TabsContent>

        <TabsContent value="following" className="mt-6">
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Following List</h3>
            <p className="text-muted-foreground">
              View and manage the users you follow
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
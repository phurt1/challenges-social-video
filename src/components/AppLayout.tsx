import React, { useState } from 'react';
import BottomNavigation from './BottomNavigation';
import EnhancedVideoFeed from './EnhancedVideoFeed';
import ChallengeCard from './ChallengeCard';
import LeaderboardItem from './LeaderboardItem';
import ProfileStats from './ProfileStats';
import RecordingModal from './RecordingModal';
import ProfileEditModal from './ProfileEditModal';
import AnalyticsDashboard from './AnalyticsDashboard';
import { SearchPage } from './SearchPage';
import { SettingsMenu } from './SettingsMenu';
import { ProfileHeader } from './ProfileHeader';
import { ChallengesSkeleton } from './ChallengesSkeleton';
import { PullToRefresh } from './PullToRefresh';
import { CategoryFilter } from './CategoryFilter';
import { ModerationDashboard } from './ModerationDashboard';
import { DareSuggestions } from './DareSuggestions';
import { Social } from '@/pages/Social';
import Live from '@/pages/Live';
import { useChallenges } from '@/hooks/useChallenges';
import { useVideoUpload } from '@/hooks/useVideoUpload';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Extreme';
  points: number;
  timeLimit?: number;
  participants: number;
  completed: boolean;
}

const AppLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [feedLoading, setFeedLoading] = useState(false);
  const { challenges, loading, error, refetch } = useChallenges();
  const { uploadVideo } = useVideoUpload();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { user } = useAuth();

  const mockVideos = [
    {
      id: '1',
      username: 'challenger1',
      avatar: '/placeholder.svg',
      description: 'Just completed the ice bucket challenge! 🧊',
      likes: 1234,
      comments: 89,
      shares: 45,
      isLiked: false,
      videoUrl: 'https://example.com/video1.mp4',
      duration: 30,
      views: 5420
    }
  ];

  const mockLeaderboard = [
    {
      id: '1',
      username: 'TopChallenger',
      avatar: '/placeholder.svg',
      points: 15420,
      rank: 1,
      streak: 7,
      isCurrentUser: false
    }
  ];

  const categories = ['Dance', 'Sports', 'Comedy', 'Music', 'Art', 'Food', 'Travel', 'Fitness'];
  const filteredChallenges = selectedCategory 
    ? challenges.filter(c => c.category === selectedCategory)
    : challenges;

  const handleChallengeAccept = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      setSelectedChallenge(challenge);
      setIsRecordingModalOpen(true);
    }
  };

  const handleRecordButtonClick = () => {
    const genericChallenge: Challenge = {
      id: 'generic',
      title: 'Free Recording',
      description: 'Record any challenge or create your own content',
      category: 'General',
      difficulty: 'Easy',
      points: 0,
      participants: 0,
      completed: false
    };
    setSelectedChallenge(genericChallenge);
    setIsRecordingModalOpen(true);
  };

  const handleVideoUpload = async (videoBlob: Blob, challengeId: string) => {
    const result = await uploadVideo(videoBlob, challengeId);
    if (result.success) {
      setIsRecordingModalOpen(false);
      setSelectedChallenge(null);
    }
  };

  const handleProfileUpdate = (updatedProfile: any) => {
    updateProfile(updatedProfile);
  };

  const handleFeedRefresh = async () => {
    setFeedLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setFeedLoading(false);
  };

  const handleChallengesRefresh = async () => {
    await refetch();
  };

  const handleSearchResultClick = (result: any) => {
    console.log('Search result clicked:', result);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div>
            <DareSuggestions className="m-4" />
            <EnhancedVideoFeed 
              videos={mockVideos}
              onLike={() => {}}
              onComment={() => {}}
              onShare={() => {}}
              loading={feedLoading}
              onRefresh={handleFeedRefresh}
            />
          </div>
        );
      case 'search':
        return <SearchPage onResultClick={handleSearchResultClick} />;
      case 'social':
        return <Social />;
      case 'live':
        return <Live />;
      case 'analytics':
        return (
          <div className="p-4 pb-20">
            <h1 className="text-white text-2xl font-bold mb-6">Analytics Dashboard</h1>
            <AnalyticsDashboard userId={user?.id} />
          </div>
        );
      case 'challenges':
        return (
          <PullToRefresh onRefresh={handleChallengesRefresh}>
            <div className="p-4 pb-20">
              <h1 className="text-white text-2xl font-bold mb-4">Challenges</h1>
              <DareSuggestions className="mb-6" />
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                className="mb-4"
              />
              <Tabs defaultValue="trending" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                  <TabsTrigger value="trending">Trending</TabsTrigger>
                  <TabsTrigger value="new">New</TabsTrigger>
                  <TabsTrigger value="my">My Challenges</TabsTrigger>
                </TabsList>
                <TabsContent value="trending" className="mt-4">
                  {loading ? (
                    <ChallengesSkeleton />
                  ) : error ? (
                    <Alert className="border-red-500 bg-red-500/10">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-red-400 mb-2">
                        {error}
                      </AlertDescription>
                      <Button
                        onClick={handleChallengesRefresh}
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-gray-800"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retry
                      </Button>
                    </Alert>
                  ) : filteredChallenges.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      {selectedCategory ? `No ${selectedCategory} challenges found` : 'No challenges available'}
                    </div>
                  ) : (
                    filteredChallenges.map(challenge => (
                      <ChallengeCard 
                        key={challenge.id} 
                        challenge={challenge} 
                        onAccept={handleChallengeAccept} 
                      />
                    ))
                  )}
                </TabsContent>
                <TabsContent value="new" className="mt-4">
                  {loading ? (
                    <ChallengesSkeleton />
                  ) : (
                    filteredChallenges.map(challenge => (
                      <ChallengeCard 
                        key={challenge.id} 
                        challenge={challenge} 
                        onAccept={handleChallengeAccept} 
                      />
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </PullToRefresh>
        );
      case 'record':
        return (
          <div className="flex items-center justify-center h-full bg-black">
            <div className="text-center">
              <Button
                onClick={handleRecordButtonClick}
                className="w-32 h-32 bg-[#843dff] hover:bg-[#7c3aef] rounded-full flex items-center justify-center mb-4 mx-auto"
              >
                <span className="text-white text-4xl">📹</span>
              </Button>
              <p className="text-white text-lg">Record Challenge</p>
              <p className="text-gray-400 text-sm">Tap to start recording</p>
            </div>
          </div>
        );
      case 'leaderboard':
        return (
          <div className="p-4 pb-20">
            <h1 className="text-white text-2xl font-bold mb-4">Leaderboard</h1>
            <Tabs defaultValue="weekly" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="alltime">All Time</TabsTrigger>
              </TabsList>
              <TabsContent value="weekly" className="mt-4">
                {mockLeaderboard.map(user => (
                  <LeaderboardItem key={user.id} user={user} />
                ))}
              </TabsContent>
            </Tabs>
          </div>
        );
      case 'moderation':
        return <ModerationDashboard />;
      case 'profile':
        if (profileLoading) {
          return (
            <div className="flex items-center justify-center h-full">
              <div className="text-white">Loading profile...</div>
            </div>
          );
        }

        const stats = {
          points: profile?.points || 0,
          followers: profile?.followers || 0,
          following: profile?.following || 0,
          likes: profile?.likes || 0,
          videos: profile?.videos || 0,
          challengesCompleted: profile?.challenges_completed || 0
        };

        return (
          <div className="p-4 pb-20">
            <ProfileHeader
              profile={profile}
              onEditProfile={() => setIsProfileEditOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
            <ProfileStats stats={stats} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {renderContent()}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <RecordingModal
        isOpen={isRecordingModalOpen}
        onClose={() => {
          setIsRecordingModalOpen(false);
          setSelectedChallenge(null);
        }}
        challenge={selectedChallenge}
        onUpload={handleVideoUpload}
      />
      {profile && (
        <ProfileEditModal
          isOpen={isProfileEditOpen}
          onClose={() => setIsProfileEditOpen(false)}
          currentProfile={{
            username: profile.username,
            bio: profile.bio || '',
            avatar_url: profile.avatar_url
          }}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
      <SettingsMenu
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default AppLayout;
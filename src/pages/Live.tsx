import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LiveChallengesList } from '@/components/LiveChallengesList';
import { ChatRoom } from '@/components/ChatRoom';
import { CreateChallengeModal } from '@/components/CreateChallengeModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, MessageCircle, Users } from 'lucide-react';

export default function Live() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedChatRoom, setSelectedChatRoom] = useState<string | null>(null);

  const handleJoinChallenge = (challengeId: string) => {
    // Auto-join the challenge chat room
    setSelectedChatRoom(challengeId);
  };

  const handleCreateChallenge = () => {
    setShowCreateModal(true);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Live Features</h1>
        <p className="text-muted-foreground">
          Join live challenges and chat with other users in real-time
        </p>
      </div>

      <Tabs defaultValue="challenges" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Live Challenges
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Chat Rooms
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Live Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="challenges" className="space-y-6">
          <LiveChallengesList
            onJoinChallenge={handleJoinChallenge}
            onCreateChallenge={handleCreateChallenge}
          />
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <ChatRoom roomId="general" roomName="General Chat" />
            <ChatRoom roomId="challenges" roomName="Challenge Discussion" />
            {selectedChatRoom && (
              <ChatRoom 
                roomId={selectedChatRoom} 
                roomName="Challenge Chat" 
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">247</div>
                <p className="text-sm text-muted-foreground">Users online now</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Live Challenges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">12</div>
                <p className="text-sm text-muted-foreground">Active challenges</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">1.2k</div>
                <p className="text-sm text-muted-foreground">Messages today</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Dance Challenge started</span>
                  </div>
                  <Badge variant="secondary">2 min ago</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">New user joined general chat</span>
                  </div>
                  <Badge variant="secondary">5 min ago</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Singing Challenge completed</span>
                  </div>
                  <Badge variant="secondary">8 min ago</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateChallengeModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {
          // Refresh challenges list
          window.location.reload();
        }}
      />
    </div>
  );
}
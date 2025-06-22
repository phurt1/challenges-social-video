import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Play } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface LiveChallenge {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  status: 'active' | 'completed' | 'cancelled';
  start_time: string;
  end_time?: string;
  max_participants: number;
  current_participants: number;
}

interface LiveChallengeCardProps {
  challenge: LiveChallenge;
  onJoin?: (challengeId: string) => void;
}

export function LiveChallengeCard({ challenge, onJoin }: LiveChallengeCardProps) {
  const [isJoining, setIsJoining] = useState(false);
  const [participants, setParticipants] = useState(challenge.current_participants);

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      // Update participant count
      const { error } = await supabase
        .from('live_challenges')
        .update({ current_participants: participants + 1 })
        .eq('id', challenge.id);

      if (!error) {
        setParticipants(prev => prev + 1);
        onJoin?.(challenge.id);
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const timeLeft = challenge.end_time 
    ? Math.max(0, new Date(challenge.end_time).getTime() - Date.now())
    : null;

  const formatTimeLeft = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{challenge.title}</CardTitle>
          <Badge variant={challenge.status === 'active' ? 'default' : 'secondary'}>
            {challenge.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{challenge.description}</p>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{participants}/{challenge.max_participants}</span>
          </div>
          {timeLeft && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatTimeLeft(timeLeft)}</span>
            </div>
          )}
        </div>

        <Button 
          onClick={handleJoin}
          disabled={isJoining || participants >= challenge.max_participants || challenge.status !== 'active'}
          className="w-full"
        >
          <Play className="h-4 w-4 mr-2" />
          {isJoining ? 'Joining...' : 'Join Challenge'}
        </Button>
      </CardContent>
    </Card>
  );
}
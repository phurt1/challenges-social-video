import { useState, useEffect } from 'react';
import { LiveChallengeCard } from './LiveChallengeCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
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

interface LiveChallengesListProps {
  onJoinChallenge?: (challengeId: string) => void;
  onCreateChallenge?: () => void;
}

export function LiveChallengesList({ onJoinChallenge, onCreateChallenge }: LiveChallengesListProps) {
  const [challenges, setChallenges] = useState<LiveChallenge[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
    subscribeToChanges();
  }, []);

  const loadChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('live_challenges')
        .select('*')
        .eq('status', 'active')
        .order('start_time', { ascending: false });

      if (error) throw error;
      setChallenges(data || []);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToChanges = () => {
    const subscription = supabase
      .channel('live_challenges_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_challenges'
        },
        () => {
          loadChallenges();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const filteredChallenges = challenges.filter(challenge =>
    challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challenge.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading live challenges...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search challenges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={onCreateChallenge}>
          <Plus className="h-4 w-4 mr-2" />
          Create
        </Button>
      </div>

      {filteredChallenges.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-muted-foreground">
            {searchTerm ? 'No challenges found matching your search.' : 'No active challenges right now.'}
          </div>
          {!searchTerm && (
            <Button onClick={onCreateChallenge} variant="outline" className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create the first challenge
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredChallenges.map((challenge) => (
            <LiveChallengeCard
              key={challenge.id}
              challenge={challenge}
              onJoin={onJoinChallenge}
            />
          ))}
        </div>
      )}
    </div>
  );
}
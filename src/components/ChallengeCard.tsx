import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Trophy, Users } from 'lucide-react';

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

interface ChallengeCardProps {
  challenge: Challenge;
  onAccept: (challengeId: string) => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onAccept }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Hard': return 'bg-orange-500';
      case 'Extreme': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 text-white mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{challenge.title}</CardTitle>
            <CardDescription className="text-gray-400">
              {challenge.description}
            </CardDescription>
          </div>
          <Badge className={`${getDifficultyColor(challenge.difficulty)} text-white`}>
            {challenge.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center">
              <Trophy size={16} className="mr-1" />
              {challenge.points} pts
            </div>
            {challenge.timeLimit && (
              <div className="flex items-center">
                <Clock size={16} className="mr-1" />
                {challenge.timeLimit}min
              </div>
            )}
            <div className="flex items-center">
              <Users size={16} className="mr-1" />
              {challenge.participants}
            </div>
          </div>
        </div>
        
        <Button 
          onClick={() => onAccept(challenge.id)}
          className="w-full bg-[#843dff] hover:bg-[#7c3aef] text-white"
          disabled={challenge.completed}
        >
          {challenge.completed ? 'Completed' : 'Accept Challenge'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ChallengeCard;
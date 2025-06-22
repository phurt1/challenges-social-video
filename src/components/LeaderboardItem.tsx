import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Crown, Flame } from 'lucide-react';

interface LeaderboardUser {
  id: string;
  username: string;
  avatar: string;
  points: number;
  rank: number;
  streak: number;
  isCurrentUser?: boolean;
}

interface LeaderboardItemProps {
  user: LeaderboardUser;
}

const LeaderboardItem: React.FC<LeaderboardItemProps> = ({ user }) => {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="text-yellow-400" size={20} />;
    if (rank === 2) return <Crown className="text-gray-300" size={20} />;
    if (rank === 3) return <Crown className="text-orange-400" size={20} />;
    return null;
  };

  return (
    <div className={`flex items-center p-4 rounded-lg mb-2 ${
      user.isCurrentUser 
        ? 'bg-[#843dff]/20 border border-[#843dff]' 
        : 'bg-gray-800'
    }`}>
      <div className="flex items-center mr-4 w-8">
        {getRankIcon(user.rank) || (
          <span className="text-white font-bold text-lg">#{user.rank}</span>
        )}
      </div>
      
      <Avatar className="w-12 h-12 mr-4">
        <AvatarImage src={user.avatar} />
        <AvatarFallback>{user.username[0]}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="flex items-center">
          <span className="text-white font-semibold">{user.username}</span>
          {user.isCurrentUser && (
            <Badge className="ml-2 bg-[#843dff] text-white text-xs">You</Badge>
          )}
        </div>
        <div className="flex items-center mt-1">
          <span className="text-gray-400 text-sm">{user.points.toLocaleString()} pts</span>
          {user.streak > 0 && (
            <div className="flex items-center ml-3 text-orange-400">
              <Flame size={14} className="mr-1" />
              <span className="text-sm">{user.streak}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardItem;
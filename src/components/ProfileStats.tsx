import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Users, Heart, Video } from 'lucide-react';

interface ProfileStatsProps {
  stats: {
    points: number;
    followers: number;
    following: number;
    likes: number;
    videos: number;
    challengesCompleted: number;
  };
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ stats }) => {
  const statItems = [
    { label: 'Points', value: stats.points.toLocaleString(), icon: Trophy, color: 'text-[#843dff]' },
    { label: 'Followers', value: stats.followers.toLocaleString(), icon: Users, color: 'text-blue-400' },
    { label: 'Following', value: stats.following.toLocaleString(), icon: Users, color: 'text-green-400' },
    { label: 'Likes', value: stats.likes.toLocaleString(), icon: Heart, color: 'text-red-400' },
    { label: 'Videos', value: stats.videos.toString(), icon: Video, color: 'text-purple-400' },
    { label: 'Challenges', value: stats.challengesCompleted.toString(), icon: Trophy, color: 'text-yellow-400' }
  ];

  return (
    <div className="grid grid-cols-3 gap-2 mb-6">
      {statItems.map((item, index) => (
        <Card key={index} className="bg-gray-800 border-gray-700">
          <CardContent className="p-3 text-center">
            <item.icon className={`${item.color} mx-auto mb-1`} size={20} />
            <div className="text-white font-bold text-lg">{item.value}</div>
            <div className="text-gray-400 text-xs">{item.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProfileStats;
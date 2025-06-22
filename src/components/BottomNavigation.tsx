import React from 'react';
import { Home, Search, Video, Trophy, Bell, User, Users, Shield, Zap, BarChart3 } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'social', icon: Users, label: 'Social' },
    { id: 'live', icon: Zap, label: 'Live' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'record', icon: Video, label: 'Record' },
    { id: 'leaderboard', icon: Trophy, label: 'Leaderboard' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
      <div className="flex justify-around items-center py-2">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              activeTab === id 
                ? 'text-[#843dff]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icon size={20} />
            <span className="text-xs mt-1">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;
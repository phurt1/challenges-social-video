import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface ProfileHeaderProps {
  profile: {
    username?: string;
    bio?: string;
    avatar_url?: string;
  } | null;
  onEditProfile: () => void;
  onOpenSettings: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  onEditProfile,
  onOpenSettings
}) => {
  return (
    <div className="text-center mb-6">
      <div className="flex justify-end mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenSettings}
          className="text-gray-400 hover:text-white hover:bg-gray-800"
          aria-label="Open settings"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
      
      <Avatar className="w-24 h-24 mx-auto mb-4">
        <AvatarImage src={profile?.avatar_url} />
        <AvatarFallback>
          {profile?.username?.charAt(0).toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      
      <h2 className="text-white text-xl font-bold">
        {profile?.username || 'Your Username'}
      </h2>
      
      <p className="text-gray-400">
        {profile?.bio || 'Challenge enthusiast 🚀'}
      </p>
      
      <Button 
        className="mt-4 bg-[#843dff] hover:bg-[#7c3aef]"
        onClick={onEditProfile}
      >
        Edit Profile
      </Button>
    </div>
  );
};
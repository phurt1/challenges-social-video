import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: {
    username: string;
    bio: string;
    avatar_url?: string;
  };
  onProfileUpdate: (profile: any) => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onProfileUpdate
}) => {
  const [username, setUsername] = useState(currentProfile.username);
  const [bio, setBio] = useState(currentProfile.bio);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(currentProfile.avatar_url);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(`avatars/${fileName}`, file);
    
    if (error) {
      console.error('Avatar upload error:', error);
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(`avatars/${fileName}`);
    
    return publicUrl;
  };

  const handleSave = async () => {
    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let avatarUrl = currentProfile.avatar_url;
      
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile, user.id);
        if (!avatarUrl) {
          throw new Error('Failed to upload avatar');
        }
      }

      const { error } = await supabase
        .from('users')
        .update({
          username,
          bio,
          avatar_url: avatarUrl
        })
        .eq('id', user.id);

      if (error) throw error;

      onProfileUpdate({ username, bio, avatar_url: avatarUrl });
      toast({ title: 'Profile updated successfully!' });
      onClose();
    } catch (error) {
      console.error('Profile update error:', error);
      toast({ 
        title: 'Error updating profile', 
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={avatarPreview} />
                <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 bg-[#843dff] rounded-full p-1 cursor-pointer">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-400">Click camera to change photo</p>
          </div>
          
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-800 border-gray-600"
            />
          </div>
          
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              className="bg-gray-800 border-gray-600 resize-none"
              rows={3}
            />
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-600"
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-[#843dff] hover:bg-[#7c3aef]"
              disabled={isUploading}
            >
              {isUploading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditModal;
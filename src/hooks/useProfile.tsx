import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: string;
  username: string;
  bio: string;
  avatar_url?: string;
  points?: number;
  followers?: number;
  following?: number;
  likes?: number;
  videos?: number;
  challenges_completed?: number;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // User doesn't exist, create one
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              username: user.email?.split('@')[0] || 'User',
              bio: '',
              points: 0,
              followers: 0,
              following: 0,
              likes: 0,
              videos: 0,
              challenges_completed: 0
            })
            .select()
            .single();

          if (insertError) throw insertError;
          setProfile(newUser);
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = (updatedProfile: Partial<Profile>) => {
    if (profile) {
      setProfile({ ...profile, ...updatedProfile });
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile
  };
};
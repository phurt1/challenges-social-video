import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface DareSuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  popularity: number;
  location_based: boolean;
  reason: string;
  score: number;
}

interface UserBehavior {
  preferred_categories?: string[];
  completed_tags?: string[];
  difficulty_preference?: string;
}

interface Location {
  lat: number;
  lng: number;
}

export const useDareSuggestions = () => {
  const [suggestions, setSuggestions] = useState<DareSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = async (userId?: string, location?: Location) => {
    try {
      setLoading(true);
      setError(null);

      // Get user's behavior data from database
      let pastBehavior: UserBehavior = {};
      if (userId) {
        const { data: behaviorData } = await supabase
          .from('user_behavior')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (behaviorData) {
          pastBehavior = {
            preferred_categories: behaviorData.preferred_categories || [],
            completed_tags: behaviorData.completed_tags || [],
            difficulty_preference: behaviorData.difficulty_preference
          };
        } else {
          // Fallback: analyze recent videos to infer preferences
          const { data: userVideos } = await supabase
            .from('videos')
            .select('challenge_id, challenges(category)')
            .eq('user_id', userId)
            .limit(10);

          if (userVideos && userVideos.length > 0) {
            const categories = userVideos
              .map(v => v.challenges?.category)
              .filter(Boolean)
              .map(c => c.toLowerCase());
            
            pastBehavior.preferred_categories = [...new Set(categories)];
            pastBehavior.completed_tags = ['social', 'creative'];
          }
        }
      }

      // Call AI suggestions function
      const response = await fetch(
        'https://ntjftvutadkasgmxeovg.supabase.co/functions/v1/f36e39d8-bfbe-4c6d-9de4-f070b6da69bf',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            location,
            pastBehavior
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dare suggestions');
      
      // Fallback to mock data
      setSuggestions([
        {
          id: '1',
          title: 'Local Coffee Shop Challenge',
          description: 'Order your drink in a different accent',
          category: 'Social',
          difficulty: 'Easy',
          points: 50,
          popularity: 85,
          location_based: true,
          reason: 'Popular in your area',
          score: 95
        },
        {
          id: '2',
          title: 'Street Art Photography',
          description: 'Find and photograph 3 pieces of street art',
          category: 'Creative',
          difficulty: 'Medium',
          points: 100,
          popularity: 92,
          location_based: true,
          reason: 'Based on your creative interests',
          score: 112
        },
        {
          id: '3',
          title: 'Random Acts of Kindness',
          description: 'Compliment 5 strangers today',
          category: 'Social',
          difficulty: 'Medium',
          points: 75,
          popularity: 78,
          location_based: false,
          reason: 'Trending globally',
          score: 88
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const acceptDare = async (dareId: string) => {
    try {
      const suggestion = suggestions.find(s => s.id === dareId);
      if (!suggestion) return;

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Create a new challenge based on the dare suggestion
      const { data: newChallenge, error: challengeError } = await supabase
        .from('challenges')
        .insert({
          title: suggestion.title,
          description: suggestion.description,
          category: suggestion.category,
          difficulty: suggestion.difficulty,
          points: suggestion.points,
          creator_id: user.user.id,
          is_active: true,
          participants: 0
        })
        .select()
        .single();

      if (challengeError) throw challengeError;
      
      // Update user behavior to improve future suggestions
      await supabase
        .from('user_behavior')
        .upsert({
          user_id: user.user.id,
          preferred_categories: [suggestion.category.toLowerCase()],
          completed_tags: ['accepted'],
          updated_at: new Date().toISOString()
        });
      
      // Remove accepted dare from suggestions
      setSuggestions(prev => prev.filter(s => s.id !== dareId));
      
      return { success: true, challenge: newChallenge };
    } catch (err) {
      console.error('Error accepting dare:', err);
      setError('Failed to accept dare');
      return { success: false, error: err };
    }
  };

  return {
    suggestions,
    loading,
    error,
    fetchSuggestions,
    acceptDare
  };
};
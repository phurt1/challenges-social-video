import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface SearchResult {
  id: string;
  type: 'user' | 'challenge' | 'hashtag' | 'video';
  title: string;
  subtitle?: string;
  avatar?: string;
  metadata?: {
    followers?: number;
    participants?: number;
    uses?: number;
    views?: number;
    likes?: number;
  };
}

export const useSearch = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const saveRecentSearch = (query: string) => {
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const searchUsers = async (query: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, bio, avatar_url')
      .or(`username.ilike.%${query}%,bio.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;

    return data?.map(user => ({
      id: user.id,
      type: 'user' as const,
      title: user.username,
      subtitle: user.bio,
      avatar: user.avatar_url,
      metadata: { followers: 0 }
    })) || [];
  };

  const searchChallenges = async (query: string) => {
    const { data, error } = await supabase
      .from('challenges')
      .select('id, title, description, category, participants')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;

    return data?.map(challenge => ({
      id: challenge.id,
      type: 'challenge' as const,
      title: challenge.title,
      subtitle: challenge.description,
      metadata: { participants: challenge.participants || 0 }
    })) || [];
  };

  const searchVideos = async (query: string) => {
    const { data, error } = await supabase
      .from('videos')
      .select('id, title, description, views, likes')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;

    return data?.map(video => ({
      id: video.id,
      type: 'video' as const,
      title: video.title || 'Untitled Video',
      subtitle: video.description,
      metadata: { 
        views: video.views || 0,
        likes: video.likes || 0
      }
    })) || [];
  };

  const searchHashtags = (query: string) => {
    const hashtags = ['#dance', '#fitness', '#comedy', '#music', '#art', '#food', '#travel', '#sports'];
    return hashtags
      .filter(tag => tag.includes(query.toLowerCase()))
      .map(tag => ({
        id: tag,
        type: 'hashtag' as const,
        title: tag,
        subtitle: 'Trending hashtag',
        metadata: { uses: Math.floor(Math.random() * 10000) }
      }));
  };

  const search = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    saveRecentSearch(query);

    try {
      const [users, challenges, videos] = await Promise.all([
        searchUsers(query),
        searchChallenges(query),
        searchVideos(query)
      ]);

      const hashtags = searchHashtags(query);
      const allResults = [...users, ...challenges, ...videos, ...hashtags];
      
      setResults(allResults);
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTrendingSearches = () => {
    return ['#dance', 'fitness challenge', 'comedy', 'trending', 'viral'];
  };

  return {
    results,
    loading,
    error,
    search,
    recentSearches,
    clearRecentSearches,
    getTrendingSearches
  };
};
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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

export const useChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: '1',
      title: 'Dance Challenge',
      description: 'Show off your best dance moves!',
      category: 'Dance',
      difficulty: 'Easy',
      points: 100,
      participants: 1234,
      completed: false
    },
    {
      id: '2',
      title: 'Cooking Challenge',
      description: 'Make a delicious meal in 30 minutes',
      category: 'Food',
      difficulty: 'Medium',
      points: 200,
      timeLimit: 1800,
      participants: 567,
      completed: false
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      setError(null);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Keep mock data for now
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch challenges');
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchChallenges();
  };

  return { challenges, loading, error, refetch };
};
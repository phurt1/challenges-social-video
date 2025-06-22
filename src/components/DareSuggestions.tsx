import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, MapPin, TrendingUp, User, RefreshCw } from 'lucide-react';
import { useDareSuggestions } from '@/hooks/useDareSuggestions';
import { supabase } from '@/lib/supabase';

interface DareSuggestionsProps {
  className?: string;
}

export const DareSuggestions: React.FC<DareSuggestionsProps> = ({ className }) => {
  const { suggestions, loading, error, fetchSuggestions, acceptDare } = useDareSuggestions();
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user?.id || null);
    };
    getCurrentUser();

    // Get user location if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Location access denied, continue without location
        }
      );
    }
  }, []);

  useEffect(() => {
    if (currentUser !== null) {
      fetchSuggestions(currentUser, userLocation);
    }
  }, [currentUser, userLocation]);

  const getReasonIcon = (reason: string) => {
    if (reason.includes('area')) return <MapPin className="w-4 h-4" />;
    if (reason.includes('interests')) return <User className="w-4 h-4" />;
    if (reason.includes('Trending')) return <TrendingUp className="w-4 h-4" />;
    return <Sparkles className="w-4 h-4" />;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'secondary';
      case 'Medium': return 'default';
      case 'Hard': return 'destructive';
      default: return 'secondary';
    }
  };

  const handleAcceptDare = async (dareId: string) => {
    await acceptDare(dareId);
  };

  const handleRefresh = () => {
    fetchSuggestions(currentUser, userLocation);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Dare Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Dare Suggestions
          </div>
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center py-4">
            <p className="text-red-500 mb-2">{error}</p>
            <Button variant="outline" onClick={handleRefresh}>
              Try Again
            </Button>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No suggestions available right now</p>
            <Button variant="outline" onClick={handleRefresh} className="mt-2">
              Get Suggestions
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{suggestion.title}</h3>
                  <Badge variant={getDifficultyColor(suggestion.difficulty)}>
                    {suggestion.difficulty}
                  </Badge>
                </div>
                <p className="text-gray-600 mb-3">{suggestion.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="font-medium">{suggestion.points} pts</span>
                    <span>{suggestion.popularity}% popularity</span>
                    <div className="flex items-center gap-1">
                      {getReasonIcon(suggestion.reason)}
                      <span>{suggestion.reason}</span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleAcceptDare(suggestion.id)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Accept Dare
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
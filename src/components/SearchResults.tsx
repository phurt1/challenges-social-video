import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, Hash, Video, Trophy } from 'lucide-react';

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

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  onResultClick: (result: SearchResult) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  loading,
  onResultClick
}) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-700 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded animate-pulse mb-2" />
                  <div className="h-3 bg-gray-700 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="text-4xl mb-4">🔍</div>
        <p>No results found</p>
        <p className="text-sm mt-2">Try different keywords or check your spelling</p>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="h-5 w-5" />;
      case 'challenge': return <Trophy className="h-5 w-5" />;
      case 'hashtag': return <Hash className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      default: return null;
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="space-y-3">
      {results.map((result) => (
        <Card 
          key={result.id} 
          className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer"
          onClick={() => onResultClick(result)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {result.type === 'user' ? (
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={result.avatar} />
                    <AvatarFallback className="bg-purple-600">
                      {result.title.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-purple-400">
                    {getIcon(result.type)}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-white font-medium">{result.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {result.type}
                    </Badge>
                  </div>
                  {result.subtitle && (
                    <p className="text-gray-400 text-sm mt-1">{result.subtitle}</p>
                  )}
                  {result.metadata && (
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      {result.metadata.followers && (
                        <span>{formatCount(result.metadata.followers)} followers</span>
                      )}
                      {result.metadata.participants && (
                        <span>{formatCount(result.metadata.participants)} participants</span>
                      )}
                      {result.metadata.uses && (
                        <span>{formatCount(result.metadata.uses)} uses</span>
                      )}
                      {result.metadata.views && (
                        <span>{formatCount(result.metadata.views)} views</span>
                      )}
                      {result.metadata.likes && (
                        <span>{formatCount(result.metadata.likes)} likes</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
                View
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
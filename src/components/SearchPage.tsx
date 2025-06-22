import React, { useState } from 'react';
import { SearchBar } from './SearchBar';
import { SearchResults } from './SearchResults';
import { DiscoveryFeed } from './DiscoveryFeed';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSearch } from '@/hooks/useSearch';
import { Clock, TrendingUp, X } from 'lucide-react';

interface SearchPageProps {
  onResultClick?: (result: any) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onResultClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { results, loading, search, recentSearches, clearRecentSearches, getTrendingSearches } = useSearch();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setShowResults(true);
      await search(query);
    } else {
      setShowResults(false);
    }
  };

  const handleResultClick = (result: any) => {
    if (onResultClick) {
      onResultClick(result);
    }
  };

  const handleRecentSearchClick = (query: string) => {
    handleSearch(query);
  };

  const handleTrendingClick = (query: string) => {
    handleSearch(query);
  };

  const trendingSearches = getTrendingSearches();

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search users, challenges, hashtags..."
        />
      </div>

      {showResults ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-lg font-semibold">
              Search Results {searchQuery && `for "${searchQuery}"`}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowResults(false);
                setSearchQuery('');
              }}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <SearchResults
            results={results}
            loading={loading}
            onResultClick={handleResultClick}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white text-lg font-semibold flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Recent Searches
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentSearches}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((query, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-gray-800 text-gray-300 hover:bg-gray-700 cursor-pointer px-3 py-1"
                    onClick={() => handleRecentSearchClick(query)}
                  >
                    {query}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          <div>
            <h2 className="text-white text-lg font-semibold mb-3 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Trending Searches
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {trendingSearches.map((query, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-purple-600 text-white hover:bg-purple-700 cursor-pointer px-3 py-1"
                  onClick={() => handleTrendingClick(query)}
                >
                  {query}
                </Badge>
              ))}
            </div>
          </div>

          {/* Discovery Feed */}
          <div>
            <h2 className="text-white text-lg font-semibold mb-4">Discover</h2>
            <DiscoveryFeed onItemClick={handleResultClick} />
          </div>
        </div>
      )}
    </div>
  );
};
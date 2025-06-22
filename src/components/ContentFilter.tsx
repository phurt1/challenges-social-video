import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ContentFilterProps {
  onFilterChange?: (filters: FilterSettings) => void;
}

interface FilterSettings {
  profanityFilter: boolean;
  violenceFilter: boolean;
  adultContentFilter: boolean;
  spamFilter: boolean;
  sensitivityLevel: number;
  autoModeration: boolean;
}

const BLOCKED_WORDS = [
  'spam', 'fake', 'scam', 'hate', 'violence'
];

export const ContentFilter: React.FC<ContentFilterProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<FilterSettings>({
    profanityFilter: true,
    violenceFilter: true,
    adultContentFilter: true,
    spamFilter: true,
    sensitivityLevel: 50,
    autoModeration: false
  });
  const [blockedWords, setBlockedWords] = useState<string[]>(BLOCKED_WORDS);
  const [newWord, setNewWord] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    onFilterChange?.(filters);
  }, [filters, onFilterChange]);

  const updateFilter = (key: keyof FilterSettings, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const addBlockedWord = () => {
    if (newWord.trim() && !blockedWords.includes(newWord.toLowerCase())) {
      setBlockedWords(prev => [...prev, newWord.toLowerCase()]);
      setNewWord('');
      toast({
        title: 'Word added',
        description: `"${newWord}" added to blocked words list`
      });
    }
  };

  const removeBlockedWord = (word: string) => {
    setBlockedWords(prev => prev.filter(w => w !== word));
    toast({
      title: 'Word removed',
      description: `"${word}" removed from blocked words list`
    });
  };

  const analyzeContent = (text: string): { score: number; flags: string[] } => {
    const flags: string[] = [];
    let score = 0;

    // Check for blocked words
    const lowerText = text.toLowerCase();
    blockedWords.forEach(word => {
      if (lowerText.includes(word)) {
        flags.push(`Contains blocked word: ${word}`);
        score += 20;
      }
    });

    // Check for excessive caps
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
    if (capsRatio > 0.5 && text.length > 10) {
      flags.push('Excessive capitalization');
      score += 10;
    }

    // Check for repeated characters
    if (/(..)\1{3,}/.test(text)) {
      flags.push('Repeated characters (spam-like)');
      score += 15;
    }

    // Check for excessive punctuation
    const punctRatio = (text.match(/[!?]{3,}/g) || []).length;
    if (punctRatio > 0) {
      flags.push('Excessive punctuation');
      score += 10;
    }

    return { score: Math.min(score, 100), flags };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="profanity">Profanity Filter</Label>
            <Switch
              id="profanity"
              checked={filters.profanityFilter}
              onCheckedChange={(checked) => updateFilter('profanityFilter', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="violence">Violence Filter</Label>
            <Switch
              id="violence"
              checked={filters.violenceFilter}
              onCheckedChange={(checked) => updateFilter('violenceFilter', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="adult">Adult Content Filter</Label>
            <Switch
              id="adult"
              checked={filters.adultContentFilter}
              onCheckedChange={(checked) => updateFilter('adultContentFilter', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="spam">Spam Filter</Label>
            <Switch
              id="spam"
              checked={filters.spamFilter}
              onCheckedChange={(checked) => updateFilter('spamFilter', checked)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Sensitivity Level: {filters.sensitivityLevel}%</Label>
            <Slider
              value={[filters.sensitivityLevel]}
              onValueChange={([value]) => updateFilter('sensitivityLevel', value)}
              max={100}
              step={10}
              className="w-full"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="auto">Auto Moderation</Label>
            <Switch
              id="auto"
              checked={filters.autoModeration}
              onCheckedChange={(checked) => updateFilter('autoModeration', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Blocked Words</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="Add blocked word"
              className="flex-1 px-3 py-2 border rounded-md"
              onKeyPress={(e) => e.key === 'Enter' && addBlockedWord()}
            />
            <Button onClick={addBlockedWord}>Add</Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {blockedWords.map((word) => (
              <Badge
                key={word}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => removeBlockedWord(word)}
              >
                {word} ×
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <textarea
              placeholder="Test content analysis here..."
              className="w-full p-3 border rounded-md h-24 resize-none"
              onChange={(e) => {
                const analysis = analyzeContent(e.target.value);
                // You can display analysis results here
              }}
            />
            <p className="text-sm text-muted-foreground">
              Type content above to see real-time analysis
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
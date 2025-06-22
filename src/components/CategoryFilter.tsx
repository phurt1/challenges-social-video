import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  className?: string;
}

export const CategoryFilter = ({
  categories,
  selectedCategory,
  onCategoryChange,
  className
}: CategoryFilterProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleCategories = isExpanded ? categories : categories.slice(0, 4);
  const hasMore = categories.length > 4;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">Categories</h3>
        {selectedCategory && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCategoryChange(null)}
            className="text-gray-400 hover:text-white h-auto p-1"
          >
            Clear
          </Button>
        )}
      </div>
      
      <ScrollArea className="w-full">
        <div className="flex flex-wrap gap-2 pb-2">
          <Badge
            variant={selectedCategory === null ? 'default' : 'secondary'}
            className={cn(
              'cursor-pointer transition-colors px-3 py-1',
              selectedCategory === null
                ? 'bg-[#843dff] hover:bg-[#7c3aeb] text-white'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            )}
            onClick={() => onCategoryChange(null)}
          >
            All
          </Badge>
          
          {visibleCategories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? 'default' : 'secondary'}
              className={cn(
                'cursor-pointer transition-colors px-3 py-1 whitespace-nowrap',
                selectedCategory === category
                  ? 'bg-[#843dff] hover:bg-[#7c3aeb] text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              )}
              onClick={() => onCategoryChange(category)}
            >
              {category}
            </Badge>
          ))}
          
          {hasMore && (
            <Badge
              variant="outline"
              className="cursor-pointer border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300 px-3 py-1"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Show Less' : `+${categories.length - 4} More`}
            </Badge>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
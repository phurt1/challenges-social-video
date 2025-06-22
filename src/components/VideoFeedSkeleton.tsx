import { Skeleton } from '@/components/ui/skeleton';

export const VideoFeedSkeleton = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-gray-900 rounded-lg overflow-hidden">
          {/* Video placeholder */}
          <div className="relative aspect-[9/16] bg-gray-800">
            <Skeleton className="w-full h-full bg-gray-700" />
            {/* User info overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center space-x-3 mb-2">
                <Skeleton className="w-10 h-10 rounded-full bg-gray-600" />
                <Skeleton className="h-4 w-24 bg-gray-600" />
              </div>
              <Skeleton className="h-4 w-full bg-gray-600 mb-1" />
              <Skeleton className="h-4 w-3/4 bg-gray-600" />
            </div>
            {/* Action buttons */}
            <div className="absolute right-4 bottom-20 space-y-4">
              <Skeleton className="w-12 h-12 rounded-full bg-gray-600" />
              <Skeleton className="w-12 h-12 rounded-full bg-gray-600" />
              <Skeleton className="w-12 h-12 rounded-full bg-gray-600" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const ChallengesSkeleton = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32 bg-gray-700" />
              <Skeleton className="h-5 w-16 bg-gray-700" />
            </div>
            <Skeleton className="h-4 w-full bg-gray-700" />
            <Skeleton className="h-4 w-3/4 bg-gray-700" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-4 w-20 bg-gray-700" />
                <Skeleton className="h-4 w-16 bg-gray-700" />
              </div>
              <Skeleton className="h-4 w-24 bg-gray-700" />
            </div>
            <Skeleton className="h-10 w-full bg-gray-700" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
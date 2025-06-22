import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, UserCheck } from 'lucide-react';

interface UserCardProps {
  user: {
    id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
    follower_count?: number;
    following_count?: number;
    video_count?: number;
    is_following?: boolean;
  };
  onFollow: (userId: string) => void;
  onUnfollow: (userId: string) => void;
  isLoading?: boolean;
}

export function UserCard({ user, onFollow, onUnfollow, isLoading }: UserCardProps) {
  const handleFollowClick = () => {
    if (user.is_following) {
      onUnfollow(user.id);
    } else {
      onFollow(user.id);
    }
  };

  return (
    <Card className="p-4">
      <CardContent className="p-0">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback>
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{user.full_name || user.username}</h3>
            <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
            
            <div className="flex space-x-4 mt-1">
              <Badge variant="secondary" className="text-xs">
                {user.follower_count || 0} followers
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {user.video_count || 0} videos
              </Badge>
            </div>
          </div>
          
          <Button
            onClick={handleFollowClick}
            disabled={isLoading}
            variant={user.is_following ? "outline" : "default"}
            size="sm"
          >
            {user.is_following ? (
              <><UserCheck className="h-4 w-4 mr-1" />Following</>
            ) : (
              <><UserPlus className="h-4 w-4 mr-1" />Follow</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
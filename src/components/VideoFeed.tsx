import React, { useState } from 'react';
import { Heart, MessageCircle, Share, AlertTriangle, RefreshCw } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PullToRefresh } from './PullToRefresh';
import { VideoFeedSkeleton } from './VideoFeedSkeleton';
import { cn } from '@/lib/utils';

interface Video {
  id: string;
  username: string;
  avatar: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  videoUrl?: string;
}

interface VideoFeedProps {
  videos: Video[];
  onLike: (videoId: string) => void;
  onComment: (videoId: string) => void;
  onShare: (videoId: string) => void;
  loading?: boolean;
  error?: string;
  onRefresh?: () => Promise<void>;
}

const VideoFeed: React.FC<VideoFeedProps> = ({
  videos,
  onLike,
  onComment,
  onShare,
  loading = false,
  error,
  onRefresh
}) => {
  const [videoErrors, setVideoErrors] = useState<Set<string>>(new Set());
  const [retryingVideos, setRetryingVideos] = useState<Set<string>>(new Set());

  const handleVideoError = (videoId: string) => {
    setVideoErrors(prev => new Set([...prev, videoId]));
  };

  const handleRetryVideo = async (videoId: string) => {
    setRetryingVideos(prev => new Set([...prev, videoId]));
    setVideoErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(videoId);
      return newSet;
    });
    
    setTimeout(() => {
      setRetryingVideos(prev => {
        const newSet = new Set(prev);
        newSet.delete(videoId);
        return newSet;
      });
    }, 1000);
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      setVideoErrors(new Set());
      await onRefresh();
    }
  };

  const handleShare = async (videoId: string) => {
    try {
      // Check if Web Share API is supported and available
      if (navigator.share && navigator.canShare) {
        const shareData = {
          title: 'Check out this challenge video!',
          text: 'Amazing challenge video from our app',
          url: window.location.href
        };
        
        // Check if the data can be shared
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          onShare(videoId);
          return;
        }
      }
      
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      onShare(videoId);
      
      // Show a simple notification
      const notification = document.createElement('div');
      notification.textContent = 'Link copied to clipboard!';
      notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg z-50';
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 2000);
      
    } catch (error) {
      console.warn('Share failed:', error);
      // Still call onShare to update the count
      onShare(videoId);
    }
  };

  if (error && !videos.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <Alert className="border-red-500 bg-red-500/10 max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-400">
            {error}
          </AlertDescription>
        </Alert>
        {onRefresh && (
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="mt-4 border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  const content = (
    <div className="pb-20">
      {loading && videos.length === 0 ? (
        <VideoFeedSkeleton />
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 text-center p-4">
          <div className="text-6xl mb-4">📹</div>
          <h3 className="text-white text-xl font-semibold mb-2">No Videos Yet</h3>
          <p className="text-gray-400">Be the first to share a challenge video!</p>
        </div>
      ) : (
        videos.map((video) => {
          const hasError = videoErrors.has(video.id);
          const isRetrying = retryingVideos.has(video.id);
          
          return (
            <div key={video.id} className="relative mb-4">
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <div className="relative aspect-[9/16] bg-gray-800">
                  {hasError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800">
                      <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-400 text-center mb-4 px-4">
                        Failed to load video
                      </p>
                      <Button
                        onClick={() => handleRetryVideo(video.id)}
                        variant="outline"
                        size="sm"
                        disabled={isRetrying}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        {isRetrying ? (
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        Retry
                      </Button>
                    </div>
                  ) : (
                    <>
                      {video.videoUrl ? (
                        <video
                          className="w-full h-full object-cover"
                          poster="/placeholder.svg"
                          controls={false}
                          muted
                          loop
                          playsInline
                          onError={() => handleVideoError(video.id)}
                          aria-label={`Video by ${video.username}: ${video.description}`}
                        >
                          <source src={video.videoUrl} type="video/mp4" />
                          <img
                            src="/placeholder.svg"
                            alt={`Video thumbnail for ${video.description}`}
                            className="w-full h-full object-cover"
                          />
                        </video>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-6xl mb-4">🎬</div>
                            <p className="text-white text-lg font-semibold">{video.username}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="absolute bottom-4 left-4 right-16">
                        <div className="flex items-center space-x-3 mb-2">
                          <Avatar className="w-10 h-10 border-2 border-white">
                            <AvatarImage src={video.avatar} alt={`${video.username}'s avatar`} />
                            <AvatarFallback>{video.username.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="text-white font-semibold">{video.username}</span>
                        </div>
                        <p className="text-white text-sm leading-tight">{video.description}</p>
                      </div>
                      
                      <div className="absolute right-4 bottom-20 space-y-4">
                        <button
                          onClick={() => onLike(video.id)}
                          className={cn(
                            "flex flex-col items-center space-y-1 transition-colors",
                            video.isLiked ? "text-red-500" : "text-white"
                          )}
                          aria-label={`${video.isLiked ? 'Unlike' : 'Like'} video by ${video.username}`}
                        >
                          <Heart className={cn("w-8 h-8", video.isLiked && "fill-current")} />
                          <span className="text-xs font-semibold">{video.likes}</span>
                        </button>
                        
                        <button
                          onClick={() => onComment(video.id)}
                          className="flex flex-col items-center space-y-1 text-white transition-colors hover:text-gray-300"
                          aria-label={`Comment on video by ${video.username}`}
                        >
                          <MessageCircle className="w-8 h-8" />
                          <span className="text-xs font-semibold">{video.comments}</span>
                        </button>
                        
                        <button
                          onClick={() => handleShare(video.id)}
                          className="flex flex-col items-center space-y-1 text-white transition-colors hover:text-gray-300"
                          aria-label={`Share video by ${video.username}`}
                        >
                          <Share className="w-8 h-8" />
                          <span className="text-xs font-semibold">{video.shares}</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  return onRefresh ? (
    <PullToRefresh onRefresh={handleRefresh} className="h-full">
      {content}
    </PullToRefresh>
  ) : (
    content
  );
};

export default VideoFeed;
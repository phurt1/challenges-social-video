import React, { useState, useRef } from 'react';
import { Heart, MessageCircle, Share, AlertTriangle, RefreshCw, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PullToRefresh } from './PullToRefresh';
import { VideoFeedSkeleton } from './VideoFeedSkeleton';
import VideoPlayer from './VideoPlayer';
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
  duration?: number;
  views?: number;
}

interface EnhancedVideoFeedProps {
  videos: Video[];
  onLike: (videoId: string) => void;
  onComment: (videoId: string) => void;
  onShare: (videoId: string) => void;
  loading?: boolean;
  error?: string;
  onRefresh?: () => Promise<void>;
}

const EnhancedVideoFeed: React.FC<EnhancedVideoFeedProps> = ({
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
  const [playingVideos, setPlayingVideos] = useState<Set<string>>(new Set());
  const [mutedVideos, setMutedVideos] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

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
      setPlayingVideos(new Set());
      await onRefresh();
    }
  };

  const togglePlay = (videoId: string) => {
    setPlayingVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  const toggleMute = (videoId: string) => {
    setMutedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
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
          const isPlaying = playingVideos.has(video.id);
          const isMuted = mutedVideos.has(video.id);
          
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
                        <VideoPlayer
                          src={video.videoUrl}
                          autoPlay={isPlaying}
                          muted={isMuted}
                          controls={false}
                          className="w-full h-full"
                          onTimeUpdate={(current, duration) => {
                            // Handle time updates if needed
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-6xl mb-4">🎬</div>
                            <p className="text-white text-lg font-semibold">{video.username}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Video duration overlay */}
                      {video.duration && (
                        <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {formatDuration(video.duration)}
                        </div>
                      )}
                      
                      {/* Play/Pause overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button
                          onClick={() => togglePlay(video.id)}
                          variant="ghost"
                          size="lg"
                          className="bg-black/30 hover:bg-black/50 text-white rounded-full p-4 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {isPlaying ? <Pause size={32} /> : <Play size={32} />}
                        </Button>
                      </div>
                      
                      {/* User info overlay */}
                      <div className="absolute bottom-4 left-4 right-16">
                        <div className="flex items-center space-x-3 mb-2">
                          <Avatar className="w-10 h-10 border-2 border-white">
                            <AvatarImage src={video.avatar} alt={`${video.username}'s avatar`} />
                            <AvatarFallback>{video.username.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="text-white font-semibold block">{video.username}</span>
                            {video.views && (
                              <span className="text-gray-300 text-xs">{formatViews(video.views)} views</span>
                            )}
                          </div>
                        </div>
                        <p className="text-white text-sm leading-tight">{video.description}</p>
                      </div>
                      
                      {/* Action buttons */}
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
                          onClick={() => onShare(video.id)}
                          className="flex flex-col items-center space-y-1 text-white transition-colors hover:text-gray-300"
                          aria-label={`Share video by ${video.username}`}
                        >
                          <Share className="w-8 h-8" />
                          <span className="text-xs font-semibold">{video.shares}</span>
                        </button>
                        
                        <button
                          onClick={() => toggleMute(video.id)}
                          className="flex flex-col items-center space-y-1 text-white transition-colors hover:text-gray-300"
                          aria-label={`${isMuted ? 'Unmute' : 'Mute'} video`}
                        >
                          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
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

export default EnhancedVideoFeed;
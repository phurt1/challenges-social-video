import { useState, useRef, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export const PullToRefresh = ({ onRefresh, children, className }: PullToRefreshProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const PULL_THRESHOLD = 80;
  const MAX_PULL = 120;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;

    currentY.current = e.touches[0].clientY;
    const distance = Math.max(0, currentY.current - startY.current);
    const pullDistance = Math.min(distance * 0.5, MAX_PULL);
    
    if (pullDistance > 0) {
      e.preventDefault();
      setPullDistance(pullDistance);
    }
  }, [isPulling, isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;
    
    setIsPulling(false);
    
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
  }, [isPulling, pullDistance, isRefreshing, onRefresh]);

  const refreshProgress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const shouldTriggerRefresh = pullDistance >= PULL_THRESHOLD;

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-auto', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateY(${isPulling ? pullDistance : isRefreshing ? 60 : 0}px)`,
        transition: isPulling ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      {/* Pull to refresh indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center bg-gray-900/90 backdrop-blur-sm"
        style={{
          height: '60px',
          transform: `translateY(-60px)`,
          opacity: isPulling || isRefreshing ? 1 : 0,
          transition: 'opacity 0.2s ease-out'
        }}
      >
        <div className="flex items-center space-x-2 text-white">
          <RefreshCw
            className={cn(
              'h-5 w-5 transition-transform duration-200',
              isRefreshing && 'animate-spin',
              shouldTriggerRefresh && !isRefreshing && 'text-[#843dff]'
            )}
            style={{
              transform: `rotate(${refreshProgress * 180}deg)`
            }}
          />
          <span className="text-sm">
            {isRefreshing
              ? 'Refreshing...'
              : shouldTriggerRefresh
              ? 'Release to refresh'
              : 'Pull to refresh'
            }
          </span>
        </div>
      </div>
      
      {children}
    </div>
  );
};
import { useEffect, useRef, useCallback } from 'react';
import { PostWithAuthor } from '@/hooks/usePosts';
import { PostCard } from './PostCard';
import { Button } from '@/components/ui/button';
import { Flame, Clock, HelpCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type SortOption = 'popular' | 'newest' | 'unanswered';

interface PostListProps {
  posts: PostWithAuthor[];
  onSelectPost?: (post: PostWithAuthor) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  isLoading?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  onPrefetchNext?: () => void;
}

export function PostList({ 
  posts, 
  onSelectPost, 
  sortBy, 
  onSortChange, 
  isLoading = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  onPrefetchNext,
}: PostListProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const prefetchRef = useRef<HTMLDivElement>(null);
  const hasPrefetched = useRef(false);

  // Reset prefetch flag when posts change (new query or page loaded)
  useEffect(() => {
    hasPrefetched.current = false;
  }, [posts.length]);

  // Prefetch next page when user scrolls near bottom (before they reach the load trigger)
  useEffect(() => {
    if (!hasNextPage || !onPrefetchNext || hasPrefetched.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasPrefetched.current) {
          hasPrefetched.current = true;
          onPrefetchNext();
        }
      },
      { threshold: 0.1, rootMargin: '400px' } // Trigger earlier than load
    );

    const currentRef = prefetchRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, onPrefetchNext]);

  // Infinite scroll with Intersection Observer - triggers actual load
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  const sortOptions: { value: SortOption; label: string; icon: typeof Flame }[] = [
    { value: 'popular', label: 'Popular', icon: Flame },
    { value: 'newest', label: 'Newest', icon: Clock },
    { value: 'unanswered', label: 'Unanswered', icon: HelpCircle },
  ];

  if (isLoading) {
    return (
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-4">
          {sortOptions.map(option => (
            <Skeleton key={option.value} className="h-8 w-24" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="forum-card p-4">
              <div className="flex gap-4">
                <Skeleton className="w-10 h-20 hidden sm:block" />
                <div className="flex-1 space-y-3">
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0">
      {/* Sort Options */}
      <div className="flex items-center gap-2 mb-4">
        {sortOptions.map(option => {
          const Icon = option.icon;
          return (
            <Button
              key={option.value}
              variant="ghost"
              size="sm"
              onClick={() => onSortChange(option.value)}
              className={cn(
                "gap-1.5",
                sortBy === option.value 
                  ? "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {option.label}
            </Button>
          );
        })}
      </div>

      {/* Posts */}
      <div className="space-y-3">
        {posts.length > 0 ? (
          <>
            {posts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                onSelect={onSelectPost}
              />
            ))}
            
            {/* Prefetch trigger - fires early */}
            <div ref={prefetchRef} className="h-1" />
            
            {/* Infinite scroll trigger - fires when visible */}
            <div ref={loadMoreRef} className="h-4" />
            
            {/* Loading indicator */}
            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </>
        ) : (
          <div className="forum-card p-12 text-center">
            <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display font-semibold text-lg mb-2">No discussions found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or be the first to start a conversation!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

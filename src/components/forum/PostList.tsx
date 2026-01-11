import { Post } from '@/types/forum';
import { PostCard } from './PostCard';
import { Button } from '@/components/ui/button';
import { Flame, Clock, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type SortOption = 'popular' | 'newest' | 'unanswered';

interface PostListProps {
  posts: Post[];
  onSelectPost: (post: Post) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function PostList({ posts, onSelectPost, sortBy, onSortChange }: PostListProps) {
  const sortOptions: { value: SortOption; label: string; icon: typeof Flame }[] = [
    { value: 'popular', label: 'Popular', icon: Flame },
    { value: 'newest', label: 'Newest', icon: Clock },
    { value: 'unanswered', label: 'Unanswered', icon: HelpCircle },
  ];

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
          posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              onSelect={onSelectPost}
            />
          ))
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

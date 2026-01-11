import { useState } from 'react';
import { Post } from '@/types/forum';
import { VoteButtons } from './VoteButtons';
import { AuthorityBadge } from './AuthorityBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Eye, Pin, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
  onSelect: (post: Post) => void;
}

export function PostCard({ post, onSelect }: PostCardProps) {
  const [localPost, setLocalPost] = useState(post);

  const handleVote = (direction: 'up' | 'down') => {
    setLocalPost(prev => {
      const wasUpvoted = prev.userVote === 'up';
      const wasDownvoted = prev.userVote === 'down';
      
      let newUpvotes = prev.upvotes;
      let newDownvotes = prev.downvotes;
      let newUserVote: 'up' | 'down' | null = direction;

      if (direction === 'up') {
        if (wasUpvoted) {
          newUpvotes--;
          newUserVote = null;
        } else {
          newUpvotes++;
          if (wasDownvoted) newDownvotes--;
        }
      } else {
        if (wasDownvoted) {
          newDownvotes--;
          newUserVote = null;
        } else {
          newDownvotes++;
          if (wasUpvoted) newUpvotes--;
        }
      }

      return {
        ...prev,
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        userVote: newUserVote,
      };
    });
  };

  return (
    <article 
      className="forum-card p-4 cursor-pointer animate-fade-in"
      onClick={() => onSelect(post)}
    >
      <div className="flex gap-4">
        {/* Vote Column */}
        <div className="hidden sm:block" onClick={e => e.stopPropagation()}>
          <VoteButtons
            upvotes={localPost.upvotes}
            downvotes={localPost.downvotes}
            userVote={localPost.userVote}
            onVote={handleVote}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {localPost.isPinned && (
              <span className="inline-flex items-center gap-1 text-accent text-xs font-medium">
                <Pin className="w-3 h-3" />
                Pinned
              </span>
            )}
            <span className={cn(
              "category-badge",
              localPost.category.type === 'equipment' 
                ? "bg-category-equipment/15 text-category-equipment"
                : "bg-category-business/15 text-category-business"
            )}>
              {localPost.category.icon} {localPost.category.name}
            </span>
            {localPost.hasAcceptedAnswer && (
              <span className="inline-flex items-center gap-1 text-success text-xs font-medium">
                <CheckCircle2 className="w-3 h-3" />
                Solved
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-display font-semibold text-lg text-foreground hover:text-accent transition-colors line-clamp-2 mb-2">
            {localPost.title}
          </h3>

          {/* Preview */}
          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
            {localPost.content}
          </p>

          {/* Tags */}
          {localPost.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {localPost.tags.slice(0, 3).map(tag => (
                <span 
                  key={tag}
                  className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
              {localPost.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{localPost.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="w-5 h-5">
                <AvatarImage src={localPost.author.avatar} />
                <AvatarFallback>{localPost.author.displayName.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground">
                {localPost.author.displayName}
              </span>
              <AuthorityBadge role={localPost.author.role} size="sm" />
            </div>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatDistanceToNow(localPost.createdAt, { addSuffix: true })}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" />
                {localPost.commentCount}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {localPost.views}
              </span>
            </div>

            {/* Mobile Votes */}
            <div className="sm:hidden flex items-center" onClick={e => e.stopPropagation()}>
              <VoteButtons
                upvotes={localPost.upvotes}
                downvotes={localPost.downvotes}
                userVote={localPost.userVote}
                onVote={handleVote}
                layout="horizontal"
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

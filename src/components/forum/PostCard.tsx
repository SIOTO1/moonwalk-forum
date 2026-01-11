import { useState } from 'react';
import { PostWithAuthor } from '@/hooks/usePosts';
import { VoteButtons } from './VoteButtons';
import { MembershipBadge } from '@/components/auth/MembershipBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Eye, Pin, CheckCircle2, Clock, Rocket, Shield, Wrench, FileText, TrendingUp, Users, AlertTriangle, MapPin, MessageCircle as MessageCircleIcon, Star, Crown, ShieldCheck, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'rocket': Rocket,
  'shield': Shield,
  'wrench': Wrench,
  'file-text': FileText,
  'trending-up': TrendingUp,
  'users': Users,
  'alert-triangle': AlertTriangle,
  'map-pin': MapPin,
  'message-circle': MessageCircleIcon,
  'star': Star,
  'crown': Crown,
  'shield-check': ShieldCheck,
  'download': Download,
};

interface PostCardProps {
  post: PostWithAuthor;
  onSelect: (post: PostWithAuthor) => void;
}

export function PostCard({ post, onSelect }: PostCardProps) {
  const [localPost, setLocalPost] = useState(post);

  const handleVote = (direction: 'up' | 'down') => {
    // For now, just update locally - will integrate with backend later
    setLocalPost(prev => {
      const wasUpvoted = false; // TODO: Track user vote in database
      const wasDownvoted = false;
      
      let newUpvotes = prev.upvotes;
      let newDownvotes = prev.downvotes;

      if (direction === 'up') {
        if (wasUpvoted) {
          newUpvotes--;
        } else {
          newUpvotes++;
          if (wasDownvoted) newDownvotes--;
        }
      } else {
        if (wasDownvoted) {
          newDownvotes--;
        } else {
          newDownvotes++;
          if (wasUpvoted) newUpvotes--;
        }
      }

      return {
        ...prev,
        upvotes: newUpvotes,
        downvotes: newDownvotes,
      };
    });
  };

  const CategoryIcon = localPost.category?.icon ? iconMap[localPost.category.icon] : FileText;

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
            userVote={null}
            onVote={handleVote}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {localPost.is_pinned && (
              <span className="inline-flex items-center gap-1 text-accent text-xs font-medium">
                <Pin className="w-3 h-3" />
                Pinned
              </span>
            )}
            {localPost.category && (
              <span 
                className="category-badge inline-flex items-center gap-1.5"
                style={{ 
                  backgroundColor: `${localPost.category.color}20`,
                  color: localPost.category.color,
                }}
              >
                <CategoryIcon className="w-3 h-3" />
                {localPost.category.name}
              </span>
            )}
            {localPost.has_accepted_answer && (
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
          {localPost.tags && localPost.tags.length > 0 && (
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
                <AvatarImage src={localPost.author?.avatar_url || undefined} />
                <AvatarFallback>
                  {localPost.author?.display_name?.charAt(0) || localPost.author?.username?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground">
                {localPost.author?.display_name || localPost.author?.username || 'Unknown'}
              </span>
              {localPost.author?.membership_tier && localPost.author.membership_tier !== 'free' && (
                <MembershipBadge tier={localPost.author.membership_tier} size="sm" />
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatDistanceToNow(new Date(localPost.created_at), { addSuffix: true })}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" />
                {localPost.comment_count}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {localPost.view_count}
              </span>
            </div>

            {/* Mobile Votes */}
            <div className="sm:hidden flex items-center" onClick={e => e.stopPropagation()}>
              <VoteButtons
                upvotes={localPost.upvotes}
                downvotes={localPost.downvotes}
                userVote={null}
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

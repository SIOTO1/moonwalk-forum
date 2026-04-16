import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PostWithAuthor } from '@/hooks/usePosts';
import { useVote } from '@/hooks/useComments';
import { useUserBadges, Badge } from '@/hooks/useBadges';
import { useAuth } from '@/contexts/AuthContext';
import { MembershipBadge } from '@/components/auth/MembershipBadge';
import { UserBadgesList } from '@/components/badges/UserBadgeDisplay';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Eye, Pin, CheckCircle2, Clock, ChevronUp, ChevronDown, Lock, Rocket, Shield, Wrench, FileText, TrendingUp, Users, AlertTriangle, MapPin, MessageCircle as MessageCircleIcon, Star, Crown, ShieldCheck, Download, Facebook } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

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
  onSelect?: (post: PostWithAuthor) => void;
}

export function PostCard({ post, onSelect }: PostCardProps) {
  const { user } = useAuth();
  const vote = useVote();
  
  // Fetch author badges
  const { data: authorBadges = [] } = useUserBadges(post.author?.user_id || null);
  const badges: Badge[] = authorBadges.map(ub => ub.badge);
  
  const [userVote, setUserVote] = useState<1 | -1 | null>(null);
  const [localUpvotes, setLocalUpvotes] = useState(post.upvotes);
  const [localDownvotes, setLocalDownvotes] = useState(post.downvotes);

  const handleVote = async (e: React.MouseEvent, voteType: 1 | -1) => {
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please sign in to vote');
      return;
    }
    
    try {
      // Optimistic update
      if (userVote === voteType) {
        if (voteType === 1) setLocalUpvotes(v => v - 1);
        else setLocalDownvotes(v => v - 1);
        setUserVote(null);
      } else {
        if (voteType === 1) {
          setLocalUpvotes(v => v + 1);
          if (userVote === -1) setLocalDownvotes(v => v - 1);
        } else {
          setLocalDownvotes(v => v + 1);
          if (userVote === 1) setLocalUpvotes(v => v - 1);
        }
        setUserVote(voteType);
      }

      await vote.mutateAsync({
        postId: post.id,
        voteType,
        currentVote: userVote,
      });
    } catch (error: any) {
      // Revert on error
      setLocalUpvotes(post.upvotes);
      setLocalDownvotes(post.downvotes);
      setUserVote(null);
      toast.error(error.message || 'Failed to vote');
    }
  };

  const score = localUpvotes - localDownvotes;
  const CategoryIcon = post.category?.icon ? iconMap[post.category.icon] : FileText;
  const threadUrl = `/thread/${post.slug || post.id}`;

  return (
    <Link to={threadUrl} className="block group">
      <article 
        className="forum-card p-4 cursor-pointer animate-fade-in"
        onClick={() => onSelect?.(post)}
      >
        <div className="flex gap-4">
        {/* Vote Column */}
        <div className="hidden sm:flex flex-col items-center gap-1" onClick={e => e.stopPropagation()}>
          <button
            onClick={(e) => handleVote(e, 1)}
            className={cn(
              "vote-button",
              userVote === 1 && "upvoted"
            )}
            disabled={vote.isPending}
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <span className={cn(
            "font-semibold text-sm",
            score > 0 && "text-accent",
            score < 0 && "text-destructive"
          )}>
            {score}
          </span>
          <button
            onClick={(e) => handleVote(e, -1)}
            className={cn(
              "vote-button",
              userVote === -1 && "downvoted"
            )}
            disabled={vote.isPending}
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {post.is_pinned && (
              <span className="inline-flex items-center gap-1 text-accent text-xs font-medium">
                <Pin className="w-3 h-3" />
                Pinned
              </span>
            )}
            {post.is_locked && (
              <span className="inline-flex items-center gap-1 text-muted-foreground text-xs font-medium">
                <Lock className="w-3 h-3" />
                Locked
              </span>
            )}
            {post.category && (
              <span 
                className="category-badge inline-flex items-center gap-1.5"
                style={{ 
                  backgroundColor: `${post.category.color}20`,
                  color: post.category.color,
                }}
              >
                <CategoryIcon className="w-3 h-3" />
                {post.category.name}
              </span>
            )}
            {post.has_accepted_answer && (
              <span className="inline-flex items-center gap-1 text-success text-xs font-medium">
                <CheckCircle2 className="w-3 h-3" />
                Solved
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2 mb-2">
            {post.title}
          </h3>

          {/* Preview */}
          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
            {post.content}
          </p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.tags.slice(0, 3).map(tag => (
                <span 
                  key={tag}
                  className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{post.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="w-5 h-5">
                <AvatarImage src={post.author?.avatar_url || undefined} />
                <AvatarFallback>
                  {post.author?.display_name?.charAt(0) || post.author?.username?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground">
                {post.author?.display_name || post.author?.username || 'Unknown'}
              </span>
              {post.author?.membership_tier && post.author.membership_tier !== 'free' && (
                <MembershipBadge tier={post.author.membership_tier} size="sm" />
              )}
              {badges.length > 0 && (
                <UserBadgesList badges={badges} size="sm" maxDisplay={2} />
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" />
                {post.comment_count}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {post.view_count}
              </span>
            </div>

            {/* Share to Facebook */}
            <div className="hidden sm:flex items-center" onClick={e => { e.stopPropagation(); e.preventDefault(); }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + threadUrl)}&quote=${encodeURIComponent(`Check out this discussion on the Moonwalk Forum: "${post.title}"`)}`;
                  window.open(shareUrl, 'facebook-share', 'width=626,height=436');
                }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-[#1877F2] transition-colors"
                title="Share to Facebook Group"
              >
                <Facebook className="w-3.5 h-3.5" />
                Share
              </button>
            </div>

            {/* Mobile Votes */}
            <div className="sm:hidden flex items-center gap-2" onClick={e => e.stopPropagation()}>
              <button
                onClick={(e) => handleVote(e, 1)}
                className={cn("p-1", userVote === 1 && "text-accent")}
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <span className={cn(
                "font-semibold text-xs",
                score > 0 && "text-accent",
                score < 0 && "text-destructive"
              )}>
                {score}
              </span>
              <button
                onClick={(e) => handleVote(e, -1)}
                className={cn("p-1", userVote === -1 && "text-destructive")}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        </div>
      </article>
    </Link>
  );
}

import { useState, useEffect } from 'react';
import { PostWithAuthor } from '@/hooks/usePosts';
import { useComments, useVote, useModeratePost } from '@/hooks/useComments';
import { useUserBadges, Badge } from '@/hooks/useBadges';
import { useAuth } from '@/contexts/AuthContext';
import { CommentThread } from './CommentThread';
import { ThreadImageGallery } from './ThreadImageGallery';
import { MembershipBadge } from '@/components/auth/MembershipBadge';
import { UserBadgesList } from '@/components/badges/UserBadgeDisplay';
import { ReportDialog } from '@/components/moderation/ReportDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Pin, 
  CheckCircle2, 
  Clock, 
  Eye, 
  MessageCircle,
  Share2,
  Bookmark,
  Flag,
  Lock,
  ChevronUp,
  ChevronDown,
  Rocket, 
  Shield, 
  Wrench, 
  FileText, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  MapPin, 
  MessageCircle as MessageCircleIcon, 
  Star, 
  Crown, 
  ShieldCheck, 
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

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

interface PostDetailProps {
  post: PostWithAuthor;
  onBack: () => void;
}

export function PostDetail({ post, onBack }: PostDetailProps) {
  const { user, canModerate } = useAuth();
  const [commentSort, setCommentSort] = useState<'top' | 'newest'>('top');
  const { data: comments = [], isLoading: commentsLoading } = useComments(post.id, commentSort);
  const vote = useVote();
  const moderatePost = useModeratePost();
  
  // Fetch author badges
  const { data: authorBadges = [] } = useUserBadges(post.author?.user_id || null);
  const badges: Badge[] = authorBadges.map(ub => ub.badge);

  // Track user's vote on this post
  const [userVote, setUserVote] = useState<1 | -1 | null>(null);
  const [localUpvotes, setLocalUpvotes] = useState(post.upvotes);
  const [localDownvotes, setLocalDownvotes] = useState(post.downvotes);

  const handleVote = async (voteType: 1 | -1) => {
    if (!user) {
      toast.error('Please sign in to vote');
      return;
    }
    
    try {
      // Optimistic update
      if (userVote === voteType) {
        // Remove vote
        if (voteType === 1) setLocalUpvotes(v => v - 1);
        else setLocalDownvotes(v => v - 1);
        setUserVote(null);
      } else {
        // Add or change vote
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

  const handlePin = async () => {
    try {
      await moderatePost.mutateAsync({
        postId: post.id,
        action: 'pin',
        value: !post.is_pinned,
      });
      toast.success(post.is_pinned ? 'Thread unpinned' : 'Thread pinned');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update pin status');
    }
  };

  const handleLock = async () => {
    try {
      await moderatePost.mutateAsync({
        postId: post.id,
        action: 'lock',
        value: !post.is_locked,
      });
      toast.success(post.is_locked ? 'Thread unlocked' : 'Thread locked');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update lock status');
    }
  };

  const score = localUpvotes - localDownvotes;
  const CategoryIcon = post.category?.icon ? iconMap[post.category.icon] : FileText;

  return (
    <div className="flex-1 min-w-0 max-w-4xl mx-auto animate-fade-in">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="mb-4 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to discussions
      </Button>

      {/* Post */}
      <article className="forum-card p-6 mb-6">
        <div className="flex gap-6">
          {/* Vote Column */}
          <div className="hidden sm:flex flex-col items-center gap-1">
            <button
              onClick={() => handleVote(1)}
              className={cn(
                "vote-button",
                userVote === 1 && "upvoted"
              )}
              disabled={vote.isPending}
            >
              <ChevronUp className="w-6 h-6" />
            </button>
            <span className={cn(
              "font-bold text-lg",
              score > 0 && "text-accent",
              score < 0 && "text-destructive"
            )}>
              {score}
            </span>
            <button
              onClick={() => handleVote(-1)}
              className={cn(
                "vote-button",
                userVote === -1 && "downvoted"
              )}
              disabled={vote.isPending}
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
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
            <h1 className="font-display font-bold text-2xl text-foreground mb-4">
              {post.title}
            </h1>

            {/* Author */}
            <div className="flex items-center gap-3 mb-6">
              <Avatar className="w-10 h-10">
                <AvatarImage src={post.author?.avatar_url || undefined} />
                <AvatarFallback>
                  {post.author?.display_name?.charAt(0) || post.author?.username?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">
                    {post.author?.display_name || post.author?.username || 'Unknown'}
                  </span>
                  {post.author?.membership_tier && post.author.membership_tier !== 'free' && (
                    <MembershipBadge tier={post.author.membership_tier} size="sm" />
                  )}
                  {badges.length > 0 && (
                    <UserBadgesList badges={badges} size="sm" maxDisplay={3} />
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{post.author?.reputation?.toLocaleString() || 0} reputation</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-invert prose-sm max-w-none mb-6">
              {post.content.split('\n').map((paragraph, i) => (
                <p key={i} className="text-foreground/90 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Images */}
            {post.images && post.images.length > 0 && (
              <ThreadImageGallery images={post.images} />
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map(tag => (
                  <span 
                    key={tag}
                    className="px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Stats & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {post.view_count} views
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {post.comment_count} comments
                </span>
                
                {/* Mobile voting */}
                <div className="sm:hidden flex items-center gap-2">
                  <button
                    onClick={() => handleVote(1)}
                    className={cn("p-1", userVote === 1 && "text-accent")}
                  >
                    <ChevronUp className="w-5 h-5" />
                  </button>
                  <span className={cn(
                    "font-semibold",
                    score > 0 && "text-accent",
                    score < 0 && "text-destructive"
                  )}>
                    {score}
                  </span>
                  <button
                    onClick={() => handleVote(-1)}
                    className={cn("p-1", userVote === -1 && "text-destructive")}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {canModerate && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handlePin}
                      className={post.is_pinned ? "text-accent" : ""}
                    >
                      <Pin className="w-4 h-4 mr-1" />
                      {post.is_pinned ? 'Unpin' : 'Pin'}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleLock}
                      className={post.is_locked ? "text-destructive" : ""}
                    >
                      <Lock className="w-4 h-4 mr-1" />
                      {post.is_locked ? 'Unlock' : 'Lock'}
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="sm">
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
                <Button variant="ghost" size="sm">
                  <Bookmark className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <ReportDialog type="post" targetId={post.id} />
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Locked Notice */}
      {post.is_locked && (
        <div className="forum-card p-4 mb-6 flex items-center gap-2 text-muted-foreground bg-muted/50">
          <Lock className="w-4 h-4" />
          <span>This thread has been locked. No new comments can be added.</span>
        </div>
      )}

      {/* Comments Section */}
      {commentsLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <CommentThread
          comments={comments}
          postId={post.id}
          postAuthorId={post.author_id}
          sortBy={commentSort}
          onSortChange={setCommentSort}
        />
      )}
    </div>
  );
}

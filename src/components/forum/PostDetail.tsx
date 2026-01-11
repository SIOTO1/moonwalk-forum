import { useState } from 'react';
import { PostWithAuthor } from '@/hooks/usePosts';
import { VoteButtons } from './VoteButtons';
import { MembershipBadge } from '@/components/auth/MembershipBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
  const [localPost, setLocalPost] = useState(post);
  const [newComment, setNewComment] = useState('');

  const handleVote = (direction: 'up' | 'down') => {
    setLocalPost(prev => {
      let newUpvotes = prev.upvotes;
      let newDownvotes = prev.downvotes;

      if (direction === 'up') {
        newUpvotes++;
      } else {
        newDownvotes++;
      }

      return {
        ...prev,
        upvotes: newUpvotes,
        downvotes: newDownvotes,
      };
    });
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    // In real app, this would call an API
    setNewComment('');
  };

  const CategoryIcon = localPost.category?.icon ? iconMap[localPost.category.icon] : FileText;

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
          <div className="hidden sm:block">
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
            <div className="flex flex-wrap items-center gap-2 mb-3">
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
            <h1 className="font-display font-bold text-2xl text-foreground mb-4">
              {localPost.title}
            </h1>

            {/* Author */}
            <div className="flex items-center gap-3 mb-6">
              <Avatar className="w-10 h-10">
                <AvatarImage src={localPost.author?.avatar_url || undefined} />
                <AvatarFallback>
                  {localPost.author?.display_name?.charAt(0) || localPost.author?.username?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {localPost.author?.display_name || localPost.author?.username || 'Unknown'}
                  </span>
                  {localPost.author?.membership_tier && localPost.author.membership_tier !== 'free' && (
                    <MembershipBadge tier={localPost.author.membership_tier} size="sm" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{localPost.author?.reputation?.toLocaleString() || 0} reputation</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(localPost.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-invert prose-sm max-w-none mb-6">
              {localPost.content.split('\n').map((paragraph, i) => (
                <p key={i} className="text-foreground/90 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Tags */}
            {localPost.tags && localPost.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {localPost.tags.map(tag => (
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
                  {localPost.view_count} views
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {localPost.comment_count} comments
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
                <Button variant="ghost" size="sm">
                  <Bookmark className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Flag className="w-4 h-4 mr-1" />
                  Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Comment Form */}
      {user ? (
        <div className="forum-card p-4 mb-6">
          <h3 className="font-display font-semibold mb-3">Add a Comment</h3>
          <Textarea
            placeholder="Share your thoughts or answer this question..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px] bg-secondary border-0 focus-visible:ring-accent mb-3"
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmitComment}
              className="gradient-accent text-accent-foreground"
              disabled={!newComment.trim()}
            >
              Post Comment
            </Button>
          </div>
        </div>
      ) : (
        <div className="forum-card p-4 mb-6 text-center text-muted-foreground">
          Please sign in to add a comment.
        </div>
      )}

      {/* Comments placeholder */}
      <div className="space-y-4">
        <h3 className="font-display font-semibold">
          {localPost.comment_count} {localPost.comment_count === 1 ? 'Comment' : 'Comments'}
        </h3>
        {localPost.comment_count === 0 && (
          <div className="forum-card p-8 text-center text-muted-foreground">
            No comments yet. Be the first to respond!
          </div>
        )}
      </div>
    </div>
  );
}

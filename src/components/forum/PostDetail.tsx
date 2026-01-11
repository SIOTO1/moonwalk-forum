import { useState } from 'react';
import { Post, Comment } from '@/types/forum';
import { VoteButtons } from './VoteButtons';
import { AuthorityBadge } from './AuthorityBadge';
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
  Flag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { mockComments } from '@/data/mockData';

interface PostDetailProps {
  post: Post;
  onBack: () => void;
}

export function PostDetail({ post, onBack }: PostDetailProps) {
  const [localPost, setLocalPost] = useState(post);
  const [comments, setComments] = useState<Comment[]>(
    mockComments.filter(c => c.postId === post.id)
  );
  const [newComment, setNewComment] = useState('');

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

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    // In real app, this would call an API
    setNewComment('');
  };

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
              userVote={localPost.userVote}
              onVote={handleVote}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
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
            <h1 className="font-display font-bold text-2xl text-foreground mb-4">
              {localPost.title}
            </h1>

            {/* Author */}
            <div className="flex items-center gap-3 mb-6">
              <Avatar className="w-10 h-10">
                <AvatarImage src={localPost.author.avatar} />
                <AvatarFallback>{localPost.author.displayName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{localPost.author.displayName}</span>
                  <AuthorityBadge role={localPost.author.role} size="sm" />
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{localPost.author.reputation.toLocaleString()} reputation</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(localPost.createdAt, { addSuffix: true })}
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
            {localPost.tags.length > 0 && (
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
                  {localPost.views} views
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {localPost.commentCount} comments
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

      {/* Comments */}
      <div className="space-y-4">
        <h3 className="font-display font-semibold">
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </h3>
        {comments.map(comment => (
          <CommentCard key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}

function CommentCard({ comment }: { comment: Comment }) {
  const [localComment, setLocalComment] = useState(comment);

  const handleVote = (direction: 'up' | 'down') => {
    setLocalComment(prev => {
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
    <div className={cn(
      "forum-card p-4",
      localComment.isAccepted && "accepted-answer"
    )}>
      <div className="flex gap-4">
        <div className="hidden sm:block">
          <VoteButtons
            upvotes={localComment.upvotes}
            downvotes={localComment.downvotes}
            userVote={localComment.userVote}
            onVote={handleVote}
          />
        </div>
        <div className="flex-1 min-w-0">
          {localComment.isAccepted && (
            <div className="flex items-center gap-1.5 text-success text-sm font-medium mb-2">
              <CheckCircle2 className="w-4 h-4" />
              Accepted Answer
            </div>
          )}
          
          <p className="text-foreground/90 leading-relaxed mb-4 whitespace-pre-wrap">
            {localComment.content}
          </p>

          <div className="flex items-center gap-3 text-sm">
            <Avatar className="w-6 h-6">
              <AvatarImage src={localComment.author.avatar} />
              <AvatarFallback>{localComment.author.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{localComment.author.displayName}</span>
            <AuthorityBadge role={localComment.author.role} size="sm" />
            <span className="text-muted-foreground">
              {formatDistanceToNow(localComment.createdAt, { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

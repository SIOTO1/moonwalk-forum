import { useState } from 'react';
import { CommentWithAuthor, useCreateComment, useVote, useAcceptAnswer } from '@/hooks/useComments';
import { useAuth } from '@/contexts/AuthContext';
import { MembershipBadge } from '@/components/auth/MembershipBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  ChevronUp, 
  ChevronDown, 
  MessageCircle, 
  CheckCircle2, 
  CornerDownRight,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface CommentThreadProps {
  comments: CommentWithAuthor[];
  postId: string;
  postAuthorId: string;
  sortBy: 'top' | 'newest';
  onSortChange: (sort: 'top' | 'newest') => void;
}

export function CommentThread({ 
  comments, 
  postId, 
  postAuthorId,
  sortBy,
  onSortChange,
}: CommentThreadProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const createComment = useCreateComment();

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    
    try {
      await createComment.mutateAsync({
        postId,
        content: newComment.trim(),
      });
      setNewComment('');
      toast.success('Comment posted!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to post comment');
    }
  };

  return (
    <div className="space-y-4">
      {/* Sort Options */}
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold">
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Button
            variant={sortBy === 'top' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onSortChange('top')}
          >
            Top
          </Button>
          <Button
            variant={sortBy === 'newest' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onSortChange('newest')}
          >
            Newest
          </Button>
        </div>
      </div>

      {/* New Comment Form */}
      {user ? (
        <div className="forum-card p-4">
          <Textarea
            placeholder="Share your thoughts or answer this question..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px] bg-secondary border-0 focus-visible:ring-accent mb-3"
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmit}
              className="gradient-accent text-accent-foreground"
              disabled={!newComment.trim() || createComment.isPending}
            >
              {createComment.isPending ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="forum-card p-4 text-center text-muted-foreground">
          Please sign in to add a comment.
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        {comments.length > 0 ? (
          comments.map(comment => (
            <CommentCard 
              key={comment.id} 
              comment={comment} 
              postId={postId}
              postAuthorId={postAuthorId}
              depth={0}
            />
          ))
        ) : (
          <div className="forum-card p-8 text-center text-muted-foreground">
            No comments yet. Be the first to respond!
          </div>
        )}
      </div>
    </div>
  );
}

interface CommentCardProps {
  comment: CommentWithAuthor;
  postId: string;
  postAuthorId: string;
  depth: number;
}

function CommentCard({ comment, postId, postAuthorId, depth }: CommentCardProps) {
  const { user, canModerate } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const createComment = useCreateComment();
  const vote = useVote();
  const acceptAnswer = useAcceptAnswer();

  const canAcceptAnswer = user && (user.id === postAuthorId || canModerate);
  const score = comment.upvotes - comment.downvotes;
  const maxDepth = 4;

  const handleVote = async (voteType: 1 | -1) => {
    if (!user) {
      toast.error('Please sign in to vote');
      return;
    }
    
    try {
      await vote.mutateAsync({
        commentId: comment.id,
        voteType,
        currentVote: comment.userVote || null,
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to vote');
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    
    try {
      await createComment.mutateAsync({
        postId,
        content: replyContent.trim(),
        parentId: comment.id,
      });
      setReplyContent('');
      setShowReplyForm(false);
      toast.success('Reply posted!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to post reply');
    }
  };

  const handleAcceptAnswer = async () => {
    try {
      await acceptAnswer.mutateAsync({
        commentId: comment.id,
        postId,
        accept: !comment.is_accepted,
      });
      toast.success(comment.is_accepted ? 'Answer unmarked' : 'Answer accepted!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update answer status');
    }
  };

  return (
    <div 
      className={cn(
        "relative",
        depth > 0 && "ml-4 sm:ml-8 border-l-2 border-border pl-4"
      )}
    >
      <div className={cn(
        "forum-card p-4",
        comment.is_accepted && "border-l-4 border-l-success bg-success/5"
      )}>
        {comment.is_accepted && (
          <div className="flex items-center gap-1.5 text-success text-sm font-medium mb-2">
            <CheckCircle2 className="w-4 h-4" />
            Accepted Answer
          </div>
        )}

        <div className="flex gap-3">
          {/* Voting */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => handleVote(1)}
              className={cn(
                "vote-button",
                comment.userVote === 1 && "upvoted"
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
              onClick={() => handleVote(-1)}
              className={cn(
                "vote-button",
                comment.userVote === -1 && "downvoted"
              )}
              disabled={vote.isPending}
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Author */}
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={comment.author?.avatar_url || undefined} />
                <AvatarFallback>
                  {comment.author?.display_name?.charAt(0) || comment.author?.username?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm">
                {comment.author?.display_name || comment.author?.username || 'Unknown'}
              </span>
              {comment.author?.membership_tier && comment.author.membership_tier !== 'free' && (
                <MembershipBadge tier={comment.author.membership_tier} size="sm" />
              )}
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
            </div>

            {/* Comment Text */}
            {!isCollapsed && (
              <>
                <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap mb-3">
                  {comment.content}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-3 text-sm">
                  {depth < maxDepth && user && (
                    <button
                      onClick={() => setShowReplyForm(!showReplyForm)}
                      className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Reply
                    </button>
                  )}
                  
                  {canAcceptAnswer && (
                    <button
                      onClick={handleAcceptAnswer}
                      className={cn(
                        "flex items-center gap-1 transition-colors",
                        comment.is_accepted 
                          ? "text-success" 
                          : "text-muted-foreground hover:text-success"
                      )}
                      disabled={acceptAnswer.isPending}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {comment.is_accepted ? 'Accepted' : 'Accept Answer'}
                    </button>
                  )}

                  {comment.replies && comment.replies.length > 0 && (
                    <button
                      onClick={() => setIsCollapsed(!isCollapsed)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isCollapsed ? `Show ${comment.replies.length} replies` : 'Collapse'}
                    </button>
                  )}
                </div>

                {/* Reply Form */}
                {showReplyForm && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <CornerDownRight className="w-4 h-4 text-muted-foreground mt-3" />
                      <Textarea
                        placeholder="Write a reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="flex-1 min-h-[80px] bg-secondary border-0"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setShowReplyForm(false);
                          setReplyContent('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm"
                        onClick={handleReply}
                        disabled={!replyContent.trim() || createComment.isPending}
                      >
                        {createComment.isPending ? 'Posting...' : 'Reply'}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Nested Replies */}
      {!isCollapsed && comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map(reply => (
            <CommentCard
              key={reply.id}
              comment={reply}
              postId={postId}
              postAuthorId={postAuthorId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

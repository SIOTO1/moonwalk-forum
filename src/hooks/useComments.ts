import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { extractMentions } from '@/lib/mentionUtils';

export interface CommentWithAuthor {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  upvotes: number;
  downvotes: number;
  is_accepted: boolean;
  depth: number;
  images: string[];
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    user_id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    membership_tier: 'free' | 'pro' | 'elite';
  } | null;
  replies?: CommentWithAuthor[];
  userVote?: 1 | -1 | null;
}

type CommentSortOption = 'top' | 'newest';

export function useComments(postId: string | null, sortBy: CommentSortOption = 'top') {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['comments', postId, sortBy, user?.id],
    queryFn: async () => {
      if (!postId) return [];

      // Fetch comments
      let query = supabase
        .from('comments')
        .select(`
          *,
          author:profiles!comments_author_id_fkey(
            id,
            user_id,
            username,
            display_name,
            avatar_url,
            membership_tier
          )
        `)
        .eq('post_id', postId);

      // Sort by top (upvotes - downvotes) or newest
      if (sortBy === 'top') {
        query = query.order('is_accepted', { ascending: false })
                     .order('upvotes', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data: comments, error } = await query;
      if (error) throw error;

      // Fetch user votes if logged in
      let userVotes: Record<string, 1 | -1> = {};
      if (user) {
        const { data: votes } = await supabase
          .from('votes')
          .select('comment_id, vote_type')
          .eq('user_id', user.id)
          .in('comment_id', comments.map(c => c.id));
        
        if (votes) {
          userVotes = votes.reduce((acc, v) => {
            if (v.comment_id) acc[v.comment_id] = v.vote_type as 1 | -1;
            return acc;
          }, {} as Record<string, 1 | -1>);
        }
      }

      // Build nested structure
      const commentsWithVotes = comments.map(c => ({
        ...c,
        userVote: userVotes[c.id] || null,
      })) as CommentWithAuthor[];

      return buildCommentTree(commentsWithVotes);
    },
    enabled: !!postId,
  });
}

function buildCommentTree(comments: CommentWithAuthor[]): CommentWithAuthor[] {
  const commentMap = new Map<string, CommentWithAuthor>();
  const roots: CommentWithAuthor[] = [];

  // First pass: create map
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Second pass: build tree
  comments.forEach(comment => {
    const node = commentMap.get(comment.id)!;
    if (comment.parent_id && commentMap.has(comment.parent_id)) {
      const parent = commentMap.get(comment.parent_id)!;
      parent.replies = parent.replies || [];
      parent.replies.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      postId, 
      content, 
      parentId,
      images = [],
    }: { 
      postId: string; 
      content: string; 
      parentId?: string;
      images?: string[];
    }) => {
      if (!user) throw new Error('Must be logged in to comment');

      // Calculate depth
      let depth = 0;
      let parentComment: { author_id: string; depth: number } | null = null;
      if (parentId) {
        const { data: parent } = await supabase
          .from('comments')
          .select('depth, author_id')
          .eq('id', parentId)
          .single();
        if (parent) {
          depth = parent.depth + 1;
          parentComment = parent;
        }
      }

      // Get post details for notification
      const { data: post } = await supabase
        .from('posts')
        .select('author_id, title, slug')
        .eq('id', postId)
        .single();

      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          parent_id: parentId || null,
          content,
          depth,
          images,
        })
        .select()
        .single();

      if (error) throw error;

      // Send notifications
      const authorName = profile?.display_name || profile?.username || 'Someone';
      const contentPreview = content.substring(0, 200);

      try {
        // Extract @mentions and notify mentioned users
        const mentionedUsernames = extractMentions(content);
        if (mentionedUsernames.length > 0) {
          // Look up user IDs for mentioned usernames
          const { data: mentionedUsers } = await supabase
            .from('profiles')
            .select('user_id, username')
            .in('username', mentionedUsernames);

          if (mentionedUsers && mentionedUsers.length > 0) {
            // Send mention notifications (excluding self-mentions)
            for (const mentionedUser of mentionedUsers) {
              if (mentionedUser.user_id !== user.id) {
                await supabase.functions.invoke('send-notification-email', {
                  body: {
                    type: 'mention',
                    recipientUserId: mentionedUser.user_id,
                    threadId: postId,
                    threadTitle: post?.title || 'A discussion',
                    threadSlug: post?.slug || postId,
                    authorId: user.id,
                    authorName,
                    contentPreview,
                    commentId: data.id,
                  },
                });
              }
            }
          }
        }

        // If replying to a comment, notify the comment author (if not already mentioned)
        const mentionedUserIds = new Set<string>();
        if (mentionedUsernames.length > 0) {
          const { data: mentionedUsers } = await supabase
            .from('profiles')
            .select('user_id')
            .in('username', mentionedUsernames);
          mentionedUsers?.forEach(u => mentionedUserIds.add(u.user_id));
        }

        if (parentComment && parentComment.author_id !== user.id && !mentionedUserIds.has(parentComment.author_id)) {
          await supabase.functions.invoke('send-notification-email', {
            body: {
              type: 'comment_reply',
              recipientUserId: parentComment.author_id,
              threadId: postId,
              threadTitle: post?.title || 'A discussion',
              threadSlug: post?.slug || postId,
              authorId: user.id,
              authorName,
              contentPreview,
              commentId: data.id,
            },
          });
        }
        // If it's a top-level comment, notify the post author (if not already mentioned)
        else if (!parentId && post && post.author_id !== user.id && !mentionedUserIds.has(post.author_id)) {
          await supabase.functions.invoke('send-notification-email', {
            body: {
              type: 'thread_reply',
              recipientUserId: post.author_id,
              threadId: postId,
              threadTitle: post.title,
              threadSlug: post.slug || postId,
              authorId: user.id,
              authorName,
              contentPreview,
              commentId: data.id,
            },
          });
        }
      } catch (notifError) {
        // Don't fail the comment creation if notification fails
        console.error('Failed to send notification:', notifError);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useVote() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      postId, 
      commentId, 
      voteType,
      currentVote,
    }: { 
      postId?: string; 
      commentId?: string; 
      voteType: 1 | -1;
      currentVote: 1 | -1 | null;
    }) => {
      if (!user) throw new Error('Must be logged in to vote');

      // If same vote, remove it
      if (currentVote === voteType) {
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('user_id', user.id)
          .eq(postId ? 'post_id' : 'comment_id', postId || commentId);
        
        if (error) throw error;
        return { action: 'removed' };
      }

      // If different vote or no vote, upsert
      const { error } = await supabase
        .from('votes')
        .upsert({
          user_id: user.id,
          post_id: postId || null,
          comment_id: commentId || null,
          vote_type: voteType,
        }, {
          onConflict: postId ? 'user_id,post_id' : 'user_id,comment_id',
        });

      if (error) throw error;
      return { action: currentVote ? 'changed' : 'added' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}

export function useAcceptAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      commentId, 
      postId,
      accept 
    }: { 
      commentId: string; 
      postId: string;
      accept: boolean;
    }) => {
      // First, unmark any existing accepted answer for this post
      if (accept) {
        await supabase
          .from('comments')
          .update({ is_accepted: false })
          .eq('post_id', postId)
          .eq('is_accepted', true);
      }

      // Then mark/unmark this comment
      const { error: commentError } = await supabase
        .from('comments')
        .update({ is_accepted: accept })
        .eq('id', commentId);

      if (commentError) throw commentError;

      // Update post has_accepted_answer flag
      const { error: postError } = await supabase
        .from('posts')
        .update({ has_accepted_answer: accept })
        .eq('id', postId);

      if (postError) throw postError;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useModeratePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      postId, 
      action,
      value 
    }: { 
      postId: string; 
      action: 'pin' | 'lock';
      value: boolean;
    }) => {
      const update = action === 'pin' 
        ? { is_pinned: value }
        : { is_locked: value };

      const { error } = await supabase
        .from('posts')
        .update(update)
        .eq('id', postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

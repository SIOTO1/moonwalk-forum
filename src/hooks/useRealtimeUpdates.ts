import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface VotePayload {
  id: string;
  user_id: string;
  post_id: string | null;
  comment_id: string | null;
  vote_type: number;
  created_at: string;
}

interface CommentPayload {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  parent_id: string | null;
  upvotes: number;
  downvotes: number;
  is_accepted_answer: boolean;
  is_removed: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Hook to subscribe to realtime updates for votes and comments
 * Automatically invalidates relevant queries when changes occur
 */
export function useRealtimeUpdates(options?: { postId?: string }) {
  const queryClient = useQueryClient();
  const { postId } = options || {};

  useEffect(() => {
    // Subscribe to votes changes
    const votesChannel = supabase
      .channel('votes-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
        },
        (payload: RealtimePostgresChangesPayload<VotePayload>) => {
          const record = payload.new as VotePayload | null;
          const oldRecord = payload.old as VotePayload | null;
          
          // Determine which post/comment was affected
          const affectedPostId = record?.post_id || oldRecord?.post_id;
          const affectedCommentId = record?.comment_id || oldRecord?.comment_id;
          
          // Invalidate posts list to update vote counts
          if (affectedPostId) {
            // Invalidate specific post
            queryClient.invalidateQueries({ queryKey: ['post', affectedPostId] });
            // Invalidate posts list with a small delay to batch updates
            setTimeout(() => {
              queryClient.invalidateQueries({ queryKey: ['posts'], exact: false });
            }, 500);
          }
          
          // Invalidate comments if a comment was voted on
          if (affectedCommentId) {
            queryClient.invalidateQueries({ queryKey: ['comments'], exact: false });
          }
        }
      )
      .subscribe();

    // Subscribe to comments changes
    const commentsChannel = supabase
      .channel('comments-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          ...(postId ? { filter: `post_id=eq.${postId}` } : {}),
        },
        (payload: RealtimePostgresChangesPayload<CommentPayload>) => {
          const record = payload.new as CommentPayload | null;
          const oldRecord = payload.old as CommentPayload | null;
          const affectedPostId = record?.post_id || oldRecord?.post_id;
          
          // Invalidate comments for the specific post
          if (affectedPostId) {
            queryClient.invalidateQueries({ queryKey: ['comments', affectedPostId] });
            // Also update post's comment count
            queryClient.invalidateQueries({ queryKey: ['post', affectedPostId] });
          }
          
          // For new comments, also invalidate posts list
          if (payload.eventType === 'INSERT') {
            setTimeout(() => {
              queryClient.invalidateQueries({ queryKey: ['posts'], exact: false });
            }, 500);
          }
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(votesChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [queryClient, postId]);
}

/**
 * Hook specifically for thread/post detail pages
 * Subscribes to realtime updates for a specific post's comments and votes
 */
export function useRealtimeThreadUpdates(postId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!postId) return;

    // Subscribe to votes on comments in this thread
    const votesChannel = supabase
      .channel(`thread-votes-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
        },
        (payload: RealtimePostgresChangesPayload<VotePayload>) => {
          const record = payload.new as VotePayload | null;
          const oldRecord = payload.old as VotePayload | null;
          
          // If this vote is for our post
          if (record?.post_id === postId || oldRecord?.post_id === postId) {
            queryClient.invalidateQueries({ queryKey: ['post', postId] });
          }
          
          // If this vote is for a comment (we check comments to see if it belongs to our post)
          if (record?.comment_id || oldRecord?.comment_id) {
            queryClient.invalidateQueries({ queryKey: ['comments', postId] });
          }
        }
      )
      .subscribe();

    // Subscribe to comments on this specific post
    const commentsChannel = supabase
      .channel(`thread-comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          // Invalidate comments for this post
          queryClient.invalidateQueries({ queryKey: ['comments', postId] });
          // Also update post's comment count
          queryClient.invalidateQueries({ queryKey: ['post', postId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(votesChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [queryClient, postId]);
}

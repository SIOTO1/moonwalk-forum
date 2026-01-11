import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type ReportReason = 'spam' | 'harassment' | 'misinformation' | 'unsafe_advice' | 'inappropriate' | 'off_topic' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';
export type ModerationAction = 'warning' | 'edit' | 'remove' | 'lock' | 'unlock' | 'shadow_ban' | 'unshadow_ban' | 'ban' | 'unban';

export interface Report {
  id: string;
  reporter_id: string | null;
  post_id: string | null;
  comment_id: string | null;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
  reporter?: {
    username: string;
    display_name: string | null;
  } | null;
  post?: {
    id: string;
    title: string;
    content: string;
    author_id: string;
    author?: {
      username: string;
      display_name: string | null;
    } | null;
  } | null;
  comment?: {
    id: string;
    content: string;
    author_id: string;
    author?: {
      username: string;
      display_name: string | null;
    } | null;
  } | null;
}

export interface ModerationLog {
  id: string;
  moderator_id: string;
  target_user_id: string | null;
  post_id: string | null;
  comment_id: string | null;
  action: ModerationAction;
  reason: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  moderator?: {
    username: string;
    display_name: string | null;
  } | null;
  target_user?: {
    username: string;
    display_name: string | null;
  } | null;
}

export interface ShadowBan {
  id: string;
  user_id: string;
  banned_by: string;
  reason: string | null;
  created_at: string;
  expires_at: string | null;
  user?: {
    username: string;
    display_name: string | null;
    email_verified: boolean;
  } | null;
  banned_by_user?: {
    username: string;
    display_name: string | null;
  } | null;
}

// Fetch pending reports
export function useReports(status?: ReportStatus) {
  const { canModerate } = useAuth();

  return useQuery({
    queryKey: ['reports', status],
    queryFn: async () => {
      let query = supabase
        .from('reports')
        .select(`
          *,
          reporter:profiles!reports_reporter_id_fkey(username, display_name),
          post:posts!reports_post_id_fkey(
            id, title, content, author_id,
            author:profiles!posts_author_id_fkey(username, display_name)
          ),
          comment:comments!reports_comment_id_fkey(
            id, content, author_id,
            author:profiles!comments_author_id_fkey(username, display_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Report[];
    },
    enabled: canModerate,
  });
}

// Create a report
export function useCreateReport() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (report: {
      postId?: string;
      commentId?: string;
      reason: ReportReason;
      description?: string;
    }) => {
      if (!user) throw new Error('Must be logged in to report');

      const { data, error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          post_id: report.postId || null,
          comment_id: report.commentId || null,
          reason: report.reason,
          description: report.description || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

// Review a report (moderator action)
export function useReviewReport() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (review: {
      reportId: string;
      status: ReportStatus;
      resolutionNotes?: string;
    }) => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('reports')
        .update({
          status: review.status,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          resolution_notes: review.resolutionNotes || null,
        })
        .eq('id', review.reportId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

// Remove content (soft delete)
export function useRemoveContent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      type: 'post' | 'comment';
      id: string;
      reason: string;
    }) => {
      if (!user) throw new Error('Must be logged in');

      const table = params.type === 'post' ? 'posts' : 'comments';
      
      const { error } = await supabase
        .from(table)
        .update({
          is_removed: true,
          removed_by: user.id,
          removed_at: new Date().toISOString(),
          removal_reason: params.reason,
        })
        .eq('id', params.id);

      if (error) throw error;

      // Log the moderation action
      await supabase.from('moderation_logs').insert({
        moderator_id: user.id,
        post_id: params.type === 'post' ? params.id : null,
        comment_id: params.type === 'comment' ? params.id : null,
        action: 'remove',
        reason: params.reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}

// Shadow ban a user
export function useShadowBan() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      userId: string;
      reason?: string;
      expiresAt?: string;
    }) => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('shadow_bans')
        .insert({
          user_id: params.userId,
          banned_by: user.id,
          reason: params.reason || null,
          expires_at: params.expiresAt || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Log the moderation action
      await supabase.from('moderation_logs').insert({
        moderator_id: user.id,
        target_user_id: params.userId,
        action: 'shadow_ban',
        reason: params.reason,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shadow_bans'] });
    },
  });
}

// Remove shadow ban
export function useRemoveShadowBan() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: { banId: string; userId: string }) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('shadow_bans')
        .delete()
        .eq('id', params.banId);

      if (error) throw error;

      // Log the moderation action
      await supabase.from('moderation_logs').insert({
        moderator_id: user.id,
        target_user_id: params.userId,
        action: 'unshadow_ban',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shadow_bans'] });
    },
  });
}

// Fetch shadow bans
export function useShadowBans() {
  const { canModerate } = useAuth();

  return useQuery({
    queryKey: ['shadow_bans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shadow_bans')
        .select(`
          *,
          user:profiles!shadow_bans_user_id_fkey(username, display_name, email_verified),
          banned_by_user:profiles!shadow_bans_banned_by_fkey(username, display_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ShadowBan[];
    },
    enabled: canModerate,
  });
}

// Fetch moderation logs
export function useModerationLogs(limit: number = 50) {
  const { canModerate } = useAuth();

  return useQuery({
    queryKey: ['moderation_logs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('moderation_logs')
        .select(`
          *,
          moderator:profiles!moderation_logs_moderator_id_fkey(username, display_name),
          target_user:profiles!moderation_logs_target_user_id_fkey(username, display_name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as ModerationLog[];
    },
    enabled: canModerate,
  });
}

// Check rate limit
export function useCheckRateLimit() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (activityType: 'post' | 'comment') => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase.rpc('check_rate_limit', {
        _user_id: user.id,
        _activity_type: activityType,
      });

      if (error) throw error;
      return data as boolean;
    },
  });
}

// Track activity for rate limiting
export function useTrackActivity() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (activityType: 'post' | 'comment') => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('user_activity')
        .insert({
          user_id: user.id,
          activity_type: activityType,
        });

      if (error) throw error;
    },
  });
}

// Ban/unban user
export function useBanUser() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      userId: string;
      ban: boolean;
      reason?: string;
    }) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: params.ban })
        .eq('user_id', params.userId);

      if (error) throw error;

      // Log the moderation action
      await supabase.from('moderation_logs').insert({
        moderator_id: user.id,
        target_user_id: params.userId,
        action: params.ban ? 'ban' : 'unban',
        reason: params.reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

// Verify email (for admins to manually verify)
export function useVerifyEmail() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: { userId: string; verified: boolean }) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('profiles')
        .update({ email_verified: params.verified })
        .eq('user_id', params.userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

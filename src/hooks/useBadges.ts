import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Badge {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  color: string;
  bg_color: string;
  display_order: number;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  assigned_by: string | null;
  assigned_at: string;
  badge?: Badge;
}

export function useBadges() {
  return useQuery({
    queryKey: ['badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as Badge[];
    },
    // Badges are static - cache for 30 minutes
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });
}

export function useUserBadges(userId: string | null) {
  return useQuery({
    queryKey: ['user-badges', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badges(*)
        `)
        .eq('user_id', userId)
        .order('assigned_at', { ascending: true });

      if (error) throw error;
      return data as (UserBadge & { badge: Badge })[];
    },
    enabled: !!userId,
    // User badges change infrequently - cache for 5 minutes
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });
}

export function useAssignBadge() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ userId, badgeId }: { userId: string; badgeId: string }) => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          badge_id: badgeId,
          assigned_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-badges', variables.userId] });
    },
  });
}

export function useRemoveBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, badgeId }: { userId: string; badgeId: string }) => {
      const { error } = await supabase
        .from('user_badges')
        .delete()
        .eq('user_id', userId)
        .eq('badge_id', badgeId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-badges', variables.userId] });
    },
  });
}

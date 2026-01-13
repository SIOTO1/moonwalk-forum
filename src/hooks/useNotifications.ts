import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  playNotificationSound, 
  isNotificationSoundEnabled, 
  setNotificationSoundEnabled as setSoundEnabled,
  toggleNotificationSound as toggleSound 
} from '@/lib/notificationSound';

export interface Notification {
  id: string;
  user_id: string;
  type: 'thread_reply' | 'comment_reply' | 'mention';
  title: string;
  content: string;
  link: string | null;
  post_id: string | null;
  comment_id: string | null;
  actor_id: string | null;
  is_read: boolean;
  created_at: string;
  actor?: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface GroupedNotifications {
  today: Notification[];
  yesterday: Notification[];
  thisWeek: Notification[];
  earlier: Notification[];
}

function groupNotificationsByDate(notifications: Notification[]): GroupedNotifications {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  return notifications.reduce(
    (groups, notification) => {
      const date = new Date(notification.created_at);
      if (date >= today) {
        groups.today.push(notification);
      } else if (date >= yesterday) {
        groups.yesterday.push(notification);
      } else if (date >= weekAgo) {
        groups.thisWeek.push(notification);
      } else {
        groups.earlier.push(notification);
      }
      return groups;
    },
    { today: [], yesterday: [], thisWeek: [], earlier: [] } as GroupedNotifications
  );
}

async function fetchActorProfiles(actorIds: string[]) {
  if (actorIds.length === 0) return {};
  
  const { data: actors } = await supabase
    .from('profiles')
    .select('user_id, username, display_name, avatar_url')
    .in('user_id', actorIds);
  
  if (!actors) return {};
  
  return actors.reduce((acc, actor) => {
    acc[actor.user_id] = {
      username: actor.username,
      display_name: actor.display_name,
      avatar_url: actor.avatar_url,
    };
    return acc;
  }, {} as Record<string, { username: string; display_name: string | null; avatar_url: string | null }>);
}

export function useNotifications() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const actorIds = [...new Set(data.filter(n => n.actor_id).map(n => n.actor_id as string))];
      const actorMap = await fetchActorProfiles(actorIds);

      return data.map(notification => ({
        ...notification,
        actor: notification.actor_id ? actorMap[notification.actor_id] || null : null,
      })) as Notification[];
    },
    enabled: !!user,
    staleTime: 1000 * 30, // Consider data fresh for 30 seconds
  });
}

export function useGroupedNotifications() {
  const { data: notifications = [] } = useNotifications();
  return groupNotificationsByDate(notifications);
}

export function useUnreadCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['notifications-unread-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
    staleTime: 1000 * 30,
  });
}

export function useRealtimeNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          // Fetch actor profile for the new notification
          const notification = payload.new as Notification;
          if (notification.actor_id) {
            const actorMap = await fetchActorProfiles([notification.actor_id]);
            notification.actor = actorMap[notification.actor_id] || null;
          }

          // Update notifications cache
          queryClient.setQueryData<Notification[]>(
            ['notifications', user.id],
            (old = []) => [notification, ...old]
          );

          // Update unread count
          queryClient.setQueryData<number>(
            ['notifications-unread-count', user.id],
            (old = 0) => old + 1
          );

          // Play notification sound if enabled
          if (isNotificationSoundEnabled()) {
            playNotificationSound(0.3);
          }

          // Show toast notification
          const actorName = notification.actor?.display_name || notification.actor?.username || 'Someone';
          toast(notification.title, {
            description: notification.content.slice(0, 100) + (notification.content.length > 100 ? '...' : ''),
            action: notification.link ? {
              label: 'View',
              onClick: () => window.location.href = notification.link!,
            } : undefined,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Update the notification in cache
          queryClient.setQueryData<Notification[]>(
            ['notifications', user.id],
            (old = []) => old.map(n => n.id === payload.new.id ? { ...n, ...payload.new } : n)
          );

          // Recalculate unread count
          queryClient.invalidateQueries({ queryKey: ['notifications-unread-count', user.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Remove from cache
          queryClient.setQueryData<Notification[]>(
            ['notifications', user.id],
            (old = []) => old.filter(n => n.id !== payload.old.id)
          );

          // Recalculate unread count
          queryClient.invalidateQueries({ queryKey: ['notifications-unread-count', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onMutate: async (notificationId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['notifications', user?.id] });
      
      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications', user?.id]);
      
      queryClient.setQueryData<Notification[]>(
        ['notifications', user?.id],
        (old = []) => old.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );

      queryClient.setQueryData<number>(
        ['notifications-unread-count', user?.id],
        (old = 0) => Math.max(0, old - 1)
      );

      return { previousNotifications };
    },
    onError: (err, notificationId, context) => {
      queryClient.setQueryData(['notifications', user?.id], context?.previousNotifications);
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications', user?.id] });
      
      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications', user?.id]);
      
      queryClient.setQueryData<Notification[]>(
        ['notifications', user?.id],
        (old = []) => old.map(n => ({ ...n, is_read: true }))
      );

      queryClient.setQueryData<number>(['notifications-unread-count', user?.id], 0);

      return { previousNotifications };
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(['notifications', user?.id], context?.previousNotifications);
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
    onSuccess: () => {
      toast.success('All notifications marked as read');
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ['notifications', user?.id] });
      
      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications', user?.id]);
      const deletedNotification = previousNotifications?.find(n => n.id === notificationId);
      
      queryClient.setQueryData<Notification[]>(
        ['notifications', user?.id],
        (old = []) => old.filter(n => n.id !== notificationId)
      );

      if (deletedNotification && !deletedNotification.is_read) {
        queryClient.setQueryData<number>(
          ['notifications-unread-count', user?.id],
          (old = 0) => Math.max(0, old - 1)
        );
      }

      return { previousNotifications };
    },
    onError: (err, notificationId, context) => {
      queryClient.setQueryData(['notifications', user?.id], context?.previousNotifications);
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
}

export function useClearAllNotifications() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications', user?.id] });
      
      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications', user?.id]);
      
      queryClient.setQueryData<Notification[]>(['notifications', user?.id], []);
      queryClient.setQueryData<number>(['notifications-unread-count', user?.id], 0);

      return { previousNotifications };
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(['notifications', user?.id], context?.previousNotifications);
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
    onSuccess: () => {
      toast.success('All notifications cleared');
    },
  });
}

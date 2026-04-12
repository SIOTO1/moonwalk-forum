import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CommunityStats {
  totalMembers: number;
  postsToday: number;
  activeNow: number;
}

export function useCommunityStats() {
  return useQuery({
    queryKey: ['community-stats'],
    queryFn: async (): Promise<CommunityStats> => {
      // Get total member count
      const { count: totalMembers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get posts created today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: postsToday } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // For "active now" we approximate using profiles updated in the last 15 minutes
      // This is a reasonable proxy since Supabase doesn't have a presence API by default
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      const { count: activeNow } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', fifteenMinutesAgo);

      return {
        totalMembers: totalMembers || 0,
        postsToday: postsToday || 0,
        activeNow: activeNow || 0,
      };
    },
    staleTime: 1000 * 60 * 2, // Refresh every 2 minutes
    refetchInterval: 1000 * 60 * 2,
  });
}

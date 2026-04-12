import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TopContributor {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  reputation: number;
  membership_tier: 'free' | 'pro' | 'elite';
}

export function useTopContributors(limit: number = 5) {
  return useQuery({
    queryKey: ['top-contributors', limit],
    queryFn: async (): Promise<TopContributor[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, username, display_name, avatar_url, reputation, membership_tier')
        .order('reputation', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as TopContributor[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

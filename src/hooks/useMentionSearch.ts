import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MentionUser {
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

export function useMentionSearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['mention-search', query],
    queryFn: async (): Promise<MentionUser[]> => {
      if (!query || query.length < 1) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(8);

      if (error) throw error;
      return data || [];
    },
    enabled: enabled && query.length >= 1,
    staleTime: 1000 * 60, // Cache for 1 minute
  });
}

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TrendingTag {
  tag: string;
  post_count: number;
  recent_activity: boolean;
}

export function useTrendingTags(limit: number = 10) {
  return useQuery({
    queryKey: ['trending-tags', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_trending_tags', { limit_count: limit });

      if (error) {
        console.error('Error fetching trending tags:', error);
        throw error;
      }

      return (data as TrendingTag[]) || [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
}

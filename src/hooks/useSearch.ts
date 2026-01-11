import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  result_type: 'post' | 'comment' | 'category';
  id: string;
  title: string;
  content: string;
  slug: string;
  category_name: string;
  category_slug: string;
  is_private: boolean;
  author_username: string | null;
  created_at: string;
  rank: number;
}

export function useSearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!query || query.trim().length < 2) {
        return [];
      }

      const { data, error } = await supabase.rpc('search_forum', {
        search_query: query.trim(),
      });

      if (error) throw error;
      return (data ?? []) as SearchResult[];
    },
    enabled: enabled && query.length >= 2,
    staleTime: 30000,
  });
}

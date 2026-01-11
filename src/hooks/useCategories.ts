import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  color: string;
  is_private: boolean;
  required_tier: 'free' | 'pro' | 'elite' | null;
  display_order: number;
  post_count: number;
  created_at: string;
  updated_at: string;
}

export function useCategories() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as Category[];
    },
  });
}

export function useCategoryBySlug(slug: string | null) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data as Category;
    },
    enabled: !!slug,
  });
}

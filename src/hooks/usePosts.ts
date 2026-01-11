import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AuthorBadge {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  bg_color: string;
}

export interface PostWithAuthor {
  id: string;
  title: string;
  content: string;
  slug: string | null;
  author_id: string;
  category_id: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  has_accepted_answer: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    user_id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    membership_tier: 'free' | 'pro' | 'elite';
    reputation: number;
  } | null;
  category: {
    id: string;
    name: string;
    slug: string;
    icon: string;
    color: string;
    is_private: boolean;
  } | null;
}

type SortOption = 'popular' | 'newest' | 'unanswered';

interface UsePostsOptions {
  categorySlug?: string | null;
  sortBy?: SortOption;
  searchQuery?: string;
}

export function usePosts(options: UsePostsOptions = {}) {
  const { categorySlug, sortBy = 'popular', searchQuery } = options;
  const { user } = useAuth();

  return useQuery({
    queryKey: ['posts', categorySlug, sortBy, searchQuery, user?.id],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          slug,
          author_id,
          category_id,
          is_pinned,
          is_locked,
          view_count,
          upvotes,
          downvotes,
          comment_count,
          has_accepted_answer,
          tags,
          created_at,
          updated_at,
          author:profiles!posts_author_id_fkey(
            id,
            user_id,
            username,
            display_name,
            avatar_url,
            membership_tier,
            reputation
          ),
          category:categories!posts_category_id_fkey(
            id,
            name,
            slug,
            icon,
            color,
            is_private
          )
        `);

      // Filter by category if provided
      if (categorySlug) {
        query = query.eq('category.slug', categorySlug);
      }

      // Search filter
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      // Sorting
      switch (sortBy) {
        case 'popular':
          query = query.order('upvotes', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'unanswered':
          query = query.eq('has_accepted_answer', false).order('created_at', { ascending: false });
          break;
      }

      // Always put pinned posts first
      query = query.order('is_pinned', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      
      // Filter out posts where category is null (user can't access that category)
      const filteredData = (data as PostWithAuthor[]).filter(post => post.category !== null);
      
      // If filtering by category slug, ensure the category matches
      if (categorySlug) {
        return filteredData.filter(post => post.category?.slug === categorySlug);
      }
      
      return filteredData;
    },
  });
}

export function usePost(postId: string | null) {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      if (!postId) return null;
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          slug,
          author_id,
          category_id,
          is_pinned,
          is_locked,
          view_count,
          upvotes,
          downvotes,
          comment_count,
          has_accepted_answer,
          tags,
          created_at,
          updated_at,
          author:profiles!posts_author_id_fkey(
            id,
            user_id,
            username,
            display_name,
            avatar_url,
            membership_tier,
            reputation
          ),
          category:categories!posts_category_id_fkey(
            id,
            name,
            slug,
            icon,
            color,
            is_private
          )
        `)
        .eq('id', postId)
        .single();

      if (error) throw error;
      return data as PostWithAuthor;
    },
    enabled: !!postId,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (post: {
      title: string;
      content: string;
      category_id: string;
      tags?: string[];
    }) => {
      if (!user) throw new Error('Must be logged in to create a post');

      const { data, error } = await supabase
        .from('posts')
        .insert({
          ...post,
          author_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

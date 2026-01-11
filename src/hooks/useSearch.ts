import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();

  return useQuery({
    queryKey: ['search', query, user?.id],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!query || query.trim().length < 2) {
        return [];
      }

      const searchTerm = query.trim();
      
      // Search posts with ilike for broader matching
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          slug,
          created_at,
          category:categories!posts_category_id_fkey(
            name,
            slug,
            is_private
          ),
          author:profiles!posts_author_id_fkey(
            username
          )
        `)
        .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
        .limit(20);

      if (postsError) throw postsError;

      // Search comments
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          post:posts!comments_post_id_fkey(
            id,
            title,
            slug,
            category:categories!posts_category_id_fkey(
              name,
              slug,
              is_private
            )
          ),
          author:profiles!comments_author_id_fkey(
            username
          )
        `)
        .ilike('content', `%${searchTerm}%`)
        .limit(15);

      if (commentsError) throw commentsError;

      // Search categories
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, description, slug, is_private, created_at')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .limit(5);

      if (categoriesError) throw categoriesError;

      // Transform and combine results
      const results: SearchResult[] = [];

      // Add post results
      posts?.forEach((post: any) => {
        if (post.category) {
          results.push({
            result_type: 'post',
            id: post.id,
            title: post.title,
            content: post.content?.substring(0, 200) || '',
            slug: post.slug || post.id,
            category_name: post.category.name,
            category_slug: post.category.slug,
            is_private: post.category.is_private,
            author_username: post.author?.username || null,
            created_at: post.created_at,
            rank: 1.0
          });
        }
      });

      // Add comment results
      comments?.forEach((comment: any) => {
        if (comment.post?.category) {
          results.push({
            result_type: 'comment',
            id: comment.id,
            title: comment.post.title,
            content: comment.content?.substring(0, 200) || '',
            slug: comment.post.slug || comment.post.id,
            category_name: comment.post.category.name,
            category_slug: comment.post.category.slug,
            is_private: comment.post.category.is_private,
            author_username: comment.author?.username || null,
            created_at: comment.created_at,
            rank: 0.8
          });
        }
      });

      // Add category results
      categories?.forEach((category: any) => {
        results.push({
          result_type: 'category',
          id: category.id,
          title: category.name,
          content: category.description || '',
          slug: category.slug,
          category_name: category.name,
          category_slug: category.slug,
          is_private: category.is_private,
          author_username: null,
          created_at: category.created_at,
          rank: 1.2
        });
      });

      // Sort by rank
      return results.sort((a, b) => b.rank - a.rank);
    },
    enabled: enabled && query.length >= 2,
    staleTime: 30000,
  });
}

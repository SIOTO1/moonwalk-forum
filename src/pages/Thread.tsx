import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/seo/SEOHead';
import { Logo } from '@/components/forum/Logo';
import { PostDetail } from '@/components/forum/PostDetail';
import { PostWithAuthor } from '@/hooks/usePosts';

export default function Thread() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post-by-slug', slug],
    queryFn: async () => {
      if (!slug) return null;

      // Try to find by slug first
      let { data, error } = await supabase
        .from('posts')
        .select(`
          *,
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
        .eq('slug', slug)
        .maybeSingle();

      // If not found by slug, try by ID (for backwards compatibility)
      if (!data && !error) {
        const result = await supabase
          .from('posts')
          .select(`
            *,
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
          .eq('id', slug)
          .maybeSingle();

        data = result.data;
        error = result.error;
      }

      if (error) throw error;
      return data as PostWithAuthor | null;
    },
    enabled: !!slug,
  });

  // Determine if content should be indexed
  const isPrivate = post?.category?.is_private ?? false;
  const canonicalUrl = post?.slug 
    ? `${window.location.origin}/thread/${post.slug}`
    : undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center h-16 gap-4">
              <Link to="/">
                <Logo size="md" />
              </Link>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="forum-card p-6 animate-pulse">
            <div className="h-8 bg-muted rounded w-3/4 mb-4" />
            <div className="h-4 bg-muted rounded w-1/4 mb-6" />
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead
          title="Thread Not Found - Moonwalk Forum"
          description="The requested thread could not be found."
          noindex={true}
        />
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center h-16 gap-4">
              <Link to="/">
                <Logo size="md" />
              </Link>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-16 text-center max-w-4xl">
          <h1 className="text-2xl font-bold mb-4">Thread Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This thread may have been removed or you don't have permission to view it.
          </p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Forum
            </Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${post.title} - Moonwalk Forum`}
        description={post.content.substring(0, 155)}
        canonical={canonicalUrl}
        noindex={isPrivate} // Private content should not be indexed
        ogType="article"
        articlePublishedTime={post.created_at}
        articleAuthor={post.author?.display_name || post.author?.username || 'Anonymous'}
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center h-16 gap-4">
              <Link to="/">
                <Logo size="md" />
              </Link>
              <Button variant="ghost" size="sm" asChild className="gap-2">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Forum
                </Link>
              </Button>
              {isPrivate && (
                <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  <Lock className="w-3 h-3" />
                  Members Only
                </span>
              )}
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <PostDetail 
            post={post} 
            onBack={() => navigate('/')} 
          />
        </main>

        <ScrollToTop />
      </div>
    </>
  );
}

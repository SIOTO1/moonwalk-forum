-- Add indexes for faster filtering and sorting on posts
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON public.posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_upvotes ON public.posts(upvotes DESC);

-- Add index for faster comment sorting
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
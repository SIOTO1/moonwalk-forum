-- Add composite indexes for frequently used query patterns to optimize performance

-- Posts table indexes
-- Index for sorting by popularity (upvotes) with pinned posts first
CREATE INDEX IF NOT EXISTS idx_posts_pinned_upvotes ON public.posts (is_pinned DESC, upvotes DESC);

-- Index for sorting by newest with pinned posts first  
CREATE INDEX IF NOT EXISTS idx_posts_pinned_created ON public.posts (is_pinned DESC, created_at DESC);

-- Index for unanswered posts query
CREATE INDEX IF NOT EXISTS idx_posts_unanswered ON public.posts (has_accepted_answer, created_at DESC) WHERE has_accepted_answer = false;

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts (category_id);

-- Index for author lookups
CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts (author_id);

-- Comments table indexes
-- Index for fetching comments by post with parent filter (root comments)
CREATE INDEX IF NOT EXISTS idx_comments_post_root ON public.comments (post_id, parent_id) WHERE parent_id IS NULL;

-- Index for fetching replies (non-null parent_id)
CREATE INDEX IF NOT EXISTS idx_comments_post_replies ON public.comments (post_id) WHERE parent_id IS NOT NULL;

-- Index for sorting root comments by top
CREATE INDEX IF NOT EXISTS idx_comments_top_sort ON public.comments (post_id, is_accepted DESC, upvotes DESC) WHERE parent_id IS NULL;

-- Index for sorting comments by newest
CREATE INDEX IF NOT EXISTS idx_comments_created ON public.comments (post_id, created_at DESC);

-- Votes table indexes
-- Index for user votes lookup
CREATE INDEX IF NOT EXISTS idx_votes_user_post ON public.votes (user_id, post_id) WHERE post_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_votes_user_comment ON public.votes (user_id, comment_id) WHERE comment_id IS NOT NULL;

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications (user_id, created_at DESC);

-- User badges index
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges (user_id);

-- Categories display order index
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON public.categories (display_order ASC);
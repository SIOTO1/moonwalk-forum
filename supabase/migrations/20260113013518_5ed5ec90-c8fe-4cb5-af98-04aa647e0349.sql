-- Create a function to get trending tags with post counts
CREATE OR REPLACE FUNCTION public.get_trending_tags(limit_count integer DEFAULT 10)
RETURNS TABLE(tag text, post_count bigint, recent_activity boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH tag_stats AS (
    SELECT 
      unnest(p.tags) AS tag,
      COUNT(*) AS post_count,
      MAX(p.created_at) AS last_post_at
    FROM public.posts p
    JOIN public.categories c ON c.id = p.category_id
    WHERE p.is_removed = false
      AND c.is_private = false
      AND p.tags IS NOT NULL
      AND array_length(p.tags, 1) > 0
    GROUP BY unnest(p.tags)
  )
  SELECT 
    tag_stats.tag,
    tag_stats.post_count,
    (tag_stats.last_post_at > now() - interval '24 hours') AS recent_activity
  FROM tag_stats
  WHERE tag_stats.tag IS NOT NULL AND tag_stats.tag != ''
  ORDER BY tag_stats.post_count DESC, tag_stats.last_post_at DESC
  LIMIT limit_count;
$$;
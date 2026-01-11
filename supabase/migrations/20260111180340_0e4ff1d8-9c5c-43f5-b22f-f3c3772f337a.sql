-- Full-text search support via tsvector columns + triggers (no generated columns)

-- 1) Add search_vector columns
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS search_vector tsvector;

ALTER TABLE public.comments
ADD COLUMN IF NOT EXISTS search_vector tsvector;

ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 2) Trigger functions to keep search_vector up-to-date
CREATE OR REPLACE FUNCTION public.update_posts_search_vector()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.content, '')), 'C');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_comments_search_vector()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', coalesce(NEW.content, ''));
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_categories_search_vector()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$;

-- 3) Triggers
DROP TRIGGER IF EXISTS posts_search_vector_trigger ON public.posts;
CREATE TRIGGER posts_search_vector_trigger
BEFORE INSERT OR UPDATE OF title, content, tags
ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.update_posts_search_vector();

DROP TRIGGER IF EXISTS comments_search_vector_trigger ON public.comments;
CREATE TRIGGER comments_search_vector_trigger
BEFORE INSERT OR UPDATE OF content
ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.update_comments_search_vector();

DROP TRIGGER IF EXISTS categories_search_vector_trigger ON public.categories;
CREATE TRIGGER categories_search_vector_trigger
BEFORE INSERT OR UPDATE OF name, description
ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_categories_search_vector();

-- 4) GIN indexes
CREATE INDEX IF NOT EXISTS posts_search_vector_gin_idx
ON public.posts
USING GIN (search_vector);

CREATE INDEX IF NOT EXISTS comments_search_vector_gin_idx
ON public.comments
USING GIN (search_vector);

CREATE INDEX IF NOT EXISTS categories_search_vector_gin_idx
ON public.categories
USING GIN (search_vector);

-- 5) Unified search RPC (SECURITY INVOKER so RLS still applies)
CREATE OR REPLACE FUNCTION public.search_forum(search_query text)
RETURNS TABLE (
  result_type text,
  id uuid,
  title text,
  content text,
  slug text,
  category_name text,
  category_slug text,
  is_private boolean,
  author_username text,
  created_at timestamptz,
  rank real
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  WITH q AS (
    SELECT websearch_to_tsquery('english', search_query) AS query
  )
  (
    SELECT
      'post'::text AS result_type,
      p.id,
      p.title,
      left(p.content, 200) AS content,
      COALESCE(p.slug, p.id::text) AS slug,
      c.name AS category_name,
      c.slug AS category_slug,
      c.is_private,
      pr.username AS author_username,
      p.created_at,
      ts_rank_cd(p.search_vector, q.query)::real AS rank
    FROM public.posts p
    JOIN public.categories c ON c.id = p.category_id
    LEFT JOIN public.profiles pr ON pr.user_id = p.author_id
    CROSS JOIN q
    WHERE search_query IS NOT NULL
      AND length(trim(search_query)) >= 2
      AND p.search_vector @@ q.query
  )
  UNION ALL
  (
    SELECT
      'comment'::text AS result_type,
      cm.id,
      p.title,
      left(cm.content, 200) AS content,
      COALESCE(p.slug, p.id::text) AS slug,
      c.name AS category_name,
      c.slug AS category_slug,
      c.is_private,
      pr.username AS author_username,
      cm.created_at,
      (ts_rank_cd(cm.search_vector, q.query) * 0.8)::real AS rank
    FROM public.comments cm
    JOIN public.posts p ON p.id = cm.post_id
    JOIN public.categories c ON c.id = p.category_id
    LEFT JOIN public.profiles pr ON pr.user_id = cm.author_id
    CROSS JOIN q
    WHERE search_query IS NOT NULL
      AND length(trim(search_query)) >= 2
      AND cm.search_vector @@ q.query
  )
  UNION ALL
  (
    SELECT
      'category'::text AS result_type,
      cat.id,
      cat.name AS title,
      COALESCE(cat.description, '') AS content,
      cat.slug,
      cat.name AS category_name,
      cat.slug AS category_slug,
      cat.is_private,
      NULL::text AS author_username,
      cat.created_at,
      (ts_rank_cd(cat.search_vector, q.query) * 1.2)::real AS rank
    FROM public.categories cat
    CROSS JOIN q
    WHERE search_query IS NOT NULL
      AND length(trim(search_query)) >= 2
      AND cat.search_vector @@ q.query
  )
  ORDER BY rank DESC
  LIMIT 50;
$$;
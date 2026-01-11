-- Add slug column to posts for clean URLs
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS slug text;

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS posts_slug_idx ON public.posts (slug);

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION public.generate_post_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  base_slug text;
  new_slug text;
  counter integer := 0;
BEGIN
  -- Only generate slug if title changed or slug is null
  IF NEW.slug IS NOT NULL AND (TG_OP = 'UPDATE' AND OLD.title = NEW.title) THEN
    RETURN NEW;
  END IF;

  -- Generate base slug from title
  base_slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  -- Limit slug length
  base_slug := left(base_slug, 80);
  
  new_slug := base_slug;
  
  -- Check for uniqueness and append number if needed
  WHILE EXISTS (SELECT 1 FROM public.posts WHERE slug = new_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
    counter := counter + 1;
    new_slug := base_slug || '-' || counter;
  END LOOP;
  
  NEW.slug := new_slug;
  RETURN NEW;
END;
$function$;

-- Create trigger to auto-generate slug on insert/update
DROP TRIGGER IF EXISTS generate_post_slug_trigger ON public.posts;
CREATE TRIGGER generate_post_slug_trigger
BEFORE INSERT OR UPDATE OF title ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.generate_post_slug();

-- Update existing posts to have slugs
UPDATE public.posts 
SET slug = lower(regexp_replace(regexp_replace(left(title, 80), '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;
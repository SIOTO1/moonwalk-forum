-- Add images column to comments table (max 2 image URLs)
ALTER TABLE public.comments ADD COLUMN images text[] DEFAULT '{}';
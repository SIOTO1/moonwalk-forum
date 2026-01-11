-- Add foreign key from posts.author_id to profiles.user_id
ALTER TABLE public.posts 
DROP CONSTRAINT IF EXISTS posts_author_id_fkey;

ALTER TABLE public.posts 
ADD CONSTRAINT posts_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
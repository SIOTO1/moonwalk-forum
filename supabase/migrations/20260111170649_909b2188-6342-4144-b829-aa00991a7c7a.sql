-- Create comments table with nested replies support
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  is_accepted BOOLEAN NOT NULL DEFAULT false,
  depth INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create votes table for posts and comments
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  vote_type SMALLINT NOT NULL CHECK (vote_type IN (-1, 1)),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_post_vote UNIQUE (user_id, post_id),
  CONSTRAINT unique_comment_vote UNIQUE (user_id, comment_id),
  CONSTRAINT vote_target_check CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR 
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Comments RLS policies
CREATE POLICY "Comments are viewable by everyone"
ON public.comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.posts p 
    WHERE p.id = post_id 
    AND public.can_access_category(auth.uid(), p.category_id)
  )
  OR EXISTS (
    SELECT 1 FROM public.posts p 
    JOIN public.categories c ON c.id = p.category_id 
    WHERE p.id = post_id AND NOT c.is_private
  )
);

CREATE POLICY "Authenticated users can create comments"
ON public.comments FOR INSERT
WITH CHECK (
  auth.uid() = author_id
  AND public.can_post(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.posts p 
    WHERE p.id = post_id 
    AND NOT p.is_locked
    AND public.can_access_category(auth.uid(), p.category_id)
  )
);

CREATE POLICY "Authors can update their comments"
ON public.comments FOR UPDATE
USING (auth.uid() = author_id OR public.can_moderate(auth.uid()));

CREATE POLICY "Authors and moderators can delete comments"
ON public.comments FOR DELETE
USING (auth.uid() = author_id OR public.can_moderate(auth.uid()));

-- Votes RLS policies
CREATE POLICY "Users can view all votes"
ON public.votes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote"
ON public.votes FOR INSERT
WITH CHECK (auth.uid() = user_id AND public.can_post(auth.uid()));

CREATE POLICY "Users can update their own votes"
ON public.votes FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
ON public.votes FOR DELETE USING (auth.uid() = user_id);

-- Function to update post vote counts
CREATE OR REPLACE FUNCTION public.update_post_votes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.post_id IS NOT NULL THEN
      IF NEW.vote_type = 1 THEN
        UPDATE public.posts SET upvotes = upvotes + 1 WHERE id = NEW.post_id;
      ELSE
        UPDATE public.posts SET downvotes = downvotes + 1 WHERE id = NEW.post_id;
      END IF;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.post_id IS NOT NULL THEN
      IF OLD.vote_type = 1 AND NEW.vote_type = -1 THEN
        UPDATE public.posts SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = NEW.post_id;
      ELSIF OLD.vote_type = -1 AND NEW.vote_type = 1 THEN
        UPDATE public.posts SET upvotes = upvotes + 1, downvotes = downvotes - 1 WHERE id = NEW.post_id;
      END IF;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.post_id IS NOT NULL THEN
      IF OLD.vote_type = 1 THEN
        UPDATE public.posts SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = OLD.post_id;
      ELSE
        UPDATE public.posts SET downvotes = GREATEST(downvotes - 1, 0) WHERE id = OLD.post_id;
      END IF;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Function to update comment vote counts
CREATE OR REPLACE FUNCTION public.update_comment_votes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.comment_id IS NOT NULL THEN
      IF NEW.vote_type = 1 THEN
        UPDATE public.comments SET upvotes = upvotes + 1 WHERE id = NEW.comment_id;
      ELSE
        UPDATE public.comments SET downvotes = downvotes + 1 WHERE id = NEW.comment_id;
      END IF;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.comment_id IS NOT NULL THEN
      IF OLD.vote_type = 1 AND NEW.vote_type = -1 THEN
        UPDATE public.comments SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = NEW.comment_id;
      ELSIF OLD.vote_type = -1 AND NEW.vote_type = 1 THEN
        UPDATE public.comments SET upvotes = upvotes + 1, downvotes = downvotes - 1 WHERE id = NEW.comment_id;
      END IF;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.comment_id IS NOT NULL THEN
      IF OLD.vote_type = 1 THEN
        UPDATE public.comments SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = OLD.comment_id;
      ELSE
        UPDATE public.comments SET downvotes = GREATEST(downvotes - 1, 0) WHERE id = OLD.comment_id;
      END IF;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Function to update comment count on posts
CREATE OR REPLACE FUNCTION public.update_post_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create triggers
CREATE TRIGGER on_vote_change_post
AFTER INSERT OR UPDATE OR DELETE ON public.votes
FOR EACH ROW
EXECUTE FUNCTION public.update_post_votes();

CREATE TRIGGER on_vote_change_comment
AFTER INSERT OR UPDATE OR DELETE ON public.votes
FOR EACH ROW
EXECUTE FUNCTION public.update_comment_votes();

CREATE TRIGGER on_comment_change
AFTER INSERT OR DELETE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.update_post_comment_count();

CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_comments_post_id ON public.comments(post_id);
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX idx_comments_author_id ON public.comments(author_id);
CREATE INDEX idx_votes_user_id ON public.votes(user_id);
CREATE INDEX idx_votes_post_id ON public.votes(post_id);
CREATE INDEX idx_votes_comment_id ON public.votes(comment_id);
CREATE INDEX idx_posts_upvotes ON public.posts(upvotes DESC);
CREATE INDEX idx_comments_upvotes ON public.comments(upvotes DESC);
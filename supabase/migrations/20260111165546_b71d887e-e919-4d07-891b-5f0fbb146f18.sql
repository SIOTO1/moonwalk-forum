-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'folder',
  color TEXT NOT NULL DEFAULT 'hsl(var(--primary))',
  is_private BOOLEAN NOT NULL DEFAULT false,
  required_tier membership_tier,
  display_order INTEGER NOT NULL DEFAULT 0,
  post_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create posts (threads) table
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  view_count INTEGER NOT NULL DEFAULT 0,
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  has_accepted_answer BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Function to check category access
CREATE OR REPLACE FUNCTION public.can_access_category(_user_id uuid, _category_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.categories c
    WHERE c.id = _category_id
    AND (
      -- Public categories
      c.is_private = false
      -- Or user has required tier
      OR (
        c.required_tier IS NOT NULL
        AND (
          -- Pro tier can access 'pro' required categories
          (c.required_tier = 'pro' AND public.get_membership_tier(_user_id) IN ('pro', 'elite'))
          -- Elite tier can access 'elite' required categories
          OR (c.required_tier = 'elite' AND public.get_membership_tier(_user_id) = 'elite')
        )
      )
      -- Or user is moderator/admin
      OR public.can_moderate(_user_id)
    )
  )
$$;

-- Categories RLS policies
CREATE POLICY "Public categories visible to all"
ON public.categories FOR SELECT
USING (is_private = false);

CREATE POLICY "Private categories visible to eligible users"
ON public.categories FOR SELECT
USING (
  is_private = true 
  AND public.can_access_category(auth.uid(), id)
);

CREATE POLICY "Admins can manage categories"
ON public.categories FOR ALL
USING (public.is_admin(auth.uid()));

-- Posts RLS policies
CREATE POLICY "Posts in accessible categories are viewable"
ON public.posts FOR SELECT
USING (public.can_access_category(auth.uid(), category_id) OR 
       (SELECT NOT is_private FROM public.categories WHERE id = category_id));

CREATE POLICY "Authenticated users can create posts in accessible categories"
ON public.posts FOR INSERT
WITH CHECK (
  auth.uid() = author_id
  AND public.can_post(auth.uid())
  AND public.can_access_category(auth.uid(), category_id)
);

CREATE POLICY "Authors can update their own posts"
ON public.posts FOR UPDATE
USING (auth.uid() = author_id OR public.can_moderate(auth.uid()));

CREATE POLICY "Authors and moderators can delete posts"
ON public.posts FOR DELETE
USING (auth.uid() = author_id OR public.can_moderate(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert public categories
INSERT INTO public.categories (name, slug, description, icon, color, is_private, display_order) VALUES
('Start Here (New Operators)', 'start-here', 'Welcome! Begin your journey here with guides and introductions.', 'rocket', 'hsl(142, 76%, 36%)', false, 1),
('Safety, Risk & Compliance', 'safety-compliance', 'Discuss safety protocols, risk management, and regulatory compliance.', 'shield', 'hsl(0, 84%, 60%)', false, 2),
('Equipment, Repairs & Manufacturers', 'equipment-repairs', 'Everything about equipment maintenance, repairs, and manufacturer discussions.', 'wrench', 'hsl(217, 91%, 60%)', false, 3),
('Pricing, Contracts & Insurance', 'pricing-contracts', 'Share insights on pricing strategies, contracts, and insurance options.', 'file-text', 'hsl(262, 83%, 58%)', false, 4),
('Marketing, SEO & Business Growth', 'marketing-growth', 'Grow your business with marketing tips, SEO strategies, and growth hacks.', 'trending-up', 'hsl(45, 93%, 47%)', false, 5),
('Staffing & Operations', 'staffing-operations', 'Discuss hiring, training, and operational best practices.', 'users', 'hsl(199, 89%, 48%)', false, 6),
('Incidents, Lessons & Near Misses', 'incidents-lessons', 'Share experiences and learn from incidents and near misses.', 'alert-triangle', 'hsl(25, 95%, 53%)', false, 7),
('Regional & Local Markets', 'regional-markets', 'Connect with operators in your region and discuss local market trends.', 'map-pin', 'hsl(173, 80%, 40%)', false, 8),
('Vendor & Partner Q&A', 'vendor-partner-qa', 'Sponsored discussions with vendors and industry partners.', 'message-circle', 'hsl(280, 65%, 60%)', false, 9);

-- Insert private/membership-gated categories
INSERT INTO public.categories (name, slug, description, icon, color, is_private, required_tier, display_order) VALUES
('Pro Operators Board', 'pro-operators', 'Exclusive discussions for Pro members and above.', 'star', 'hsl(45, 93%, 47%)', true, 'pro', 10),
('Certified & Elite Operators Board', 'elite-operators', 'Premium discussions for Elite members only.', 'crown', 'hsl(262, 83%, 58%)', true, 'elite', 11),
('Insurance & Claims Discussions', 'insurance-claims', 'Confidential discussions about insurance and claims. Elite only.', 'shield-check', 'hsl(217, 91%, 60%)', true, 'elite', 12),
('Templates, SOPs & Downloads', 'templates-downloads', 'Access exclusive templates and standard operating procedures.', 'download', 'hsl(142, 76%, 36%)', true, 'pro', 13);
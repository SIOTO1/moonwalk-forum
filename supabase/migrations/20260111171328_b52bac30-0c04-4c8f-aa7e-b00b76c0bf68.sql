-- Create badges table
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'award',
  color TEXT NOT NULL DEFAULT 'hsl(38, 92%, 50%)',
  bg_color TEXT NOT NULL DEFAULT 'hsl(38, 92%, 50%, 0.15)',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_badges junction table
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_badge UNIQUE (user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Badges RLS - everyone can view
CREATE POLICY "Badges are viewable by everyone"
ON public.badges FOR SELECT USING (true);

CREATE POLICY "Only admins can manage badges"
ON public.badges FOR ALL
USING (public.is_admin(auth.uid()));

-- User badges RLS
CREATE POLICY "User badges are viewable by everyone"
ON public.user_badges FOR SELECT USING (true);

CREATE POLICY "Moderators can assign badges"
ON public.user_badges FOR INSERT
WITH CHECK (public.can_moderate(auth.uid()));

CREATE POLICY "Moderators can remove badges"
ON public.user_badges FOR DELETE
USING (public.can_moderate(auth.uid()));

-- Create indexes
CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON public.user_badges(badge_id);

-- Insert default badges
INSERT INTO public.badges (name, slug, description, icon, color, bg_color, display_order) VALUES
('SIOTO Certified', 'sioto-certified', 'Certified by the Safety & Industry Operations Training Organization', 'shield-check', 'hsl(142, 76%, 36%)', 'hsl(142, 76%, 36%, 0.15)', 1),
('5+ Years in Business', '5-years', 'Operating for 5+ years in the industry', 'calendar', 'hsl(199, 89%, 48%)', 'hsl(199, 89%, 48%, 0.15)', 2),
('10+ Years in Business', '10-years', 'Operating for 10+ years in the industry', 'trophy', 'hsl(45, 93%, 47%)', 'hsl(45, 93%, 47%, 0.15)', 3),
('Moderator', 'moderator', 'Community moderator helping maintain forum quality', 'shield', 'hsl(262, 83%, 58%)', 'hsl(262, 83%, 58%, 0.15)', 4),
('Industry Partner', 'industry-partner', 'Verified industry partner organization', 'handshake', 'hsl(25, 95%, 53%)', 'hsl(25, 95%, 53%, 0.15)', 5),
('Manufacturer Representative', 'manufacturer-rep', 'Official representative of an equipment manufacturer', 'factory', 'hsl(173, 80%, 40%)', 'hsl(173, 80%, 40%, 0.15)', 6);
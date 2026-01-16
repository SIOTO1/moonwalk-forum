-- Create enum for campaign status
CREATE TYPE public.campaign_status AS ENUM ('draft', 'pending_review', 'approved', 'rejected', 'active', 'paused', 'completed', 'cancelled');

-- Create ad_campaigns table
CREATE TABLE public.ad_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  daily_budget_cents INTEGER NOT NULL DEFAULT 1000, -- $10 default daily budget
  total_budget_cents INTEGER NOT NULL DEFAULT 10000, -- $100 default total budget
  cost_per_impression_cents INTEGER NOT NULL DEFAULT 1, -- $0.01 per impression
  spent_cents INTEGER NOT NULL DEFAULT 0,
  impressions_count INTEGER NOT NULL DEFAULT 0,
  clicks_count INTEGER NOT NULL DEFAULT 0,
  status campaign_status NOT NULL DEFAULT 'draft',
  target_categories UUID[] DEFAULT '{}',
  start_date DATE,
  end_date DATE,
  rejection_reason TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sponsored_posts table (the actual ad content)
CREATE TABLE public.sponsored_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  cta_text TEXT DEFAULT 'Learn More',
  cta_url TEXT NOT NULL,
  sponsor_name TEXT NOT NULL,
  sponsor_logo_url TEXT,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ad_impressions table for tracking
CREATE TABLE public.ad_impressions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  sponsored_post_id UUID NOT NULL REFERENCES public.sponsored_posts(id) ON DELETE CASCADE,
  viewer_id UUID, -- nullable for anonymous viewers
  category_id UUID REFERENCES public.categories(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ad_clicks table for tracking
CREATE TABLE public.ad_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  sponsored_post_id UUID NOT NULL REFERENCES public.sponsored_posts(id) ON DELETE CASCADE,
  viewer_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsored_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_clicks ENABLE ROW LEVEL SECURITY;

-- RLS policies for ad_campaigns
CREATE POLICY "Vendors can view their own campaigns"
ON public.ad_campaigns FOR SELECT
USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can create campaigns"
ON public.ad_campaigns FOR INSERT
WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update their draft/rejected campaigns"
ON public.ad_campaigns FOR UPDATE
USING (auth.uid() = vendor_id AND status IN ('draft', 'rejected', 'pending_review'));

CREATE POLICY "Admins can view all campaigns"
ON public.ad_campaigns FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update any campaign"
ON public.ad_campaigns FOR UPDATE
USING (is_admin(auth.uid()));

-- RLS policies for sponsored_posts
CREATE POLICY "Vendors can view their own sponsored posts"
ON public.sponsored_posts FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.ad_campaigns c 
  WHERE c.id = campaign_id AND c.vendor_id = auth.uid()
));

CREATE POLICY "Vendors can create sponsored posts for their campaigns"
ON public.sponsored_posts FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.ad_campaigns c 
  WHERE c.id = campaign_id AND c.vendor_id = auth.uid()
));

CREATE POLICY "Vendors can update their sponsored posts"
ON public.sponsored_posts FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.ad_campaigns c 
  WHERE c.id = campaign_id AND c.vendor_id = auth.uid()
));

CREATE POLICY "Vendors can delete their sponsored posts"
ON public.sponsored_posts FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.ad_campaigns c 
  WHERE c.id = campaign_id AND c.vendor_id = auth.uid()
));

CREATE POLICY "Active sponsored posts are viewable by everyone"
ON public.sponsored_posts FOR SELECT
USING (
  is_active = true AND EXISTS (
    SELECT 1 FROM public.ad_campaigns c 
    WHERE c.id = campaign_id AND c.status = 'active'
  )
);

CREATE POLICY "Admins can view all sponsored posts"
ON public.sponsored_posts FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update any sponsored post"
ON public.sponsored_posts FOR UPDATE
USING (is_admin(auth.uid()));

-- RLS policies for ad_impressions (insert-only for tracking)
CREATE POLICY "Anyone can record impressions"
ON public.ad_impressions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Vendors can view their campaign impressions"
ON public.ad_impressions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.ad_campaigns c 
  WHERE c.id = campaign_id AND c.vendor_id = auth.uid()
));

CREATE POLICY "Admins can view all impressions"
ON public.ad_impressions FOR SELECT
USING (is_admin(auth.uid()));

-- RLS policies for ad_clicks (insert-only for tracking)
CREATE POLICY "Anyone can record clicks"
ON public.ad_clicks FOR INSERT
WITH CHECK (true);

CREATE POLICY "Vendors can view their campaign clicks"
ON public.ad_clicks FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.ad_campaigns c 
  WHERE c.id = campaign_id AND c.vendor_id = auth.uid()
));

CREATE POLICY "Admins can view all clicks"
ON public.ad_clicks FOR SELECT
USING (is_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_ad_campaigns_vendor ON public.ad_campaigns(vendor_id);
CREATE INDEX idx_ad_campaigns_status ON public.ad_campaigns(status);
CREATE INDEX idx_sponsored_posts_campaign ON public.sponsored_posts(campaign_id);
CREATE INDEX idx_ad_impressions_campaign ON public.ad_impressions(campaign_id);
CREATE INDEX idx_ad_impressions_created ON public.ad_impressions(created_at);
CREATE INDEX idx_ad_clicks_campaign ON public.ad_clicks(campaign_id);

-- Trigger for updated_at
CREATE TRIGGER update_ad_campaigns_updated_at
BEFORE UPDATE ON public.ad_campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sponsored_posts_updated_at
BEFORE UPDATE ON public.sponsored_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to record impression and update campaign stats
CREATE OR REPLACE FUNCTION public.record_ad_impression(
  _campaign_id UUID,
  _sponsored_post_id UUID,
  _viewer_id UUID DEFAULT NULL,
  _category_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  campaign_record RECORD;
BEGIN
  -- Get campaign info
  SELECT daily_budget_cents, total_budget_cents, spent_cents, cost_per_impression_cents, status
  INTO campaign_record
  FROM public.ad_campaigns
  WHERE id = _campaign_id;
  
  -- Check if campaign is active and has budget
  IF campaign_record.status != 'active' THEN
    RETURN false;
  END IF;
  
  IF campaign_record.spent_cents >= campaign_record.total_budget_cents THEN
    -- Mark campaign as completed
    UPDATE public.ad_campaigns SET status = 'completed' WHERE id = _campaign_id;
    RETURN false;
  END IF;
  
  -- Record the impression
  INSERT INTO public.ad_impressions (campaign_id, sponsored_post_id, viewer_id, category_id)
  VALUES (_campaign_id, _sponsored_post_id, _viewer_id, _category_id);
  
  -- Update campaign stats
  UPDATE public.ad_campaigns SET
    impressions_count = impressions_count + 1,
    spent_cents = spent_cents + cost_per_impression_cents
  WHERE id = _campaign_id;
  
  RETURN true;
END;
$$;

-- Function to record click
CREATE OR REPLACE FUNCTION public.record_ad_click(
  _campaign_id UUID,
  _sponsored_post_id UUID,
  _viewer_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Record the click
  INSERT INTO public.ad_clicks (campaign_id, sponsored_post_id, viewer_id)
  VALUES (_campaign_id, _sponsored_post_id, _viewer_id);
  
  -- Update campaign click count
  UPDATE public.ad_campaigns SET clicks_count = clicks_count + 1
  WHERE id = _campaign_id;
  
  RETURN true;
END;
$$;

-- Function to get active sponsored post for a category
CREATE OR REPLACE FUNCTION public.get_sponsored_post_for_category(_category_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  campaign_id UUID,
  title TEXT,
  content TEXT,
  image_url TEXT,
  cta_text TEXT,
  cta_url TEXT,
  sponsor_name TEXT,
  sponsor_logo_url TEXT,
  tags TEXT[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    sp.id,
    sp.campaign_id,
    sp.title,
    sp.content,
    sp.image_url,
    sp.cta_text,
    sp.cta_url,
    sp.sponsor_name,
    sp.sponsor_logo_url,
    sp.tags
  FROM public.sponsored_posts sp
  JOIN public.ad_campaigns c ON c.id = sp.campaign_id
  WHERE c.status = 'active'
    AND sp.is_active = true
    AND c.spent_cents < c.total_budget_cents
    AND (c.start_date IS NULL OR c.start_date <= CURRENT_DATE)
    AND (c.end_date IS NULL OR c.end_date >= CURRENT_DATE)
    AND (
      _category_id IS NULL 
      OR c.target_categories = '{}' 
      OR _category_id = ANY(c.target_categories)
    )
  ORDER BY RANDOM()
  LIMIT 1;
$$;
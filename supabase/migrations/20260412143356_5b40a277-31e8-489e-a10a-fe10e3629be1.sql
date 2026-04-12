
-- Safe trigger creation
DROP TRIGGER IF EXISTS update_ad_campaigns_updated_at ON public.ad_campaigns;
CREATE TRIGGER update_ad_campaigns_updated_at BEFORE UPDATE ON public.ad_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_sponsored_posts_updated_at ON public.sponsored_posts;
CREATE TRIGGER update_sponsored_posts_updated_at BEFORE UPDATE ON public.sponsored_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Functions
CREATE OR REPLACE FUNCTION public.record_ad_impression(
  _campaign_id UUID, _sponsored_post_id UUID, _viewer_id UUID DEFAULT NULL, _category_id UUID DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE campaign_record RECORD;
BEGIN
  SELECT total_budget_cents, spent_cents, cost_per_impression_cents, status INTO campaign_record FROM public.ad_campaigns WHERE id = _campaign_id;
  IF campaign_record.status != 'active' THEN RETURN false; END IF;
  IF campaign_record.spent_cents >= campaign_record.total_budget_cents THEN
    UPDATE public.ad_campaigns SET status = 'completed' WHERE id = _campaign_id; RETURN false;
  END IF;
  INSERT INTO public.ad_impressions (campaign_id, sponsored_post_id, viewer_id, category_id) VALUES (_campaign_id, _sponsored_post_id, _viewer_id, _category_id);
  UPDATE public.ad_campaigns SET impressions_count = impressions_count + 1, spent_cents = spent_cents + cost_per_impression_cents WHERE id = _campaign_id;
  RETURN true;
END; $$;

CREATE OR REPLACE FUNCTION public.record_ad_click(
  _campaign_id UUID, _sponsored_post_id UUID, _viewer_id UUID DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.ad_clicks (campaign_id, sponsored_post_id, viewer_id) VALUES (_campaign_id, _sponsored_post_id, _viewer_id);
  UPDATE public.ad_campaigns SET clicks_count = clicks_count + 1 WHERE id = _campaign_id;
  RETURN true;
END; $$;

CREATE OR REPLACE FUNCTION public.get_sponsored_post_for_category(_category_id UUID DEFAULT NULL)
RETURNS TABLE (id UUID, campaign_id UUID, title TEXT, content TEXT, image_url TEXT, cta_text TEXT, cta_url TEXT, sponsor_name TEXT, sponsor_logo_url TEXT, tags TEXT[])
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT sp.id, sp.campaign_id, sp.title, sp.content, sp.image_url, sp.cta_text, sp.cta_url, sp.sponsor_name, sp.sponsor_logo_url, sp.tags
  FROM public.sponsored_posts sp JOIN public.ad_campaigns c ON c.id = sp.campaign_id
  WHERE c.status = 'active' AND sp.is_active = true AND c.spent_cents < c.total_budget_cents
    AND (c.start_date IS NULL OR c.start_date <= CURRENT_DATE)
    AND (c.end_date IS NULL OR c.end_date >= CURRENT_DATE)
    AND (_category_id IS NULL OR c.target_categories = '{}' OR _category_id = ANY(c.target_categories))
  ORDER BY RANDOM() LIMIT 1;
$$;

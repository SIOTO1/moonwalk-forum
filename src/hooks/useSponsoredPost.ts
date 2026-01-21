import { useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SponsoredPostData {
  id: string;
  campaign_id: string;
  title: string;
  content: string;
  sponsor_name: string;
  sponsor_logo_url?: string;
  image_url?: string;
  cta_text?: string;
  cta_url: string;
  tags?: string[];
}

export function useSponsoredPost(categoryId?: string | null) {
  const { user } = useAuth();
  const hasTrackedImpression = useRef(false);
  const currentPostId = useRef<string | null>(null);

  const { data: sponsoredPost, isLoading } = useQuery({
    queryKey: ['sponsored-post', categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_sponsored_post_for_category', {
          _category_id: categoryId || null
        });

      if (error) {
        console.error('Error fetching sponsored post:', error);
        return null;
      }

      // The function returns an array, get the first item
      if (!data || data.length === 0) return null;
      return data[0] as SponsoredPostData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Reset impression tracking when post changes
  useEffect(() => {
    if (sponsoredPost?.id !== currentPostId.current) {
      hasTrackedImpression.current = false;
      currentPostId.current = sponsoredPost?.id || null;
    }
  }, [sponsoredPost?.id]);

  // Track impression mutation
  const trackImpressionMutation = useMutation({
    mutationFn: async (post: SponsoredPostData) => {
      const { error } = await supabase.rpc('record_ad_impression', {
        _campaign_id: post.campaign_id,
        _sponsored_post_id: post.id,
        _viewer_id: user?.id || null,
        _category_id: null
      });

      if (error) {
        console.error('Error recording impression:', error);
        throw error;
      }
    },
  });

  // Track click mutation
  const trackClickMutation = useMutation({
    mutationFn: async (post: SponsoredPostData) => {
      const { error } = await supabase.rpc('record_ad_click', {
        _campaign_id: post.campaign_id,
        _sponsored_post_id: post.id,
        _viewer_id: user?.id || null
      });

      if (error) {
        console.error('Error recording click:', error);
        throw error;
      }
    },
  });

  // Track impression when post becomes visible
  const trackImpression = useCallback(() => {
    if (sponsoredPost && !hasTrackedImpression.current) {
      hasTrackedImpression.current = true;
      trackImpressionMutation.mutate(sponsoredPost);
    }
  }, [sponsoredPost, trackImpressionMutation]);

  // Track click
  const trackClick = useCallback(() => {
    if (sponsoredPost) {
      trackClickMutation.mutate(sponsoredPost);
    }
  }, [sponsoredPost, trackClickMutation]);

  return {
    sponsoredPost,
    isLoading,
    trackImpression,
    trackClick,
  };
}

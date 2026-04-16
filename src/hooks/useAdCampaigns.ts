import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type CampaignStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'active' | 'paused' | 'completed' | 'cancelled';

export interface AdCampaign {
  id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  daily_budget_cents: number;
  total_budget_cents: number;
  cost_per_impression_cents: number;
  spent_cents: number;
  impressions_count: number;
  clicks_count: number;
  status: CampaignStatus;
  target_categories: string[];
  start_date: string | null;
  end_date: string | null;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SponsoredPost {
  id: string;
  campaign_id: string;
  title: string;
  content: string;
  image_url: string | null;
  cta_text: string;
  cta_url: string;
  sponsor_name: string;
  sponsor_logo_url: string | null;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCampaignData {
  name: string;
  description?: string;
  daily_budget_cents: number;
  total_budget_cents: number;
  target_categories?: string[];
  start_date?: string;
  end_date?: string;
}

export interface CreateSponsoredPostData {
  campaign_id: string;
  title: string;
  content: string;
  image_url?: string;
  cta_text?: string;
  cta_url: string;
  sponsor_name: string;
  sponsor_logo_url?: string;
  tags?: string[];
}

export function useAdCampaigns() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const campaignsQuery = useQuery({
    queryKey: ['ad-campaigns', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('ad_campaigns')
        .select('*')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AdCampaign[];
    },
    enabled: !!user,
  });

  const createCampaign = useMutation({
    mutationFn: async (data: CreateCampaignData) => {
      if (!user) throw new Error('Must be logged in');

      const { data: campaign, error } = await supabase
        .from('ad_campaigns')
        .insert({
          vendor_id: user.id,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      return campaign as AdCampaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-campaigns'] });
      toast.success('Campaign created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create campaign: ' + error.message);
    },
  });

  const updateCampaign = useMutation({
    mutationFn: async ({ id, ...data }: Partial<AdCampaign> & { id: string }) => {
      const { data: campaign, error } = await supabase
        .from('ad_campaigns')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return campaign as AdCampaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-campaigns'] });
      toast.success('Campaign updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update campaign: ' + error.message);
    },
  });

  const submitForReview = useMutation({
    mutationFn: async (campaignId: string) => {
      const { data: campaign, error } = await supabase
        .from('ad_campaigns')
        .update({ status: 'pending_review' as CampaignStatus })
        .eq('id', campaignId)
        .select()
        .single();

      if (error) throw error;
      return campaign as AdCampaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-campaigns'] });
      toast.success('Campaign submitted for review');
    },
    onError: (error) => {
      toast.error('Failed to submit campaign: ' + error.message);
    },
  });

  return {
    campaigns: campaignsQuery.data ?? [],
    isLoading: campaignsQuery.isLoading,
    error: campaignsQuery.error,
    createCampaign,
    updateCampaign,
    submitForReview,
  };
}

export function useCampaign(campaignId: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['ad-campaign', campaignId, user?.id],
    queryFn: async () => {
      if (!campaignId || !user) return null;

      const { data, error } = await supabase
        .from('ad_campaigns')
        .select('*')
        .eq('id', campaignId)
        .eq('vendor_id', user.id)
        .single();

      if (error) throw error;
      return data as AdCampaign;
    },
    enabled: !!campaignId && !!user,
  });
}

export function useSponsoredPosts(campaignId: string | undefined) {
  const queryClient = useQueryClient();

  const postsQuery = useQuery({
    queryKey: ['sponsored-posts', campaignId],
    queryFn: async () => {
      if (!campaignId) return [];

      const { data, error } = await supabase
        .from('sponsored_posts')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SponsoredPost[];
    },
    enabled: !!campaignId,
  });

  const createPost = useMutation({
    mutationFn: async (data: CreateSponsoredPostData) => {
      const { data: post, error } = await supabase
        .from('sponsored_posts')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return post as SponsoredPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsored-posts', campaignId] });
      toast.success('Ad created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create ad: ' + error.message);
    },
  });

  const updatePost = useMutation({
    mutationFn: async ({ id, ...data }: Partial<SponsoredPost> & { id: string }) => {
      const { data: post, error } = await supabase
        .from('sponsored_posts')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return post as SponsoredPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsored-posts', campaignId] });
      toast.success('Ad updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update ad: ' + error.message);
    },
  });

  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('sponsored_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsored-posts', campaignId] });
      toast.success('Ad deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete ad: ' + error.message);
    },
  });

  return {
    posts: postsQuery.data ?? [],
    isLoading: postsQuery.isLoading,
    error: postsQuery.error,
    createPost,
    updatePost,
    deletePost,
  };
}

export function useCampaignAnalytics(campaignId: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['campaign-analytics', campaignId, user?.id],
    queryFn: async () => {
      if (!campaignId || !user) return null;

      // Verify the user owns this campaign before fetching analytics
      const { data: campaign, error: ownerError } = await supabase
        .from('ad_campaigns')
        .select('id')
        .eq('id', campaignId)
        .eq('vendor_id', user.id)
        .single();

      if (ownerError || !campaign) {
        throw new Error('Campaign not found or access denied');
      }

      // Get impressions over time
      const { data: impressions, error: impError } = await supabase
        .from('ad_impressions')
        .select('created_at')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: true });

      if (impError) throw impError;

      // Get clicks over time
      const { data: clicks, error: clickError } = await supabase
        .from('ad_clicks')
        .select('created_at')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: true });

      if (clickError) throw clickError;

      // Group by day
      const dailyStats: Record<string, { impressions: number; clicks: number }> = {};
      
      impressions?.forEach((imp) => {
        const date = new Date(imp.created_at).toISOString().split('T')[0];
        if (!dailyStats[date]) dailyStats[date] = { impressions: 0, clicks: 0 };
        dailyStats[date].impressions++;
      });

      clicks?.forEach((click) => {
        const date = new Date(click.created_at).toISOString().split('T')[0];
        if (!dailyStats[date]) dailyStats[date] = { impressions: 0, clicks: 0 };
        dailyStats[date].clicks++;
      });

      const chartData = Object.entries(dailyStats)
        .map(([date, stats]) => ({
          date,
          impressions: stats.impressions,
          clicks: stats.clicks,
          ctr: stats.impressions > 0 ? (stats.clicks / stats.impressions * 100).toFixed(2) : '0',
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        totalImpressions: impressions?.length ?? 0,
        totalClicks: clicks?.length ?? 0,
        ctr: impressions && impressions.length > 0 
          ? ((clicks?.length ?? 0) / impressions.length * 100).toFixed(2)
          : '0',
        chartData,
      };
    },
    enabled: !!campaignId && !!user,
  });
}

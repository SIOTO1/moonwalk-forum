import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/forum/Header';
import { Footer } from '@/components/forum/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  ArrowLeft,
  AlertCircle,
  DollarSign,
  Target,
  ExternalLink,
  Play
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { AdCampaign, CampaignStatus, SponsoredPost } from '@/hooks/useAdCampaigns';

export default function AdminAdReview() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCampaign, setSelectedCampaign] = useState<AdCampaign | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const { data: pendingCampaigns, isLoading: loadingPending } = useQuery({
    queryKey: ['admin-campaigns', 'pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .select('*')
        .eq('status', 'pending_review')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as AdCampaign[];
    },
    enabled: isAdmin,
  });

  const { data: allCampaigns, isLoading: loadingAll } = useQuery({
    queryKey: ['admin-campaigns', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as AdCampaign[];
    },
    enabled: isAdmin,
  });

  const { data: campaignPosts } = useQuery({
    queryKey: ['admin-campaign-posts', selectedCampaign?.id],
    queryFn: async () => {
      if (!selectedCampaign) return [];
      const { data, error } = await supabase
        .from('sponsored_posts')
        .select('*')
        .eq('campaign_id', selectedCampaign.id);

      if (error) throw error;
      return data as SponsoredPost[];
    },
    enabled: !!selectedCampaign,
  });

  const approveCampaign = useMutation({
    mutationFn: async (campaignId: string) => {
      const { error } = await supabase
        .from('ad_campaigns')
        .update({ 
          status: 'approved' as CampaignStatus,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', campaignId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      setSelectedCampaign(null);
      toast.success('Campaign approved');
    },
    onError: (error) => {
      toast.error('Failed to approve: ' + error.message);
    },
  });

  const rejectCampaign = useMutation({
    mutationFn: async ({ campaignId, reason }: { campaignId: string; reason: string }) => {
      const { error } = await supabase
        .from('ad_campaigns')
        .update({ 
          status: 'rejected' as CampaignStatus,
          rejection_reason: reason,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', campaignId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      setSelectedCampaign(null);
      setShowRejectDialog(false);
      setRejectionReason('');
      toast.success('Campaign rejected');
    },
    onError: (error) => {
      toast.error('Failed to reject: ' + error.message);
    },
  });

  const activateCampaign = useMutation({
    mutationFn: async (campaignId: string) => {
      const { error } = await supabase
        .from('ad_campaigns')
        .update({ status: 'active' as CampaignStatus })
        .eq('id', campaignId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      toast.success('Campaign activated');
    },
    onError: (error) => {
      toast.error('Failed to activate: ' + error.message);
    },
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">You don't have permission to access this page.</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/moderation')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Ad Campaign Review</h1>
            <p className="text-muted-foreground">Review and approve vendor advertising campaigns</p>
          </div>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              Pending Review
              {pendingCampaigns && pendingCampaigns.length > 0 && (
                <Badge variant="destructive" className="ml-1">{pendingCampaigns.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">All Campaigns</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {loadingPending ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 bg-muted rounded w-1/3 mb-2" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : pendingCampaigns?.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-12 w-12 text-accent mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                  <p className="text-muted-foreground">No campaigns pending review</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingCampaigns?.map(campaign => (
                  <Card key={campaign.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold">{campaign.name}</h3>
                          {campaign.description && (
                            <p className="text-sm text-muted-foreground">{campaign.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              ${(campaign.total_budget_cents / 100).toFixed(2)} budget
                            </span>
                            <span>Submitted {format(new Date(campaign.created_at), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedCampaign(campaign)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => approveCampaign.mutate(campaign.id)}
                            disabled={approveCampaign.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => {
                              setSelectedCampaign(campaign);
                              setShowRejectDialog(true);
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all">
            {loadingAll ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 bg-muted rounded w-1/3 mb-2" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {allCampaigns?.map(campaign => (
                  <Card key={campaign.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{campaign.name}</h3>
                            <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                              {campaign.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>${(campaign.spent_cents / 100).toFixed(2)} / ${(campaign.total_budget_cents / 100).toFixed(2)}</span>
                            <span>{campaign.impressions_count.toLocaleString()} impressions</span>
                            <span>{campaign.clicks_count.toLocaleString()} clicks</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedCampaign(campaign)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          {campaign.status === 'approved' && (
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => activateCampaign.mutate(campaign.id)}
                              disabled={activateCampaign.isPending}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Activate
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Campaign Detail Dialog */}
        <Dialog open={!!selectedCampaign && !showRejectDialog} onOpenChange={() => setSelectedCampaign(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedCampaign?.name}</DialogTitle>
              <DialogDescription>Campaign details and ad creatives</DialogDescription>
            </DialogHeader>
            {selectedCampaign && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="text-lg font-semibold">
                      ${(selectedCampaign.total_budget_cents / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${(selectedCampaign.daily_budget_cents / 100).toFixed(2)}/day limit
                    </p>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Targeting</p>
                    <p className="text-lg font-semibold">
                      {selectedCampaign.target_categories.length === 0 
                        ? 'All Categories' 
                        : `${selectedCampaign.target_categories.length} categories`}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Ad Creatives ({campaignPosts?.length || 0})</h4>
                  <div className="space-y-4">
                    {campaignPosts?.map(ad => (
                      <div key={ad.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center gap-3">
                          {ad.sponsor_logo_url && (
                            <img 
                              src={ad.sponsor_logo_url} 
                              alt={ad.sponsor_name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium">{ad.title}</p>
                            <p className="text-sm text-muted-foreground">by {ad.sponsor_name}</p>
                          </div>
                        </div>
                        <p className="text-sm">{ad.content}</p>
                        {ad.image_url && (
                          <img 
                            src={ad.image_url} 
                            alt={ad.title}
                            className="w-full max-h-48 object-cover rounded-lg"
                          />
                        )}
                        <a 
                          href={ad.cta_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-accent hover:underline flex items-center gap-1"
                        >
                          {ad.cta_url}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedCampaign.status === 'pending_review' && (
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button 
                      variant="destructive"
                      onClick={() => setShowRejectDialog(true)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button 
                      onClick={() => approveCampaign.mutate(selectedCampaign.id)}
                      disabled={approveCampaign.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Campaign</DialogTitle>
              <DialogDescription>
                Provide a reason for rejecting "{selectedCampaign?.name}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Explain why this campaign is being rejected..."
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    if (selectedCampaign) {
                      rejectCampaign.mutate({ 
                        campaignId: selectedCampaign.id, 
                        reason: rejectionReason 
                      });
                    }
                  }}
                  disabled={!rejectionReason.trim() || rejectCampaign.isPending}
                >
                  Reject Campaign
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
}

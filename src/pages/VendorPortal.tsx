import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdCampaigns, CampaignStatus } from '@/hooks/useAdCampaigns';
import { Header } from '@/components/forum/Header';
import { Footer } from '@/components/forum/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Eye, 
  MousePointer,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Pause,
  Play
} from 'lucide-react';
import { format } from 'date-fns';
import { AuthModal } from '@/components/auth/AuthModal';

const statusConfig: Record<CampaignStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  draft: { label: 'Draft', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
  pending_review: { label: 'Pending Review', variant: 'outline', icon: <AlertCircle className="h-3 w-3" /> },
  approved: { label: 'Approved', variant: 'default', icon: <CheckCircle className="h-3 w-3" /> },
  rejected: { label: 'Rejected', variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
  active: { label: 'Active', variant: 'default', icon: <Play className="h-3 w-3" /> },
  paused: { label: 'Paused', variant: 'secondary', icon: <Pause className="h-3 w-3" /> },
  completed: { label: 'Completed', variant: 'outline', icon: <CheckCircle className="h-3 w-3" /> },
  cancelled: { label: 'Cancelled', variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
};

export default function VendorPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { campaigns, isLoading } = useAdCampaigns();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent_cents, 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions_count, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks_count, 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-2xl">Vendor Ad Portal</CardTitle>
              <CardDescription>
                Create and manage sponsored content to reach our community
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4 text-left">
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <Eye className="h-8 w-8 text-accent mb-2" />
                  <h3 className="font-semibold">Pay Per Impression</h3>
                  <p className="text-sm text-muted-foreground">Only pay when your ad is seen</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-accent mb-2" />
                  <h3 className="font-semibold">Category Targeting</h3>
                  <p className="text-sm text-muted-foreground">Reach the right audience</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <BarChart3 className="h-8 w-8 text-accent mb-2" />
                  <h3 className="font-semibold">Real-time Analytics</h3>
                  <p className="text-sm text-muted-foreground">Track performance live</p>
                </div>
              </div>
              <Button onClick={() => setShowAuthModal(true)} size="lg">
                Sign in to Get Started
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Vendor Portal</h1>
            <p className="text-muted-foreground">Manage your advertising campaigns</p>
          </div>
          <Button onClick={() => navigate('/vendor/campaigns/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Play className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Campaigns</p>
                  <p className="text-2xl font-bold">{activeCampaigns.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">${(totalSpent / 100).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Eye className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Impressions</p>
                  <p className="text-2xl font-bold">{totalImpressions.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <MousePointer className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Clicks</p>
                  <p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns List */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Campaigns</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pending">Pending Review</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <CampaignList campaigns={campaigns} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="active" className="space-y-4">
            <CampaignList campaigns={campaigns.filter(c => c.status === 'active')} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="pending" className="space-y-4">
            <CampaignList campaigns={campaigns.filter(c => c.status === 'pending_review')} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="draft" className="space-y-4">
            <CampaignList campaigns={campaigns.filter(c => c.status === 'draft')} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}

function CampaignList({ campaigns, isLoading }: { campaigns: ReturnType<typeof useAdCampaigns>['campaigns']; isLoading: boolean }) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
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
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
          <p className="text-muted-foreground mb-4">Create your first campaign to start advertising</p>
          <Button onClick={() => navigate('/vendor/campaigns/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {campaigns.map(campaign => {
        const status = statusConfig[campaign.status];
        const budgetUsed = (campaign.spent_cents / campaign.total_budget_cents) * 100;

        return (
          <Card 
            key={campaign.id} 
            className="cursor-pointer hover:border-accent/30 transition-colors"
            onClick={() => navigate(`/vendor/campaigns/${campaign.id}`)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{campaign.name}</h3>
                    <Badge variant={status.variant} className="flex items-center gap-1">
                      {status.icon}
                      {status.label}
                    </Badge>
                  </div>
                  {campaign.description && (
                    <p className="text-sm text-muted-foreground">{campaign.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Created {format(new Date(campaign.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-medium">
                    ${(campaign.spent_cents / 100).toFixed(2)} / ${(campaign.total_budget_cents / 100).toFixed(2)}
                  </p>
                  <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent transition-all"
                      style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {campaign.impressions_count.toLocaleString()} impressions
                  </p>
                </div>
              </div>
              {campaign.rejection_reason && campaign.status === 'rejected' && (
                <div className="mt-4 p-3 bg-destructive/10 rounded-lg">
                  <p className="text-sm text-destructive">
                    <strong>Rejection reason:</strong> {campaign.rejection_reason}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

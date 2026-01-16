import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdCampaigns, useCampaign, useSponsoredPosts, CreateCampaignData, CreateSponsoredPostData } from '@/hooks/useAdCampaigns';
import { useCategories, Category } from '@/hooks/useCategories';
import { Header } from '@/components/forum/Header';
import { Footer } from '@/components/forum/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Plus, 
  Trash2,
  DollarSign,
  Calendar,
  Target,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

export default function CampaignEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createCampaign, updateCampaign, submitForReview } = useAdCampaigns();
  const { data: existingCampaign, isLoading: loadingCampaign } = useCampaign(isNew ? undefined : id);
  const { posts, createPost, updatePost, deletePost } = useSponsoredPosts(isNew ? undefined : id);
  const { data: categories = [] } = useCategories();

  const [formData, setFormData] = useState<CreateCampaignData>({
    name: '',
    description: '',
    daily_budget_cents: 1000,
    total_budget_cents: 10000,
    target_categories: [],
    start_date: '',
    end_date: '',
  });

  const [showAdDialog, setShowAdDialog] = useState(false);
  const [editingAd, setEditingAd] = useState<string | null>(null);
  const [adFormData, setAdFormData] = useState<CreateSponsoredPostData>({
    campaign_id: '',
    title: '',
    content: '',
    image_url: '',
    cta_text: 'Learn More',
    cta_url: '',
    sponsor_name: '',
    sponsor_logo_url: '',
    tags: [],
  });

  useEffect(() => {
    if (existingCampaign) {
      setFormData({
        name: existingCampaign.name,
        description: existingCampaign.description || '',
        daily_budget_cents: existingCampaign.daily_budget_cents,
        total_budget_cents: existingCampaign.total_budget_cents,
        target_categories: existingCampaign.target_categories || [],
        start_date: existingCampaign.start_date || '',
        end_date: existingCampaign.end_date || '',
      });
    }
  }, [existingCampaign]);

  if (!user) {
    navigate('/vendor');
    return null;
  }

  const handleSave = async () => {
    if (isNew) {
      const result = await createCampaign.mutateAsync(formData);
      navigate(`/vendor/campaigns/${result.id}`);
    } else if (id) {
      await updateCampaign.mutateAsync({ id, ...formData });
    }
  };

  const handleSubmitForReview = async () => {
    if (id && !isNew) {
      await submitForReview.mutateAsync(id);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      target_categories: prev.target_categories?.includes(categoryId)
        ? prev.target_categories.filter(c => c !== categoryId)
        : [...(prev.target_categories || []), categoryId]
    }));
  };

  const handleSaveAd = async () => {
    if (!id || isNew) return;

    if (editingAd) {
      await updatePost.mutateAsync({ id: editingAd, ...adFormData });
    } else {
      await createPost.mutateAsync({ ...adFormData, campaign_id: id });
    }
    setShowAdDialog(false);
    resetAdForm();
  };

  const handleEditAd = (ad: typeof posts[0]) => {
    setEditingAd(ad.id);
    setAdFormData({
      campaign_id: ad.campaign_id,
      title: ad.title,
      content: ad.content,
      image_url: ad.image_url || '',
      cta_text: ad.cta_text,
      cta_url: ad.cta_url,
      sponsor_name: ad.sponsor_name,
      sponsor_logo_url: ad.sponsor_logo_url || '',
      tags: ad.tags || [],
    });
    setShowAdDialog(true);
  };

  const handleDeleteAd = async (adId: string) => {
    if (confirm('Are you sure you want to delete this ad?')) {
      await deletePost.mutateAsync(adId);
    }
  };

  const resetAdForm = () => {
    setEditingAd(null);
    setAdFormData({
      campaign_id: id || '',
      title: '',
      content: '',
      image_url: '',
      cta_text: 'Learn More',
      cta_url: '',
      sponsor_name: '',
      sponsor_logo_url: '',
      tags: [],
    });
  };

  const canEdit = isNew || existingCampaign?.status === 'draft' || existingCampaign?.status === 'rejected';
  const canSubmit = !isNew && existingCampaign?.status === 'draft' && posts.length > 0;

  if (loadingCampaign && !isNew) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/vendor')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {isNew ? 'Create Campaign' : formData.name || 'Edit Campaign'}
            </h1>
            {existingCampaign && (
              <p className="text-sm text-muted-foreground">
                Status: {existingCampaign.status}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {canEdit && (
              <Button 
                onClick={handleSave} 
                disabled={createCampaign.isPending || updateCampaign.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {isNew ? 'Create' : 'Save'}
              </Button>
            )}
            {canSubmit && (
              <Button 
                variant="default"
                onClick={handleSubmitForReview}
                disabled={submitForReview.isPending}
              >
                <Send className="h-4 w-4 mr-2" />
                Submit for Review
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Campaign Details</TabsTrigger>
            <TabsTrigger value="targeting">Targeting</TabsTrigger>
            <TabsTrigger value="ads" disabled={isNew}>Ads</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Campaign Details
                </CardTitle>
                <CardDescription>
                  Set up your campaign name, description, and budget
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Summer Product Launch"
                    disabled={!canEdit}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of your campaign goals..."
                    disabled={!canEdit}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="daily_budget">Daily Budget ($)</Label>
                    <Input
                      id="daily_budget"
                      type="number"
                      min="1"
                      step="1"
                      value={formData.daily_budget_cents / 100}
                      onChange={e => setFormData(prev => ({ 
                        ...prev, 
                        daily_budget_cents: Math.round(parseFloat(e.target.value) * 100) 
                      }))}
                      disabled={!canEdit}
                    />
                    <p className="text-xs text-muted-foreground">Maximum spend per day</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="total_budget">Total Budget ($) *</Label>
                    <Input
                      id="total_budget"
                      type="number"
                      min="10"
                      step="1"
                      value={formData.total_budget_cents / 100}
                      onChange={e => setFormData(prev => ({ 
                        ...prev, 
                        total_budget_cents: Math.round(parseFloat(e.target.value) * 100) 
                      }))}
                      disabled={!canEdit}
                    />
                    <p className="text-xs text-muted-foreground">Campaign ends when budget is spent</p>
                  </div>
                </div>

                <div className="p-4 bg-secondary/30 rounded-lg">
                  <p className="text-sm">
                    <strong>Cost:</strong> $0.01 per impression
                  </p>
                  <p className="text-sm text-muted-foreground">
                    With a ${(formData.total_budget_cents / 100).toFixed(0)} budget, you'll get approximately{' '}
                    <strong>{formData.total_budget_cents.toLocaleString()}</strong> impressions.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Start Date (optional)
                    </Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={e => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      disabled={!canEdit}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      End Date (optional)
                    </Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={e => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                      disabled={!canEdit}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="targeting">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Category Targeting
                </CardTitle>
                <CardDescription>
                  Choose which forum categories your ads will appear in. Leave empty to show in all categories.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {categories.filter(c => !c.is_private).map(category => (
                    <label
                      key={category.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.target_categories?.includes(category.id)
                          ? 'border-accent bg-accent/5'
                          : 'border-border hover:border-accent/50'
                      } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Checkbox
                        checked={formData.target_categories?.includes(category.id)}
                        onCheckedChange={() => canEdit && handleCategoryToggle(category.id)}
                        disabled={!canEdit}
                      />
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-xs text-muted-foreground">{category.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {formData.target_categories?.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-4">
                    No categories selected — ads will appear in all public categories.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ads">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      Ad Creatives
                    </CardTitle>
                    <CardDescription>
                      Create the ads that will be displayed in the feed
                    </CardDescription>
                  </div>
                  {canEdit && (
                    <Dialog open={showAdDialog} onOpenChange={setShowAdDialog}>
                      <DialogTrigger asChild>
                        <Button onClick={resetAdForm}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Ad
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{editingAd ? 'Edit Ad' : 'Create Ad'}</DialogTitle>
                          <DialogDescription>
                            Design your sponsored post that will appear in the feed
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="sponsor_name">Sponsor Name *</Label>
                              <Input
                                id="sponsor_name"
                                value={adFormData.sponsor_name}
                                onChange={e => setAdFormData(prev => ({ ...prev, sponsor_name: e.target.value }))}
                                placeholder="Your Company Name"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="sponsor_logo">Sponsor Logo URL</Label>
                              <Input
                                id="sponsor_logo"
                                value={adFormData.sponsor_logo_url}
                                onChange={e => setAdFormData(prev => ({ ...prev, sponsor_logo_url: e.target.value }))}
                                placeholder="https://..."
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="ad_title">Ad Title *</Label>
                            <Input
                              id="ad_title"
                              value={adFormData.title}
                              onChange={e => setAdFormData(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Catchy headline for your ad"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="ad_content">Ad Content *</Label>
                            <Textarea
                              id="ad_content"
                              value={adFormData.content}
                              onChange={e => setAdFormData(prev => ({ ...prev, content: e.target.value }))}
                              placeholder="Describe your product or service..."
                              rows={4}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="ad_image">Image URL</Label>
                            <Input
                              id="ad_image"
                              value={adFormData.image_url}
                              onChange={e => setAdFormData(prev => ({ ...prev, image_url: e.target.value }))}
                              placeholder="https://..."
                            />
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="cta_text">Button Text</Label>
                              <Input
                                id="cta_text"
                                value={adFormData.cta_text}
                                onChange={e => setAdFormData(prev => ({ ...prev, cta_text: e.target.value }))}
                                placeholder="Learn More"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cta_url">Button URL *</Label>
                              <Input
                                id="cta_url"
                                value={adFormData.cta_url}
                                onChange={e => setAdFormData(prev => ({ ...prev, cta_url: e.target.value }))}
                                placeholder="https://yoursite.com/landing"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="ad_tags">Tags (comma-separated)</Label>
                            <Input
                              id="ad_tags"
                              value={adFormData.tags?.join(', ')}
                              onChange={e => setAdFormData(prev => ({ 
                                ...prev, 
                                tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                              }))}
                              placeholder="product, sale, featured"
                            />
                          </div>

                          <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setShowAdDialog(false)}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleSaveAd}
                              disabled={!adFormData.title || !adFormData.content || !adFormData.cta_url || !adFormData.sponsor_name}
                            >
                              {editingAd ? 'Update' : 'Create'} Ad
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {posts.length === 0 ? (
                  <div className="text-center py-12">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No ads yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Add at least one ad before submitting for review
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map(ad => (
                      <div 
                        key={ad.id}
                        className="p-4 border rounded-lg space-y-3"
                      >
                        <div className="flex items-start justify-between">
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
                          {canEdit && (
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditAd(ad)}>
                                Edit
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-destructive"
                                onClick={() => handleDeleteAd(ad.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <p className="text-sm">{ad.content}</p>
                        {ad.image_url && (
                          <img 
                            src={ad.image_url} 
                            alt={ad.title}
                            className="w-full max-h-48 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{ad.cta_text}</Badge>
                          <a 
                            href={ad.cta_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-accent hover:underline flex items-center gap-1"
                          >
                            {ad.cta_url}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        {ad.tags && ad.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {ad.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}

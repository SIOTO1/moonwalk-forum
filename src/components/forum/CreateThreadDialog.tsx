import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCategories } from '@/hooks/useCategories';
import { useCreatePost } from '@/hooks/usePosts';
import { useContentModeration } from '@/hooks/useContentModeration';
import { useRateLimit } from '@/hooks/useRateLimit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MentionAutocomplete } from './MentionAutocomplete';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ContentViolationWarning } from '@/components/moderation/ContentViolationWarning';
import { ThreadImageUpload } from './ThreadImageUpload';
import { Plus, X, Lock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface CreateThreadDialogProps {
  defaultCategorySlug?: string | null;
}

export function CreateThreadDialog({ defaultCategorySlug }: CreateThreadDialogProps) {
  const { user, canPost, canAccessPremium, profile } = useAuth();
  const { data: categories = [] } = useCategories();
  const createPost = useCreatePost();
  const { validateContent, checkOnly, isChecking } = useContentModeration();
  const { checkRateLimit, trackActivity } = useRateLimit();
  
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  
  // Content moderation states
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [violationData, setViolationData] = useState<{
    violationType: string;
    message: string;
    strikeNumber: number;
    restrictionType: 'warning' | 'temp_restriction' | 'suspension';
  } | null>(null);
  const [contentWarning, setContentWarning] = useState<string | null>(null);

  // Filter accessible categories
  const accessibleCategories = categories.filter(cat => {
    if (!cat.is_private) return true;
    if (!profile) return false;
    if (cat.required_tier === 'pro') {
      return profile.membership_tier === 'pro' || profile.membership_tier === 'elite';
    }
    if (cat.required_tier === 'elite') {
      return profile.membership_tier === 'elite';
    }
    return canAccessPremium;
  });

  // Set default category when available
  const defaultCategory = defaultCategorySlug 
    ? accessibleCategories.find(c => c.slug === defaultCategorySlug)
    : null;

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  // Real-time content check for warnings
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    const check = checkOnly(newContent);
    if (check.isViolation) {
      setContentWarning(check.message);
    } else {
      setContentWarning(null);
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    const check = checkOnly(newTitle);
    if (check.isViolation) {
      setContentWarning(check.message);
    } else if (!checkOnly(content).isViolation) {
      setContentWarning(null);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !categoryId) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check rate limit first
    const rateLimitResult = await checkRateLimit('post');
    if (!rateLimitResult.allowed) {
      toast.error(rateLimitResult.message || 'Rate limit exceeded. Please wait before posting again.');
      return;
    }

    // Validate content before submission
    const fullContent = `${title} ${content}`;
    const result = await validateContent(fullContent);

    if (!result.allowed) {
      setViolationData({
        violationType: result.violationType || 'other',
        message: result.message,
        strikeNumber: result.strikeNumber || 1,
        restrictionType: result.restrictionType || 'warning',
      });
      setShowViolationWarning(true);
      return;
    }

    try {
      await createPost.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        category_id: categoryId,
        tags,
        images,
      });
      
      // Track successful post creation for rate limiting
      await trackActivity('post');
      
      toast.success('Thread created successfully!');
      setOpen(false);
      setTitle('');
      setContent('');
      setCategoryId('');
      setTags([]);
      setImages([]);
      setContentWarning(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create thread');
    }
  };

  if (!user || !canPost) {
    return (
      <Button disabled className="gap-2">
        <Plus className="w-4 h-4" />
        New Thread
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 gradient-accent text-accent-foreground">
          <Plus className="w-4 h-4" />
          New Thread
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="font-display">Create New Thread</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select 
              value={categoryId} 
              onValueChange={setCategoryId}
              defaultValue={defaultCategory?.id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {accessibleCategories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      {cat.name}
                      {cat.is_private && <Lock className="w-3 h-3 text-muted-foreground" />}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="What's your question or topic?"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground text-right">
              {title.length}/200
            </p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Body *</Label>
            <MentionAutocomplete
              value={content}
              onChange={handleContentChange}
              placeholder="Provide details, context, or ask your question... Use @ to mention users"
              className="min-h-[150px]"
              minHeight="150px"
            />
          </div>

          {/* Content Warning */}
          {contentWarning && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-amber-700 dark:text-amber-400">{contentWarning}</p>
            </div>
          )}

          {/* Images */}
          {user && (
            <div className="space-y-2">
              <Label>Images (optional)</Label>
              <ThreadImageUpload
                images={images}
                onImagesChange={setImages}
                userId={user.id}
                maxImages={4}
              />
            </div>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tags..."
                disabled={tags.length >= 5}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddTag}
                disabled={tags.length >= 5}
              >
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <span 
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm"
                  >
                    #{tag}
                    <button 
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Up to 5 tags, letters and numbers only
            </p>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createPost.isPending || isChecking || !title.trim() || !content.trim() || !categoryId || !!contentWarning}
              className="bg-primary text-primary-foreground"
            >
              {createPost.isPending || isChecking ? 'Creating...' : 'Create Thread'}
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Violation Warning Modal */}
      {violationData && (
        <ContentViolationWarning
          isOpen={showViolationWarning}
          onClose={() => setShowViolationWarning(false)}
          violationType={violationData.violationType}
          message={violationData.message}
          strikeNumber={violationData.strikeNumber}
          restrictionType={violationData.restrictionType}
        />
      )}
    </Dialog>
  );
}

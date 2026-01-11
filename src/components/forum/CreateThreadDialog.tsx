import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCategories } from '@/hooks/useCategories';
import { useCreatePost } from '@/hooks/usePosts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { Plus, X, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface CreateThreadDialogProps {
  defaultCategorySlug?: string | null;
}

export function CreateThreadDialog({ defaultCategorySlug }: CreateThreadDialogProps) {
  const { user, canPost, canAccessPremium, profile } = useAuth();
  const { data: categories = [] } = useCategories();
  const createPost = useCreatePost();
  
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

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

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !categoryId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createPost.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        category_id: categoryId,
        tags,
      });
      
      toast.success('Thread created successfully!');
      setOpen(false);
      setTitle('');
      setContent('');
      setCategoryId('');
      setTags([]);
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
              onChange={(e) => setTitle(e.target.value)}
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
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide details, context, or ask your question..."
              className="min-h-[150px]"
            />
          </div>

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
              disabled={createPost.isPending || !title.trim() || !content.trim() || !categoryId}
              className="gradient-accent text-accent-foreground"
            >
              {createPost.isPending ? 'Creating...' : 'Create Thread'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

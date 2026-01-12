import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Share2, Twitter, Facebook, Linkedin, Link2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface SocialShareButtonsProps {
  url: string;
  title: string;
  description?: string;
}

export function SocialShareButtons({ url, title, description }: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || '');

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <Share2 className="w-4 h-4 mr-1" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleShare('twitter')} className="cursor-pointer">
          <Twitter className="w-4 h-4 mr-2" />
          Share on X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('facebook')} className="cursor-pointer">
          <Facebook className="w-4 h-4 mr-2" />
          Share on Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('linkedin')} className="cursor-pointer">
          <Linkedin className="w-4 h-4 mr-2" />
          Share on LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4 mr-2" />
              Copy link
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

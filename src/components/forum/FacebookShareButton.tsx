import { Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FacebookShareButtonProps {
  url: string;
  title: string;
  variant?: 'prominent' | 'compact';
  className?: string;
}

export function FacebookShareButton({
  url,
  title,
  variant = 'prominent',
  className = '',
}: FacebookShareButtonProps) {
  const handleShareToFacebook = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(`Check out this discussion on the Moonwalk Forum: "${title}"`)}`;
    
    const popup = window.open(
      shareUrl,
      'facebook-share',
      'width=626,height=436,left=100,top=100'
    );

    if (popup) {
      toast.success('Share window opened! Post the link to your Facebook Group.');
    } else {
      // Fallback if popup blocked
      window.location.href = shareUrl;
    }
  };

  if (variant === 'compact') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShareToFacebook}
        className={`gap-1.5 text-muted-foreground hover:text-[#1877F2] ${className}`}
        title="Share to Facebook Group"
      >
        <Facebook className="w-4 h-4" />
        Share to Facebook
      </Button>
    );
  }

  return (
    <Button
      onClick={handleShareToFacebook}
      className={`gap-2 bg-[#1877F2] hover:bg-[#166FE5] text-white shadow-sm ${className}`}
      size="sm"
    >
      <Facebook className="w-4 h-4" />
      Share to Facebook Group
    </Button>
  );
}

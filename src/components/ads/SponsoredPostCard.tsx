import { ExternalLink, Megaphone, Eye } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export interface SponsoredPost {
  id: string;
  title: string;
  content: string;
  sponsorName: string;
  sponsorLogo?: string;
  sponsorTagline?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaUrl: string;
  tags?: string[];
  impressions?: number;
}

interface SponsoredPostCardProps {
  post: SponsoredPost;
  className?: string;
}

// Default placeholder sponsored post
export const placeholderSponsoredPost: SponsoredPost = {
  id: 'sponsored-placeholder',
  title: 'Reach the Moonwalk Community',
  content: 'Promote your space-related products and services to thousands of engaged astronauts and space enthusiasts. Our sponsored posts blend seamlessly with organic content while clearly identifying your brand.',
  sponsorName: 'Advertise with Us',
  sponsorTagline: 'Premium ad placement',
  ctaText: 'Learn More',
  ctaUrl: 'mailto:ads@moonwalk.forum',
  tags: ['advertising', 'sponsored'],
};

// Sample sponsored post for demonstration
export const sampleSponsoredPost: SponsoredPost = {
  id: 'sponsored-sample',
  title: 'Introducing the Next-Gen EVA Suit: SpaceSuit Pro X1',
  content: 'Experience unprecedented mobility and safety with our revolutionary EVA suit technology. Designed by astronauts, for astronauts. Now available for pre-order with exclusive Moonwalk member discounts.',
  sponsorName: 'SpaceTech Industries',
  sponsorTagline: 'Innovation Beyond Earth',
  imageUrl: '/placeholder.svg',
  ctaText: 'Pre-Order Now',
  ctaUrl: 'https://example.com/spacesuit',
  tags: ['equipment', 'eva', 'safety'],
  impressions: 12500,
};

export function SponsoredPostCard({ post, className }: SponsoredPostCardProps) {
  const isPlaceholder = post.id === 'sponsored-placeholder';

  return (
    <article 
      className={cn(
        "forum-card p-4 animate-fade-in relative",
        isPlaceholder && "border-dashed",
        className
      )}
    >
      {/* Sponsored Label */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/80 backdrop-blur-sm">
        <Megaphone className="w-3 h-3 text-muted-foreground" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Sponsored
        </span>
      </div>

      <div className="flex gap-4">
        {/* Sponsor Avatar Column (matching PostCard vote column) */}
        <div className="hidden sm:flex flex-col items-center gap-2 pt-1">
          <Avatar className="w-10 h-10 ring-2 ring-primary/20">
            <AvatarImage src={post.sponsorLogo} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {post.sponsorName.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <span className="text-[10px] text-muted-foreground font-medium text-center leading-tight max-w-[48px]">
            AD
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header with sponsor info */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
              <Megaphone className="w-3 h-3" />
              Promoted
            </span>
            {post.sponsorTagline && (
              <span className="text-xs text-muted-foreground">
                {post.sponsorTagline}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className={cn(
            "font-display font-semibold text-lg mb-2 line-clamp-2",
            isPlaceholder ? "text-muted-foreground" : "text-foreground"
          )}>
            {post.title}
          </h3>

          {/* Image (if provided) */}
          {post.imageUrl && (
            <a 
              href={post.ctaUrl} 
              target="_blank" 
              rel="noopener noreferrer sponsored"
              className="block mb-3"
            >
              <img 
                src={post.imageUrl} 
                alt={post.title}
                className="w-full h-40 object-cover rounded-lg hover:opacity-90 transition-opacity"
              />
            </a>
          )}

          {/* Content Preview */}
          <p className={cn(
            "text-sm line-clamp-2 mb-3",
            isPlaceholder ? "text-muted-foreground/70" : "text-muted-foreground"
          )}>
            {post.content}
          </p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.tags.map(tag => (
                <span 
                  key={tag}
                  className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer with CTA */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {/* Mobile sponsor avatar */}
              <div className="sm:hidden flex items-center gap-2">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={post.sponsorLogo} />
                  <AvatarFallback className="text-[8px]">
                    {post.sponsorName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <span className="font-medium text-foreground">
                {post.sponsorName}
              </span>
              {post.impressions && (
                <span className="flex items-center gap-1 text-xs">
                  <Eye className="w-3 h-3" />
                  {post.impressions.toLocaleString()}
                </span>
              )}
            </div>

            {/* CTA Button */}
            <a
              href={post.ctaUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                isPlaceholder 
                  ? "bg-muted text-muted-foreground hover:bg-muted/80"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {post.ctaText || 'Learn More'}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom attribution */}
      <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          Why am I seeing this? · Ad by {post.sponsorName}
        </span>
        <button className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
          Hide this ad
        </button>
      </div>
    </article>
  );
}

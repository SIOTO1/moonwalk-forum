import { ExternalLink, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AdSlot {
  id: string;
  type: 'vendor' | 'external' | 'placeholder';
  title?: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  sponsorName?: string;
}

interface SidebarAdBannerProps {
  slot?: AdSlot;
  className?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

// Default placeholder ad for when no real ad is configured
const defaultPlaceholder: AdSlot = {
  id: 'placeholder-1',
  type: 'placeholder',
  title: 'Your Ad Here',
  description: 'Reach thousands of space enthusiasts. Contact us to advertise.',
  sponsorName: 'Advertise with Moonwalk',
};

export function SidebarAdBanner({ 
  slot = defaultPlaceholder, 
  className,
  onClose,
  showCloseButton = false,
}: SidebarAdBannerProps) {
  const [isDismissed, setDismissed] = useState(false);

  if (isDismissed) return null;

  const handleClose = () => {
    setDismissed(true);
    onClose?.();
  };

  const isPlaceholder = slot.type === 'placeholder';

  return (
    <div className={cn(
      "rounded-lg border bg-card overflow-hidden",
      isPlaceholder && "border-dashed border-muted-foreground/30",
      className
    )}>
      {/* Ad Label - Required for transparency */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/50 border-b">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {slot.type === 'vendor' ? 'Sponsored' : 'Advertisement'}
        </span>
        {showCloseButton && (
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss ad"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Ad Content */}
      <div className="p-4">
        {slot.imageUrl ? (
          <a 
            href={slot.linkUrl || '#'} 
            target="_blank" 
            rel="noopener noreferrer sponsored"
            className="block"
          >
            <img 
              src={slot.imageUrl} 
              alt={slot.title || 'Advertisement'} 
              className="w-full h-auto rounded-md mb-3 hover:opacity-90 transition-opacity"
            />
          </a>
        ) : isPlaceholder ? (
          <div className="w-full h-32 bg-muted/30 rounded-md mb-3 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-2xl mb-1">📢</div>
              <div className="text-xs">300×250</div>
            </div>
          </div>
        ) : null}

        {slot.title && (
          <h4 className={cn(
            "font-semibold text-sm mb-1",
            isPlaceholder ? "text-muted-foreground" : "text-foreground"
          )}>
            {slot.title}
          </h4>
        )}

        {slot.description && (
          <p className={cn(
            "text-xs mb-3",
            isPlaceholder ? "text-muted-foreground/70" : "text-muted-foreground"
          )}>
            {slot.description}
          </p>
        )}

        {slot.linkUrl && !isPlaceholder ? (
          <a
            href={slot.linkUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Learn more <ExternalLink className="h-3 w-3" />
          </a>
        ) : isPlaceholder ? (
          <a
            href="mailto:ads@moonwalk.forum"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Contact us <ExternalLink className="h-3 w-3" />
          </a>
        ) : null}

        {/* Sponsor attribution */}
        {slot.sponsorName && (
          <div className="mt-3 pt-2 border-t border-border/50">
            <span className="text-[10px] text-muted-foreground">
              by {slot.sponsorName}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Pre-configured vendor ad example
export const sampleVendorAd: AdSlot = {
  id: 'vendor-sample',
  type: 'vendor',
  title: 'SpaceSuit Pro X1',
  description: 'The most advanced EVA suit for professional astronauts. 30% off for Moonwalk members.',
  imageUrl: '/placeholder.svg',
  linkUrl: 'https://example.com/spacesuit',
  sponsorName: 'SpaceTech Industries',
};

// External ad network slot (e.g., Google AdSense placeholder)
export function ExternalAdSlot({ 
  adSlotId,
  className,
}: { 
  adSlotId?: string;
  className?: string;
}) {
  return (
    <div className={cn(
      "rounded-lg border bg-card overflow-hidden",
      className
    )}>
      <div className="px-3 py-1.5 bg-muted/50 border-b">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Advertisement
        </span>
      </div>
      <div className="p-4">
        {/* This is where external ad network code would be injected */}
        <div 
          id={adSlotId || 'ad-slot-sidebar'}
          className="w-full min-h-[250px] bg-muted/20 rounded-md flex items-center justify-center"
        >
          <div className="text-center text-muted-foreground/50">
            <div className="text-xs">External Ad Network</div>
            <div className="text-[10px] mt-1">ID: {adSlotId || 'sidebar-1'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

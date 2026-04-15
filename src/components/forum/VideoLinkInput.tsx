import { useState } from 'react';
import { Video, Plus, X, ExternalLink, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { extractVideoUrls, VideoEmbed } from './VideoEmbed';

interface VideoLinkInputProps {
  videoLinks: string[];
  onVideoLinksChange: (links: string[]) => void;
  maxVideos?: number;
}

const SUPPORTED_PLATFORMS = [
  { name: 'YouTube', example: 'youtube.com/watch?v=...' },
  { name: 'TikTok', example: 'tiktok.com/@user/video/...' },
  { name: 'Instagram', example: 'instagram.com/reel/...' },
  { name: 'Facebook', example: 'facebook.com/.../videos/...' },
  { name: 'Vimeo', example: 'vimeo.com/...' },
];

export function VideoLinkInput({
  videoLinks,
  onVideoLinksChange,
  maxVideos = 3,
}: VideoLinkInputProps) {
  const [linkInput, setLinkInput] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const handleAddLink = () => {
    const url = linkInput.trim();
    if (!url) return;

    if (videoLinks.length >= maxVideos) {
      toast.error(`Maximum ${maxVideos} videos allowed per post`);
      return;
    }

    // Validate that it's a supported video URL
    const extracted = extractVideoUrls(url);
    if (extracted.length === 0) {
      toast.error(
        'Please paste a valid video link from YouTube, TikTok, Instagram, Facebook, or Vimeo'
      );
      return;
    }

    const videoUrl = extracted[0];
    if (videoLinks.includes(videoUrl)) {
      toast.error('This video has already been added');
      return;
    }

    onVideoLinksChange([...videoLinks, videoUrl]);
    setLinkInput('');
    toast.success('Video link added! It will be embedded in your post.');
  };

  const handleRemoveLink = (index: number) => {
    const newLinks = [...videoLinks];
    newLinks.splice(index, 1);
    onVideoLinksChange(newLinks);
  };

  return (
    <div className="space-y-3">
      {/* Video Link Previews */}
      {videoLinks.length > 0 && (
        <div className="space-y-2">
          {videoLinks.map((url, index) => (
            <div key={index} className="relative group">
              <VideoEmbed url={url} />
              <button
                type="button"
                onClick={() => handleRemoveLink(index)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-background/90 text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Video Link Input */}
      {videoLinks.length < maxVideos && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddLink();
                  }
                }}
                placeholder="Paste a video link (YouTube, TikTok, Instagram...)"
                className="pl-9"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddLink}
              disabled={!linkInput.trim()}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

          {/* Help Toggle */}
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Info className="w-3 h-3" />
            {showHelp ? 'Hide video sharing tips' : 'How do I share a video?'}
          </button>

          {/* Instructional Help Panel */}
          {showHelp && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Video className="w-4 h-4 text-accent" />
                Sharing Videos on the Moonwalk Forum
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Want to show off your latest setup, share a walkthrough of your equipment, or post 
                a video review? Simply paste the link from any of these platforms and it will be 
                automatically embedded in your post for everyone to watch.
              </p>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-foreground">Supported platforms:</p>
                {SUPPORTED_PLATFORMS.map((platform) => (
                  <div
                    key={platform.name}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span className="font-medium text-foreground">{platform.name}</span>
                    <span className="text-muted-foreground/60">— {platform.example}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong>How to get the link:</strong> Open the video on YouTube, TikTok, Instagram, 
                  Facebook, or Vimeo. Tap the <strong>Share</strong> button and select{' '}
                  <strong>Copy Link</strong>. Then paste it in the field above. Up to {maxVideos} videos 
                  per post.
                </p>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            {videoLinks.length}/{maxVideos} videos added. Paste a link from YouTube, TikTok, Instagram, Facebook, or Vimeo.
          </p>
        </div>
      )}
    </div>
  );
}

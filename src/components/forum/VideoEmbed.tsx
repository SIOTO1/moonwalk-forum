import { useMemo } from 'react';
import { Video, ExternalLink } from 'lucide-react';

interface VideoEmbedProps {
  url: string;
}

interface ParsedVideo {
  platform: 'youtube' | 'tiktok' | 'instagram' | 'facebook' | 'vimeo';
  embedUrl: string;
  originalUrl: string;
}

function parseVideoUrl(url: string): ParsedVideo | null {
  // YouTube - supports youtube.com/watch, youtu.be, and youtube.com/shorts
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        platform: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${match[1]}`,
        originalUrl: url,
      };
    }
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return {
      platform: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      originalUrl: url,
    };
  }

  // TikTok - link to the video page (no direct embed iframe, use blockquote approach)
  const tiktokMatch = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
  if (tiktokMatch) {
    return {
      platform: 'tiktok',
      embedUrl: url,
      originalUrl: url,
    };
  }

  // Instagram Reels/Posts
  const instagramMatch = url.match(/instagram\.com\/(p|reel|reels)\/([a-zA-Z0-9_-]+)/);
  if (instagramMatch) {
    return {
      platform: 'instagram',
      embedUrl: `https://www.instagram.com/${instagramMatch[1]}/${instagramMatch[2]}/embed`,
      originalUrl: url,
    };
  }

  // Facebook Video
  const facebookMatch = url.match(/facebook\.com\/.*\/videos\/(\d+)|facebook\.com\/watch\/?\?v=(\d+)|fb\.watch\//);
  if (facebookMatch) {
    return {
      platform: 'facebook',
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`,
      originalUrl: url,
    };
  }

  return null;
}

const platformLabels: Record<string, { name: string; color: string }> = {
  youtube: { name: 'YouTube', color: '#FF0000' },
  tiktok: { name: 'TikTok', color: '#000000' },
  instagram: { name: 'Instagram', color: '#E4405F' },
  facebook: { name: 'Facebook', color: '#1877F2' },
  vimeo: { name: 'Vimeo', color: '#1AB7EA' },
};

export function VideoEmbed({ url }: VideoEmbedProps) {
  const video = useMemo(() => parseVideoUrl(url), [url]);

  if (!video) return null;

  const platform = platformLabels[video.platform];

  // TikTok doesn't support standard iframe embeds, show a styled link card
  if (video.platform === 'tiktok') {
    return (
      <div className="my-4 rounded-lg overflow-hidden border border-border bg-muted/30">
        <a
          href={video.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-black text-white">
            <Video className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground">TikTok Video</p>
            <p className="text-xs text-muted-foreground truncate">{video.originalUrl}</p>
          </div>
          <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
        </a>
      </div>
    );
  }

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-border">
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={video.embedUrl}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={`${platform.name} video`}
          loading="lazy"
        />
      </div>
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 text-xs text-muted-foreground">
        <Video className="w-3 h-3" />
        <span>Embedded from {platform.name}</span>
        <a
          href={video.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-1 hover:text-foreground transition-colors"
        >
          Open original <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

// Utility to extract video URLs from text content
export function extractVideoUrls(text: string): string[] {
  const urlRegex = /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/|vimeo\.com\/\d+|tiktok\.com\/@[\w.-]+\/video\/\d+|instagram\.com\/(?:p|reel|reels)\/[a-zA-Z0-9_-]+|facebook\.com\/.*\/videos\/\d+|facebook\.com\/watch\/?\?v=\d+|fb\.watch\/[a-zA-Z0-9_-]+)[^\s)"\]<]*/g;
  const matches = text.match(urlRegex);
  return matches ? [...new Set(matches)] : [];
}

// Component that renders text content with embedded videos
interface ContentWithVideosProps {
  content: string;
}

export function ContentWithVideos({ content }: ContentWithVideosProps) {
  const videoUrls = useMemo(() => extractVideoUrls(content), [content]);

  return (
    <>
      {/* Render text paragraphs */}
      <div className="prose prose-invert prose-sm max-w-none mb-4">
        {content.split('\n').map((paragraph, i) => (
          <p key={i} className="text-foreground/90 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Render embedded videos */}
      {videoUrls.length > 0 && (
        <div className="space-y-3">
          {videoUrls.map((url, index) => (
            <VideoEmbed key={`${url}-${index}`} url={url} />
          ))}
        </div>
      )}
    </>
  );
}

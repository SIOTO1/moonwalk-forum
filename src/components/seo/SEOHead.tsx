import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  ogImage?: string;
  ogType?: 'website' | 'article';
  articlePublishedTime?: string;
  articleAuthor?: string;
}

export function SEOHead({
  title = 'Moonwalk Forum - The Party Rental Industry\'s Premier Community',
  description = 'Join the premier community for party rental operators and inflatable industry professionals. Discuss equipment, share experiences, and connect with experts.',
  canonical,
  noindex = false,
  ogImage = '/og-image.png',
  ogType = 'website',
  articlePublishedTime,
  articleAuthor,
}: SEOHeadProps) {
  useEffect(() => {
    // Update title
    document.title = title;

    // Helper to update or create meta tag
    const updateMeta = (name: string, content: string, property?: boolean) => {
      const attr = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Update description
    updateMeta('description', description);

    // Update robots
    if (noindex) {
      updateMeta('robots', 'noindex, nofollow');
    } else {
      const robotsMeta = document.querySelector('meta[name="robots"]');
      if (robotsMeta) robotsMeta.remove();
    }

    // Update canonical
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonical) {
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = canonical;
    } else if (canonicalLink) {
      canonicalLink.remove();
    }

    // Update Open Graph tags
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:type', ogType, true);
    updateMeta('og:image', ogImage, true);
    
    if (canonical) {
      updateMeta('og:url', canonical, true);
    }

    // Article-specific meta tags
    if (ogType === 'article' && articlePublishedTime) {
      updateMeta('article:published_time', articlePublishedTime, true);
    }
    if (ogType === 'article' && articleAuthor) {
      updateMeta('article:author', articleAuthor, true);
    }

    // Update Twitter tags
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', ogImage);

  }, [title, description, canonical, noindex, ogImage, ogType, articlePublishedTime, articleAuthor]);

  return null;
}

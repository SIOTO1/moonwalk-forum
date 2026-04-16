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
  articleTags?: string[];
  articleSection?: string;
}

const SITE_NAME = 'Moonwalk Forum';
const SITE_URL = 'https://moonwalkforum.com';
const DEFAULT_TITLE = "Moonwalk Forum - The Party Rental Industry's Premier Community";
const DEFAULT_DESCRIPTION = 'Join the premier community for party rental operators and inflatable industry professionals. Discuss equipment, share experiences, and connect with experts.';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
const FB_APP_ID = ''; // Add Facebook App ID when available

export function SEOHead({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonical,
  noindex = false,
  ogImage,
  ogType = 'website',
  articlePublishedTime,
  articleAuthor,
  articleTags,
  articleSection,
}: SEOHeadProps) {
  // Ensure OG image is an absolute URL (required by Facebook)
  const resolvedOgImage = ogImage
    ? ogImage.startsWith('http')
      ? ogImage
      : `${SITE_URL}${ogImage}`
    : DEFAULT_OG_IMAGE;

  // Ensure canonical is absolute
  const resolvedCanonical = canonical
    ? canonical.startsWith('http')
      ? canonical
      : `${SITE_URL}${canonical}`
    : undefined;

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

    // Helper to remove a meta tag
    const removeMeta = (name: string, property?: boolean) => {
      const attr = property ? 'property' : 'name';
      const meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (meta) meta.remove();
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
    if (resolvedCanonical) {
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = resolvedCanonical;
    } else if (canonicalLink) {
      canonicalLink.remove();
    }

    // =============================================
    // Open Graph tags (Facebook, LinkedIn, etc.)
    // =============================================
    updateMeta('og:site_name', SITE_NAME, true);
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:type', ogType, true);
    updateMeta('og:image', resolvedOgImage, true);
    updateMeta('og:image:width', '1200', true);
    updateMeta('og:image:height', '630', true);
    updateMeta('og:image:alt', title, true);
    updateMeta('og:locale', 'en_US', true);

    if (resolvedCanonical) {
      updateMeta('og:url', resolvedCanonical, true);
    }

    // Facebook App ID (enables Facebook Insights for shared links)
    if (FB_APP_ID) {
      updateMeta('fb:app_id', FB_APP_ID, true);
    }

    // Article-specific Open Graph tags
    if (ogType === 'article') {
      if (articlePublishedTime) {
        updateMeta('article:published_time', articlePublishedTime, true);
      }
      if (articleAuthor) {
        updateMeta('article:author', articleAuthor, true);
      }
      if (articleSection) {
        updateMeta('article:section', articleSection, true);
      }
      // Add article tags for better categorization
      if (articleTags && articleTags.length > 0) {
        // Remove existing article:tag meta tags
        document.querySelectorAll('meta[property="article:tag"]').forEach(el => el.remove());
        // Add new ones
        articleTags.forEach(tag => {
          const meta = document.createElement('meta');
          meta.setAttribute('property', 'article:tag');
          meta.content = tag;
          document.head.appendChild(meta);
        });
      }
    } else {
      // Clean up article tags if not an article
      removeMeta('article:published_time', true);
      removeMeta('article:author', true);
      removeMeta('article:section', true);
      document.querySelectorAll('meta[property="article:tag"]').forEach(el => el.remove());
    }

    // =============================================
    // Twitter Card tags
    // =============================================
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:site', '@MoonwalkForum');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', resolvedOgImage);
    updateMeta('twitter:image:alt', title);

  }, [title, description, resolvedCanonical, noindex, resolvedOgImage, ogType, articlePublishedTime, articleAuthor, articleTags, articleSection]);

  return null;
}

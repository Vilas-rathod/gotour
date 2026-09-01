import { useEffect } from 'react';

export interface SeoProps {
  title: string;
  description?: string;
  image?: string;
  canonical?: string;
  noIndex?: boolean;
  /** JSON-LD structured data for rich results. */
  jsonLd?: Record<string, unknown>;
}

const SITE_NAME = 'GoTour';
const TITLE_SUFFIX = ` | ${SITE_NAME}`;

function upsertMeta(selector: string, attribute: 'name' | 'property', key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

/**
 * Document head manager. React 19 hoists <title>/<meta> rendered anywhere in the
 * tree, but managing them imperatively keeps a single tag per key — rendering
 * them declaratively across nested routes would duplicate them.
 */
export function Seo({ title, description, image, canonical, noIndex, jsonLd }: SeoProps) {
  const fullTitle = title.endsWith(SITE_NAME) ? title : `${title}${TITLE_SUFFIX}`;

  useEffect(() => {
    document.title = fullTitle;
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);

    if (description) {
      upsertMeta('meta[name="description"]', 'name', 'description', description);
      upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
    }

    if (image) {
      upsertMeta('meta[property="og:image"]', 'property', 'og:image', image);
      upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', image);
    }

    upsertMeta('meta[name="robots"]', 'name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    const href = canonical ?? window.location.href.split('?')[0];
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = href;
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', href);
  }, [fullTitle, description, image, canonical, noIndex]);

  useEffect(() => {
    if (!jsonLd) return;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [jsonLd]);

  return null;
}

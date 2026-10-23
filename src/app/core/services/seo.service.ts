import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SeoConfig {
  title: string;
  description: string;
  url?: string;
  image?: string;
  keywords?: string;
}

const SITE_NAME = 'TaktX Flow';
const BASE_URL = 'https://taktx.io/flow';
const DEFAULT_IMAGE = `${BASE_URL}/assets/images/og-image.png`;

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(private readonly title: Title, private readonly meta: Meta) {}

  update(config: SeoConfig): void {
    const fullTitle = config.title.includes(SITE_NAME)
      ? config.title
      : `${config.title} — ${SITE_NAME}`;
    const url = config.url ? `${BASE_URL}${config.url}` : BASE_URL;
    const image = config.image ?? DEFAULT_IMAGE;

    // Title
    this.title.setTitle(fullTitle);

    // Primary
    this.meta.updateTag({ name: 'description', content: config.description });
    if (config.keywords) {
      this.meta.updateTag({ name: 'keywords', content: config.keywords });
    }

    // Canonical
    this.updateCanonical(url);

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: image });

    // Twitter Card
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: config.description });
    this.meta.updateTag({ name: 'twitter:image', content: image });
  }

  private updateCanonical(url: string): void {
    // Remove existing canonical if present, then add the correct one
    const existing = document.querySelector('link[rel="canonical"]');
    if (existing) {
      existing.setAttribute('href', url);
    } else {
      const link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', url);
      document.head.appendChild(link);
    }
  }
}



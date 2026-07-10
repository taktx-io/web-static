import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CookieService } from '../../shared/services/cookie.service';
import { filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

declare let gtag: Function;

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private gaInitialized = false;
  private readonly GA_MEASUREMENT_ID = environment.googleAnalytics.measurementId;
  private readonly GA_ENABLED = environment.googleAnalytics.enabled;

  constructor(
    private router: Router,
    private cookieService: CookieService
  ) {}

  /**
   * Initialize Google Analytics if the user has consented to analytics cookies
   */
  public initializeGoogleAnalytics(): void {
    // Only initialize GA if enabled in environment and user has consented
    if (!this.GA_ENABLED) {
      console.log('Google Analytics is disabled in this environment');
      return;
    }
    
    // Check cookie consent
    if (this.cookieService.isAllowed('analytics')) {
      this.loadGoogleAnalyticsScripts();
      this.trackPageViews();
      this.gaInitialized = true;
      console.log('Google Analytics initialized');
    } else {
      console.log('Analytics cookies not allowed by user');
    }
  }

  /**
   * Send a page view event to Google Analytics
   */
  public sendPageView(path: string): void {
    if (!this.GA_ENABLED || !this.gaInitialized || !this.cookieService.isAllowed('analytics')) {
      return;
    }

    if (typeof gtag === 'function') {
      gtag('config', this.GA_MEASUREMENT_ID, {
        page_path: path
      });
    }
  }

  /**
   * Send a custom event to Google Analytics
   */
  public sendEvent(eventName: string, params: any = {}): void {
    if (!this.GA_ENABLED || !this.gaInitialized || !this.cookieService.isAllowed('analytics')) {
      return;
    }

    if (typeof gtag === 'function') {
      gtag('event', eventName, params);
    }
  }

  /**
   * Re-check consent and either initialize or remove Google Analytics
   * Called when cookie preferences change
   */
  public updateConsent(): void {
    if (!this.GA_ENABLED) {
      return; // Google Analytics is disabled in this environment
    }
    
    if (this.cookieService.isAllowed('analytics')) {
      if (!this.gaInitialized) {
        this.initializeGoogleAnalytics();
      }
    } else {
      this.removeGoogleAnalytics();
    }
  }

  /**
   * Set up automatic page view tracking
   */
  private trackPageViews(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.sendPageView(event.urlAfterRedirects);
    });
  }

  /**
   * Dynamically load the Google Analytics scripts
   */
  private loadGoogleAnalyticsScripts(): void {
    // Only load if not already present
    if (document.querySelector(`script[src="https://www.googletagmanager.com/gtag/js?id=${this.GA_MEASUREMENT_ID}"]`)) {
      return;
    }

    // Create Google Analytics script
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${this.GA_MEASUREMENT_ID}`;
    document.head.appendChild(gaScript);

    // Create initialization code
    const dataLayer = document.createElement('script');
    dataLayer.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${this.GA_MEASUREMENT_ID}', { 'anonymize_ip': true });
    `;
    document.head.appendChild(dataLayer);
  }

  /**
   * Remove Google Analytics if user revokes consent
   */
  private removeGoogleAnalytics(): void {
    if (!this.gaInitialized) {
      return;
    }

    // Remove Google Analytics scripts
    const gaScript = document.querySelector(`script[src="https://www.googletagmanager.com/gtag/js?id=${this.GA_MEASUREMENT_ID}"]`);
    if (gaScript) {
      gaScript.remove();
    }

    // Remove Google Analytics cookies
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const cookieName = cookie.split('=')[0].trim();
      if (cookieName.startsWith('_ga') || cookieName.startsWith('_gid') || cookieName.startsWith('_gat')) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    }

    this.gaInitialized = false;
    console.log('Google Analytics removed');
  }
}

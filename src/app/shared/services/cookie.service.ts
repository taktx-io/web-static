import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface CookieConsent {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  lastUpdated: number;
}

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  private readonly CONSENT_COOKIE_NAME = 'taktx_cookie_consent';
  private readonly CONSENT_EXPIRY_DAYS = 365;
  
  // Observable for consent changes
  private consentChanges = new BehaviorSubject<CookieConsent | null>(null);

  constructor() {
    // Initialize with current consent
    this.consentChanges.next(this.getCookieConsent());
  }

  /**
   * Get an observable that emits when cookie consent changes
   */
  public getConsentChanges(): Observable<CookieConsent | null> {
    return this.consentChanges.asObservable();
  }

  /**
   * Check if the user has already provided cookie consent
   */
  public hasConsent(): boolean {
    return this.getCookieConsent() !== null;
  }

  /**
   * Get the current cookie consent settings
   */
  public getCookieConsent(): CookieConsent | null {
    const cookieValue = this.getCookie(this.CONSENT_COOKIE_NAME);
    if (!cookieValue) {
      return null;
    }

    try {
      return JSON.parse(cookieValue);
    } catch (e) {
      console.error('Error parsing cookie consent JSON', e);
      return null;
    }
  }

  /**
   * Set cookie consent preferences
   */
  public setConsent(essential: boolean, functional: boolean, analytics: boolean): void {
    const consent: CookieConsent = {
      essential,
      functional,
      analytics,
      lastUpdated: Date.now()
    };

    this.setCookie(
      this.CONSENT_COOKIE_NAME,
      JSON.stringify(consent),
      this.CONSENT_EXPIRY_DAYS
    );
    
    // Notify observers of consent changes
    this.consentChanges.next(consent);
  }

  /**
   * Check if a specific cookie type is allowed
   */
  public isAllowed(cookieType: 'essential' | 'functional' | 'analytics'): boolean {
    // Essential cookies are always allowed
    if (cookieType === 'essential') {
      return true;
    }

    const consent = this.getCookieConsent();
    if (!consent) {
      return false;
    }

    return consent[cookieType];
  }

  /**
   * Clear all consent settings
   */
  public clearConsent(): void {
    this.deleteCookie(this.CONSENT_COOKIE_NAME);
    this.consentChanges.next(null);
  }

  /**
   * Helper to get a cookie by name
   */
  private getCookie(name: string): string | null {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(name + '=')) {
        return decodeURIComponent(cookie.substring(name.length + 1));
      }
    }
    return null;
  }

  /**
   * Helper to set a cookie
   */
  private setCookie(name: string, value: string, daysToExpire: number): void {
    const date = new Date();
    date.setTime(date.getTime() + daysToExpire * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/;SameSite=Lax`;
  }

  /**
   * Helper to delete a cookie
   */
  private deleteCookie(name: string): void {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
  }
}

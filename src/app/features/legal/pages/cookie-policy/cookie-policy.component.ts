import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CookieService } from '../../../../shared/services/cookie.service';
import { SeoService } from '@core/services/seo.service';

@Component({
  selector: 'app-cookie-policy',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cookie-policy.component.html',
  styleUrls: ['./cookie-policy.component.scss']
})
export class CookiePolicyComponent implements OnInit {
  // Track current cookie settings
  cookieSettings = {
    essential: true, // Always true
    functional: false,
    analytics: false
  };

  // Message to show after settings are updated
  updateMessage = '';
  // Flag to track if settings were changed
  settingsChanged = false;

  constructor(private cookieService: CookieService, private readonly seo: SeoService) {
    this.seo.update({
      title: 'Cookie Policy — TaktX',
      description: 'Read the TaktX cookie policy. Manage your cookie preferences and learn how we use essential, functional, and analytics cookies.',
      url: '/cookies'
    });
  }

  ngOnInit(): void {
    // Load current cookie settings
    const currentSettings = this.cookieService.getCookieConsent();
    if (currentSettings) {
      this.cookieSettings = {
        essential: true, // Always true
        functional: currentSettings.functional,
        analytics: currentSettings.analytics
      };
    }
  }

  updateCookiePreferences(essential: boolean, functional: boolean, analytics: boolean): void {
    // Check if settings are actually changing
    const isChange = functional !== this.cookieSettings.functional ||
                      analytics !== this.cookieSettings.analytics;

    this.cookieService.setConsent(essential, functional, analytics);

    // Update local state
    this.cookieSettings = {
      essential,
      functional,
      analytics
    };

    // Show feedback message
    this.updateMessage = 'Your cookie preferences have been updated';
    this.settingsChanged = isChange;
    this.showMessageTemporarily();

    // If functional cookies were toggled, reload the page to ensure proper behavior
    if (isChange && functional !== this.cookieSettings.functional) {
      setTimeout(() => {
        window.location.reload();
      }, 1500); // Delay to allow user to see the message
    }
  }

  acceptAll(): void {
    const isChange = !this.cookieSettings.functional || !this.cookieSettings.analytics;

    this.cookieService.setConsent(true, true, true);

    // Update local state
    this.cookieSettings = {
      essential: true,
      functional: true,
      analytics: true
    };

    // Show feedback message
    this.updateMessage = 'All cookies have been accepted';
    this.settingsChanged = isChange;
    this.showMessageTemporarily();

    // Reload if there was a change to functional cookies
    if (isChange) {
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  }

  acceptEssential(): void {
    const isChange = this.cookieSettings.functional || this.cookieSettings.analytics;

    this.cookieService.setConsent(true, false, false);

    // Update local state
    this.cookieSettings = {
      essential: true,
      functional: false,
      analytics: false
    };

    // Show feedback message
    this.updateMessage = 'Only essential cookies have been enabled';
    this.settingsChanged = isChange;
    this.showMessageTemporarily();

    // Reload if there was a change to functional cookies
    if (isChange && this.cookieSettings.functional) {
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  }

  // Helper to show message temporarily
  private showMessageTemporarily(): void {
    setTimeout(() => {
      this.updateMessage = '';
      // Don't reset settingsChanged flag here to allow the reload to happen
    }, 3000); // Hide message after 3 seconds
  }
}

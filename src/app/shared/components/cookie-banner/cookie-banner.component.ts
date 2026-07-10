import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CookieService } from '../../../shared/services/cookie.service';

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cookie-banner.component.html',
  styleUrls: ['./cookie-banner.component.scss']
})
export class CookieBannerComponent implements OnInit {
  showBanner = false;
  
  constructor(private cookieService: CookieService) {}

  ngOnInit(): void {
    // Check if the user has already consented
    this.showBanner = !this.cookieService.hasConsent();
  }

  acceptAll(): void {
    this.cookieService.setConsent(true, true, true);
    this.showBanner = false;
    this.handleSettingsChange();
  }

  acceptEssential(): void {
    this.cookieService.setConsent(true, false, false);
    this.showBanner = false;
    this.handleSettingsChange();
  }

  manageCookies(): void {
    // Navigate to cookie settings page
    // For now, just hide the banner when they click Manage
    this.showBanner = false;
  }
  
  /**
   * Handle any necessary adjustments after cookie settings change
   */
  private handleSettingsChange(): void {
    // Store a flag in sessionStorage to indicate settings were changed
    sessionStorage.setItem('cookie_settings_changed', 'true');
    
    // Optionally reload the page to ensure all components respect new settings
    // This ensures the cookie notification in the documentation layout updates correctly
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }
}

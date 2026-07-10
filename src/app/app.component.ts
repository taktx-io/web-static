import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { CookieBannerComponent } from './shared/components/cookie-banner/cookie-banner.component';
import { AnalyticsService } from './core/services/analytics.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CookieBannerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'taktx-web';

  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    // Initialize Google Analytics if the user has consented.
    this.analyticsService.initializeGoogleAnalytics();

    const settingsChanged = sessionStorage.getItem('cookie_settings_changed');
    if (settingsChanged === 'true') {
      this.analyticsService.updateConsent();
      sessionStorage.removeItem('cookie_settings_changed');
    }
  }
}

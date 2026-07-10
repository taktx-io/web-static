import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '@core/services/seo.service';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent {
  constructor(private readonly seo: SeoService) {
    this.seo.update({
      title: 'Privacy Policy — TaktX',
      description: 'Read the TaktX privacy policy. Learn how we collect, use, and protect your personal data in compliance with GDPR.',
      url: '/privacy'
    });
  }
}

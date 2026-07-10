import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '@core/services/seo.service';

@Component({
  selector: 'app-terms-of-service',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './terms-of-service.component.html',
  styleUrls: ['./terms-of-service.component.scss']
})
export class TermsOfServiceComponent {
  constructor(private readonly seo: SeoService) {
    this.seo.update({
      title: 'Terms of Service — TaktX',
      description: 'Read the TaktX terms of service governing use of the platform, software, and related services.',
      url: '/terms'
    });
  }
}

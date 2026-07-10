import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '@core/services/seo.service';

@Component({
  selector: 'app-license',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './license.component.html',
  styleUrls: ['./license.component.scss']
})
export class LicenseComponent {
  constructor(private readonly seo: SeoService) {
    this.seo.update({
      title: 'License — Apache 2.0 — TaktX',
      description: 'TaktX is open source software released under the Apache 2.0 License. Free to use, modify, and distribute with minimal restrictions.',
      url: '/license'
    });
  }
}

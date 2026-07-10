import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '@core/services/seo.service';

@Component({
  selector: 'app-public-alpha',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './public-alpha.component.html',
  styleUrls: ['./public-alpha.component.scss']
})
export class PublicAlphaComponent {
  quickstartOs: 'macos' | 'linux' | 'windows' = 'macos';

  constructor(private readonly seo: SeoService) {
    this.seo.update({
      title: 'Join the Public Beta — Free Early Access',
      description: 'Join the TaktX public beta. Free early access to the high-performance, open source BPMN 2.0 orchestration engine. Kafka-native, no partition limits.',
      url: '/beta'
    });
  }

  selectQuickstartOs(os: 'macos' | 'linux' | 'windows') { this.quickstartOs = os; }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  currentYear = new Date().getFullYear();

  constructor(private seo: SeoService) {
    this.seo.update({
      title: 'About TaktX — The Team and the Technology',
      description: 'Learn about TaktX — built on the Kafka protocol by a senior distributed systems engineer with 30+ years of experience. Enterprise validated, open source at heart.',
      url: '/about',
      keywords: 'about TaktX, BPMN engine team, distributed systems, open source workflow, Eric Hendriks'
    });
  }

  stats = [
    { value: '10x', label: 'Faster BPMN Execution' },
    { value: '99.99%', label: 'Fault Tolerance' },
    { value: 'E2E', label: 'Encryption by Default' },
  ];

  values = [
    {
      icon: 'bolt',
      title: 'Performance First',
      description: 'We obsess over low latency and high throughput to unlock new use cases for BPMN at scale.'
    },
    {
      icon: 'shield_lock',
      title: 'Security by Design',
      description: 'Privacy is not an afterthought. The architecture allows for end-to-end encryption of data at rest (planned 2026).'
    },
    {
      icon: 'handshake',
      title: 'Open Collaboration',
      description: 'We build in the open with a thriving community and transparent roadmap.'
    }
  ];
}

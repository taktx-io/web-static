import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '@core/services/seo.service';

@Component({
  selector: 'app-dutch-financial-poc',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dutch-financial-poc.component.html',
  styleUrls: ['./dutch-financial-poc.component.scss']
})
export class DutchFinancialPocComponent {
  constructor(private readonly seo: SeoService) {
    this.seo.update({
      title: 'Case Study: Camunda 8 Migration at Dutch Financial Institution',
      description: 'How a leading Dutch financial institution migrated from Camunda 8 to TaktX, achieving horizontal scalability and eliminating Kafka partition limits.',
      url: '/case-studies/dutch-financial-poc'
    });
  }
}

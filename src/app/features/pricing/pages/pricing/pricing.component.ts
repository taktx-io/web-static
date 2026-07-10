import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../../../core/services/seo.service';

interface ComparisonRow {
  feature: string;
  community: boolean;
  team: boolean;
  business: boolean;
  enterprise: boolean;
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent {

  activeDeployment: 'on-premise' | 'saas' = 'on-premise';

  constructor(private seo: SeoService) {
    this.seo.update({
      title: 'Pricing — Start Free, Scale with Control',
      description: 'TaktX is free forever for the open source Community tier. Add operational control with Team, Business, and Enterprise tiers — all free during beta.',
      url: '/pricing',
      keywords: 'TaktX pricing, BPMN open source free, workflow orchestration pricing, Camunda alternative cost'
    });
  }

  setDeployment(tab: 'on-premise' | 'saas'): void {
    this.activeDeployment = tab;
  }

  comparisonRows: ComparisonRow[] = [
    { feature: 'BPMN Engine (full, OSS)',        community: true,  team: true,  business: true,  enterprise: true  },
    { feature: 'Unlimited scale',                community: true,  team: true,  business: true,  enterprise: true  },
    { feature: 'Community Console',              community: true,  team: true,  business: true,  enterprise: true  },
    { feature: 'Operations Console',             community: false, team: true,  business: true,  enterprise: true  },
    { feature: 'Multi-namespace support',        community: false, team: true,  business: true,  enterprise: true  },
    { feature: 'Basic RBAC',                     community: false, team: true,  business: true,  enterprise: true  },
    { feature: 'Command Center',                 community: false, team: false, business: true,  enterprise: true  },
    { feature: 'Cross-process visibility',       community: false, team: false, business: true,  enterprise: true  },
    { feature: 'Advanced RBAC',                  community: false, team: false, business: true,  enterprise: true  },
    { feature: 'Multi-cluster visibility',       community: false, team: false, business: true,  enterprise: true  },
    { feature: 'Audit & compliance',             community: false, team: false, business: false, enterprise: true  },
    { feature: 'Signing & trust configuration',  community: false, team: false, business: false, enterprise: true  },
    { feature: 'Advanced governance',            community: false, team: false, business: false, enterprise: true  },
  ];

  supportRows: ComparisonRow[] = [
    { feature: 'Community forum',                 community: true,  team: true,  business: false, enterprise: false },
    { feature: 'Best-effort email',               community: false, team: true,  business: false, enterprise: false },
    { feature: 'Email support (office hours)',    community: false, team: false, business: true,  enterprise: true  },
    { feature: 'Priority email (office hours)',   community: false, team: false, business: false, enterprise: true  },
    { feature: 'SLA / 24×7 support',             community: false, team: false, business: false, enterprise: false },
  ];
}


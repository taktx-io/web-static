import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'app-decisions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './decisions.component.html',
  styleUrls: ['./decisions.component.scss']
})
export class DecisionsComponent {
  lightboxOpen = false;
  lightboxSrc = '';

  openLightbox(src: string) {
    this.lightboxSrc = src;
    this.lightboxOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    this.lightboxOpen = false;
    this.lightboxSrc = '';
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() { this.closeLightbox(); }

  constructor(private seo: SeoService) {
    this.seo.update({
      title: 'DMN Decision Execution — TaktX',
      description: 'TaktX supports native DMN decision execution alongside BPMN. Evaluate decision tables and DRGs inline — no separate decision service required. FEEL expressions, open source.',
      url: '/decisions',
      keywords: 'DMN, decision model notation, FEEL, DRG, decision requirements graph, decision tables, BPMN process, TaktX decisions, open source DMN'
    });
  }
}




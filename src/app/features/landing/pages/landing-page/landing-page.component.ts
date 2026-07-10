import { Component, ElementRef, HostListener, OnDestroy, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../../../core/services/seo.service';

interface CounterItem {
  value: number; unit: string; suffix: string; description: string; duration: number; color: string;
}
interface HeroSlide {
  label: string;
  badge?: string;
  badgeLabel?: string;
  src?: string;
  alt?: string;
  caption?: string;
  videoSrc?: string;
  subtext?: string;
  ctaPrimaryLabel?: string;
  ctaPrimaryIcon?: string;
  ctaPrimaryHref?: string;
}

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnDestroy {
  @ViewChildren('counterSection') counterSection!: QueryList<ElementRef>;
  countersStarted = false;

  // Hero badge cycling
  heroBadges = [
    { icon: 'rocket_launch', text: 'Now open source — Apache 2.0' },
    { icon: 'table_chart',   text: 'DMN & DRG now supported' }
  ];
  heroBadgeIndex = 0;
  heroBadgePaused = false;
  private heroBadgeInterval: any;

  get heroBadgeAnimation(): string {
    return this.heroBadgeIndex % 2 === 0 ? 'badgeFadeEven' : 'badgeFadeOdd';
  }

  pauseBadge()  { this.heroBadgePaused = true; }
  resumeBadge() { this.heroBadgePaused = false; }

  private startBadgeCycle() {
    this.heroBadgeInterval = setInterval(() => {
      if (!this.heroBadgePaused) {
        this.heroBadgeIndex = (this.heroBadgeIndex + 1) % this.heroBadges.length;
      }
    }, 4500);
  }

  // Hero carousel
  heroSlides: HeroSlide[] = [
    {
      label: 'Quickstart',
      subtext: 'High-performance BPMN & DMN execution, Kafka-native and horizontally scalable — with a simple path to real operational control.',
      ctaPrimaryLabel: 'Get started (5 min)', ctaPrimaryIcon: 'play_arrow',
      ctaPrimaryHref: 'https://github.com/taktx-io/quickstart'
    },
    {
      label: 'Process Definitions', badge: 'Community Console', badgeLabel: 'Open source',
      src: 'assets/images/screenshots/console-process-list.png',
      alt: 'Community Console — process definitions list',
      videoSrc: 'assets/images/screenshots/console-process-list.webm',
      caption: 'Browse deployed processes and version history',
      subtext: 'Deploy, version and manage BPMN processes — browse, start and cancel instances with zero configuration.',
      ctaPrimaryLabel: 'Try the Community Console', ctaPrimaryIcon: 'monitor',
      ctaPrimaryHref: 'https://github.com/taktx-io/quickstart'
    },
    {
      label: 'Live Instance Monitor', badge: 'Community Console', badgeLabel: 'Open source',
      src: 'assets/images/screenshots/console-instance-monitor.png',
      alt: 'Community Console — live instance monitor with heatmaps',
      videoSrc: 'assets/images/screenshots/console-instance-monitor.webm',
      caption: 'Real-time heatmaps across running instances',
      subtext: 'Real-time heatmaps show token flow across all running instances — see exactly where the load is, at a glance.',
      ctaPrimaryLabel: 'Try the live monitor', ctaPrimaryIcon: 'visibility',
      ctaPrimaryHref: 'https://github.com/taktx-io/quickstart'
    },
    {
      label: 'Ops Dashboard', badge: 'TaktX Ops', badgeLabel: 'Preview',
      src: 'assets/images/screenshots/ops-dashboard.png',
      alt: 'TaktX Ops — cluster-wide dashboard',
      caption: 'Cluster-wide visibility and partition control',
      subtext: 'Cluster-wide engine visibility and Kafka partition control — for teams that need full operational grip at scale.',
      ctaPrimaryLabel: 'Learn about TaktX Ops', ctaPrimaryIcon: 'admin_panel_settings',
      ctaPrimaryHref: '/beta'
    },
    {
      label: 'RBAC & Tenancy', badge: 'TaktX Ops', badgeLabel: 'Preview',
      src: 'assets/images/screenshots/ops-rbac.png',
      alt: 'TaktX Ops — RBAC and multi-tenancy',
      caption: 'Fine-grained access control and multi-tenancy',
      subtext: 'Fine-grained RBAC down to process definition and version level — with full multi-tenancy and enterprise identity.',
      ctaPrimaryLabel: 'Learn about TaktX Ops', ctaPrimaryIcon: 'lock',
      ctaPrimaryHref: '/beta'
    },
    {
      label: 'DMN Decision Table', badge: 'TaktX Engine', badgeLabel: 'Open source',
      src: 'assets/images/screenshots/dmn.png',
      alt: 'DMN decision table modeled in Camunda Desktop Modeler',
      caption: 'Standard DMN 1.3 decision table — evaluated inline by the engine',
      subtext: 'Model decision logic as DMN tables and execute them inline within running BPMN processes — no separate service needed.',
      ctaPrimaryLabel: 'Learn about DMN support', ctaPrimaryIcon: 'table_chart',
      ctaPrimaryHref: '/decisions'
    },
    {
      label: 'Decision Requirements Graph', badge: 'TaktX Engine', badgeLabel: 'Open source',
      src: 'assets/images/screenshots/drg.png',
      alt: 'Decision Requirements Graph (DRG) — composed decision tables',
      caption: 'Compose multiple decisions into a structured DRG',
      subtext: 'Build structured Decision Requirements Graphs — compose multiple decision tables into reusable dependency graphs.',
      ctaPrimaryLabel: 'Learn about DMN support', ctaPrimaryIcon: 'account_tree',
      ctaPrimaryHref: '/decisions'
    }
  ];
  heroSlideIndex = 0;
  private heroSlideInterval: any;

  get currentHeroSlide(): HeroSlide { return this.heroSlides[this.heroSlideIndex]; }

  get heroSubtextAnimation(): string {
    return this.heroSlideIndex % 2 === 0 ? 'subtextFadeEven' : 'subtextFadeOdd';
  }

  setHeroSlide(index: number) {
    this.heroSlideIndex = index;
    clearInterval(this.heroSlideInterval);
    this.startHeroCarousel();
    this.reloadHeroVideo();
  }

  private startHeroCarousel() {
    this.heroSlideInterval = setInterval(() => {
      this.heroSlideIndex = (this.heroSlideIndex + 1) % this.heroSlides.length;
      this.reloadHeroVideo();
    }, 6000);
  }

  private reloadHeroVideo(): void {
    setTimeout(() => {
      const video = (this.el.nativeElement as HTMLElement)
        .querySelector('.hero-carousel video') as HTMLVideoElement | null;
      if (video) {
        video.addEventListener('canplay', () => {
          video.play().catch(() => {});
        }, { once: true });
        video.load();
      }
    });
  }

  quickstartOs: 'macos' | 'linux' | 'windows' = 'macos';
  selectQuickstartOs(os: 'macos' | 'linux' | 'windows') { this.quickstartOs = os; }

  lightboxOpen = false;
  lightboxSrc = '';
  lightboxAlt = '';
  lightboxTitle = '';
  lightboxIsVideo = false;
  lightboxVideoSrc = '';

  openLightbox(src: string, alt: string, title: string, videoSrc = '') {
    this.lightboxSrc = src;
    this.lightboxAlt = alt;
    this.lightboxTitle = title;
    this.lightboxVideoSrc = videoSrc;
    this.lightboxIsVideo = !!videoSrc;
    this.lightboxOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    this.lightboxOpen = false;
    this.lightboxVideoSrc = '';
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() { this.closeLightbox(); }

  counterItems: CounterItem[] = [
    { value: 40, unit: 'x', suffix: '', description: 'Faster than leading competitors', duration: 2000, color: 'text-primary' },
    { value: 70, unit: '%', suffix: '', description: 'Less disk space required', duration: 2500, color: 'text-green-400' },
    { value: 100, unit: '%', suffix: '', description: 'Horizontal scalability', duration: 3000, color: 'text-yellow-400' }
  ];
  currentCounterValues: number[] = this.counterItems.map(() => 0);

  constructor(private el: ElementRef, private seo: SeoService) {
    this.seo.update({
      title: 'TaktX — Process Orchestration at Scale, Open Source',
      description: 'Run BPMN and DMN at scale with TaktX — a fully open source, horizontally scalable engine. Kafka-native, integrated decision execution, no enterprise tax. Get started in 5 minutes.',
      url: '/',
      keywords: 'BPMN engine, DMN execution, open source workflow, Kafka orchestration, Camunda alternative, process automation, decision tables'
    });
    this.startHeroCarousel();
    this.startBadgeCycle();
  }

  ngOnDestroy() {
    clearInterval(this.heroSlideInterval);
    clearInterval(this.heroBadgeInterval);
  }

  startVideoRotation() {}
  setVideo(index: number) {}

  @HostListener('window:scroll', ['$event'])
  checkScroll() {
    if (this.countersStarted || !this.counterSection.first) return;
    const rect = this.counterSection.first.nativeElement.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.8) { this.startCounterAnimations(); this.countersStarted = true; }
  }

  startCounterAnimations() {
    this.counterItems.forEach((item, index) => {
      const startTime = Date.now();
      const updateCounter = () => {
        const progress = Math.min((Date.now() - startTime) / item.duration, 1);
        this.currentCounterValues[index] = Math.floor(this.easeOutCubic(progress) * item.value);
        if (progress < 1) requestAnimationFrame(updateCounter);
        else this.currentCounterValues[index] = item.value;
      };
      updateCounter();
    });
  }

  easeOutCubic(x: number): number { return 1 - Math.pow(1 - x, 3); }
}

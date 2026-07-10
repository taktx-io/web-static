import { Component, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-camundacon-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './camundacon-landing.component.html',
  styleUrls: ['./camundacon-landing.component.scss']
})
export class CamundaConLandingComponent implements AfterViewInit {

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    // Angular doesn't reliably set the `muted` DOM property from template attributes.
    // Mirror the landing page pattern: set muted programmatically, load and play.
    const videos = (this.el.nativeElement as HTMLElement)
      .querySelectorAll('video') as NodeListOf<HTMLVideoElement>;
    videos.forEach(video => {
      video.muted = true;
      video.addEventListener('canplay', () => {
        video.play().catch(() => {});
      }, { once: true });
      video.load();
    });
  }

  readonly differentiators = [
    {
      icon: 'speed',
      title: 'Real-time visibility',
      text: 'Sub-second operational insight and live BPMN execution visibility across all running instances.'
    },
    {
      icon: 'verified_user',
      title: 'Verifiable execution',
      text: 'Built-in signing and verification for governance-oriented workloads where auditability is non-negotiable.'
    },
    {
      icon: 'shield_lock',
      title: 'Zero-trust principles',
      text: 'Secure-by-design orchestration with JWT authorization and trust-aware command execution.'
    },
    {
      icon: 'bolt',
      title: 'High-performance runtime',
      text: 'Per-worker Kafka topics with independently configurable partition counts. Tune throughput exactly where it\'s needed — no shared queue, no cross-worker interference.'
    },
    {
      icon: 'code',
      title: 'Open source engine',
      text: 'Core engine and community console available as open source under Apache 2.0. No artificial limits.'
    },
    {
      icon: 'table_chart',
      title: 'DMN included',
      text: 'DMN decision tables and DRGs with FEEL support included in the open source platform. No add-ons required.'
    }
  ];

  readonly aiQuestions = [
    { icon: 'help_outline', text: 'What triggered a decision?' },
    { icon: 'fact_check', text: 'Can execution be verified afterwards?' },
    { icon: 'edit_note', text: 'Was a workflow modified?' },
    { icon: 'history', text: 'Can operators trace execution history reliably?' },
    { icon: 'lock', text: 'How do you secure autonomous actions?' },
    { icon: 'manage_accounts', text: 'Who initiated each step — and can you prove it?' }
  ];


  readonly screenshots: {
    src: string;
    videoSrc?: string;
    label: string;
    caption: string;
  }[] = [
    {
      src: 'assets/images/screenshots/console-instance-monitor.png',
      videoSrc: 'assets/images/screenshots/console-instance-monitor.webm',
      label: 'Live BPMN heatmap',
      caption: 'Real-time execution heatmap — see active tokens across the diagram as they flow.'
    },
    {
      src: 'assets/images/screenshots/ops-dashboard.png',
      label: 'Operational dashboard',
      caption: 'Engine-level metrics and throughput in real time. Sub-second refresh.'
    },
    {
      src: 'assets/images/screenshots/drg.png',
      label: 'DMN Decision Requirements Graph',
      caption: 'Decision graphs authored in Camunda Modeler, executed inline by the TaktX engine.'
    },
    {
      src: 'assets/images/screenshots/console-process-list.png',
      videoSrc: 'assets/images/screenshots/console-process-list.webm',
      label: 'Process definitions',
      caption: 'Deployed BPMN definitions across namespaces with live instance counts.'
    }
  ];
}



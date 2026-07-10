import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'app-why-taktx',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './why-taktx.component.html',
  styleUrls: ['./why-taktx.component.scss']
})
export class WhyTaktxComponent {

  constructor(private seo: SeoService) {
    this.seo.update({
      title: 'When to Choose TaktX — Honest Comparison',
      description: 'An honest look at when TaktX is the right BPMN orchestration choice — and when it is not. Compare TaktX with traditional engines, Camunda 8, and code-first platforms.',
      url: '/why-taktx',
      keywords: 'TaktX vs Camunda, BPMN engine comparison, Zeebe alternative, workflow orchestration choice, when to use TaktX'
    });
  }

  idealUseCases = [
    {
      icon: 'speed',
      title: 'High-throughput, event-driven systems',
      description: 'You need to process large volumes of workflows with low latency, in combination with any Kafka-protocol compatible platform — Apache Kafka, Confluent, Redpanda, AWS MSK, Axual, and more.',
    },
    {
      icon: 'verified_user',
      title: 'Security and trust matter',
      description: 'You need strong guarantees around identity, message integrity, and traceability — built into the platform, not bolted on.',
    },
    {
      icon: 'tune',
      title: 'Operational control at business level',
      description: 'You don\'t just want to run workflows — you want to understand and control them across multiple processes and teams.',
    },
    {
      icon: 'dns',
      title: 'Deployment flexibility is a requirement',
      description: 'You need full control over your infrastructure: on-premise, cloud, or hybrid — without vendor lock-in.',
    },
    {
      icon: 'savings',
      title: 'Avoid enterprise pricing overhead',
      description: 'You want production-grade orchestration without large upfront licensing costs or artificial scale limits.',
    },
  ];

  notAGoodFit = [
    {
      icon: 'cloud',
      title: 'You need a fully managed SaaS today',
      description: 'TaktX SaaS is currently in development. If you need a mature managed offering right now, alternatives may be a better fit.',
    },
    {
      icon: 'code',
      title: 'You prefer a code-first workflow model',
      description: 'If you don\'t need BPMN and prefer code-defined workflows, platforms like Temporal may be more suitable for your team.',
    },
    {
      icon: 'apps',
      title: 'You need a fully integrated enterprise suite out of the box',
      description: 'If you need modeling, task management, and analytics all bundled together today, platforms like Camunda offer a more complete package.',
    },
  ];

  summaryPoints = [
    'Need scalable, event-driven orchestration',
    'Require strong operational control and visibility',
    'Want deployment flexibility and cost efficiency',
    'Are comfortable adopting a modern, evolving platform',
  ];
}


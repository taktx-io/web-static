import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JavaHighlightPipe } from '../../../../shared/pipes/java-highlight.pipe';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../../../core/services/seo.service';

interface FeatureCard {
  title: string;
  icon: string;
  description: string;
  bullets: string[];
}

@Component({
  selector: 'app-features-home',
  standalone: true,
  imports: [CommonModule, RouterModule, JavaHighlightPipe],
  templateUrl: './features-home.component.html',
  styleUrls: ['./features-home.component.scss']
})
export class FeaturesHomeComponent {
  constructor(private seo: SeoService) {
    this.seo.update({
      title: 'Features — High-Performance BPMN at Scale',
      description: 'Explore TaktX features: per-worker Kafka topics, Kafka-native multi-tenancy, near-complete BPMN 2.0 coverage, horizontal scalability, and a drop-in Camunda 8 migration path.',
      url: '/features',
      keywords: 'TaktX features, BPMN 2.0, Kafka topics, horizontal scaling, Camunda migration, workflow engine features'
    });
  }

  featureCards: FeatureCard[] = [
    {
      title: 'Industry-leading performance',
      icon: 'speed',
      description: 'High throughput on modest hardware, designed for JVM efficiency.',
      bullets: [
        'Over 100k flow node instances per second in benchmarks',
        'Low memory footprint and minimal GC pressure',
        'Optimized Kafka-based persistence and messaging'
      ]
    },
    {
      title: 'Horizontal scalability',
      icon: 'view_quilt',
      description: 'Scale across nodes with consistent performance.',
      bullets: [
        'Stateless engine nodes — add capacity on demand',
        'Kafka-based workload distribution with automatic rebalancing',
        'Each worker type gets its own dedicated Kafka topic'
      ]
    },
    {
      title: 'Per-worker Kafka topics',
      icon: 'topic',
      description: 'Every worker type runs on its own dedicated Kafka topic for complete performance isolation.',
      bullets: [
        'Tune partition count independently per worker type',
        'Scale high-throughput workers without affecting low-intensity ones',
        'Isolate and predict throughput characteristics per task type'
      ]
    },
    {
      title: 'Kafka-native multi-tenancy',
      icon: 'hub',
      description: 'Achieve full tenant isolation at the infrastructure level — no application-layer complexity required.',
      bullets: [
        'Each engine instance operates on its own dedicated set of Kafka topics',
        'Divide namespaces across Kafka clusters for hard tenant isolation',
        'Multi-tenancy scales with your infrastructure, not your codebase',
        'Works with any Kafka-protocol broker — Apache Kafka, Confluent, Redpanda, AWS MSK, Axual'
      ]
    },
    {
      title: 'Reliability & fault tolerance',
      icon: 'shield',
      description: 'Built for business continuity and safe recovery.',
      bullets: [
        'Checkpointing and recovery semantics',
        'Idempotent execution model',
        'Processes resume exactly where they left off'
      ]
    },
    {
      title: 'Near-complete BPMN 2.0 coverage',
      icon: 'account_tree',
      description: 'Implements almost 100% of BPMN 2.0 — model real processes without workarounds.',
      bullets: [
        'Events, gateways, timers, subprocesses, error/compensation',
        'Message correlation semantics',
        'Compatible with Camunda Desktop Modeler BPMN XML'
      ]
    },
    {
      title: 'Camunda 8 / Zeebe compatible',
      icon: 'swap_horiz',
      description: 'Migrate from Camunda 8 with minimal code changes.',
      bullets: [
        'Same BPMN 2.0 XML format — models run almost natively',
        'Worker migration: swap annotation, remove manual complete',
        'Zeebe client protocol compatible'
      ]
    },
    {
      title: 'Developer experience',
      icon: 'code',
      description: 'Workers are plain Java classes — no infrastructure boilerplate.',
      bullets: [
        'Spring Boot & Quarkus friendly',
        'Variables auto-injected as typed parameters',
        'Return value auto-completes the job — no manual command'
      ]
    }
  ];

  // Camunda 8 worker (before)
  camundaWorkerSnippet: string =
`
import io.camunda.zeebe.spring.client.annotation.CustomHeaders;
import io.camunda.zeebe.spring.client.annotation.JobWorker;
import io.camunda.zeebe.spring.client.annotation.Variable;
import io.camunda.zeebe.client.api.respons.ActivatedJob;

public class ExampleWorkerCamunda {

    @JobWorker(type = "process.actions.promote-variables")
    public Map<String, Object> handle(
                       ActivatedJob activatedJob,
                       @Variable List<String> variableNameList,
                       @Variable String instanceId,
                        @CustomHeaders Map<String, String> headers) {

        return Map.of("var1", "value1", "var2", "value2");
    }
}`;

  // TaktX worker (after)
  taktxWorkerSnippet: string =
`
import io.taktx.client.annotation.CustomHeaders;
import io.taktx.client.annotation.JobWorker;
import io.taktx.client.annotation.Variable;
import io.taktx.dto.ExternalTaskTriggerDTO;

public class ExampleWorkerTaktX {

    @JobWorker(type = "process.actions.promote-variables")
    public Map<String, Object> handle(
                        ExternalTaskTriggerDTO triggerDTO,
                       @Variable List<String> variableNameList,
                       @Variable String instanceId,
                        @CustomHeaders Map<String, String> headers) {

        return Map.of("var1", "value1", "var2", "value2");
    }
}`;

  // Multi-instance example
  codeSnippet: string =
`import io.taktx.client.annotation.JobWorker;
import io.taktx.client.annotation.Variable;

public class OrderProcessingWorker {

    @JobWorker(type = "create-collection-id")
    public Map<String, Object> createCollection() {
        List<String> items = IntStream.rangeClosed(1, 1000)
            .mapToObj(String::valueOf)
            .toList();
        return Map.of("inputCollection", items);
    }

    @JobWorker(type = "service-task-id")
    public Map<String, Object> processItem(
            @Variable String inputElement) {

        return Map.of("outputElement", "result-" + inputElement);
    }
}`;
}

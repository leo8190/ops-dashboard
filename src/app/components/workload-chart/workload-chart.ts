import { Component, computed, input } from '@angular/core';

import { WorkloadPoint } from '../../core/operations.models';

@Component({
  selector: 'app-workload-chart',
  templateUrl: './workload-chart.html',
  styleUrl: './workload-chart.scss',
})
export class WorkloadChart {
  readonly data = input.required<readonly WorkloadPoint[]>();

  private readonly maxValue = computed(() =>
    Math.max(
      1,
      ...this.data().flatMap((point) => [point.intake, point.completed, point.cancelled]),
    ),
  );

  protected height(value: number): string {
    return `${Math.round((value / this.maxValue()) * 100)}%`;
  }
}

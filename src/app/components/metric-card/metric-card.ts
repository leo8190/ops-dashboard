import { Component, input } from '@angular/core';

import { Metric } from '../../core/operations.models';

@Component({
  selector: 'app-metric-card',
  templateUrl: './metric-card.html',
  styleUrl: './metric-card.scss',
})
export class MetricCard {
  readonly metric = input.required<Metric>();
}

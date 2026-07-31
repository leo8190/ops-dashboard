import { Component, computed, input } from '@angular/core';

import { OperationalStatus } from '../../core/operations.models';

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
})
export class StatusBadge {
  readonly status = input.required<OperationalStatus>();

  protected readonly label = computed(() => {
    const labels: Record<OperationalStatus, string> = {
      'on-track': 'On track',
      'at-risk': 'At risk',
      blocked: 'Blocked',
    };

    return labels[this.status()];
  });
}

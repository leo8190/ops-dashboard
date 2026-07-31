import { Component, computed, input } from '@angular/core';

import { OrderStatus } from '../../core/operations.models';

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
})
export class StatusBadge {
  readonly status = input.required<OrderStatus>();

  protected readonly label = computed(() => {
    return this.status();
  });

  protected readonly cssClass = computed(() => this.status().toLowerCase());
}

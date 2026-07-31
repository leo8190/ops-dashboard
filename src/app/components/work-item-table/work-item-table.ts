import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { Order } from '../../core/operations.models';
import { StatusBadge } from '../status-badge/status-badge';

@Component({
  selector: 'app-work-item-table',
  imports: [DatePipe, StatusBadge],
  templateUrl: './work-item-table.html',
  styleUrl: './work-item-table.scss',
})
export class WorkItemTable {
  readonly items = input.required<readonly Order[]>();
  readonly selectedItemId = input<string | null>(null);
  readonly inspected = output<Order>();

  protected progress(status: Order['status']): number {
    return { Received: 20, Processing: 65, Completed: 100, Cancelled: 100 }[status];
  }
}

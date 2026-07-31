import { Component, input, output } from '@angular/core';

import { WorkItem } from '../../core/operations.models';
import { StatusBadge } from '../status-badge/status-badge';

@Component({
  selector: 'app-work-item-table',
  imports: [StatusBadge],
  templateUrl: './work-item-table.html',
  styleUrl: './work-item-table.scss',
})
export class WorkItemTable {
  readonly items = input.required<readonly WorkItem[]>();
  readonly selectedItemId = input<string | null>(null);
  readonly inspected = output<WorkItem>();
}

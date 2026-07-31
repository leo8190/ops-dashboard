import { Component, HostListener, input, output } from '@angular/core';

import { OperationalStatus, WorkItem } from '../../core/operations.models';
import { StatusBadge } from '../status-badge/status-badge';

@Component({
  selector: 'app-work-item-detail',
  imports: [StatusBadge],
  templateUrl: './work-item-detail.html',
  styleUrl: './work-item-detail.scss',
})
export class WorkItemDetail {
  readonly item = input<WorkItem | null>(null);
  readonly closeRequested = output<void>();
  readonly statusChanged = output<OperationalStatus>();

  protected readonly statuses: readonly OperationalStatus[] = ['on-track', 'at-risk', 'blocked'];

  protected statusLabel(status: OperationalStatus): string {
    return {
      'on-track': 'On track',
      'at-risk': 'At risk',
      blocked: 'Blocked',
    }[status];
  }

  @HostListener('document:keydown.escape')
  protected closeOnEscape(): void {
    if (this.item()) {
      this.closeRequested.emit();
    }
  }
}

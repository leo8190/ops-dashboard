import { DatePipe } from '@angular/common';
import { Component, HostListener, computed, input, output, signal } from '@angular/core';

import {
  ConnectionMode,
  Order,
  OrderAction,
  OrderActionRequest,
  validActions,
} from '../../core/operations.models';
import { StatusBadge } from '../status-badge/status-badge';

@Component({
  selector: 'app-work-item-detail',
  imports: [DatePipe, StatusBadge],
  templateUrl: './work-item-detail.html',
  styleUrl: './work-item-detail.scss',
})
export class WorkItemDetail {
  readonly item = input<Order | null>(null);
  readonly pending = input(false);
  readonly mode = input.required<ConnectionMode>();
  readonly closeRequested = output<void>();
  readonly actionRequested = output<OrderActionRequest>();

  protected readonly cancellationReason = signal('');
  protected readonly allowedActions = computed(() => {
    const current = this.item();
    return current ? validActions(current.status) : [];
  });

  protected request(action: Exclude<OrderAction, 'cancel'>): void {
    this.actionRequested.emit({ action });
  }

  protected requestCancellation(): void {
    const reason = this.cancellationReason().trim();
    if (reason) {
      this.actionRequested.emit({ action: 'cancel', reason });
    }
  }

  protected onReasonInput(event: Event): void {
    this.cancellationReason.set((event.target as HTMLInputElement).value);
  }

  @HostListener('document:keydown.escape')
  protected closeOnEscape(): void {
    if (this.item()) {
      this.closeRequested.emit();
    }
  }
}

import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { AppHeader } from './components/app-header/app-header';
import { MetricCard } from './components/metric-card/metric-card';
import { WorkItemDetail } from './components/work-item-detail/work-item-detail';
import { WorkItemTable } from './components/work-item-table/work-item-table';
import { WorkloadChart } from './components/workload-chart/workload-chart';
import {
  CreateOrderRequest,
  Metric,
  Order,
  OrderActionRequest,
  OrderPriority,
  OrderStatus,
  WorkloadPoint,
} from './core/operations.models';
import { OperationsService } from './core/operations.service';

type StatusFilter = 'all' | OrderStatus;
type PriorityFilter = 'all' | OrderPriority;

@Component({
  selector: 'app-root',
  imports: [
    AppHeader,
    MetricCard,
    ReactiveFormsModule,
    WorkItemDetail,
    WorkItemTable,
    WorkloadChart,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly operations = inject(OperationsService);

  protected readonly orders = this.operations.orders;
  protected readonly connectionMode = this.operations.connectionMode;
  protected readonly loading = this.operations.loading;
  protected readonly creating = this.operations.creating;
  protected readonly pendingOrderId = this.operations.pendingOrderId;
  protected readonly error = this.operations.error;
  protected readonly notice = this.operations.notice;
  protected readonly lastSynced = this.operations.lastSynced;

  protected readonly statusFilter = signal<StatusFilter>('all');
  protected readonly priorityFilter = signal<PriorityFilter>('all');
  protected readonly searchTerm = signal('');
  protected readonly selectedItemId = signal<string | null>(null);

  protected readonly createForm = new FormGroup({
    externalReference: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(64),
        Validators.pattern(/^[A-Za-z0-9][A-Za-z0-9._-]{2,63}$/),
      ],
    }),
    customerName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(500)],
    }),
    priority: new FormControl<OrderPriority>('Normal', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    idempotencyKey: new FormControl(createIdempotencyKey(), {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(128),
        Validators.pattern(/^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/),
      ],
    }),
  });

  protected readonly filteredItems = computed(() => {
    const status = this.statusFilter();
    const priority = this.priorityFilter();
    const search = this.searchTerm().trim().toLocaleLowerCase();

    return this.orders().filter((order) => {
      const matchesStatus = status === 'all' || order.status === status;
      const matchesPriority = priority === 'all' || order.priority === priority;
      const searchTarget =
        `${order.externalReference} ${order.customerName} ${order.description} ${order.id}`.toLocaleLowerCase();
      const matchesSearch = !search || searchTarget.includes(search);

      return matchesStatus && matchesPriority && matchesSearch;
    });
  });

  protected readonly selectedItem = computed(
    () => this.orders().find((order) => order.id === this.selectedItemId()) ?? null,
  );

  protected readonly resultSummary = computed(
    () => `${this.filteredItems().length} of ${this.orders().length} orders shown`,
  );

  protected readonly metrics = computed<readonly Metric[]>(() => {
    const orders = this.orders();
    const received = orders.filter((order) => order.status === 'Received').length;
    const processing = orders.filter((order) => order.status === 'Processing').length;
    const completed = orders.filter((order) => order.status === 'Completed').length;
    const criticalActive = orders.filter(
      (order) =>
        order.priority === 'Critical' &&
        (order.status === 'Received' || order.status === 'Processing'),
    ).length;

    return [
      {
        label: 'Loaded orders',
        value: `${orders.length}`,
        change: this.connectionMode() === 'live' ? 'Live' : 'Local',
        context: 'current queue snapshot',
        direction: 'flat',
        tone: 'neutral',
        icon: 'throughput',
      },
      {
        label: 'Active queue',
        value: `${received + processing}`,
        change: `${received} received`,
        context: `${processing} processing`,
        direction: 'flat',
        tone: processing ? 'warning' : 'neutral',
        icon: 'cycle',
      },
      {
        label: 'Completed',
        value: `${completed}`,
        change: orders.length ? `${Math.round((completed / orders.length) * 100)}%` : '0%',
        context: 'of loaded orders',
        direction: 'flat',
        tone: 'positive',
        icon: 'sla',
      },
      {
        label: 'Critical active',
        value: `${criticalActive}`,
        change: criticalActive ? 'Review now' : 'Clear',
        context: 'received or processing',
        direction: 'flat',
        tone: criticalActive ? 'critical' : 'positive',
        icon: 'incident',
      },
    ];
  });

  protected readonly workload = computed(() => buildActivity(this.orders()));

  ngOnInit(): void {
    void this.operations.loadOrders();
  }

  protected setStatusFilter(status: StatusFilter): void {
    this.statusFilter.set(status);
  }

  protected onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected onPriorityChange(event: Event): void {
    this.priorityFilter.set((event.target as HTMLSelectElement).value as PriorityFilter);
  }

  protected resetFilters(): void {
    this.statusFilter.set('all');
    this.priorityFilter.set('all');
    this.searchTerm.set('');
  }

  protected inspect(item: Order): void {
    this.selectedItemId.set(item.id);
  }

  protected async performAction(request: OrderActionRequest): Promise<void> {
    const id = this.selectedItemId();
    if (id) {
      await this.operations.transitionOrder(id, request.action, request.reason);
    }
  }

  protected focusCreateForm(): void {
    document.getElementById('external-reference')?.focus();
  }

  protected async refreshData(): Promise<void> {
    await this.operations.loadOrders();
  }

  protected async createOrder(): Promise<void> {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const value = this.createForm.getRawValue();
    const request: CreateOrderRequest = {
      externalReference: value.externalReference,
      customerName: value.customerName,
      description: value.description,
      priority: value.priority,
    };
    const created = await this.operations.createOrder(request, value.idempotencyKey);

    if (created) {
      this.selectedItemId.set(created.id);
      document.getElementById('workflows')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  protected regenerateIdempotencyKey(): void {
    this.createForm.controls.idempotencyKey.setValue(createIdempotencyKey());
  }
}

function buildActivity(orders: readonly Order[], now = new Date()): readonly WorkloadPoint[] {
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (6 - index));

    return {
      label: day.toLocaleDateString('en-US', { weekday: 'short' }),
      intake: orders.filter((order) => isSameDay(order.createdAt, day)).length,
      completed: orders.filter((order) => order.completedAt && isSameDay(order.completedAt, day))
        .length,
      cancelled: orders.filter(
        (order) => order.status === 'Cancelled' && isSameDay(order.updatedAt, day),
      ).length,
    };
  });
}

function isSameDay(value: string, day: Date): boolean {
  const date = new Date(value);
  return (
    date.getFullYear() === day.getFullYear() &&
    date.getMonth() === day.getMonth() &&
    date.getDate() === day.getDate()
  );
}

function createIdempotencyKey(): string {
  const suffix = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`;
  return `ops-ui-${suffix}`;
}

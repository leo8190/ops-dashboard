import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { createDemoOrders } from '../data/demo-orders';
import { ORDERFLOW_API_BASE_URL } from './api-config';
import {
  ApiProblemDetails,
  ConnectionMode,
  CreateOrderRequest,
  Order,
  OrderAction,
  OrderListResponse,
  validActions,
} from './operations.models';

interface DemoIdempotencyEntry {
  readonly fingerprint: string;
  readonly orderId: string;
}

@Injectable({ providedIn: 'root' })
export class OperationsService {
  private readonly http = inject(HttpClient);
  private readonly configuredBaseUrl = inject(ORDERFLOW_API_BASE_URL);
  private readonly ordersState = signal<readonly Order[]>([]);
  private readonly connectionModeState = signal<ConnectionMode>('connecting');
  private readonly loadingState = signal(false);
  private readonly creatingState = signal(false);
  private readonly pendingOrderIdState = signal<string | null>(null);
  private readonly errorState = signal<string | null>(null);
  private readonly noticeState = signal<string | null>(null);
  private readonly lastSyncedState = signal(new Date());
  private readonly demoIdempotency = new Map<string, DemoIdempotencyEntry>();

  readonly orders = this.ordersState.asReadonly();
  readonly connectionMode = this.connectionModeState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly creating = this.creatingState.asReadonly();
  readonly pendingOrderId = this.pendingOrderIdState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly notice = this.noticeState.asReadonly();
  readonly lastSynced = this.lastSyncedState.asReadonly();
  readonly apiBaseUrl = this.configuredBaseUrl;

  private readonly ordersUrl = `${this.configuredBaseUrl}/api/v1/orders`;

  async loadOrders(): Promise<void> {
    if (this.loadingState()) {
      return;
    }

    const previousMode = this.connectionModeState();
    this.loadingState.set(true);
    this.errorState.set(null);
    this.noticeState.set(null);

    try {
      const response = await firstValueFrom(
        this.http.get<OrderListResponse>(`${this.ordersUrl}/`, {
          params: { page: 1, pageSize: 100 },
        }),
      );

      this.ordersState.set(sortOrders(response.items));
      this.connectionModeState.set('live');
      this.lastSyncedState.set(new Date());
    } catch (error: unknown) {
      this.errorState.set(
        apiErrorMessage(error, `OrderFlow API is unavailable at ${this.configuredBaseUrl}.`),
      );

      if (previousMode === 'live' || previousMode === 'offline') {
        this.connectionModeState.set('offline');
      } else {
        if (this.ordersState().length === 0) {
          this.ordersState.set(createDemoOrders());
        }
        this.connectionModeState.set('demo');
      }

      this.lastSyncedState.set(new Date());
    } finally {
      this.loadingState.set(false);
    }
  }

  async createOrder(request: CreateOrderRequest, idempotencyKey: string): Promise<Order | null> {
    if (this.creatingState()) {
      return null;
    }

    this.errorState.set(null);
    this.noticeState.set(null);
    this.creatingState.set(true);

    try {
      if (this.connectionModeState() === 'demo') {
        return this.createDemoOrder(request, idempotencyKey);
      }

      const response = await firstValueFrom(
        this.http.post<Order>(`${this.ordersUrl}/`, request, {
          headers: new HttpHeaders({ 'Idempotency-Key': idempotencyKey }),
          observe: 'response',
        }),
      );

      if (!response.body) {
        throw new Error('The API returned an empty order response.');
      }

      this.upsert(response.body);
      this.connectionModeState.set('live');
      this.lastSyncedState.set(new Date());
      this.noticeState.set(
        response.headers.get('Idempotency-Replayed') === 'true'
          ? `Idempotent replay returned ${response.body.externalReference}; no duplicate was created.`
          : `Order ${response.body.externalReference} was created by the live API.`,
      );

      return response.body;
    } catch (error: unknown) {
      this.handleMutationError(error, 'The order could not be created.');
      return null;
    } finally {
      this.creatingState.set(false);
    }
  }

  async transitionOrder(
    orderId: string,
    action: OrderAction,
    reason?: string,
  ): Promise<Order | null> {
    const current = this.ordersState().find((order) => order.id === orderId);

    if (!current) {
      this.errorState.set(
        'The selected order is no longer in the loaded queue. Refresh and retry.',
      );
      return null;
    }

    if (!validActions(current.status).includes(action)) {
      this.errorState.set(
        `${actionLabel(action)} is not valid while the order is ${current.status}.`,
      );
      return null;
    }

    if (action === 'cancel' && !reason?.trim()) {
      this.errorState.set('A cancellation reason is required.');
      return null;
    }

    if (this.pendingOrderIdState()) {
      return null;
    }

    this.errorState.set(null);
    this.noticeState.set(null);
    this.pendingOrderIdState.set(orderId);

    try {
      if (this.connectionModeState() === 'demo') {
        return this.transitionDemoOrder(current, action, reason);
      }

      const body = action === 'cancel' ? { reason: reason!.trim() } : null;
      const updated = await firstValueFrom(
        this.http.post<Order>(`${this.ordersUrl}/${encodeURIComponent(orderId)}/${action}`, body),
      );

      this.upsert(updated);
      this.connectionModeState.set('live');
      this.lastSyncedState.set(new Date());
      this.noticeState.set(
        `${updated.externalReference} moved to ${updated.status} through the live API.`,
      );

      return updated;
    } catch (error: unknown) {
      this.handleMutationError(error, `The ${action} action failed.`);
      return null;
    } finally {
      this.pendingOrderIdState.set(null);
    }
  }

  clearFeedback(): void {
    this.errorState.set(null);
    this.noticeState.set(null);
  }

  private createDemoOrder(request: CreateOrderRequest, idempotencyKey: string): Order | null {
    const fingerprint = JSON.stringify(request);
    const existing = this.demoIdempotency.get(idempotencyKey);

    if (existing) {
      const order = this.ordersState().find((candidate) => candidate.id === existing.orderId);
      if (existing.fingerprint !== fingerprint) {
        this.errorState.set(
          'That idempotency key was already used with different data in this demo session.',
        );
        return null;
      }

      if (order) {
        this.noticeState.set(
          `Demo replay returned ${order.externalReference}; no duplicate was created.`,
        );
        return order;
      }
    }

    const now = new Date().toISOString();
    const order: Order = {
      id: createUuid(),
      externalReference: request.externalReference.trim(),
      customerName: request.customerName.trim(),
      description: request.description.trim(),
      priority: request.priority,
      status: 'Received',
      createdAt: now,
      updatedAt: now,
      completedAt: null,
      cancellationReason: null,
      version: 1,
    };

    this.demoIdempotency.set(idempotencyKey, { fingerprint, orderId: order.id });
    this.upsert(order);
    this.lastSyncedState.set(new Date());
    this.noticeState.set(
      `Demo order ${order.externalReference} was created locally; no backend was changed.`,
    );

    return order;
  }

  private transitionDemoOrder(current: Order, action: OrderAction, reason?: string): Order {
    const now = new Date().toISOString();
    const status =
      action === 'start' ? 'Processing' : action === 'complete' ? 'Completed' : 'Cancelled';
    const updated: Order = {
      ...current,
      status,
      updatedAt: now,
      completedAt: status === 'Completed' ? now : current.completedAt,
      cancellationReason: status === 'Cancelled' ? reason!.trim() : current.cancellationReason,
      version: current.version + 1,
    };

    this.upsert(updated);
    this.lastSyncedState.set(new Date());
    this.noticeState.set(
      `Demo order ${updated.externalReference} moved to ${status} locally; no backend was changed.`,
    );

    return updated;
  }

  private handleMutationError(error: unknown, fallback: string): void {
    this.errorState.set(apiErrorMessage(error, fallback));
    if (error instanceof HttpErrorResponse && error.status === 0) {
      this.connectionModeState.set('offline');
    }
  }

  private upsert(updated: Order): void {
    const remaining = this.ordersState().filter((order) => order.id !== updated.id);
    this.ordersState.set(sortOrders([updated, ...remaining]));
  }
}

function sortOrders(orders: readonly Order[]): readonly Order[] {
  const priorityRank: Readonly<Record<Order['priority'], number>> = {
    Critical: 0,
    High: 1,
    Normal: 2,
    Low: 3,
  };

  return [...orders].sort(
    (left, right) =>
      priorityRank[left.priority] - priorityRank[right.priority] ||
      Date.parse(right.createdAt) - Date.parse(left.createdAt),
  );
}

function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return fallback;
    }

    const problem = error.error as ApiProblemDetails | string | null;
    if (typeof problem === 'string' && problem.trim()) {
      return problem;
    }

    if (problem && typeof problem === 'object') {
      if (problem.detail) {
        return problem.detail;
      }

      const validationMessage = problem.errors
        ? Object.values(problem.errors).flat().find(Boolean)
        : undefined;
      if (validationMessage) {
        return validationMessage;
      }
    }

    return `${fallback} The API returned HTTP ${error.status}.`;
  }

  return error instanceof Error ? error.message : fallback;
}

function actionLabel(action: OrderAction): string {
  return action === 'start' ? 'Starting' : action === 'complete' ? 'Completing' : 'Cancelling';
}

function createUuid(): string {
  return globalThis.crypto?.randomUUID?.() ?? '00000000-0000-4000-8000-000000000001';
}

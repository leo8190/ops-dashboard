export type OrderStatus = 'Received' | 'Processing' | 'Completed' | 'Cancelled';

export type OrderPriority = 'Low' | 'Normal' | 'High' | 'Critical';

export type OrderAction = 'start' | 'complete' | 'cancel';

export type ConnectionMode = 'connecting' | 'live' | 'offline' | 'demo';

export interface Order {
  readonly id: string;
  readonly externalReference: string;
  readonly customerName: string;
  readonly description: string;
  readonly priority: OrderPriority;
  readonly status: OrderStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly completedAt: string | null;
  readonly cancellationReason: string | null;
  readonly version: number;
}

export interface OrderListResponse {
  readonly items: readonly Order[];
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
  readonly totalPages: number;
}

export interface CreateOrderRequest {
  readonly externalReference: string;
  readonly customerName: string;
  readonly description: string;
  readonly priority: OrderPriority;
}

export interface OrderActionRequest {
  readonly action: OrderAction;
  readonly reason?: string;
}

export interface ApiProblemDetails {
  readonly title?: string;
  readonly detail?: string;
  readonly code?: string;
  readonly errors?: Readonly<Record<string, readonly string[]>>;
}

export type MetricIcon = 'throughput' | 'sla' | 'incident' | 'cycle';

export interface Metric {
  readonly label: string;
  readonly value: string;
  readonly change: string;
  readonly context: string;
  readonly direction: 'up' | 'down' | 'flat';
  readonly tone: 'positive' | 'warning' | 'critical' | 'neutral';
  readonly icon: MetricIcon;
}

export interface WorkloadPoint {
  readonly label: string;
  readonly intake: number;
  readonly completed: number;
  readonly cancelled: number;
}

export function validActions(status: OrderStatus): readonly OrderAction[] {
  switch (status) {
    case 'Received':
      return ['start', 'cancel'];
    case 'Processing':
      return ['complete', 'cancel'];
    case 'Completed':
    case 'Cancelled':
      return [];
  }
}

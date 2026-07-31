export type OperationalStatus = 'on-track' | 'at-risk' | 'blocked';

export type Priority = 'P0' | 'P1' | 'P2';

export interface Owner {
  readonly name: string;
  readonly initials: string;
}

export interface WorkItem {
  readonly id: string;
  readonly title: string;
  readonly account: string;
  readonly team: string;
  readonly owner: Owner;
  readonly status: OperationalStatus;
  readonly priority: Priority;
  readonly progress: number;
  readonly dueLabel: string;
  readonly updatedLabel: string;
  readonly summary: string;
}

export interface Incident {
  readonly id: string;
  readonly title: string;
  readonly service: string;
  readonly severity: Exclude<Priority, 'P0'>;
  readonly elapsed: string;
  readonly owner: string;
  readonly acknowledged: boolean;
}

export interface WorkloadPoint {
  readonly label: string;
  readonly intake: number;
  readonly completed: number;
  readonly capacity: number;
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

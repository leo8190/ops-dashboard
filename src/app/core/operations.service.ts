import { Injectable, signal } from '@angular/core';

import { Incident, OperationalStatus, WorkItem } from './operations.models';
import {
  MOCK_INCIDENTS,
  MOCK_METRICS,
  MOCK_WORK_ITEMS,
  MOCK_WORKLOAD,
} from '../data/mock-operations';

@Injectable({ providedIn: 'root' })
export class OperationsService {
  private readonly workItemsState = signal<readonly WorkItem[]>([...MOCK_WORK_ITEMS]);
  private readonly incidentsState = signal<readonly Incident[]>([...MOCK_INCIDENTS]);

  readonly workItems = this.workItemsState.asReadonly();
  readonly incidents = this.incidentsState.asReadonly();
  readonly metrics = MOCK_METRICS;
  readonly workload = MOCK_WORKLOAD;

  updateStatus(id: string, status: OperationalStatus): void {
    this.workItemsState.update((items) =>
      items.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  }

  acknowledgeIncident(id: string): void {
    this.incidentsState.update((incidents) =>
      incidents.map((incident) =>
        incident.id === id ? { ...incident, acknowledged: true } : incident,
      ),
    );
  }
}

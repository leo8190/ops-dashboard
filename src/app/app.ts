import { Component, computed, inject, signal } from '@angular/core';

import { AppHeader } from './components/app-header/app-header';
import { IncidentPanel } from './components/incident-panel/incident-panel';
import { MetricCard } from './components/metric-card/metric-card';
import { WorkItemDetail } from './components/work-item-detail/work-item-detail';
import { WorkItemTable } from './components/work-item-table/work-item-table';
import { WorkloadChart } from './components/workload-chart/workload-chart';
import { OperationalStatus, WorkItem } from './core/operations.models';
import { OperationsService } from './core/operations.service';

type StatusFilter = 'all' | OperationalStatus;

@Component({
  selector: 'app-root',
  imports: [AppHeader, IncidentPanel, MetricCard, WorkItemDetail, WorkItemTable, WorkloadChart],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly operations = inject(OperationsService);

  protected readonly metrics = this.operations.metrics;
  protected readonly workload = this.operations.workload;
  protected readonly incidents = this.operations.incidents;
  protected readonly workItems = this.operations.workItems;

  protected readonly statusFilter = signal<StatusFilter>('all');
  protected readonly teamFilter = signal('All teams');
  protected readonly searchTerm = signal('');
  protected readonly selectedItemId = signal<string | null>(null);
  protected readonly lastSynced = signal(new Date());
  protected readonly refreshing = signal(false);

  protected readonly teams = computed(() => [
    'All teams',
    ...new Set(this.workItems().map((item) => item.team)),
  ]);

  protected readonly filteredItems = computed(() => {
    const status = this.statusFilter();
    const team = this.teamFilter();
    const search = this.searchTerm().trim().toLocaleLowerCase();

    return this.workItems().filter((item) => {
      const matchesStatus = status === 'all' || item.status === status;
      const matchesTeam = team === 'All teams' || item.team === team;
      const searchTarget =
        `${item.id} ${item.title} ${item.account} ${item.owner.name}`.toLocaleLowerCase();
      const matchesSearch = !search || searchTarget.includes(search);

      return matchesStatus && matchesTeam && matchesSearch;
    });
  });

  protected readonly selectedItem = computed(
    () => this.workItems().find((item) => item.id === this.selectedItemId()) ?? null,
  );

  protected readonly resultSummary = computed(
    () => `${this.filteredItems().length} of ${this.workItems().length} workflows shown`,
  );

  protected setStatusFilter(status: StatusFilter): void {
    this.statusFilter.set(status);
  }

  protected onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected onTeamChange(event: Event): void {
    this.teamFilter.set((event.target as HTMLSelectElement).value);
  }

  protected resetFilters(): void {
    this.statusFilter.set('all');
    this.teamFilter.set('All teams');
    this.searchTerm.set('');
  }

  protected inspect(item: WorkItem): void {
    this.selectedItemId.set(item.id);
  }

  protected updateSelectedStatus(status: OperationalStatus): void {
    const id = this.selectedItemId();
    if (id) {
      this.operations.updateStatus(id, status);
    }
  }

  protected acknowledgeIncident(id: string): void {
    this.operations.acknowledgeIncident(id);
  }

  protected showSlaRisks(): void {
    this.statusFilter.set('at-risk');
    document.getElementById('workflows')?.scrollIntoView({ behavior: 'smooth' });
  }

  protected refreshData(): void {
    if (this.refreshing()) {
      return;
    }

    this.refreshing.set(true);
    window.setTimeout(() => {
      this.lastSynced.set(new Date());
      this.refreshing.set(false);
    }, 650);
  }
}

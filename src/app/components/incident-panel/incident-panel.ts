import { Component, input, output } from '@angular/core';

import { Incident } from '../../core/operations.models';

@Component({
  selector: 'app-incident-panel',
  templateUrl: './incident-panel.html',
  styleUrl: './incident-panel.scss',
})
export class IncidentPanel {
  readonly incidents = input.required<readonly Incident[]>();
  readonly acknowledged = output<string>();
}

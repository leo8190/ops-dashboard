import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { ConnectionMode } from '../../core/operations.models';

@Component({
  selector: 'app-header',
  imports: [DatePipe],
  templateUrl: './app-header.html',
  styleUrl: './app-header.scss',
})
export class AppHeader {
  readonly lastSynced = input.required<Date>();
  readonly refreshing = input(false);
  readonly mode = input.required<ConnectionMode>();
  readonly refreshRequested = output<void>();
}

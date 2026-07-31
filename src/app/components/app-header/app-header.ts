import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [DatePipe],
  templateUrl: './app-header.html',
  styleUrl: './app-header.scss',
})
export class AppHeader {
  readonly lastSynced = input.required<Date>();
  readonly refreshing = input(false);
  readonly refreshRequested = output<void>();
}

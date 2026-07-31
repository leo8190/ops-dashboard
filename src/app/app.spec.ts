import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { createDemoOrders } from './data/demo-orders';
import { App } from './app';
import { OperationsService } from './core/operations.service';

describe('App', () => {
  const operations = {
    orders: signal(createDemoOrders(new Date('2026-07-31T16:00:00.000Z'))),
    connectionMode: signal<'demo'>('demo'),
    loading: signal(false),
    creating: signal(false),
    pendingOrderId: signal<string | null>(null),
    error: signal<string | null>(null),
    notice: signal<string | null>(null),
    lastSynced: signal(new Date('2026-07-31T16:00:00.000Z')),
    apiBaseUrl: 'http://localhost:5099',
    loadOrders: vi.fn(async () => undefined),
    createOrder: vi.fn(async () => null),
    transitionOrder: vi.fn(async () => null),
    clearFeedback: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: OperationsService, useValue: operations }],
    }).compileComponents();
  });

  it('renders the connected product and its honest demo fallback', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('Order operations overview');
    expect(compiled.querySelector('.connection-note')?.textContent).toContain(
      'Offline demo fallback',
    );
    expect(compiled.querySelector('#create-title')?.textContent).toContain('safely replay');
  });

  it('filters the queue by the real API status', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const processingFilter = compiled.querySelector<HTMLButtonElement>(
      '[data-filter="Processing"]',
    );
    processingFilter?.click();
    fixture.detectChanges();

    expect(compiled.querySelectorAll('[data-testid="work-item-row"]')).toHaveLength(1);
    expect(compiled.querySelector('.result-summary')?.textContent).toContain('1 of 5 orders shown');
  });

  it('shows only valid actions for a received order', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector<HTMLButtonElement>('.action button')?.click();
    fixture.detectChanges();

    expect(compiled.querySelector('app-work-item-detail')?.textContent).toContain(
      'Start processing',
    );
    expect(compiled.querySelector('app-work-item-detail')?.textContent).not.toContain(
      'Complete order',
    );
    expect(compiled.querySelector('app-work-item-detail')?.textContent).toContain('Demo fallback');
  });
});

import { TestBed } from '@angular/core/testing';

import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('renders the dashboard and its portfolio disclosure', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('Operations overview');
    expect(compiled.querySelector('.demo-note')?.textContent).toContain('Portfolio demo');
  });

  it('filters workflows by operational status', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const atRiskFilter = compiled.querySelector<HTMLButtonElement>('[data-filter="at-risk"]');

    atRiskFilter?.click();
    fixture.detectChanges();

    expect(compiled.querySelectorAll('[data-testid="work-item-row"]')).toHaveLength(3);
    expect(compiled.querySelector('.result-summary')?.textContent).toContain(
      '3 of 8 workflows shown',
    );
  });

  it('acknowledges a simulated incident', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const buttonsBefore = compiled.querySelectorAll('app-incident-panel .incident button');

    expect(buttonsBefore).toHaveLength(2);
    (buttonsBefore.item(0) as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(compiled.querySelectorAll('app-incident-panel .incident button')).toHaveLength(1);
  });
});

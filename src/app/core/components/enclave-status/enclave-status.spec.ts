import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { EnsyLabsIcon, IconName } from '@enclave/core/icons';

import { ENCLAVE_STATUSES, EnclaveStatus, EnclaveStatusValues } from './enclave-status';

// The single source of truth for this spec: every status the component is expected to know,
// with the label and host class it must produce. Adding a status to any domain model widens
// EnclaveStatusValues without touching this table, so "covers every status the domain models
// define" below fails until the new value is given a label, a class, and a :host(...) color
// rule in enclave-status.scss. That failure is intended -- it's the reminder to style it.
const KNOWN_STATUSES = [
  { status: 'Active', label: 'Active', cssClass: 'active' },
  { status: 'Deactivated', label: 'Deactivated', cssClass: 'deactivated' },
  { status: 'InviteSent', label: 'Invite Sent', cssClass: 'invite-sent' },
  { status: 'Retired', label: 'Retired', cssClass: 'retired' },
  { status: 'Upcoming', label: 'Upcoming', cssClass: 'upcoming' },
] as const satisfies readonly { status: EnclaveStatusValues; label: string; cssClass: string }[];

describe('EnclaveStatus', () => {
  let fixture: ComponentFixture<EnclaveStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnclaveStatus],
    }).compileComponents();

    fixture = TestBed.createComponent(EnclaveStatus);
  });

  function renderWith(status: EnclaveStatusValues): HTMLElement {
    fixture.componentRef.setInput('status', status);
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  it('should create', () => {
    expect(renderWith('Active')).toBeTruthy();
  });

  it('renders the dot icon', () => {
    renderWith('Active');

    const icon = fixture.debugElement.query(By.directive(EnsyLabsIcon))
      .componentInstance as EnsyLabsIcon;
    expect(icon.name()).toBe(IconName.Dot);
  });

  // Order in ENCLAVE_STATUSES is an artifact of the spread order in enclave-status.ts, not
  // something worth pinning -- compare as sets so only membership matters.
  it('covers every status the domain models define', () => {
    const covered = KNOWN_STATUSES.map((s) => s.status).sort();

    expect(covered).toEqual([...ENCLAVE_STATUSES].sort());
  });

  it.each([...KNOWN_STATUSES])('renders $status with the label "$label"', ({ status, label }) => {
    const host = renderWith(status);

    expect(host.querySelector('.content')?.textContent?.trim()).toBe(label);
  });

  // The status class lands on the host element, not the inner container -- enclave-status.scss
  // declares its --enclave-status-* aliases on :host, and a custom property's var() references
  // are substituted where they're declared, so an override on a descendant would never reach them.
  it.each([...KNOWN_STATUSES])(
    'puts the host class "$cssClass" on a $status status',
    ({ status, cssClass }) => {
      const host = renderWith(status);

      expect(host.classList.contains(cssClass)).toBe(true);
    },
  );

  // Complements the coverage check above: that one catches a status missing from this spec's
  // table, this one catches a status missing a branch in the component's own switches.
  it('handles every status in ENCLAVE_STATUSES without throwing', () => {
    for (const status of ENCLAVE_STATUSES) {
      expect(() => renderWith(status)).not.toThrow();
    }
  });

  it('swaps both the label and the host class when the status changes', () => {
    const host = renderWith('Active');
    expect(host.classList.contains('active')).toBe(true);

    fixture.componentRef.setInput('status', 'Retired');
    fixture.detectChanges();

    expect(host.classList.contains('retired')).toBe(true);
    expect(host.classList.contains('active')).toBe(false);
    expect(host.querySelector('.content')?.textContent?.trim()).toBe('Retired');
  });

  it('de-duplicates statuses shared across the domain models', () => {
    expect(ENCLAVE_STATUSES).toHaveLength(new Set(ENCLAVE_STATUSES).size);
    expect(ENCLAVE_STATUSES).toContain('Active');
  });
});

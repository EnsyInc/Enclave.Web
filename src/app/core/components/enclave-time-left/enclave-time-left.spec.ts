import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { EnclaveTimeLeft } from './enclave-time-left';

const NOW = new Date('2026-01-15T12:00:00Z');
const DAY_MS = 24 * 60 * 60 * 1000;

function daysFromNow(days: number): Date {
  return new Date(NOW.getTime() + days * DAY_MS);
}

function hoursFromNow(hours: number): Date {
  return new Date(NOW.getTime() + hours * 60 * 60 * 1000);
}

describe('EnclaveTimeLeft', () => {
  let fixture: ComponentFixture<EnclaveTimeLeft>;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);

    await TestBed.configureTestingModule({
      imports: [EnclaveTimeLeft],
    }).compileComponents();

    fixture = TestBed.createComponent(EnclaveTimeLeft);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function renderWith(startDate: Date, endDate: Date, negativeTimeLeftLabel?: string): HTMLElement {
    fixture.componentRef.setInput('startDate', startDate);
    fixture.componentRef.setInput('endDate', endDate);
    if (negativeTimeLeftLabel !== undefined) {
      fixture.componentRef.setInput('negativeTimeLeftLabel', negativeTimeLeftLabel);
    }
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  it('should create', () => {
    expect(renderWith(daysFromNow(-10), daysFromNow(10))).toBeTruthy();
  });

  describe('timeLeft', () => {
    it('buckets a difference of a few hours as hours', () => {
      renderWith(daysFromNow(-1), hoursFromNow(5));
      expect(fixture.componentInstance.timeLeft()).toBe('5h');
    });

    it('buckets a difference of a few days as days', () => {
      renderWith(daysFromNow(-1), daysFromNow(3));
      expect(fixture.componentInstance.timeLeft()).toBe('3d');
    });

    it('buckets a difference of a few months as months', () => {
      renderWith(daysFromNow(-1), new Date('2026-04-15T12:00:00Z'));
      expect(fixture.componentInstance.timeLeft()).toBe('3mo');
    });

    it('buckets a difference of multiple years as years', () => {
      renderWith(daysFromNow(-1), new Date('2028-01-15T12:00:00Z'));
      expect(fixture.componentInstance.timeLeft()).toBe('2y');
    });

    it('borrows days from the prior month across a month boundary', () => {
      vi.setSystemTime(new Date('2026-01-31T12:00:00Z'));
      renderWith(daysFromNow(-1), new Date('2026-02-05T12:00:00Z'));
      expect(fixture.componentInstance.timeLeft()).toBe('5d');
    });

    it('borrows across a year boundary', () => {
      vi.setSystemTime(new Date('2025-12-20T12:00:00Z'));
      renderWith(daysFromNow(-1), new Date('2026-01-03T12:00:00Z'));
      expect(fixture.componentInstance.timeLeft()).toBe('14d');
    });

    it('falls back to the default negative label once the end date has passed', () => {
      renderWith(daysFromNow(-10), daysFromNow(-1));
      expect(fixture.componentInstance.timeLeft()).toBe('-');
    });

    it('treats an end date equal to now as already passed', () => {
      renderWith(daysFromNow(-10), NOW);
      expect(fixture.componentInstance.timeLeft()).toBe('-');
    });

    it('uses a custom negative label when provided', () => {
      renderWith(daysFromNow(-10), daysFromNow(-1), 'Expired');
      expect(fixture.componentInstance.timeLeft()).toBe('Expired');
    });
  });

  describe('timeLeftPercent', () => {
    it('computes the remaining share of the license window', () => {
      renderWith(daysFromNow(-30), daysFromNow(10));
      expect(fixture.componentInstance.timeLeftPercent()).toBe(25);
    });

    it('clamps to 0 once the end date has passed', () => {
      renderWith(daysFromNow(-20), daysFromNow(-5));
      expect(fixture.componentInstance.timeLeftPercent()).toBe(0);
    });

    it('clamps to 100 before the window has started', () => {
      renderWith(daysFromNow(5), daysFromNow(15));
      expect(fixture.componentInstance.timeLeftPercent()).toBe(100);
    });

    it('returns 0 for a degenerate start/end pair', () => {
      const sameDate = daysFromNow(5);
      renderWith(sameDate, sameDate);
      expect(fixture.componentInstance.timeLeftPercent()).toBe(0);
    });
  });

  describe('rendering', () => {
    it('shows the time-left label', () => {
      const el = renderWith(daysFromNow(-1), daysFromNow(3));
      expect(el.querySelector('span')?.textContent?.trim()).toBe('3d');
    });

    it('renders the progress bar while there is time left', () => {
      const el = renderWith(daysFromNow(-1), daysFromNow(3));
      expect(el.querySelector('mat-progress-bar')).toBeTruthy();
    });

    it('hides the progress bar once time left is 0%', () => {
      const el = renderWith(daysFromNow(-20), daysFromNow(-5));
      expect(el.querySelector('mat-progress-bar')).toBeFalsy();
    });
  });
});

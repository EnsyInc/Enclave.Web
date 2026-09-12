import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'enclave-time-left',
  imports: [MatProgressBarModule],
  templateUrl: './enclave-time-left.html',
  styleUrl: './enclave-time-left.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnclaveTimeLeft {
  public readonly startDate = input.required<Date>();
  public readonly endDate = input.required<Date>();
  public readonly negativeTimeLeftLabel = input<string>('-');

  public readonly timeLeft = computed(() => {
    const end = this.endDate();
    const now = new Date();

    if (end.getTime() <= now.getTime()) {
      return this.negativeTimeLeftLabel();
    }

    let years = end.getUTCFullYear() - now.getUTCFullYear();
    let months = end.getUTCMonth() - now.getUTCMonth();
    let days = end.getUTCDate() - now.getUTCDate();
    let hours = end.getUTCHours() - now.getUTCHours();

    if (hours < 0) {
      days--;
      hours += 24;
    }
    if (days < 0) {
      months--;
      days += EnclaveTimeLeft.daysInMonth(end.getUTCFullYear(), end.getUTCMonth() - 1);
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    if (years > 0) {
      return `${years}y`;
    }
    if (months > 0) {
      return `${months}mo`;
    }
    if (days > 0) {
      return `${days}d`;
    }
    return `${hours}h`;
  });

  public readonly timeLeftPercent = computed(() => {
    const start = this.startDate();
    const end = this.endDate();
    const totalMs = end.getTime() - start.getTime();

    if (totalMs <= 0) {
      return 0;
    }

    const remainingMs = end.getTime() - Date.now();
    const percent = (remainingMs / totalMs) * 100;

    return Math.min(100, Math.max(0, percent));
  });

  private static daysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatSidenav, MatSidenavContainer, MatSidenavModule } from '@angular/material/sidenav';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { EnsyLabsIcon } from '@enclave/core/icons';
import { AppHeader } from '@enclave/core/layout/app-header/app-header';

export const SIDENAV_STORAGE_KEY = 'enclave-sidenav-collapsed';

@Component({
  selector: 'enclave-shell',
  imports: [
    AppHeader,
    EnsyLabsIcon,
    MatBadgeModule,
    MatDividerModule,
    MatSidenavModule,
    MatListModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShell {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly drawer = viewChild.required<MatSidenav>('drawer');
  private readonly sidenavContainer = viewChild.required(MatSidenavContainer);
  private animationFrameId?: number;

  protected readonly isHandset = toSignal(
    this.breakpointObserver.observe(Breakpoints.Handset).pipe(map((state) => state.matches)),
    { requireSync: true },
  );
  protected readonly sidenavCollapsed = signal(this.getInitialSidenavCollapseState());
  protected readonly sidenavContentHidden = signal(this.getInitialSidenavCollapseState());
  protected readonly licenseRequestsCount = input<number>(3);

  protected onToggleSidenav(): void {
    if (this.isHandset()) {
      this.drawer().toggle();
    } else {
      this.sidenavCollapsed.update((v) => !v);
      localStorage.setItem(SIDENAV_STORAGE_KEY, this.sidenavCollapsed().toString());
    }
  }

  private getInitialSidenavCollapseState(): boolean {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    return localStorage.getItem(SIDENAV_STORAGE_KEY) === 'true';
  }

  protected onSidenavTransitionStart(event: TransitionEvent): void {
    if (event.propertyName !== 'width') {
      return;
    }
    if (!this.sidenavCollapsed()) {
      // Expanding: reveal the labels immediately so they grow in with the width
      // instead of popping in only after the animation finishes.
      this.sidenavContentHidden.set(false);
    }
    const step = () => {
      this.sidenavContainer().updateContentMargins();
      this.animationFrameId = requestAnimationFrame(step);
    };
    this.animationFrameId = requestAnimationFrame(step);
  }

  protected onSidenavTransitionEnd(event: TransitionEvent): void {
    if (event.propertyName !== 'width') {
      return;
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.sidenavContainer().updateContentMargins();
    if (this.sidenavCollapsed()) {
      // Collapsing: only remove the labels from layout once the rail has
      // finished narrowing, so they clip smoothly with the width instead of
      // vanishing instantly at the start of the animation.
      this.sidenavContentHidden.set(true);
    }
  }
}

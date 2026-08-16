import { Component, inject, signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatSidenav, MatSidenavContainer, MatSidenavModule } from '@angular/material/sidenav';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { EnsyIcon } from '../../icons/ensy-icon/ensy-icon';
import { AppHeader } from '../app-header/app-header';

@Component({
  selector: 'app-shell',
  imports: [
    AppHeader,
    EnsyIcon,
    MatDividerModule,
    MatSidenavModule,
    MatListModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShell {
  private readonly breakpointObserver = inject(BreakpointObserver);
  
  protected readonly isHandset = toSignal(
    this.breakpointObserver.observe(Breakpoints.Handset).pipe(map((state) => state.matches)),
    { requireSync: true },
  );
  protected readonly sidenavCollapsed = signal(false);
  private animationFrameId?: number;

  @ViewChild('drawer') private readonly drawer!: MatSidenav;
  @ViewChild(MatSidenavContainer) private readonly sidenavContainer!: MatSidenavContainer;

  protected onToggleSidenav(): void {
    if (this.isHandset()) {
      this.drawer.toggle();
    } else {
      this.sidenavCollapsed.update(v => !v);
    }
  }

  protected onSidenavTransitionStart(event: TransitionEvent): void {
    if (event.propertyName !== 'width') {
      return;
    }
    const step = () => {
      this.sidenavContainer.updateContentMargins();
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
    this.sidenavContainer.updateContentMargins();
  }
}

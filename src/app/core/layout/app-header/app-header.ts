import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs';

import { ThemeService } from '@enclave/core';
import { EnclaveAvatar } from '@enclave/core/components';
import { EnsyLabsIcon } from '@enclave/core/icons';
import { routeChain } from '@enclave/core/routing/route-chain';

@Component({
  selector: 'enclave-header',
  imports: [EnclaveAvatar, EnsyLabsIcon, MatButtonModule, MatDivider],
  templateUrl: './app-header.html',
  styleUrl: './app-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppHeader {
  protected readonly userName: string = 'John Doe';
  protected readonly userRole: string = 'Admin';
  protected readonly themeService: ThemeService = inject(ThemeService);
  protected readonly toggleSidenav = output<void>();

  private readonly router: Router = inject(Router);

  /** 
   * Every level contributes, deepest last. A resolver may supply several segments at once 
   */
  private getBreadcrumb(): string[] {
    return routeChain(this.router.routerState.root)
      .slice(1)
      .flatMap((route) => {
        const crumb: string | string[] | undefined = route.snapshot.data['breadcrumb'];
        if (!crumb) {
          return [];
        }
        return Array.isArray(crumb) ? crumb : [crumb];
      });
  }

  /**
   * Last level to declare a section wins, so a child can override its parent while a child
   * without one keeps inheriting (which is how /admin/* all report 'Admin').
   */
  private findSection(): string | undefined {
    return routeChain(this.router.routerState.root).reduce<string | undefined>(
      (section, route) => route.snapshot.data['section'] ?? section,
      undefined,
    );
  }

  protected readonly breadcrumb = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.getBreadcrumb()),
    ),
    { initialValue: this.getBreadcrumb() },
  );

  protected readonly section = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.findSection()),
    ),
    { initialValue: this.findSection() },
  );
}

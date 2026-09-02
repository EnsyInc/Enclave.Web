import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { EnsyLabsIcon } from '@enclave-core/icons/ensy-labs-icon/ensy-labs-icon';
import { ThemeService } from '@enclave-core/theme/theme.service';
import { EnclaveAvatar } from '@enclave/core/components/enclave-avatar/enclave-avatar';

@Component({
  selector: 'enclave-header',
  imports: [MatButtonModule, EnsyLabsIcon, EnclaveAvatar, MatDivider],
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

  private getBreadcrumb(): string[] {
    let route = this.router.routerState.root;
    let breadcrumb: string[] = [];
    while (route.firstChild) {
      route = route.firstChild;
      if (route.snapshot.data['breadcrumb']) {
        breadcrumb = [
          ...breadcrumb,
          ...(Array.isArray(route.snapshot.data['breadcrumb'])
            ? route.snapshot.data['breadcrumb']
            : [route.snapshot.data['breadcrumb']]),
        ];
      }
    }
    return breadcrumb;
  }

  private findSection(): string | undefined {
    let route = this.router.routerState.root;
    let section: string | undefined = route.snapshot.data['section'];
    while (route.firstChild) {
      route = route.firstChild;
      section = route.snapshot.data['section'] ?? section;
    }
    return section;
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

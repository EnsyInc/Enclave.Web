import { Component, inject, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { EnsyIcon } from '../../icons/ensy-icon/ensy-icon';
import { ThemeService } from '../../theme/theme.service';

@Component({
  selector: 'app-header',
  imports: [MatButtonModule, EnsyIcon, MatDivider],
  templateUrl: './app-header.html',
  styleUrl: './app-header.scss',
})
export class AppHeader {
  protected readonly userName: string = 'John Doe';
  protected readonly userRole: string = 'Admin';
  protected readonly userInitials: string = this.userName
    .split(' ')
    .map((n) => n[0])
    .join('');
  protected readonly themeService: ThemeService = inject(ThemeService);
  protected readonly toggleSidenav = output<void>();

  private readonly router: Router = inject(Router);

  private findDeepestBreadcrumb(): string | undefined {
    let route = this.router.routerState.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route.snapshot.data['breadcrumb'];
  }

  protected readonly breadcrumb = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.findDeepestBreadcrumb()),
    ),
    { initialValue: this.findDeepestBreadcrumb() },
  );
}

import { Component, inject } from '@angular/core';
import { ThemeService } from './core/theme/theme.service';
import { AppShell } from './core/layout/app-shell/app-shell';
import { IconRegistryService } from './core/icons/icon-registry.service';

@Component({
  selector: 'app-root',
  imports: [AppShell],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly themeService = inject(ThemeService);
  protected readonly iconService = inject(IconRegistryService);
}

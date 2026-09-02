import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ThemeService } from '@enclave/core';
import { IconRegistryService } from '@enclave/core/icons';
import { AppShell } from '@enclave/core/layout/app-shell/app-shell';

@Component({
  selector: 'enclave-root',
  imports: [AppShell],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly themeService = inject(ThemeService);
  protected readonly iconService = inject(IconRegistryService);
}

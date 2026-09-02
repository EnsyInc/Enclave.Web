import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '@enclave/core/theme/theme.service';
import { AppShell } from '@enclave/core/layout/app-shell/app-shell';
import { IconRegistryService } from '@enclave/core/icons/icon-registry.service';

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

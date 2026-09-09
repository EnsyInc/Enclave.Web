import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ThemeService } from '@enclave/core';
import { IconRegistryService } from '@enclave/core/icons';

@Component({
  selector: 'enclave-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly themeService = inject(ThemeService);
  protected readonly iconService = inject(IconRegistryService);
}

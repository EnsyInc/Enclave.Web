import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

import type { ValuesOf } from '@enclave/core';

import { EnsyLabsIcon } from '@enclave/core/icons';

const REASONS = ['NotFound', 'Forbidden'] as const;
type Reason = ValuesOf<typeof REASONS>;

interface ReasonContent {
  statusCode: string;
  title: string;
  subtitle: string;
}

const DEFAULT_REASON: Reason = 'NotFound';

const CONTENT: Record<Reason, ReasonContent> = {
  NotFound: {
    statusCode: '404',
    title: 'Page not found',
    subtitle: `The page you're looking for doesn't exist or may have been moved`,
  },
  Forbidden: {
    statusCode: '403',
    title: 'Access denied',
    subtitle: `You don't have permission to view this page. Ask your administrator if you need access`,
  },
};

@Component({
  selector: 'enclave-error-page',
  imports: [EnsyLabsIcon, MatButtonModule, RouterLink],
  templateUrl: './error-page.html',
  styleUrl: './error-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
// Suffixed, unlike the repo's other feature components (Dashboard, ProductList), because a bare
// `Error` would shadow the JS builtin inside this module.
export class ErrorPage {
  protected readonly reason = input<Reason>(DEFAULT_REASON);

  protected readonly data = computed(() => {
    const reason = REASONS.find((candidate) => candidate === this.reason()) ?? DEFAULT_REASON;

    return CONTENT[reason];
  });
}

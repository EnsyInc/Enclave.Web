import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';

import { OrganizationService } from '@enclave/domain/services';

export const organizationDetailsBreadcrumbResolver: ResolveFn<string[]> = (route) => {
  const orgService = inject(OrganizationService);
  const org = orgService.getOrganizationById(route.paramMap.get('organizationId')!);

  if (!org) {
    const router = inject(Router);
    const urlTree = router.parseUrl('/not-found');
    return new RedirectCommand(urlTree);
  }

  return ['Organizations', org.name];
};

export const organizationDetailsTitleResolver: ResolveFn<string> = (route) => {
  const orgService = inject(OrganizationService);
  const org = orgService.getOrganizationById(route.paramMap.get('organizationId')!);
  return `${org?.name ?? 'Organization Details'}`;
};

import { inject } from '@angular/core';

import { createDetailsResolvers } from '@enclave/core';
import { OrganizationService } from '@enclave/domain/services';

export const {
  breadcrumb: organizationDetailsBreadcrumbResolver,
  title: organizationDetailsTitleResolver,
} = createDetailsResolvers({
  paramName: 'organizationId',
  collectionLabel: 'Organizations',
  defaultTitle: 'Organization Details',
  findById: (id) => inject(OrganizationService).getOrganizationById(id),
});

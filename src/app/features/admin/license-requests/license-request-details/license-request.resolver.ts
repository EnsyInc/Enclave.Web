import { inject } from '@angular/core';

import { createDetailsResolvers } from '@enclave/core';
import {
  LicenseRequestService,
  OrganizationService,
  ProductService,
} from '@enclave/domain/services';

export const {
  breadcrumb: licenseRequestDetailsBreadcrumbResolver,
  title: licenseRequestDetailsTitleResolver,
} = createDetailsResolvers({
  paramName: 'licenseRequestId',
  collectionLabel: 'License Requests',
  defaultTitle: 'License Request Details',
  findById: (id) => {
    const licenseRequest = inject(LicenseRequestService).getLicenseRequestById(id);
    if (!licenseRequest) {
      return undefined;
    }
    const product = inject(ProductService).getProductById(licenseRequest.productId);
    if (!product) {
      return undefined;
    }
    const org = inject(OrganizationService).getOrganizationById(licenseRequest.orgId);
    if (!org) {
      return undefined;
    }
    return { ...licenseRequest, name: `${product.name} - ${org.name}` };
  },
});

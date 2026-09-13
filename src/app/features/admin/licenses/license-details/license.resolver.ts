import { inject } from '@angular/core';

import { createDetailsResolvers } from '@enclave/core';
import { LicenseService, OrganizationService, ProductService } from '@enclave/domain/services';

export const { breadcrumb: licenseDetailsBreadcrumbResolver, title: licenseDetailsTitleResolver } =
  createDetailsResolvers({
    paramName: 'licenseId',
    collectionLabel: 'Licenses',
    defaultTitle: 'License Details',
    findById: (id) => {
      const license = inject(LicenseService).getLicenseById(id);
      if (!license) {
        return undefined;
      }
      const product = inject(ProductService).getProductById(license.productId);
      if (!product) {
        return undefined;
      }
      const org = inject(OrganizationService).getOrganizationById(license.orgId);
      if (!org) {
        return undefined;
      }
      return { ...license, name: `${product.name} - ${org.name}` };
    },
  });

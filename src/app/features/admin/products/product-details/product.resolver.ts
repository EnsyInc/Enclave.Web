import { inject } from '@angular/core';

import { createDetailsResolvers } from '@enclave/core';
import { ProductService } from '@enclave/domain/services';

export const { breadcrumb: productDetailsBreadcrumbResolver, title: productDetailsTitleResolver } =
  createDetailsResolvers({
    paramName: 'productId',
    collectionLabel: 'Products',
    defaultTitle: 'Product Details',
    findById: (id) => inject(ProductService).getProductById(id),
  });

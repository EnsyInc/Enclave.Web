import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';

import { ProductService } from '@enclave/domain/services';

export const productDetailsBreadcrumbResolver: ResolveFn<string[]> = (route) => {
  const productService = inject(ProductService);
  const product = productService.getProductById(route.paramMap.get('productId')!);

  if (!product) {
    const router = inject(Router);
    const urlTree = router.parseUrl('/not-found');
    return new RedirectCommand(urlTree);
  }

  return ['Products', product.name];
};

export const productDetailsTitleResolver: ResolveFn<string> = (route) => {
  const productService = inject(ProductService);
  const product = productService.getProductById(route.paramMap.get('productId')!);
  return `${product?.name ?? 'Product Details'}`;
};

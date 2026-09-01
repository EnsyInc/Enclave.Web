import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ProductsService } from '@enclave/services/products-service';

export const productDetailsBreadcrumbResolver: ResolveFn<string[]> = (route) => {
  const productsService = inject(ProductsService);
  const product = productsService.getProductById(route.paramMap.get('productId')!);
  return ['Products', product?.name ?? 'Details'];
};

export const productDetailsTitleResolver: ResolveFn<string> = (route) => {
  const productsService = inject(ProductsService);
  const product = productsService.getProductById(route.paramMap.get('productId')!);
  return `${product?.name ?? 'Product Details'}`;
};

import type { ValuesOf } from '@enclave/core';

export interface ProductModel {
  id: string;
  name: string;
  description?: string;
  status: ProductStatus;
}

export const PRODUCT_STATUSES = ['Active', 'Retired', 'Upcoming'] as const;
export type ProductStatus = ValuesOf<typeof PRODUCT_STATUSES>;

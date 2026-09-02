export interface ProductModel {
  id: string;
  name: string;
  description?: string;
  status: ProductStatus;
}

export const PRODUCT_STATUSES = ['Active', 'Retired', 'Upcoming'] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

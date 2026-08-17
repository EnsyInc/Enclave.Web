export interface ProductModel {
  id: string;
  name: string;
  description?: string;
  status: ProductStatus;
}

export type ProductStatus = 'Active' | 'Retired' | 'Upcoming';

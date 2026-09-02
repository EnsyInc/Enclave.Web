import { TestBed } from '@angular/core/testing';

import { ProductsService } from './products-service';

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProducts', () => {
    it('returns the seeded products', () => {
      const products = service.getProducts();

      expect(products.length).toBeGreaterThan(0);
      expect(products).toContainEqual(expect.objectContaining({ id: '1', name: 'Enclave Core' }));
    });

    it('returns a copy of the list, not the live array', () => {
      const first = service.getProducts();
      first.push({ id: 'temp', name: 'Temp', status: 'Active', description: '' });

      expect(service.getProducts()).toHaveLength(first.length - 1);
    });
  });

  describe('getProductById', () => {
    it('returns the matching product', () => {
      expect(service.getProductById('1')).toEqual(
        expect.objectContaining({ id: '1', name: 'Enclave Core' }),
      );
    });

    it('returns undefined for an unknown id', () => {
      expect(service.getProductById('999')).toBeUndefined();
    });
  });
});

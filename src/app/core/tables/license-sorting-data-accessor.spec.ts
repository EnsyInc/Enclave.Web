import { LicenseModel } from '@enclave/domain/models';

import { licenseSortingDataAccessor } from './license-sorting-data-accessor';

function license(overrides: Partial<LicenseModel> = {}): LicenseModel {
  return {
    id: '1',
    orgId: '1',
    productId: '1',
    start: new Date('2025-01-01T00:00:00Z'),
    end: new Date('2026-01-01T00:00:00Z'),
    status: 'Active',
    ...overrides,
  };
}

describe('licenseSortingDataAccessor', () => {
  describe('end column', () => {
    it('returns the real expiry time for an Active license', () => {
      const row = license({ status: 'Active' });
      expect(licenseSortingDataAccessor(row, 'end')).toBe(row.end.getTime());
    });

    it('returns the real expiry time for an Expired license', () => {
      const row = license({ status: 'Expired' });
      expect(licenseSortingDataAccessor(row, 'end')).toBe(row.end.getTime());
    });

    it.each(['Scheduled', 'Suspended', 'Revoked'] as const)(
      'pushes a %s license to the end, since its expiry date is not even shown',
      (status) => {
        const row = license({ status });
        expect(licenseSortingDataAccessor(row, 'end')).toBe(Number.POSITIVE_INFINITY);
      },
    );
  });

  describe('timeLeft column', () => {
    it("returns the license's own expiry time for an Active license", () => {
      const row = license({ status: 'Active' });
      expect(licenseSortingDataAccessor(row, 'timeLeft')).toBe(row.end.getTime());
    });

    it.each(['Scheduled', 'Expired', 'Suspended', 'Revoked'] as const)(
      'pushes a %s license to the end, since it has no time-left widget',
      (status) => {
        const row = license({ status });
        expect(licenseSortingDataAccessor(row, 'timeLeft')).toBe(Number.POSITIVE_INFINITY);
      },
    );
  });

  describe('any other column', () => {
    it('returns the raw string value for a status/product-like column', () => {
      const row = { ...license({ status: 'Suspended' }), product: 'Enclave Core' };
      expect(licenseSortingDataAccessor(row, 'status')).toBe('Suspended');
      expect(licenseSortingDataAccessor(row, 'product')).toBe('Enclave Core');
    });

    it('converts a Date field to its timestamp (e.g. sorting by start)', () => {
      const row = license();
      expect(licenseSortingDataAccessor(row, 'start')).toBe(row.start.getTime());
    });

    it('falls back to an empty string for an unresolved value (e.g. no matching product)', () => {
      const row = { ...license(), product: undefined };
      expect(licenseSortingDataAccessor(row, 'product')).toBe('');
    });
  });
});

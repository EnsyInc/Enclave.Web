import { TestBed } from '@angular/core/testing';

import { LICENSE_STATUSES } from '@enclave/domain/models';

import { LicenseService } from './license.service';

describe('LicenseService', () => {
  let service: LicenseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LicenseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getLicenses', () => {
    it('returns the seeded licenses', () => {
      const licenses = service.getLicenses();

      expect(licenses.length).toBeGreaterThan(0);
      expect(licenses).toContainEqual(expect.objectContaining({ id: '1', orgId: '1' }));
    });

    it('returns a copy of the list, not the live array', () => {
      const first = service.getLicenses();
      first.push({
        id: 'temp',
        orgId: 'temp',
        productId: 'temp',
        start: new Date(),
        end: new Date(),
        status: 'Active',
      });

      expect(service.getLicenses()).toHaveLength(first.length - 1);
    });

    it('seeds one org with a license in every status', () => {
      const licenses = service.getLicenses();
      const orgCounts = new Map<string, Set<string>>();

      for (const license of licenses) {
        const statuses = orgCounts.get(license.orgId) ?? new Set<string>();
        statuses.add(license.status);
        orgCounts.set(license.orgId, statuses);
      }

      const orgWithEveryStatus = [...orgCounts.values()].some(
        (statuses) => statuses.size === LICENSE_STATUSES.length,
      );

      expect(orgWithEveryStatus).toBe(true);
    });

    it('seeds one org with no licenses', () => {
      const licenses = service.getLicenses();
      const orgIdsWithLicenses = new Set(licenses.map((license) => license.orgId));

      expect(orgIdsWithLicenses.has('6')).toBe(false);
    });
  });

  describe('getLicenseById', () => {
    it('returns the matching license', () => {
      expect(service.getLicenseById('1')).toEqual(expect.objectContaining({ id: '1', orgId: '1' }));
    });

    it('returns undefined for an unknown id', () => {
      expect(service.getLicenseById('999')).toBeUndefined();
    });
  });
});

import { TestBed } from '@angular/core/testing';

import { LICENSE_REQUEST_STATUSES } from '@enclave/domain/models';

import { LicenseRequestService } from './license-request.service';

describe('LicenseRequestService', () => {
  let service: LicenseRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LicenseRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getLicenseRequests', () => {
    it('returns the seeded license requests', () => {
      const licenseRequests = service.getLicenseRequests();

      expect(licenseRequests.length).toBeGreaterThan(0);
      expect(licenseRequests).toContainEqual(expect.objectContaining({ id: '1', orgId: '1' }));
    });

    it('returns a copy of the list, not the live array', () => {
      const first = service.getLicenseRequests();
      first.push({
        id: 'temp',
        orgId: 'temp',
        productId: 'temp',
        userId: 'temp',
        status: 'Pending',
      });

      expect(service.getLicenseRequests()).toHaveLength(first.length - 1);
    });

    it('seeds one org with a request in every status', () => {
      const licenseRequests = service.getLicenseRequests();
      const orgStatuses = new Map<string, Set<string>>();

      for (const licenseRequest of licenseRequests) {
        const statuses = orgStatuses.get(licenseRequest.orgId) ?? new Set<string>();
        statuses.add(licenseRequest.status);
        orgStatuses.set(licenseRequest.orgId, statuses);
      }

      const orgWithEveryStatus = [...orgStatuses.values()].some(
        (statuses) => statuses.size === LICENSE_REQUEST_STATUSES.length,
      );

      expect(orgWithEveryStatus).toBe(true);
    });

    it('seeds one org with no requests', () => {
      const licenseRequests = service.getLicenseRequests();
      const orgIdsWithRequests = new Set(
        licenseRequests.map((licenseRequest) => licenseRequest.orgId),
      );

      expect(orgIdsWithRequests.has('6')).toBe(false);
    });

    it('gives every rejected request a rejection reason', () => {
      const licenseRequests = service.getLicenseRequests();
      const rejected = licenseRequests.filter(
        (licenseRequest) => licenseRequest.status === 'Rejected',
      );

      expect(rejected.length).toBeGreaterThan(0);
      expect(rejected.every((licenseRequest) => !!licenseRequest.rejectionReason)).toBe(true);
    });
  });

  describe('getLicenseRequestById', () => {
    it('returns the matching license request', () => {
      expect(service.getLicenseRequestById('1')).toEqual(
        expect.objectContaining({ id: '1', orgId: '1' }),
      );
    });

    it('returns undefined for an unknown id', () => {
      expect(service.getLicenseRequestById('999')).toBeUndefined();
    });
  });

  describe('getLicenseRequestsForOrg', () => {
    it('returns only the license requests belonging to the given org', () => {
      const licenseRequests = service.getLicenseRequestsForOrg('1');

      expect(licenseRequests.length).toBeGreaterThan(0);
      expect(licenseRequests.every((licenseRequest) => licenseRequest.orgId === '1')).toBe(true);
    });

    it('returns an empty array for an org with no requests', () => {
      expect(service.getLicenseRequestsForOrg('6')).toEqual([]);
    });

    it('returns an empty array for an unknown org id', () => {
      expect(service.getLicenseRequestsForOrg('999')).toEqual([]);
    });
  });

  describe('getLicenseRequestsForLicense', () => {
    it('returns only the license requests renewing/upgrading the given license', () => {
      const licenseRequests = service.getLicenseRequestsForLicense('2');

      expect(licenseRequests).toEqual([
        expect.objectContaining({ id: '1', existingLicenseId: '2' }),
      ]);
    });

    it('returns an empty array for a license with no requests against it', () => {
      expect(service.getLicenseRequestsForLicense('1')).toEqual([]);
    });

    it('returns an empty array for an unknown license id', () => {
      expect(service.getLicenseRequestsForLicense('999')).toEqual([]);
    });
  });
});

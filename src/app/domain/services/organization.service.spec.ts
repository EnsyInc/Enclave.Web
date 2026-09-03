import { TestBed } from '@angular/core/testing';

import { OrganizationService } from './organization.service';

describe('OrganizationService', () => {
  let service: OrganizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrganizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getOrganizations', () => {
    it('returns the seeded organizations', () => {
      const organizations = service.getOrganizations();

      expect(organizations.length).toBeGreaterThan(0);
      expect(organizations).toContainEqual(
        expect.objectContaining({ id: '1', name: 'Northwind Systems' }),
      );
    });

    it('returns a copy of the list, not the live array', () => {
      const first = service.getOrganizations();
      first.push({ id: 'temp', name: 'Temp', status: 'Active', primaryUserId: 'temp' });

      expect(service.getOrganizations()).toHaveLength(first.length - 1);
    });
  });

  describe('getOrganizationById', () => {
    it('returns the matching organization', () => {
      expect(service.getOrganizationById('1')).toEqual(
        expect.objectContaining({ id: '1', name: 'Northwind Systems' }),
      );
    });

    it('returns undefined for an unknown id', () => {
      expect(service.getOrganizationById('999')).toBeUndefined();
    });
  });
});

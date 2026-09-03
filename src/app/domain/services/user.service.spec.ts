import { TestBed } from '@angular/core/testing';

import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUsers', () => {
    it('returns the seeded users', () => {
      const users = service.getUsers();

      expect(users.length).toBeGreaterThan(0);
      expect(users).toContainEqual(expect.objectContaining({ id: '1', email: 'ops@northwind.io' }));
    });

    it('returns a copy of the list, not the live array', () => {
      const first = service.getUsers();
      first.push({
        id: 'temp',
        firstName: 'temp',
        lastName: 'temp',
        email: 'temp@temp.com',
        organizationId: 'temp',
        status: 'Active',
        role: 'Admin',
      });

      expect(service.getUsers()).toHaveLength(first.length - 1);
    });
  });

  describe('getUserById', () => {
    it('returns the matching user', () => {
      expect(service.getUserById('1')).toEqual(
        expect.objectContaining({ id: '1', email: 'ops@northwind.io' }),
      );
    });

    it('returns undefined for an unknown id', () => {
      expect(service.getUserById('999')).toBeUndefined();
    });
  });
});

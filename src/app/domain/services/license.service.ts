import { Service } from '@angular/core';

import { LicenseModel } from '@enclave/domain/models';

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

function hoursFromNow(hours: number): Date {
  return new Date(Date.now() + hours * HOUR_MS);
}

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * DAY_MS);
}

@Service()
export class LicenseService {
  // All dates are computed relative to Date.now() so a seed's status (e.g. 'Expired')
  // and its start/end always stay consistent, however long after this file was written
  // the app runs. Org '1' carries one license per status; org '6' intentionally has none.
  private readonly LICENSE_SEEDS: LicenseModel[] = [
    {
      id: '1',
      orgId: '1',
      productId: '1',
      start: daysFromNow(200),
      end: daysFromNow(565),
      status: 'Scheduled',
    },
    {
      id: '2',
      orgId: '1',
      productId: '2',
      start: daysFromNow(-120),
      end: daysFromNow(245),
      status: 'Active',
    },
    {
      id: '3',
      orgId: '1',
      productId: '3',
      start: daysFromNow(-400),
      end: daysFromNow(-35),
      status: 'Expired',
    },
    {
      id: '4',
      orgId: '1',
      productId: '4',
      start: daysFromNow(-45),
      end: daysFromNow(320),
      status: 'Suspended',
    },
    {
      id: '5',
      orgId: '1',
      productId: '5',
      start: daysFromNow(-730),
      end: daysFromNow(-365),
      status: 'Revoked',
    },
    {
      id: '6',
      orgId: '2',
      productId: '1',
      start: daysFromNow(-420),
      end: daysFromNow(-55),
      status: 'Expired',
    },
    {
      id: '7',
      orgId: '3',
      productId: '3',
      start: daysFromNow(-20),
      end: daysFromNow(345),
      status: 'Suspended',
    },
    {
      id: '8',
      orgId: '4',
      productId: '4',
      start: daysFromNow(150),
      end: daysFromNow(515),
      status: 'Scheduled',
    },
    {
      id: '9',
      orgId: '5',
      productId: '1',
      start: daysFromNow(-800),
      end: daysFromNow(-435),
      status: 'Revoked',
    },
    // These seeds specifically target each EnclaveTimeLeft bucket (hours/days/months/years).
    {
      id: '10',
      orgId: '2',
      productId: '2',
      start: daysFromNow(-60),
      end: hoursFromNow(5),
      status: 'Active',
    },
    {
      id: '11',
      orgId: '3',
      productId: '4',
      start: daysFromNow(-20),
      end: daysFromNow(10),
      status: 'Active',
    },
    {
      id: '12',
      orgId: '4',
      productId: '5',
      start: daysFromNow(-60),
      end: daysFromNow(120),
      status: 'Active',
    },
    {
      id: '13',
      orgId: '5',
      productId: '3',
      start: daysFromNow(-10),
      end: daysFromNow(730),
      status: 'Active',
    },
  ];

  public getLicenses(): LicenseModel[] {
    return this.LICENSE_SEEDS.slice();
  }

  public getLicenseById(id: string): LicenseModel | undefined {
    return this.LICENSE_SEEDS.find((license) => license.id === id);
  }
}

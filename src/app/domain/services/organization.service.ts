import { Service } from '@angular/core';

import { OrganizationModel } from '@enclave/domain/models';

@Service()
export class OrganizationService {
  private readonly ORGANIZATION_SEEDS: OrganizationModel[] = [
    {
      id: '1',
      name: 'Northwind Systems',
      status: 'Active',
      primaryUserId: '1',
    },
    {
      id: '2',
      name: 'Halcyon Labs',
      status: 'Active',
      primaryUserId: '2',
    },
    {
      id: '3',
      name: 'Ridgeline Group',
      status: 'Active',
      primaryUserId: '3',
    },
    {
      id: '4',
      name: 'Meridian Freight',
      status: 'Active',
      primaryUserId: '4',
    },
    {
      id: '5',
      name: 'Castille & Co',
      status: 'Deactivated',
      primaryUserId: '5',
    },
    {
      id: '6',
      name: 'Orbit Retail',
      status: 'Active',
      primaryUserId: '6',
    },
  ];

  public getOrganizations(): OrganizationModel[] {
    return this.ORGANIZATION_SEEDS.slice();
  }

  public getOrganizationById(id: string): OrganizationModel | undefined {
    return this.ORGANIZATION_SEEDS.find((organization) => organization.id === id);
  }
}

import { Service } from '@angular/core';

import { UserModel } from '@enclave/domain/models';

@Service()
export class UserService {
  private readonly USER_SEEDS: UserModel[] = [
    {
      id: '1',
      firstName: 'ops',
      lastName: 'NorthwindSystems',
      email: 'ops@northwind.io',
      organizationId: '1',
      status: 'Active',
      role: 'Admin',
    },
    {
      id: '2',
      firstName: 'billing',
      lastName: 'HalcyonLabs',
      email: 'billing@halcyon.dev',
      organizationId: '2',
      status: 'Active',
      role: 'Admin',
    },
    {
      id: '3',
      firstName: 'admin',
      lastName: 'RidgelineGroup',
      email: 'admin@ridgeline.co',
      organizationId: '3',
      status: 'Active',
      role: 'Admin',
    },
    {
      id: '4',
      firstName: 'it',
      lastName: 'MeridianFreight',
      email: 'it@meridianfreight.com',
      organizationId: '4',
      status: 'Active',
      role: 'Admin',
    },
    {
      id: '5',
      firstName: 'contact',
      lastName: 'CastilleCo',
      email: 'contact@castille.eu',
      organizationId: '5',
      status: 'Active',
      role: 'Admin',
    },
    {
      id: '6',
      firstName: 'ops',
      lastName: 'OrbitRetail',
      email: 'ops@orbitretail.net',
      organizationId: '6',
      status: 'Active',
      role: 'Admin',
    },
  ];

  public getUsers(): UserModel[] {
    return this.USER_SEEDS.slice();
  }

  public getUserById(id: string): UserModel | undefined {
    return this.USER_SEEDS.find((user) => user.id === id);
  }
}

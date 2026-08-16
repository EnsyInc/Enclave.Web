import { Routes } from '@angular/router';
import { Dashboard } from './features/admin/dashboard/dashboard';
import { Licenses } from './features/admin/licenses/licenses';
import { LicenseRequests } from './features/admin/license-requests/license-requests';
import { Organizations } from './features/admin/organizations/organizations';
import { Products } from './features/admin/products/products';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'admin/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'admin',
    children: [
      {
        path: 'dashboard',
        component: Dashboard,
      },
      {
        path: 'products',
        component: Products,
      },
      {
        path: 'organizations',
        component: Organizations,
      },
      {
        path: 'licenses',
        component: Licenses,
      },
      {
        path: 'license-requests',
        component: LicenseRequests,
      },
    ],
  },
];

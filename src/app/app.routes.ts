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
    data: {
      section: 'Admin',
    },
    children: [
      {
        path: 'dashboard',
        component: Dashboard,
        data: {
          breadcrumb: 'Dashboard',
        },
      },
      {
        path: 'products',
        component: Products,
        data: {
          breadcrumb: 'Products',
        },
      },
      {
        path: 'organizations',
        component: Organizations,
        data: {
          breadcrumb: 'Organizations',
        },
      },
      {
        path: 'licenses',
        component: Licenses,
        data: {
          breadcrumb: 'Licenses',
        },
      },
      {
        path: 'license-requests',
        component: LicenseRequests,
        data: {
          breadcrumb: 'License Requests',
        },
      },
    ],
  },
];

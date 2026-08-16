import { Routes } from '@angular/router';

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
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard').then((m) => m.Dashboard),
        title: 'Dashboard | Enclave',
        data: {
          breadcrumb: 'Dashboard',
        },
      },
      {
        path: 'products',
        loadComponent: () => import('./features/admin/products/products').then((m) => m.Products),
        title: 'Products | Enclave',
        data: {
          breadcrumb: 'Products',
        },
      },
      {
        path: 'organizations',
        loadComponent: () =>
          import('./features/admin/organizations/organizations').then((m) => m.Organizations),
        title: 'Organizations | Enclave',
        data: {
          breadcrumb: 'Organizations',
        },
      },
      {
        path: 'licenses',
        loadComponent: () => import('./features/admin/licenses/licenses').then((m) => m.Licenses),
        title: 'Licenses | Enclave',
        data: {
          breadcrumb: 'Licenses',
        },
      },
      {
        path: 'license-requests',
        loadComponent: () =>
          import('./features/admin/license-requests/license-requests').then(
            (m) => m.LicenseRequests,
          ),
        title: 'License Requests | Enclave',
        data: {
          breadcrumb: 'License Requests',
        },
      },
    ],
  },
];

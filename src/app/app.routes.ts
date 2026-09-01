import { Routes } from '@angular/router';
import {
  productDetailsBreadcrumbResolver,
  productDetailsTitleResolver,
} from '@enclave-features/admin/product-details/product-breadcrumb.resolver';

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
        title: 'Dashboard',
        data: {
          breadcrumb: 'Dashboard',
        },
      },
      {
        path: 'products',
        loadComponent: () => import('./features/admin/products/products').then((m) => m.Products),
        title: 'Products',
        data: {
          breadcrumb: 'Products',
        },
      },

      {
        path: 'products/:productId',
        loadComponent: () =>
          import('./features/admin/product-details/product-details').then((m) => m.ProductDetails),
        title: productDetailsTitleResolver,
        resolve: {
          breadcrumb: productDetailsBreadcrumbResolver,
        },
      },
      {
        path: 'organizations',
        loadComponent: () =>
          import('./features/admin/organizations/organizations').then((m) => m.Organizations),
        title: 'Organizations',
        data: {
          breadcrumb: 'Organizations',
        },
      },
      {
        path: 'licenses',
        loadComponent: () => import('./features/admin/licenses/licenses').then((m) => m.Licenses),
        title: 'Licenses',
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
        title: 'License Requests',
        data: {
          breadcrumb: 'License Requests',
        },
      },
    ],
  },
];

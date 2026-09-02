import { Routes } from '@angular/router';
import {
  productDetailsBreadcrumbResolver,
  productDetailsTitleResolver,
} from '@enclave/features/admin/products';

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
          import('@enclave/features/admin/dashboard/dashboard').then((m) => m.Dashboard),
        title: 'Dashboard',
        data: {
          breadcrumb: 'Dashboard',
        },
      },
      {
        path: 'products',
        loadComponent: () =>
          import('@enclave/features/admin/products/product-list/product-list').then(
            (m) => m.ProductList,
          ),
        title: 'Products',
        data: {
          breadcrumb: 'Products',
        },
      },

      {
        path: 'products/:productId',
        loadComponent: () =>
          import('@enclave/features/admin/products/product-details/product-details').then(
            (m) => m.ProductDetails,
          ),
        title: productDetailsTitleResolver,
        resolve: {
          breadcrumb: productDetailsBreadcrumbResolver,
        },
      },
      {
        path: 'organizations',
        loadComponent: () =>
          import('@enclave/features/admin/organizations/organization-list/organization-list').then(
            (m) => m.OrganizationList,
          ),
        title: 'Organizations',
        data: {
          breadcrumb: 'Organizations',
        },
      },
      {
        path: 'licenses',
        loadComponent: () =>
          import('@enclave/features/admin/licenses/license-list/license-list').then(
            (m) => m.LicenseList,
          ),
        title: 'Licenses',
        data: {
          breadcrumb: 'Licenses',
        },
      },
      {
        path: 'license-requests',
        loadComponent: () =>
          import('@enclave/features/admin/license-requests/license-request-list/license-request-list').then(
            (m) => m.LicenseRequestList,
          ),
        title: 'License Requests',
        data: {
          breadcrumb: 'License Requests',
        },
      },
    ],
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('@enclave/features/not-found-page/not-found-page').then((m) => m.NotFoundPage),
    title: 'Page not found',
  },
  {
    path: '**',
    redirectTo: 'not-found',
  },
];

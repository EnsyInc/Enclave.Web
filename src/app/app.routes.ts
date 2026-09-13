import { Routes } from '@angular/router';

import { AppShell } from '@enclave/core/layout/app-shell/app-shell';
import {
  licenseRequestDetailsBreadcrumbResolver,
  licenseRequestDetailsTitleResolver,
} from '@enclave/features/admin/license-requests';
import {
  licenseDetailsBreadcrumbResolver,
  licenseDetailsTitleResolver,
} from '@enclave/features/admin/licenses';
import {
  organizationDetailsBreadcrumbResolver,
  organizationDetailsTitleResolver,
} from '@enclave/features/admin/organizations';
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
    component: AppShell,
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
        path: 'organizations/:organizationId',
        loadComponent: () =>
          import('@enclave/features/admin/organizations/organization-details/organization-details').then(
            (m) => m.OrganizationDetails,
          ),
        title: organizationDetailsTitleResolver,
        resolve: {
          breadcrumb: organizationDetailsBreadcrumbResolver,
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
        path: 'licenses/:licenseId',
        loadComponent: () =>
          import('@enclave/features/admin/licenses/license-details/license-details').then(
            (m) => m.LicenseDetails,
          ),
        title: licenseDetailsTitleResolver,
        resolve: {
          breadcrumb: licenseDetailsBreadcrumbResolver,
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
      {
        path: 'license-requests/:licenseRequestId',
        loadComponent: () =>
          import('@enclave/features/admin/license-requests/license-request-details/license-request-details').then(
            (m) => m.LicenseRequestDetails,
          ),
        title: licenseRequestDetailsTitleResolver,
        resolve: {
          breadcrumb: licenseRequestDetailsBreadcrumbResolver,
        },
      },
    ],
  },
  {
    path: 'not-found',
    loadComponent: () => import('@enclave/features/error-page/error-page').then((m) => m.ErrorPage),
    title: 'Page not found',
    data: {
      reason: 'NotFound',
    },
  },
  {
    path: 'forbidden',
    loadComponent: () => import('@enclave/features/error-page/error-page').then((m) => m.ErrorPage),
    title: 'Forbidden',
    data: {
      reason: 'Forbidden',
    },
  },
  {
    path: '**',
    redirectTo: 'not-found',
  },
];

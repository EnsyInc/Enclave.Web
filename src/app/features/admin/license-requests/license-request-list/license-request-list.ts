import { DatePipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';

import {
  EnclaveSearchBarFilter,
  EnclavePageHeader,
  EnclaveAvatar,
  EnclaveStatus,
  EnclaveMoreActionsMenu,
} from '@enclave/core/components';
import { EnclavePersistentSort } from '@enclave/core/directives';
import { EnsyLabsIcon } from '@enclave/core/icons';
import { LicenseRequestModel } from '@enclave/domain/models';
import {
  LicenseRequestService,
  LicenseService,
  OrganizationService,
  ProductService,
} from '@enclave/domain/services';

@Component({
  selector: 'enclave-license-request-list',
  imports: [
    DatePipe,
    EnclaveAvatar,
    EnclaveMoreActionsMenu,
    EnclavePageHeader,
    EnclavePersistentSort,
    EnclaveSearchBarFilter,
    EnclaveStatus,
    EnsyLabsIcon,
    MatButtonModule,
    MatMenuModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
    RouterLink,
  ],
  templateUrl: './license-request-list.html',
  styleUrl: './license-request-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LicenseRequestList implements AfterViewInit {
  private readonly licenseRequestService = inject(LicenseRequestService);
  private readonly licenseService = inject(LicenseService);
  private readonly orgService = inject(OrganizationService);
  private readonly productService = inject(ProductService);

  protected readonly licenseRequestList = signal<LicenseRequestModel[]>([]);
  protected readonly licenseRequestRows = computed(() =>
    this.licenseRequestList().map((licenseRequest) => {
      const license = licenseRequest.existingLicenseId
        ? this.licenseService.getLicenseById(licenseRequest.existingLicenseId)
        : undefined;

      return {
        ...licenseRequest,
        organization: this.orgService.getOrganizationById(licenseRequest.orgId)?.name,
        product: this.productService.getProductById(licenseRequest.productId)?.name,
        renewalLabel: license ? 'Renewal' : 'New License',
        renewalLabelClass: license ? 'renewal' : 'new-license',
        existingLicenseExpiry: license?.end,
      };
    }),
  );
  protected readonly licenseRequestCount = computed(() => this.licenseRequestRows().length);
  protected readonly pendingLicenseRequestCount = computed(
    () =>
      this.licenseRequestRows().filter((licenseRequest) => licenseRequest.status === 'Pending')
        .length,
  );
  protected readonly licenseRequestDataSource = computed(
    () => new MatTableDataSource(this.licenseRequestRows()),
  );
  protected readonly displayedColumns = ['organization', 'product', 'renewal', 'status', 'action'];
  protected readonly licenseRequestSearch = viewChild.required(EnclaveSearchBarFilter);
  protected readonly licenseRequestSort = viewChild.required(MatSort);

  constructor() {
    effect(() => {
      this.licenseRequestDataSource().filter = this.licenseRequestSearch()
        .searchText()
        .toLocaleLowerCase();
      this.licenseRequestDataSource().sort = this.licenseRequestSort();
    });
  }

  ngAfterViewInit(): void {
    this.licenseRequestList.set(this.licenseRequestService.getLicenseRequests());
  }
}

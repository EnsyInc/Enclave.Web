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
import { RouterLink } from '@angular/router';

import {
  EnclaveAvatar,
  EnclavePageHeader,
  EnclaveSearchBarFilter,
  EnclaveStatus,
  EnclaveTimeLeft,
  EnclaveMoreActionsMenu,
} from '@enclave/core/components';
import { EnclavePersistentSort } from '@enclave/core/directives';
import { EnsyLabsIcon } from '@enclave/core/icons';
import { LicenseModel } from '@enclave/domain/models';
import { LicenseService, OrganizationService, ProductService } from '@enclave/domain/services';

@Component({
  selector: 'enclave-license-list',
  imports: [
    DatePipe,
    EnclaveAvatar,
    EnclaveMoreActionsMenu,
    EnclavePageHeader,
    EnclavePersistentSort,
    EnclaveSearchBarFilter,
    EnclaveStatus,
    EnclaveTimeLeft,
    EnsyLabsIcon,
    MatButtonModule,
    MatMenuModule,
    MatSortModule,
    MatTableModule,
    RouterLink,
  ],
  templateUrl: './license-list.html',
  styleUrl: './license-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LicenseList implements AfterViewInit {
  private readonly licenseService = inject(LicenseService);
  private readonly orgService = inject(OrganizationService);
  private readonly productService = inject(ProductService);

  protected readonly licenseList = signal<LicenseModel[]>([]);
  protected readonly licenseRows = computed(() =>
    this.licenseList().map((license) => ({
      ...license,
      organization: this.orgService.getOrganizationById(license.orgId)?.name,
      product: this.productService.getProductById(license.productId)?.name,
    })),
  );
  protected readonly activeLicenseCount = computed(
    () => this.licenseRows().filter((l) => l.status === 'Active').length,
  );
  protected readonly licenseDataSource = computed(() => {
    const ds = new MatTableDataSource(this.licenseRows());
    ds.sortingDataAccessor = (row, columnId) => {
      if (columnId === 'end' && row.status !== 'Active' && row.status !== 'Expired') {
        return Number.POSITIVE_INFINITY;
      }
      if (columnId === 'timeLeft') {
        if (row.status !== 'Active') {
          return Number.POSITIVE_INFINITY;
        }
        const val = row['end'];
        return val.getTime();
      }
      const val = row[columnId as keyof typeof row];
      if (val instanceof Date) {
        return val.getTime();
      }
      return val ?? '';
    };
    return ds;
  });

  protected readonly displayedColumns = [
    'organization',
    'product',
    'status',
    'end',
    'timeLeft',
    'action',
  ];
  protected readonly licenseSearch = viewChild.required(EnclaveSearchBarFilter);
  protected readonly licenseSort = viewChild.required(MatSort);

  constructor() {
    effect(() => {
      this.licenseDataSource().filter = this.licenseSearch().searchText().toLocaleLowerCase();
      this.licenseDataSource().sort = this.licenseSort();
    });
  }

  ngAfterViewInit(): void {
    this.licenseList.set(this.licenseService.getLicenses());
  }
}

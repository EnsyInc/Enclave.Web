import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';

import { licenseSortingDataAccessor } from '@enclave/core';
import {
  EnclaveDetailsHeader,
  EnclaveDetailCard,
  EnclaveDetailList,
  EnclaveDetailRow,
  EnclaveStatus,
  EnclaveAvatar,
  EnclaveTimeLeft,
  EnclaveMoreActionsMenu,
} from '@enclave/core/components';
import { EnclavePersistentSort, EnclavePersistentTab } from '@enclave/core/directives';
import { EnsyLabsIcon } from '@enclave/core/icons';
import {
  LicenseService,
  OrganizationService,
  ProductService,
  UserService,
} from '@enclave/domain/services';

@Component({
  selector: 'enclave-organization-details',
  imports: [
    DatePipe,
    EnclaveAvatar,
    EnclaveDetailCard,
    EnclaveDetailList,
    EnclaveDetailRow,
    EnclaveDetailsHeader,
    EnclaveMoreActionsMenu,
    EnclavePersistentSort,
    EnclavePersistentTab,
    EnclaveStatus,
    EnclaveTimeLeft,
    EnsyLabsIcon,
    MatButtonModule,
    MatMenuModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    RouterLink,
  ],
  templateUrl: './organization-details.html',
  styleUrl: './organization-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationDetails {
  private readonly orgService = inject(OrganizationService);
  private readonly userService = inject(UserService);
  private readonly licenseService = inject(LicenseService);
  private readonly productService = inject(ProductService);

  protected readonly organizationId = input.required<string>();
  protected readonly org = computed(() => {
    return this.orgService.getOrganizationById(this.organizationId())!;
  });
  protected readonly primaryContact = computed(() => {
    return this.userService.getUserById(this.org().primaryUserId);
  });

  protected readonly licenses = computed(() => {
    return this.licenseService.getLicensesForOrg(this.org().id);
  });
  protected readonly licenseRows = computed(() =>
    this.licenses().map((license) => ({
      ...license,
      product: this.productService.getProductById(license.productId)?.name,
    })),
  );
  protected readonly licenseCount = computed(() => {
    return this.licenses().length;
  });
  protected readonly licensesDataSource = computed(() => {
    const ds = new MatTableDataSource(this.licenseRows());
    ds.sortingDataAccessor = licenseSortingDataAccessor;
    return ds;
  });
  protected readonly licensesDisplayedColumns = ['product', 'status', 'end', 'timeLeft', 'action'];
  protected readonly licenseSort = viewChild.required<MatSort>('licenseSort');

  protected readonly users = computed(() => {
    return this.userService.getUsersForOrg(this.org().id);
  });
  protected readonly userRows = computed(() =>
    this.users().map((user) => ({
      ...user,
      name: `${user.firstName} ${user.lastName}`,
    })),
  );
  protected readonly userCount = computed(() => {
    return this.users().length;
  });
  protected readonly usersDataSource = computed(() => new MatTableDataSource(this.userRows()));
  protected readonly usersDisplayedColumns = ['name', 'email', 'role', 'status', 'action'];
  protected readonly userSort = viewChild.required<MatSort>('userSort');

  constructor() {
    effect(() => {
      this.licensesDataSource().sort = this.licenseSort();
    });
    effect(() => {
      this.usersDataSource().sort = this.userSort();
    });
  }
}

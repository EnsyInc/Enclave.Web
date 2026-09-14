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
  EnclavePageHeader,
  EnclaveAvatar,
  EnclaveSearchBarFilter,
  EnclaveStatus,
  EnclaveMoreActionsMenu,
} from '@enclave/core/components';
import { EnclavePersistentSort } from '@enclave/core/directives';
import { EnsyLabsIcon } from '@enclave/core/icons';
import { OrganizationModel } from '@enclave/domain/models';
import { OrganizationService, UserService } from '@enclave/domain/services';

@Component({
  selector: 'enclave-organization-list',
  imports: [
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
    RouterLink,
  ],
  templateUrl: './organization-list.html',
  styleUrl: './organization-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationList implements AfterViewInit {
  private readonly orgService = inject(OrganizationService);
  private readonly userService = inject(UserService);

  protected readonly orgList = signal<OrganizationModel[]>([]);
  protected readonly orgRows = computed(() =>
    this.orgList().map((org) => ({
      ...org,
      primaryContactEmail: this.userService.getUserById(org.primaryUserId)!.email,
    })),
  );
  protected readonly orgCount = computed(() => this.orgRows().length);
  protected readonly orgDataSource = computed(() => {
    const ds = new MatTableDataSource(this.orgRows());
    ds.filterPredicate = (row, filter) => {
      return [row.id, row.name, row.primaryContactEmail, row.status]
        .join(' ')
        .toLowerCase()
        .includes(filter);
    };
    return ds;
  });
  protected readonly displayedColumns = ['name', 'primaryContactEmail', 'status', 'action'];
  protected readonly orgSearch = viewChild.required(EnclaveSearchBarFilter);
  protected readonly orgSort = viewChild.required(MatSort);

  constructor() {
    effect(() => {
      this.orgDataSource().filter = this.orgSearch().searchText().toLocaleLowerCase();
      this.orgDataSource().sort = this.orgSort();
    });
  }

  ngAfterViewInit(): void {
    this.orgList.set(this.orgService.getOrganizations());
  }
}

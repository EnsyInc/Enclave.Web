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
import { MatSort, MatSortModule } from '@angular/material/sort';
import {
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';

import {
  EnclavePageHeader,
  EnclaveAvatar,
  EnclaveSearchBarFilter,
  EnclaveStatus,
} from '@enclave/core/components';
import { EnclavePersistentSort } from '@enclave/core/directives';
import { EnsyLabsIcon } from '@enclave/core/icons';
import { OrganizationModel } from '@enclave/domain/models';
import { OrganizationService, UserService } from '@enclave/domain/services';

@Component({
  selector: 'enclave-organization-list',
  imports: [
    EnclaveAvatar,
    EnclavePageHeader,
    EnclavePersistentSort,
    EnclaveSearchBarFilter,
    EnclaveStatus,
    EnsyLabsIcon,
    MatButtonModule,
    MatSortModule,
    MatTableModule,
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
  protected readonly orgDataSource = computed(() => new MatTableDataSource(this.orgRows()));
  protected readonly displayedColumns = ['name', 'status', 'primaryContactEmail', 'action'];
  protected readonly orgSearch = viewChild.required(EnclaveSearchBarFilter);
  protected readonly orgSort = viewChild.required(MatSort);

  constructor() {
    effect(() => {
      this.orgDataSource().filter = this.orgSearch().searchText().toLocaleLowerCase();
      this.orgDataSource().sort = this.orgSort();
    });
  }

  ngAfterViewInit(): void {
    // populate orgsList
    this.orgList.set(this.orgService.getOrganizations());
  }
}

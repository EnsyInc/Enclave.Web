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
import { MatSort, MatSortHeader, MatSortModule } from '@angular/material/sort';
import {
  MatTableDataSource,
  MatTable,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRowDef,
  MatCell,
  MatCellDef,
  MatHeaderRow,
  MatRow,
  MatRowDef,
  MatHeaderCellDef,
  MatTableModule,
} from '@angular/material/table';

import {
  EnclavePageHeader,
  EnclaveAvatar,
  EnclaveSearchBarFilter,
  EnclaveStatus,
} from '@enclave/core/components';
import { EnclavePersistentSort } from '@enclave/core/directives';
import { OrganizationModel } from '@enclave/domain/models';
import { OrganizationService } from '@enclave/domain/services';
import { EnsyLabsIcon } from '@enclave/core/icons';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'enclave-organization-list',
  imports: [
    EnclaveAvatar,
    EnclavePageHeader,
    EnclavePersistentSort,
    EnclaveSearchBarFilter,
    MatTableModule,
    MatButtonModule,
    MatSortModule,
    EnclaveStatus,
    EnsyLabsIcon,
  ],
  templateUrl: './organization-list.html',
  styleUrl: './organization-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationList implements AfterViewInit {
  private readonly orgService = inject(OrganizationService);

  protected readonly orgsList = signal<OrganizationModel[]>([]);
  protected readonly orgsCount = computed(() => this.orgsList().length);
  protected readonly orgsDataSource = computed(() => new MatTableDataSource(this.orgsList()));
  protected readonly displayedColumns = ['name', 'status', 'primaryUserId', 'action'];
  protected readonly orgSearch = viewChild.required(EnclaveSearchBarFilter);
  protected readonly orgSort = viewChild.required(MatSort);

  constructor() {
    effect(() => {
      this.orgsDataSource().filter = this.orgSearch().searchText().toLocaleLowerCase();
      this.orgsDataSource().sort = this.orgSort();
    });
  }

  ngAfterViewInit(): void {
    this.populateOrgs();
  }

  private populateOrgs(): void {
    this.orgsList.set(this.orgService.getOrganizations());
  }
}

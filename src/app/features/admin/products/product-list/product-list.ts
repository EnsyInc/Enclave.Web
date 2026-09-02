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
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';

import {
  ConfirmationDialogService,
  EnclaveAvatar,
  EnclaveMoreActionsMenu,
  EnclavePageHeader,
  EnclaveSearchBarFilter,
  EnclaveStatus,
} from '@enclave/core/components';
import { EnclavePersistentSort } from '@enclave/core/directives';
import { EnsyLabsIcon } from '@enclave/core/icons';
import { ProductModel } from '@enclave/domain/models';
import { ProductsService } from '@enclave/domain/services';
import { ProductFormService } from '@enclave/features/admin/products/product-form/product-form.service';

@Component({
  selector: 'enclave-product-list',
  imports: [
    EnclaveAvatar,
    EnclaveMoreActionsMenu,
    EnclavePageHeader,
    EnclavePersistentSort,
    EnclaveSearchBarFilter,
    EnclaveStatus,
    EnsyLabsIcon,
    MatButtonModule,
    MatInputModule,
    MatMenuModule,
    MatSortModule,
    MatTableModule,
    RouterLink,
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductList implements AfterViewInit {
  private readonly productsService = inject(ProductsService);
  private readonly productForm = inject(ProductFormService);
  private readonly confirmDialog = inject(ConfirmationDialogService);

  protected readonly productsList = signal<ProductModel[]>([]);
  protected readonly productsCount = computed(() => this.productsList().length);
  protected readonly activeProductsCount = computed(
    () => this.productsList().filter((p) => p.status === 'Active').length,
  );
  protected readonly productsDataSource = computed(
    () => new MatTableDataSource(this.productsList()),
  );
  protected readonly displayedColumns = ['name', 'description', 'status', 'action'];
  protected readonly productSearch = viewChild.required(EnclaveSearchBarFilter);
  protected readonly productSort = viewChild.required(MatSort);

  constructor() {
    effect(() => {
      this.productsDataSource().filter = this.productSearch().searchText().toLowerCase();
      this.productsDataSource().sort = this.productSort();
    });
  }

  ngAfterViewInit(): void {
    this.populateProducts();
  }

  private populateProducts(): void {
    this.productsList.set(this.productsService.getProducts());
  }

  protected openCreateProductFormDialog(): void {
    this.productForm.openCreate();
  }

  protected openEditProductFormDialog(product: ProductModel): void {
    this.productForm.openEdit(product);
  }

  protected openDeleteProductDialog(product: ProductModel): void {
    this.confirmDialog
      .open({
        action: 'Delete',
        title: `Delete "${product.name}"`,
        message: `Are you sure you want to delete "<span class="highlight">${product.name}</span>"? This can't be undone.`,
        confirmLabel: 'Delete',
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        console.log('Product deleted');
      });
  }
}

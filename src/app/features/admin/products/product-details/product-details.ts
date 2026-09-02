import { Component, computed, inject, input } from '@angular/core';
import { ProductsService } from '@enclave/domain/services';
import { EnclaveAvatar, EnclaveStatus } from '@enclave/core/components';
import { ProductFormService } from '@enclave/features/admin/products/product-form/product-form.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { EnclaveDetailCard } from '@enclave/core/components/enclave-detail-card/enclave-detail-card';
import { EnclaveDetailRow } from '@enclave/core/components/enclave-detail-row/enclave-detail-row';
import { EnclaveDetailList } from '@enclave/core/components/enclave-detail-list/enclave-detail-list';

@Component({
  selector: 'enclave-product-details',
  imports: [
    EnclaveAvatar,
    EnclaveStatus,
    MatTabsModule,
    EnclaveDetailCard,
    EnclaveDetailRow,
    MatDividerModule,
    EnclaveDetailList,
  ],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss',
})
export class ProductDetails {
  private readonly productsService = inject(ProductsService);
  private readonly productForm = inject(ProductFormService);

  protected readonly productId = input.required<string>();
  protected readonly product = computed(() => {
    return this.productsService.getProductById(this.productId())!;
  });

  protected openProductFormDialog(): void {
    this.productForm.openEdit(this.product());
  }
}

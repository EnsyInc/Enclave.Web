import { Component, computed, inject, input } from '@angular/core';
import { ProductsService } from '@enclave/domain/services';
import { EnclaveAvatar, EnclaveStatus } from '@enclave/core/components';
import { ProductFormService } from '@enclave/features/admin/products/product-form/product-form.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { EnsyLabsIcon } from '@enclave/core/icons';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'enclave-product-details',
  imports: [
    EnclaveAvatar,
    EnclaveStatus,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    EnsyLabsIcon,
    MatDividerModule,
    MatTooltipModule,
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

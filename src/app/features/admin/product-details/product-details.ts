import { Component, computed, inject, input } from '@angular/core';
import { ProductsService } from '@enclave/core/services/products.service';
import { EnclaveAvatar } from '@enclave/core/components/enclave-avatar/enclave-avatar';
import { EnclaveStatus } from '@enclave/core/components/enclave-status/enclave-status';
import { ProductFormOverlayService } from '@enclave/features/admin/product-form-overlay/product-form-overlay.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { EnsyLabsIcon } from '@enclave/core/icons/ensy-labs-icon/ensy-labs-icon';
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
  private readonly productFormOverlay = inject(ProductFormOverlayService);

  protected readonly productId = input.required<string>();
  protected readonly product = computed(() => {
    return this.productsService.getProductById(this.productId())!;
  });

  protected openProductFormDialog(): void {
    this.productFormOverlay.openEdit(this.product());
  }
}

import { Component, computed, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { PRODUCT_STATUSES, ProductModel, ProductStatus } from '@enclave/core';
import { MatDivider } from '@angular/material/divider';
import { EnsyLabsIcon } from '@enclave/core/icons';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'enclave-product-form',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatDivider,
    EnsyLabsIcon,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class EnclaveProductForm {
  private readonly data = inject<ProductModel | undefined>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<EnclaveProductForm>);

  protected readonly productStatuses = PRODUCT_STATUSES;
  protected readonly product = computed(() => this.data);
  protected readonly form = new FormGroup({
    name: new FormControl(this.product()?.name ?? '', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl(this.product()?.description ?? '', {
      nonNullable: true,
    }),
    status: new FormControl<ProductStatus | undefined>(this.product()?.status, {
      validators: [Validators.required],
    }),
  });

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close(this.form.getRawValue());
  }
}

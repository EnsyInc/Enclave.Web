import { Component, contentChildren, effect } from '@angular/core';

import { EnclaveDetailRow } from '@enclave/core/components/enclave-detail-row/enclave-detail-row';

@Component({
  selector: 'enclave-detail-list',
  imports: [],
  templateUrl: './enclave-detail-list.html',
})
export class EnclaveDetailList {
  private readonly rows = contentChildren(EnclaveDetailRow);

  constructor() {
    effect(() => {
      this.rows().forEach((r, index) => {
        r.renderDivider.set(index == this.rows().length - 1 ? false : true);
      });
    });
  }
}

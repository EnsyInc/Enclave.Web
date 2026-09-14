import { formatDate } from '@angular/common';
import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'enclaveDate',
})
export class EnclaveDatePipe implements PipeTransform {
  private readonly locale = inject(LOCALE_ID);

  transform(value: Date): string {
    return formatDate(value, 'd MMM y', this.locale);
  }
}

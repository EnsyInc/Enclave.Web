import { Component, input } from '@angular/core';

@Component({
  selector: 'enclave-not-found-page',
  imports: [],
  templateUrl: './not-found-page.html',
  styleUrl: './not-found-page.scss',
})
export class NotFoundPage {
  protected readonly reason = input<'not-found' | 'forbidden'>('not-found');
}

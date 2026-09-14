import { TestBed } from '@angular/core/testing';

import { EnclaveDatePipe } from './enclave-date-pipe';

describe('EnclaveDatePipe', () => {
  it('creates an instance', () => {
    TestBed.configureTestingModule({ providers: [EnclaveDatePipe] });

    expect(TestBed.inject(EnclaveDatePipe)).toBeTruthy();
  });

  it('formats a date as "d MMM y"', () => {
    TestBed.configureTestingModule({ providers: [EnclaveDatePipe] });
    const pipe = TestBed.inject(EnclaveDatePipe);

    expect(pipe.transform(new Date(2026, 8, 14))).toBe('14 Sep 2026');
  });
});

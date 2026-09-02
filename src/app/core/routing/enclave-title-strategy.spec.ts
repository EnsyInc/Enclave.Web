import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot } from '@angular/router';
import { vi } from 'vitest';

import { EnclaveTitleStrategy } from './enclave-title-strategy';

describe('EnclaveTitleStrategy', () => {
  let strategy: EnclaveTitleStrategy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EnclaveTitleStrategy],
    });
    strategy = TestBed.inject(EnclaveTitleStrategy);
  });

  it('appends the Enclave suffix to a resolved title', () => {
    vi.spyOn(strategy, 'buildTitle').mockReturnValue('Products');

    strategy.updateTitle({} as RouterStateSnapshot);

    expect(TestBed.inject(Title).getTitle()).toBe('Products | Enclave');
  });

  it('falls back to a bare "Enclave" title when no route in the chain sets one', () => {
    vi.spyOn(strategy, 'buildTitle').mockReturnValue(undefined);

    strategy.updateTitle({} as RouterStateSnapshot);

    expect(TestBed.inject(Title).getTitle()).toBe('Enclave');
  });
});

import { TestBed } from '@angular/core/testing';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { vi } from 'vitest';

import { IconRegistryService } from './icon-registry.service';

describe('IconRegistryService', () => {
  let addSvgIconSpy: ReturnType<typeof vi.fn>;
  let bypassSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    addSvgIconSpy = vi.fn();
    bypassSpy = vi.fn((url: string) => `safe:${url}` as unknown as SafeResourceUrl);

    TestBed.configureTestingModule({
      providers: [
        { provide: MatIconRegistry, useValue: { addSvgIcon: addSvgIconSpy } },
        { provide: DomSanitizer, useValue: { bypassSecurityTrustResourceUrl: bypassSpy } },
      ],
    });
  });

  it('registers every icon exactly once, sanitizing its resource url first', () => {
    TestBed.inject(IconRegistryService);

    const expected: [string, string][] = [
      ['logo', 'icons/logo.svg'],
      ['dashboard', 'icons/dashboard.svg'],
      ['products', 'icons/products.svg'],
      ['organizations', 'icons/organizations.svg'],
      ['licenses', 'icons/licenses.svg'],
      ['license-requests', 'icons/license-requests.svg'],
    ];

    expect(addSvgIconSpy).toHaveBeenCalledTimes(expected.length);
    for (const [name, path] of expected) {
      expect(bypassSpy).toHaveBeenCalledWith(path);
      expect(addSvgIconSpy).toHaveBeenCalledWith(name, `safe:${path}`);
    }
  });
});

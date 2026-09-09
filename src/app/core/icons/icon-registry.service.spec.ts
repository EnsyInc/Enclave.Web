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

    // Deliberately a hand-written mirror of IconName rather than derived from it -- asserting
    // against Object.values(IconName) would just restate the implementation. Kept in the same
    // order so the two files diff against each other by eye.
    const expected: [string, string][] = [
      ['logo', 'icons/logo.svg'],
      ['logo-full', 'icons/logo-full.svg'],
      ['dot', 'icons/dot.svg'],
      ['more-horizontal', 'icons/more-horizontal.svg'],
      ['add', 'icons/add.svg'],
      ['search', 'icons/search.svg'],
      ['chevrons-up-down', 'icons/chevrons-up-down.svg'],
      ['chevron-right', 'icons/chevron-right.svg'],
      ['sun', 'icons/sun.svg'],
      ['moon', 'icons/moon.svg'],
      ['sidenav', 'icons/sidenav.svg'],
      ['dashboard', 'icons/dashboard.svg'],
      ['products', 'icons/products.svg'],
      ['organizations', 'icons/organizations.svg'],
      ['licenses', 'icons/licenses.svg'],
      ['license-requests', 'icons/license-requests.svg'],
      ['edit', 'icons/edit.svg'],
      ['delete', 'icons/delete.svg'],
      ['details', 'icons/details.svg'],
      ['close', 'icons/close.svg'],
      ['arrow-left', 'icons/arrow-left.svg'],
    ];

    // Compare the name lists rather than just the call count: a bare count mismatch reports
    // "expected 19, got 21" and leaves you to find which icons drifted.
    expect(addSvgIconSpy.mock.calls.map(([name]) => name)).toEqual(expected.map(([name]) => name));
    for (const [name, path] of expected) {
      expect(bypassSpy).toHaveBeenCalledWith(path);
      expect(addSvgIconSpy).toHaveBeenCalledWith(name, `safe:${path}`);
    }
  });
});

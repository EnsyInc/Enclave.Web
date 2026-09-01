import { Injectable, inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

export const SVG_ICONS = [
  'logo',
  'dot',
  'more-horizontal',
  'add',
  'search',
  'chevrons-up-down',
  'sun',
  'moon',
  'sidenav',
  'dashboard',
  'products',
  'organizations',
  'licenses',
  'license-requests',
  'edit',
  'delete',
  'details',
  'close',
];

@Injectable({ providedIn: 'root' })
export class IconRegistryService {
  private readonly iconRegistry = inject(MatIconRegistry);
  private readonly domSanitizer = inject(DomSanitizer);

  constructor() {
    for (const svg of SVG_ICONS) {
      this.registerIcon(svg);
    }
  }

  private registerIcon(name: string): void {
    this.iconRegistry.addSvgIcon(
      name,
      this.domSanitizer.bypassSecurityTrustResourceUrl(`icons/${name}.svg`),
    );
  }
}

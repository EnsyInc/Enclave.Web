import { Injectable, inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

export const IconName = {
  Logo: 'logo',
  Dot: 'dot',
  MoreHorizontal: 'more-horizontal',
  Add: 'add',
  Search: 'search',
  ChevronsUpDown: 'chevrons-up-down',
  Sun: 'sun',
  Moon: 'moon',
  Sidenav: 'sidenav',
  Dashboard: 'dashboard',
  Products: 'products',
  Organizations: 'organizations',
  Licenses: 'licenses',
  LicenseRequests: 'license-requests',
  Edit: 'edit',
  Delete: 'delete',
  Details: 'details',
  Close: 'close',
} as const;
export type IconName = (typeof IconName)[keyof typeof IconName];

@Injectable({ providedIn: 'root' })
export class IconRegistryService {
  private readonly iconRegistry = inject(MatIconRegistry);
  private readonly domSanitizer = inject(DomSanitizer);

  constructor() {
    for (const svg of Object.values(IconName)) {
      this.registerIcon(svg);
    }
  }

  private registerIcon(name: IconName): void {
    this.iconRegistry.addSvgIcon(
      name,
      this.domSanitizer.bypassSecurityTrustResourceUrl(`icons/${name}.svg`),
    );
  }
}

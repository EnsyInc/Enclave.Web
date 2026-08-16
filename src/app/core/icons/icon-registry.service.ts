import { Injectable, inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class IconRegistryService {
  private readonly iconRegistry = inject(MatIconRegistry);
  private readonly domSanitizer = inject(DomSanitizer);

  constructor() {
    this.iconRegistry.addSvgIcon(
      'logo',
      this.domSanitizer.bypassSecurityTrustResourceUrl('icons/logo.svg'),
    );

    this.iconRegistry.addSvgIcon(
      'chevrons-up-down',
      this.domSanitizer.bypassSecurityTrustResourceUrl('icons/chevrons-up-down.svg'),
    );
    this.iconRegistry.addSvgIcon(
      'moon',
      this.domSanitizer.bypassSecurityTrustResourceUrl('icons/moon.svg'),
    );
    this.iconRegistry.addSvgIcon(
      'sidenav',
      this.domSanitizer.bypassSecurityTrustResourceUrl('icons/sidenav.svg'),
    );
    this.iconRegistry.addSvgIcon(
      'dashboard',
      this.domSanitizer.bypassSecurityTrustResourceUrl('icons/dashboard.svg'),
    );
    this.iconRegistry.addSvgIcon(
      'products',
      this.domSanitizer.bypassSecurityTrustResourceUrl('icons/products.svg'),
    );
    this.iconRegistry.addSvgIcon(
      'organizations',
      this.domSanitizer.bypassSecurityTrustResourceUrl('icons/organizations.svg'),
    );
    this.iconRegistry.addSvgIcon(
      'licenses',
      this.domSanitizer.bypassSecurityTrustResourceUrl('icons/licenses.svg'),
    );
    this.iconRegistry.addSvgIcon(
      'license-requests',
      this.domSanitizer.bypassSecurityTrustResourceUrl('icons/license-requests.svg'),
    );
  }
}

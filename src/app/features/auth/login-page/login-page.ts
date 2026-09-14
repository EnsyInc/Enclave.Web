import { Component, inject } from '@angular/core';

import { EnsyLabsIcon } from '@enclave/core/icons';
import { AuthService } from '@enclave/core/services';

// Google Sign-In is temporarily disabled: loading its script via afterNextRender() resolves
// in jsdom (the <script> element's `load` event fires without the fetched content actually
// running), so `google` is referenced but never defined, throwing an unhandled rejection in
// every spec that creates this component. Re-enable by restoring the code kept below once
// there's a way to stub/skip the script load in tests.
//
// import { ElementRef, afterNextRender, effect, signal, viewChild } from '@angular/core';
// import { ThemeService } from '@enclave/core';
//
// // No @types package for Google Identity Services is installed; this is the minimal
// // shape of the global `google.accounts.id` API this component actually calls.
// declare const google: {
//   accounts: {
//     id: {
//       initialize(config: {
//         client_id: string;
//         callback: (response: { credential: string }) => void;
//       }): void;
//       renderButton(parent: HTMLElement, options: Record<string, string>): void;
//     };
//   };
// };
//
// const GOOGLE_GSI_SCRIPT_ID = 'google-gsi-script';
// const GOOGLE_GSI_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
//
// // Replace with the real OAuth client ID from the Google Cloud Console project once one exists.
// const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';

@Component({
  selector: 'enclave-login-page',
  imports: [EnsyLabsIcon],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  protected readonly authService = inject(AuthService);

  // private readonly themeService = inject(ThemeService);
  //
  // private readonly googleButtonContainer =
  //   viewChild.required<ElementRef<HTMLElement>>('googleButton');
  // private readonly googleScriptLoaded = signal(false);
  //
  // constructor() {
  //   // Angular's template compiler drops <script> tags found in component templates, so the
  //   // Google Identity Services library has to be loaded imperatively instead.
  //   afterNextRender(() => {
  //     this.loadGoogleScript().then(() => {
  //       this.initializeGoogleSignIn();
  //       this.googleScriptLoaded.set(true);
  //     });
  //   });
  //
  //   // The rendered button has no live theme API - re-rendering into the same container is
  //   // the only way to switch its look, so re-run this whenever the theme signal changes.
  //   effect(() => {
  //     const theme = this.themeService.theme();
  //
  //     if (this.googleScriptLoaded()) {
  //       this.renderGoogleButton(theme === 'dark' ? 'filled_black' : 'outline');
  //     }
  //   });
  // }
  //
  // private loadGoogleScript(): Promise<void> {
  //   if (document.getElementById(GOOGLE_GSI_SCRIPT_ID)) {
  //     return Promise.resolve();
  //   }
  //
  //   return new Promise((resolve, reject) => {
  //     const script = document.createElement('script');
  //     script.id = GOOGLE_GSI_SCRIPT_ID;
  //     script.src = GOOGLE_GSI_SCRIPT_SRC;
  //     script.async = true;
  //     script.onload = () => resolve();
  //     script.onerror = () =>
  //       reject(new Error('Failed to load the Google Identity Services script.'));
  //     document.head.appendChild(script);
  //   });
  // }
  //
  // private initializeGoogleSignIn(): void {
  //   google.accounts.id.initialize({
  //     client_id: GOOGLE_CLIENT_ID,
  //     callback: () => this.authService.loginWithGoogle(),
  //   });
  // }
  //
  // private renderGoogleButton(theme: 'outline' | 'filled_black'): void {
  //   this.googleButtonContainer().nativeElement.replaceChildren();
  //
  //   google.accounts.id.renderButton(this.googleButtonContainer().nativeElement, {
  //     type: 'standard',
  //     size: 'large',
  //     theme,
  //     text: 'sign_in_with',
  //     shape: 'rectangular',
  //     logo_alignment: 'left',
  //   });
  // }
}

import { Service } from '@angular/core';

@Service()
export class AuthService {
  public loginWithGoogle(): void {
    console.log('Logged in with Google.');
  }

  public loginWithMicrosoft(): void {
    console.log('Logged in with Microsoft.');
  }
}

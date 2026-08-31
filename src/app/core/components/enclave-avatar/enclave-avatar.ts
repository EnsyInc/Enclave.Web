import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'enclave-avatar',
  imports: [],
  templateUrl: './enclave-avatar.html',
  styleUrl: './enclave-avatar.scss',
})
export class EnclaveAvatar {
  public readonly name = input.required<string>();
  public readonly maxInitials = input(1);
  
  protected readonly initials = computed(() => {
    return this.name()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, this.maxInitials())
        .map((n) => n[0])
        .join('');
  });
}

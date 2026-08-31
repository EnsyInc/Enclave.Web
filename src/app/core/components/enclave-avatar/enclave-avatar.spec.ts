import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnclaveAvatar } from './enclave-avatar';

describe('EnclaveAvatar', () => {
  let component: EnclaveAvatar;
  let fixture: ComponentFixture<EnclaveAvatar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnclaveAvatar],
    }).compileComponents();

    fixture = TestBed.createComponent(EnclaveAvatar);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('name', 'Enclave Core');
    fixture.detectChanges();
  });

  function fallbackText(): string | null | undefined {
    return fixture.debugElement.nativeElement
      .querySelector('.avatar-fallback')
      ?.textContent?.trim();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('defaults to a single initial for a multi-word name', () => {
    expect(fallbackText()).toBe('E');
  });

  it('renders the first letter of a single-word name', () => {
    fixture.componentRef.setInput('name', 'Products');
    fixture.detectChanges();

    expect(fallbackText()).toBe('P');
  });

  it('renders two initials when maxInitials is 2', () => {
    fixture.componentRef.setInput('name', 'Jane Doe');
    fixture.componentRef.setInput('maxInitials', 2);
    fixture.detectChanges();

    expect(fallbackText()).toBe('JD');
  });

  it('falls back to fewer initials when the name has fewer words than maxInitials', () => {
    fixture.componentRef.setInput('name', 'Enclave');
    fixture.componentRef.setInput('maxInitials', 2);
    fixture.detectChanges();

    expect(fallbackText()).toBe('E');
  });

  it('ignores extra whitespace between and around words', () => {
    fixture.componentRef.setInput('name', '  Jane   Doe  ');
    fixture.componentRef.setInput('maxInitials', 2);
    fixture.detectChanges();

    expect(fallbackText()).toBe('JD');
  });

  it('updates the initials when the name input changes', () => {
    expect(fallbackText()).toBe('E');

    fixture.componentRef.setInput('name', 'Vault Analytics');
    fixture.detectChanges();

    expect(fallbackText()).toBe('V');
  });
});

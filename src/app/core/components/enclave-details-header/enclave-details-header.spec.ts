import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnclaveDetailsHeader } from './enclave-details-header';

describe('EnclaveDetailsHeader', () => {
  let component: EnclaveDetailsHeader;
  let fixture: ComponentFixture<EnclaveDetailsHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnclaveDetailsHeader],
    }).compileComponents();

    fixture = TestBed.createComponent(EnclaveDetailsHeader);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'Northwind Systems');
    fixture.detectChanges();
  });

  function nativeElement(): HTMLElement {
    return fixture.debugElement.nativeElement;
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the title', () => {
    expect(nativeElement().querySelector('.title')?.textContent?.trim()).toBe('Northwind Systems');
  });

  it('does not render an avatar by default', () => {
    expect(nativeElement().querySelector('enclave-avatar')).toBeNull();
  });

  it('renders an avatar when showTitleAvatar is true', () => {
    fixture.componentRef.setInput('showTitleAvatar', true);
    fixture.detectChanges();

    expect(nativeElement().querySelector('enclave-avatar')).toBeTruthy();
  });

  it('does not render a status or subtitle when neither is provided', () => {
    expect(nativeElement().querySelector('enclave-status')).toBeNull();
    expect(nativeElement().querySelector('.subtitle span')).toBeNull();
  });

  it('renders the status when provided', () => {
    fixture.componentRef.setInput('status', 'Active');
    fixture.detectChanges();

    expect(nativeElement().querySelector('enclave-status')?.textContent?.trim()).toBe('Active');
  });

  it('renders the subtitle when provided', () => {
    fixture.componentRef.setInput('subTitle', 'ops@northwind.io');
    fixture.detectChanges();

    expect(nativeElement().querySelector('.subtitle')?.textContent).toContain('ops@northwind.io');
  });
});

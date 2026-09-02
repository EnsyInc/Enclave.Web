import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';

import { EnclavePageHeader } from './enclave-page-header';
import { EnsyLabsIcon } from '@enclave/core/icons';

describe('EnclavePageHeader', () => {
  let component: EnclavePageHeader;
  let fixture: ComponentFixture<EnclavePageHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnclavePageHeader],
    }).compileComponents();

    fixture = TestBed.createComponent(EnclavePageHeader);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'Products');
    fixture.componentRef.setInput('subTitle', '6 in the catalogue - 3 active');
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('renders the title and subtitle', () => {
    fixture.detectChanges();

    const title: HTMLElement = fixture.debugElement.nativeElement.querySelector('.page-title');
    const subtitle: HTMLElement =
      fixture.debugElement.nativeElement.querySelector('.page-subtitle');
    expect(title.textContent?.trim()).toBe('Products');
    expect(subtitle.textContent?.trim()).toBe('6 in the catalogue - 3 active');
  });

  it('does not render an action button when neither actionIcon nor actionText is provided', () => {
    fixture.detectChanges();

    const button = fixture.debugElement.nativeElement.querySelector('button');
    expect(button).toBeNull();
  });

  it('does not render an action button when only actionIcon is provided', () => {
    fixture.componentRef.setInput('actionIcon', 'add');
    fixture.detectChanges();

    const button = fixture.debugElement.nativeElement.querySelector('button');
    expect(button).toBeNull();
  });

  it('does not render an action button when only actionText is provided', () => {
    fixture.componentRef.setInput('actionText', 'Create Product');
    fixture.detectChanges();

    const button = fixture.debugElement.nativeElement.querySelector('button');
    expect(button).toBeNull();
  });

  it('renders an action button with the given icon and text when both are provided', () => {
    fixture.componentRef.setInput('actionIcon', 'add');
    fixture.componentRef.setInput('actionText', 'Create Product');
    fixture.detectChanges();

    const button: HTMLElement = fixture.debugElement.nativeElement.querySelector('button');
    const icon = fixture.debugElement.query(By.directive(EnsyLabsIcon))
      .componentInstance as EnsyLabsIcon;

    expect(button).toBeTruthy();
    expect(button.textContent?.trim()).toBe('Create Product');
    expect(icon.name()).toBe('add');
  });

  it('emits actionButtonClick when the action button is clicked', () => {
    fixture.componentRef.setInput('actionIcon', 'add');
    fixture.componentRef.setInput('actionText', 'Create Product');
    fixture.detectChanges();

    const emitted = vi.fn();
    component.actionButtonClick.subscribe(emitted);

    const button: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('button');
    button.click();

    expect(emitted).toHaveBeenCalledTimes(1);
  });
});

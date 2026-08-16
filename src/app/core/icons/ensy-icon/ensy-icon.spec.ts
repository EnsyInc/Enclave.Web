import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatIcon } from '@angular/material/icon';

import { EnsyIcon } from './ensy-icon';

describe('EnsyIcon', () => {
  let component: EnsyIcon;
  let fixture: ComponentFixture<EnsyIcon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnsyIcon],
    }).compileComponents();

    fixture = TestBed.createComponent(EnsyIcon);
    component = fixture.componentInstance;
  });

  it('should create', async () => {
    fixture.componentRef.setInput('name', 'dashboard');
    await fixture.whenStable();
    expect(component).toBeTruthy();
  });

  it('forwards the name input to the underlying mat-icon as its svgIcon', async () => {
    fixture.componentRef.setInput('name', 'dashboard');
    await fixture.whenStable();

    const matIcon = fixture.debugElement.query(By.directive(MatIcon)).componentInstance as MatIcon;
    expect(matIcon.svgIcon).toBe('dashboard');
  });

  it('applies the color input as inline style on the icon', async () => {
    fixture.componentRef.setInput('name', 'dashboard');
    fixture.componentRef.setInput('color', 'var(--color-primary)');
    await fixture.whenStable();

    const iconEl: HTMLElement = fixture.debugElement.query(By.directive(MatIcon)).nativeElement;
    expect(iconEl.style.color).toBe('var(--color-primary)');
  });

  it('leaves color unset when no color input is provided', async () => {
    fixture.componentRef.setInput('name', 'dashboard');
    await fixture.whenStable();

    const iconEl: HTMLElement = fixture.debugElement.query(By.directive(MatIcon)).nativeElement;
    expect(iconEl.style.color).toBe('');
  });
});

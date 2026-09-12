import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIcon } from '@angular/material/icon';
import { By } from '@angular/platform-browser';

import { IconName } from '@enclave/core/icons';

import { EnsyLabsIcon } from './ensy-labs-icon';

describe('EnsyLabsIcon', () => {
  let component: EnsyLabsIcon;
  let fixture: ComponentFixture<EnsyLabsIcon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnsyLabsIcon],
    }).compileComponents();

    fixture = TestBed.createComponent(EnsyLabsIcon);
    component = fixture.componentInstance;
  });

  it('should create', async () => {
    fixture.componentRef.setInput('name', IconName.Dashboard);
    await fixture.whenStable();
    expect(component).toBeTruthy();
  });

  it('forwards the name input to the underlying mat-icon as its svgIcon', async () => {
    fixture.componentRef.setInput('name', IconName.Dashboard);
    await fixture.whenStable();

    const matIcon = fixture.debugElement.query(By.directive(MatIcon)).componentInstance as MatIcon;
    expect(matIcon.svgIcon).toBe(IconName.Dashboard);
  });

  it('does not add the ghost class by default', async () => {
    fixture.componentRef.setInput('name', IconName.Dashboard);
    await fixture.whenStable();

    const matIcon: HTMLElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
    expect(matIcon.classList.contains('ghost')).toBe(false);
  });

  it('adds the ghost class when ghostMode is enabled', async () => {
    fixture.componentRef.setInput('name', IconName.Dashboard);
    fixture.componentRef.setInput('ghostMode', true);
    await fixture.whenStable();

    const matIcon: HTMLElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
    expect(matIcon.classList.contains('ghost')).toBe(true);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatIcon } from '@angular/material/icon';

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
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

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
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

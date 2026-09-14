import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginPage } from './login-page';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Microsoft sign-in button', () => {
    let button: HTMLElement;

    beforeEach(() => {
      button = fixture.nativeElement.querySelector('.ms-signin-button');
    });

    afterEach(() => {
      delete document.documentElement.dataset['theme'];
    });

    it('matches the fixed dimensions/typography from the Microsoft redlines', () => {
      const style = getComputedStyle(button);

      expect(style.height).toBe('41px');
      expect(style.padding).toBe('0px 12px');
      expect(style.gap).toBe('12px');
      expect(style.fontSize).toBe('15px');
      expect(style.fontWeight).toBe('600');
      expect(style.fontFamily).toContain('Segoe UI');
    });

    it('uses the dark Microsoft button colors by default, with no visible border', () => {
      const style = getComputedStyle(button);

      expect(style.backgroundColor).toBe('rgb(47, 47, 47)');
      expect(style.color).toBe('rgb(255, 255, 255)');
      expect(style.borderTopColor).toBe('rgba(0, 0, 0, 0)');
    });

    it('switches to the light Microsoft button colors, with a visible border, under the light theme', () => {
      document.documentElement.dataset['theme'] = 'light';
      const style = getComputedStyle(button);

      expect(style.backgroundColor).toBe('rgb(255, 255, 255)');
      expect(style.color).toBe('rgb(94, 94, 94)');
      expect(style.borderTopColor).toBe('rgb(140, 140, 140)');
    });
  });
});

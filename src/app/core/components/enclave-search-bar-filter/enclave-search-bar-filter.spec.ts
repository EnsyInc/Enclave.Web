import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { vi } from 'vitest';

import { EnclaveSearchBarFilter } from './enclave-search-bar-filter';

describe('EnclaveSearchBarFilter', () => {
  let component: EnclaveSearchBarFilter;
  let fixture: ComponentFixture<EnclaveSearchBarFilter>;
  let queryParamMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let routeStub: { queryParamMap: BehaviorSubject<ReturnType<typeof convertToParamMap>> };
  let navigateSpy: ReturnType<typeof vi.fn>;
  let getCurrentNavigationSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    queryParamMap$ = new BehaviorSubject(convertToParamMap({}));
    routeStub = { queryParamMap: queryParamMap$ };
    navigateSpy = vi.fn().mockResolvedValue(true);
    getCurrentNavigationSpy = vi.fn().mockReturnValue(null);

    await TestBed.configureTestingModule({
      imports: [EnclaveSearchBarFilter],
      providers: [
        { provide: ActivatedRoute, useValue: routeStub },
        {
          provide: Router,
          useValue: { navigate: navigateSpy, getCurrentNavigation: getCurrentNavigationSpy },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EnclaveSearchBarFilter);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('searchPlaceholder', 'Search Products');
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the placeholder as both the input placeholder and its aria-label', () => {
    const input: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('input');
    expect(input.placeholder).toBe('Search Products');
    expect(input.getAttribute('aria-label')).toBe('Search Products');
  });

  it('initializes searchText from the current search query param', () => {
    queryParamMap$.next(convertToParamMap({ search: 'widgets' }));
    fixture.detectChanges();

    expect(component.searchText()).toBe('widgets');
  });

  it('writes an external query param change into the input DOM value', () => {
    const input: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('input');

    queryParamMap$.next(convertToParamMap({ search: 'widgets' }));
    fixture.detectChanges();

    expect(input.value).toBe('widgets');
  });

  it('does not overwrite the DOM value while the user is typing', () => {
    const input: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('input');

    input.value = 'wid';
    input.dispatchEvent(new Event('keyup'));
    fixture.detectChanges();

    expect(input.value).toBe('wid');
  });

  it('updates searchText immediately on keyup, before the debounce elapses', () => {
    const input: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('input');
    input.value = 'widgets';
    input.dispatchEvent(new Event('keyup'));

    expect(component.searchText()).toBe('widgets');
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('navigates with the search query param set after the debounce elapses', () => {
    vi.useFakeTimers();
    const input: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('input');
    input.value = 'widgets';
    input.dispatchEvent(new Event('keyup'));

    vi.advanceTimersByTime(400);

    expect(navigateSpy).toHaveBeenCalledWith([], {
      relativeTo: routeStub,
      queryParams: { search: 'widgets' },
      queryParamsHandling: 'merge',
    });
  });

  it('navigates with the query param cleared when the input is emptied', () => {
    vi.useFakeTimers();
    const input: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('input');
    input.value = '';
    input.dispatchEvent(new Event('keyup'));

    vi.advanceTimersByTime(400);

    expect(navigateSpy).toHaveBeenCalledWith([], {
      relativeTo: routeStub,
      queryParams: { search: null },
      queryParamsHandling: 'merge',
    });
  });

  // Regression: a navigation away from this route (e.g. clicking a row action) can still be
  // resolving when the debounce elapses. router.navigate() cancels whatever navigation is
  // currently in flight, so firing here would silently bounce the user back to this page.
  it('does not navigate when another navigation is already in flight once the debounce elapses', () => {
    getCurrentNavigationSpy.mockReturnValue({ id: 1 });
    vi.useFakeTimers();
    const input: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('input');
    input.value = 'widgets';
    input.dispatchEvent(new Event('keyup'));

    vi.advanceTimersByTime(400);

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('reads a custom query param name when configured', () => {
    fixture.componentRef.setInput('urlQueryParamName', 'filter');
    queryParamMap$.next(convertToParamMap({ filter: 'widgets' }));
    fixture.detectChanges();

    expect(component.searchText()).toBe('widgets');
  });

  it('writes to a custom query param name when configured', () => {
    fixture.componentRef.setInput('urlQueryParamName', 'filter');
    vi.useFakeTimers();
    const input: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('input');
    input.value = 'widgets';
    input.dispatchEvent(new Event('keyup'));

    vi.advanceTimersByTime(400);

    expect(navigateSpy).toHaveBeenCalledWith([], {
      relativeTo: routeStub,
      queryParams: { filter: 'widgets' },
      queryParamsHandling: 'merge',
    });
  });
});

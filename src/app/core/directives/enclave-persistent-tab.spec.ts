import { ChangeDetectorRef, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, ParamMap, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { vi } from 'vitest';

import { EnclavePersistentTab } from './enclave-persistent-tab';

@Component({
  imports: [EnclavePersistentTab, MatTabsModule],
  template: `
    <mat-tab-group enclavePersistentTab [tabQueryParamName]="tabQueryParamName">
      <mat-tab label="First">First content</mat-tab>
      <mat-tab label="Second">Second content</mat-tab>
    </mat-tab-group>
  `,
})
class HostComponent {
  tabQueryParamName = 'tab';
}

interface FixtureOptions {
  queryParams?: Record<string, string>;
  tabQueryParamName?: string;
}

function createFixture(options: FixtureOptions = {}): {
  fixture: ComponentFixture<HostComponent>;
  navigate: ReturnType<typeof vi.fn>;
  tabGroup: MatTabGroup;
  queryParamMap$: BehaviorSubject<ParamMap>;
} {
  const navigate = vi.fn().mockResolvedValue(true);
  const queryParamMap$ = new BehaviorSubject(convertToParamMap(options.queryParams ?? {}));

  TestBed.configureTestingModule({
    imports: [HostComponent],
    providers: [
      { provide: Router, useValue: { navigate } },
      {
        provide: ActivatedRoute,
        useValue: {
          get snapshot() {
            return { queryParamMap: queryParamMap$.value };
          },
          queryParamMap: queryParamMap$,
        },
      },
    ],
  });

  const fixture = TestBed.createComponent(HostComponent);
  if (options.tabQueryParamName) {
    fixture.componentInstance.tabQueryParamName = options.tabQueryParamName;
  }

  const tabGroup = fixture.debugElement.query(By.directive(MatTabGroup)).injector.get(MatTabGroup);

  return { fixture, navigate, tabGroup, queryParamMap$ };
}

// The directive restores the tab by assigning MatTabGroup.selectedIndex directly (matching how
// production code does it, see enclave-persistent-tab.ts) rather than through a real DOM event.
// MatTabGroup only resolves that assignment into its readable `selectedIndex` during its own
// ngAfterContentChecked -- in this app's zoneless setup, nothing schedules that recheck for a
// plain property mutation coming from a bare RxJS subscription (unlike the real Router, which
// integrates with Angular's scheduler on navigation). Real DOM events don't have this problem
// (Angular always reschedules a check after a template-bound listener runs), which is why the
// "selecting a tab" tests below click a real tab label instead of assigning `selectedIndex`
// directly. For the restore path, there's no click to piggyback on, so the tests force the
// recheck the same way a scheduler-integrated trigger would: mark MatTabGroup's view dirty, then
// run change detection.
function settleTabGroupUpdate(fixture: ComponentFixture<HostComponent>): void {
  fixture.debugElement
    .query(By.directive(MatTabGroup))
    .injector.get(ChangeDetectorRef)
    .markForCheck();
  fixture.detectChanges();
}

function clickTab(fixture: ComponentFixture<HostComponent>, index: number): void {
  const tabLabels: HTMLElement[] =
    fixture.debugElement.nativeElement.querySelectorAll('[role="tab"]');
  tabLabels[index].click();
  fixture.detectChanges();
}

describe('EnclavePersistentTab', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('restores the second tab from the query param on init', async () => {
    const { fixture, tabGroup } = createFixture({ queryParams: { tab: 'second' } });
    fixture.detectChanges();
    await fixture.whenStable();
    settleTabGroupUpdate(fixture);

    expect(tabGroup.selectedIndex).toBe(1);
  });

  // Regression test: `parseTabQueryParam()` can legitimately return 0 (the first tab), and
  // `if (restoredIndex)` used to treat that as falsy, silently skipping the restore.
  it('restores tab index 0 after a different tab was selected (index 0 must not be treated as falsy)', async () => {
    const { fixture, tabGroup, queryParamMap$ } = createFixture({
      queryParams: { tab: 'second' },
    });
    fixture.detectChanges();
    await fixture.whenStable();
    settleTabGroupUpdate(fixture);

    expect(tabGroup.selectedIndex).toBe(1);

    queryParamMap$.next(convertToParamMap({ tab: 'first' }));
    await fixture.whenStable();
    settleTabGroupUpdate(fixture);

    expect(tabGroup.selectedIndex).toBe(0);
  });

  it('self-heals the URL to the current tab when the query param names an unrecognized tab', async () => {
    const { fixture, navigate } = createFixture({ queryParams: { tab: 'doesnotexist' } });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { tab: 'first' },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  });

  it('populates the URL with the default tab when no query param is present on load', async () => {
    const { fixture, navigate } = createFixture();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { tab: 'first' },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  });

  // Regression test: this is exactly the index-0 case that used to slip past the
  // `if (restoredIndex)` falsy-zero bug into the "self-heal" branch, which then overwrote the URL
  // to match the (still wrong) currently-selected tab instead of leaving it alone.
  it('does not navigate again when the query param already matches the current (first) tab', async () => {
    const { fixture, navigate } = createFixture({ queryParams: { tab: 'first' } });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(navigate).not.toHaveBeenCalled();
  });

  it('does not navigate again when queryParamMap re-emits the same value', async () => {
    const { fixture, navigate, queryParamMap$ } = createFixture({
      queryParams: { tab: 'second' },
    });
    fixture.detectChanges();
    await fixture.whenStable();
    navigate.mockClear();

    queryParamMap$.next(convertToParamMap({ tab: 'second' }));
    await fixture.whenStable();

    expect(navigate).not.toHaveBeenCalled();
  });

  it('restores a different tab when queryParamMap emits again after mount', async () => {
    const { fixture, tabGroup, queryParamMap$ } = createFixture({
      queryParams: { tab: 'first' },
    });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(tabGroup.selectedIndex).toBe(0);

    queryParamMap$.next(convertToParamMap({ tab: 'second' }));
    await fixture.whenStable();
    settleTabGroupUpdate(fixture);

    expect(tabGroup.selectedIndex).toBe(1);
  });

  it('navigates with the tab query param set once the debounce elapses after selecting a tab', () => {
    vi.useFakeTimers();
    const { fixture, navigate } = createFixture();
    fixture.detectChanges();
    navigate.mockClear();

    clickTab(fixture, 1);
    vi.advanceTimersByTime(400);

    expect(navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { tab: 'second' },
      queryParamsHandling: 'merge',
      replaceUrl: false,
    });
  });

  it('restores from a custom query param name instead of "tab"', async () => {
    const { fixture, tabGroup } = createFixture({
      queryParams: { productsTab: 'second' },
      tabQueryParamName: 'productsTab',
    });
    fixture.detectChanges();
    await fixture.whenStable();
    settleTabGroupUpdate(fixture);

    expect(tabGroup.selectedIndex).toBe(1);
  });

  it('ignores the default "tab" param when a custom tabQueryParamName is set', async () => {
    const { fixture, tabGroup } = createFixture({
      queryParams: { tab: 'second' },
      tabQueryParamName: 'productsTab',
    });
    fixture.detectChanges();
    await fixture.whenStable();

    // Falls through to the self-heal branch, which selects the current (default, first) tab.
    expect(tabGroup.selectedIndex).toBe(0);
  });

  it('writes to a custom query param name instead of "tab"', () => {
    vi.useFakeTimers();
    const { fixture, navigate } = createFixture({ tabQueryParamName: 'productsTab' });
    fixture.detectChanges();
    navigate.mockClear();

    clickTab(fixture, 1);
    vi.advanceTimersByTime(400);

    expect(navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { productsTab: 'second' },
      queryParamsHandling: 'merge',
      replaceUrl: false,
    });
  });
});

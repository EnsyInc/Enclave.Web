import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSort, MatSortHeader, MatSortModule } from '@angular/material/sort';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, ParamMap, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { vi } from 'vitest';

import { EnclavePersistentSort } from './enclave-persistent-sort';

@Component({
  imports: [EnclavePersistentSort, MatSortModule],
  template: `
    <table
      matSort
      enclavePersistentSort
      [sortableColumns]="sortableColumns"
      [sortQueryParamName]="sortQueryParamName"
    >
      <tr>
        <th mat-sort-header="name">Name</th>
        <th mat-sort-header="status">Status</th>
      </tr>
    </table>
  `,
})
class HostComponent {
  sortableColumns: string[] = ['name', 'status'];
  sortQueryParamName = 'sort';
}

interface FixtureOptions {
  queryParams?: Record<string, string>;
  sortableColumns?: string[];
  sortQueryParamName?: string;
}

function createFixture(options: FixtureOptions = {}): {
  fixture: ComponentFixture<HostComponent>;
  navigate: ReturnType<typeof vi.fn>;
  sort: MatSort;
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
  if (options.sortableColumns) {
    fixture.componentInstance.sortableColumns = options.sortableColumns;
  }
  if (options.sortQueryParamName) {
    fixture.componentInstance.sortQueryParamName = options.sortQueryParamName;
  }

  const sort = fixture.debugElement.query(By.directive(MatSort)).injector.get(MatSort);

  return { fixture, navigate, sort, queryParamMap$ };
}

describe('EnclavePersistentSort', () => {
  it('restores ascending sort from the query param on init', async () => {
    const { fixture, sort } = createFixture({ queryParams: { sort: 'name:asc' } });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(sort.active).toBe('name');
    expect(sort.direction).toBe('asc');
  });

  it('restores descending sort from the query param on init', async () => {
    const { fixture, sort } = createFixture({ queryParams: { sort: 'status:desc' } });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(sort.active).toBe('status');
    expect(sort.direction).toBe('desc');
  });

  it.each([
    ['missing the direction half', 'name'],
    ['naming a non-sortable column', 'description:asc'],
    ['using an unrecognized direction', 'name:sideways'],
    ['with trailing garbage', 'name:asc:extra'],
  ])('ignores a malformed sort query param (%s)', async (_label, sortParam) => {
    const { fixture, sort } = createFixture({ queryParams: { sort: sortParam } });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(sort.active).toBeFalsy();
  });

  it('navigates with the sort query param set when a header is clicked', () => {
    const { fixture, navigate } = createFixture();
    fixture.detectChanges();

    const nameSortHeader = fixture.debugElement.queryAll(By.directive(MatSortHeader))[0];
    nameSortHeader.triggerEventHandler('click', null);

    expect(navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { sort: 'name:asc' },
      queryParamsHandling: 'merge',
    });
  });

  it('restores sort from a custom query param name instead of "sort"', async () => {
    const { fixture, sort } = createFixture({
      queryParams: { productsSort: 'status:desc' },
      sortQueryParamName: 'productsSort',
    });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(sort.active).toBe('status');
    expect(sort.direction).toBe('desc');
  });

  it('ignores the default "sort" param when a custom sortQueryParamName is set', async () => {
    const { fixture, sort } = createFixture({
      queryParams: { sort: 'name:asc' },
      sortQueryParamName: 'productsSort',
    });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(sort.active).toBeFalsy();
  });

  it('writes to a custom query param name instead of "sort"', () => {
    const { fixture, navigate } = createFixture({ sortQueryParamName: 'productsSort' });
    fixture.detectChanges();

    const nameSortHeader = fixture.debugElement.queryAll(By.directive(MatSortHeader))[0];
    nameSortHeader.triggerEventHandler('click', null);

    expect(navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { productsSort: 'name:asc' },
      queryParamsHandling: 'merge',
    });
  });

  // Regression test: MatSort.sort() cycles the direction whenever the given column is already
  // active, instead of setting it to the requested direction -- calling it to restore an
  // already-matching column used to spin the sort forward (asc -> desc -> none -> ...) every time
  // the restore-triggered write echoed back through queryParamMap. The fix restores via direct
  // `active`/`direction` assignment and relies on persistSortInUrl's dedup guard to break the loop.
  it('does not keep rewriting the URL when restoring a sort that already matches it', async () => {
    const { fixture, navigate, sort } = createFixture({ queryParams: { sort: 'name:asc' } });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(sort.active).toBe('name');
    expect(sort.direction).toBe('asc');
    expect(navigate).not.toHaveBeenCalled();
  });

  // Angular Router's queryParamMap can emit more than once for what is logically a single
  // navigation (e.g. an interim value alongside the final one) -- a duplicate emission of the
  // same params must not produce a second, redundant navigation.
  it('does not navigate again when queryParamMap re-emits the same value', async () => {
    const { fixture, navigate, queryParamMap$ } = createFixture({
      queryParams: { sort: 'name:asc' },
    });
    fixture.detectChanges();
    await fixture.whenStable();

    queryParamMap$.next(convertToParamMap({ sort: 'name:asc' }));
    await fixture.whenStable();

    expect(navigate).not.toHaveBeenCalled();
  });

  // Restoring should react to the URL changing after mount too, not just on the initial read --
  // this is what makes browser back/forward actually restore the previous sort.
  it('restores a different sort when queryParamMap emits again after mount', async () => {
    const { fixture, sort, queryParamMap$ } = createFixture({
      queryParams: { sort: 'name:asc' },
    });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(sort.active).toBe('name');
    expect(sort.direction).toBe('asc');

    queryParamMap$.next(convertToParamMap({ sort: 'status:desc' }));
    await fixture.whenStable();

    expect(sort.active).toBe('status');
    expect(sort.direction).toBe('desc');
  });
});
